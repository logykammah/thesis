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

const FALLBACK_REPLY =
  'Thanks for your question. I will connect you with a human support team member who can assist you right away.';

const DEMO_QA = {
  patient: [
    {
      question: 'When is my next appointment?',
      answer: 'Your next appointment is scheduled for Monday at 6:00 PM with Dr. Youssef at Dokki branch.',
      keywords: ['next appointment', 'when is my appointment'],
    },
    {
      question: 'Can I reschedule my visit?',
      answer: 'Yes. Open My Appointments, select the visit, then choose an available slot and confirm reschedule.',
      keywords: ['reschedule', 'change appointment'],
    },
    {
      question: 'How can I pay my invoice?',
      answer: 'Go to Invoices, open the pending invoice, then choose card or cash payment to complete it.',
      keywords: ['pay', 'invoice', 'payment'],
    },
  ],
  dentist: [
    {
      question: 'Summarize this patient before treatment.',
      answer: 'Last visit notes mention sensitivity and plaque buildup; recommend soft brushing and follow-up in one week.',
      keywords: ['summarize patient', 'before treatment', 'patient summary'],
    },
    {
      question: 'What post-treatment advice should I give?',
      answer: 'Recommend soft diet for 48 hours, avoid hard biting, maintain oral hygiene, and return if pain increases.',
      keywords: ['post-treatment', 'advice', 'instructions'],
    },
    {
      question: 'How should I explain the smile preview?',
      answer: 'Tell the patient it is a consultation-only visual aid, not a guaranteed clinical outcome.',
      keywords: ['smile preview', 'explain preview'],
    },
  ],
  assistant: [
    {
      question: 'What are today’s scheduling priorities?',
      answer: 'Prioritize no-shows follow-up, confirm afternoon appointments, and fill any cancelled slots from waitlist.',
      keywords: ['scheduling priorities', 'today schedule'],
    },
    {
      question: 'How do I register a new patient?',
      answer: 'Open Register Patient, complete identity and contact details, save, then book the first appointment.',
      keywords: ['register patient', 'new patient'],
    },
    {
      question: 'Which supplies are low stock?',
      answer: 'Demo status: nitrile gloves and composite refill are flagged low and should be reordered.',
      keywords: ['low stock', 'supplies', 'inventory'],
    },
  ],
  owner: [
    {
      question: 'Give me a quick KPI summary.',
      answer: 'Dokki currently leads revenue, AR is stable, and appointments completed this week are trending upward.',
      keywords: ['kpi', 'summary', 'performance'],
    },
    {
      question: 'Any branch needs attention?',
      answer: 'Zayed branch needs attention on refill turnaround time and delayed receivables follow-up.',
      keywords: ['branch attention', 'which branch'],
    },
    {
      question: 'What is the biggest financial risk now?',
      answer: 'The biggest risk is delayed collections on older unpaid invoices and potential supply stockouts.',
      keywords: ['financial risk', 'risk now'],
    },
  ],
};

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findDemoReply(preset, userText) {
  const normalized = normalizeText(userText);
  if (!normalized) return null;
  const bank = DEMO_QA[preset] || DEMO_QA.patient;

  const exact = bank.find((x) => normalizeText(x.question) === normalized);
  if (exact) return exact.answer;

  const byKeyword = bank.find((x) => x.keywords.some((k) => normalized.includes(normalizeText(k))));
  return byKeyword ? byKeyword.answer : null;
}

export function PortalAiChat({ preset }) {
  const cfg = PRESETS[preset] || PRESETS.patient;
  const quickQuestions = (DEMO_QA[preset] || DEMO_QA.patient).map((x) => x.question);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Demo mode active. Ask one of the suggested questions to get a mapped answer.',
    },
  ]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const reply = findDemoReply(preset, text) || FALLBACK_REPLY;
    setMessages((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: reply }]);
    setDraft('');
  };

  const askQuickQuestion = (q) => {
    const reply = findDemoReply(preset, q) || FALLBACK_REPLY;
    setMessages((prev) => [...prev, { role: 'user', text: q }, { role: 'assistant', text: reply }]);
  };

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
            <span className="muted">Try one of these demo questions:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.45rem' }}>
              {quickQuestions.map((q) => (
                <button key={q} type="button" className="btn btn-ghost btn-sm" onClick={() => askQuickQuestion(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="portal-ai-chat__demo card" style={{ padding: '0.65rem', marginBottom: '0.6rem', fontSize: '0.82rem' }}>
            {messages.map((m, idx) => (
              <p key={`${m.role}-${idx}`} style={{ margin: idx === 0 ? 0 : '0.4rem 0 0' }}>
                <strong>{m.role === 'assistant' ? `${cfg.label}:` : 'You:'}</strong> {m.text}
              </p>
            ))}
          </div>

          <label className="form-row" style={{ marginBottom: '0.5rem' }}>
            <span className="muted" style={{ fontSize: '0.78rem' }}>
              Message (demo mode — no backend/API)
            </span>
            <textarea
              className="textarea"
              rows={2}
              placeholder={cfg.placeholder}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm" onClick={sendMessage} disabled={!draft.trim()}>
            Send
          </button>
        </div>
      ) : null}
    </>
  );
}
