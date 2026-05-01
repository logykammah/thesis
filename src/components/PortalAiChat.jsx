import { useState } from 'react';

const PRESETS = {
  patient: {
    label: 'AI Patient Assistant',
    welcome:
      'Hello — how can I help you with your appointment, treatment instructions, or payment status?',
    bullets: ['Booking guidance', 'Reminders & reschedule', 'Post-op care FAQ', 'Invoice basics'],
    placeholder: 'Ask about your next visit…',
  },
  dentist: {
    label: 'AI Doctor Assistant',
    welcome:
      'Need help reviewing this patient’s treatment history or preparing post-treatment care instructions?',
    bullets: ['Visit summaries', 'Chart notes', 'AI Smile Preview tips', 'Post-op wording'],
    placeholder: 'Ask about this patient…',
  },
  assistant: {
    label: 'AI Assistant Support',
    welcome:
      'I can help you check today’s appointments, register patients, or review low-stock dental materials.',
    bullets: ['Scheduling', 'Registration steps', 'Low-stock SKUs', 'PO workflow'],
    placeholder: 'Ask about staffing or inventory…',
  },
  owner: {
    label: 'AI Business Assistant',
    welcome:
      'I can summarize clinic performance, highlight revenue leakage, and explain inventory risks.',
    bullets: ['Revenue & AR', 'Branch comparison', 'Supply risk', 'Procedure trends'],
    placeholder: 'Ask for a KPI summary…',
  },
};

/** Non-functional prototype assistant — floating button + panel with sample messaging. */
export function PortalAiChat({ preset }) {
  const cfg = PRESETS[preset] || PRESETS.patient;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  return (
    <>
      <button
        type="button"
        className="portal-ai-chat__fab"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Open ${cfg.label}`}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden className="portal-ai-chat__fab-icon">
          💬
        </span>
        <span className="portal-ai-chat__fab-label">{cfg.label}</span>
      </button>

      {open ? (
        <div className="portal-ai-chat__panel" role="dialog" aria-labelledby="portal-ai-chat-title">
          <div className="portal-ai-chat__head">
            <strong id="portal-ai-chat-title">{cfg.label}</strong>
            <button type="button" className="portal-ai-chat__close btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <p className="portal-ai-chat__welcome muted" style={{ fontSize: '0.88rem', marginTop: '0.35rem' }}>
            {cfg.welcome}
          </p>
          <ul className="portal-ai-chat__hints muted" style={{ fontSize: '0.82rem', margin: '0.65rem 0', paddingLeft: '1.1rem' }}>
            {cfg.bullets.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <div className="portal-ai-chat__demo card" style={{ padding: '0.65rem', marginBottom: '0.6rem', fontSize: '0.82rem' }}>
            <span className="muted">Sample reply (prototype):</span>
            <p style={{ margin: '0.35rem 0 0' }}>
              “{preset === 'owner'
                ? 'Dokki revenue leads Zayed this month; composite and glove SKUs show the highest stockout risk.'
                : preset === 'assistant'
                  ? 'Three chairs today have patient-portal bookings; nitrile gloves at reorder at your branch.'
                  : preset === 'dentist'
                    ? 'Last visit notes mention sensitivity — suggest soft diet and chlorhexidine through day 3.'
                    : 'Your next visit is confirmed; cancellation frees the slot for other patients within minutes.'}
              ”
            </p>
          </div>
          <label className="form-row" style={{ marginBottom: '0.5rem' }}>
            <span className="muted" style={{ fontSize: '0.78rem' }}>
              Message (prototype — not connected)
            </span>
            <textarea
              className="textarea"
              rows={2}
              placeholder={cfg.placeholder}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm" disabled>
            Send (prototype)
          </button>
        </div>
      ) : null}
    </>
  );
}
