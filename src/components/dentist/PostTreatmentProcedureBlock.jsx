import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';

/** Prototype-only: post-operative instructions persisted to patient profile context. */
export function PostTreatmentProcedureBlock({ layout = 'card', linkedPatientId } = {}) {
  const { user } = useAuth();
  const { state, savePostTreatmentCare, pushToast } = useAppData();
  const fileRef = useRef(null);
  const embedded = layout === 'embedded';
  const patientFromForm = linkedPatientId != null && linkedPatientId !== '';

  const [patientId, setPatientId] = useState(state.patients[0]?.id || '');
  const [careNotes, setCareNotes] = useState('');
  const [warnings, setWarnings] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (patientFromForm) setPatientId(linkedPatientId);
  }, [linkedPatientId, patientFromForm]);

  const mine = state.postTreatmentCare?.filter((x) => x.dentistId === user.id) || [];

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : '');
    e.target.value = '';
  };

  const submit = (sendToPatient) => {
    const pid = patientFromForm ? linkedPatientId : patientId;
    if (!pid) {
      pushToast('Select a patient.', 'error');
      return;
    }
    if (!careNotes.trim() && !warnings.trim()) {
      pushToast('Add care instructions or warnings before saving.', 'error');
      return;
    }
    savePostTreatmentCare({
      patientId: pid,
      dentistId: user.id,
      careNotes,
      warnings,
      attachmentFileName: fileName || null,
      sendToPatient,
    });
    setCareNotes('');
    setWarnings('');
    setFileName('');
  };

  const patientRow = !patientFromForm ? (
    <div className="form-row">
      <label>Patient</label>
      <select className="select" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
        {state.patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.fullName} · {p.id}
          </option>
        ))}
      </select>
    </div>
  ) : (
    <p className="muted" style={{ fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
      Patient matches <strong>New treatment entry</strong> above.
    </p>
  );

  const recentBlock = (
    <div>
      <h3 className="font-serif" style={{ marginTop: embedded ? '0.5rem' : 0, fontSize: '1rem' }}>
        Recent post-treatment entries (you)
      </h3>
      {mine.length === 0 ? (
        <p className="muted" style={{ fontSize: '0.88rem' }}>
          No saved entries yet.
        </p>
      ) : (
        <div style={{ maxHeight: embedded ? 220 : 320, overflow: 'auto' }}>
          {mine.slice(-8).reverse().map((row) => (
            <div key={row.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '0.65rem 0', fontSize: '0.88rem' }}>
              <strong>{state.patients.find((p) => p.id === row.patientId)?.fullName}</strong>
              <span className="muted"> · {row.createdDate}</span>
              {row.sentToPatient ? (
                <span className="badge badge-confirmed" style={{ marginLeft: '0.35rem', fontSize: '0.65rem' }}>
                  Sent (prototype)
                </span>
              ) : null}
              <div className="muted" style={{ marginTop: '0.25rem' }}>
                {row.careNotes?.slice(0, 140)}
                {(row.careNotes?.length || 0) > 140 ? '…' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const mainForm = (
    <div>
      {patientRow}

      <div className="form-row">
        <label>Follow-up care instructions</label>
        <textarea
          className="textarea"
          rows={embedded ? 3 : 4}
          placeholder="e.g. Soft foods for 48 hours, saline rinse twice daily…"
          value={careNotes}
          onChange={(e) => setCareNotes(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Warnings / complications to watch</label>
        <textarea
          className="textarea"
          rows={embedded ? 2 : 3}
          placeholder="e.g. Persistent bleeding over 24h → call clinic; swelling…"
          value={warnings}
          onChange={(e) => setWarnings(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label className="muted" style={{ fontSize: '0.85rem' }}>
          Upload post-treatment procedure (PDF / image — prototype stores filename only)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
          className="input"
          onChange={onPickFile}
        />
        {fileName ? <span className="muted" style={{ fontSize: '0.82rem' }}>{fileName}</span> : null}
      </div>

      <div className="flex gap-sm mt-md" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={() => submit(false)}>
          Save to Patient Profile
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => submit(true)}>
          Send to Patient
        </button>
      </div>
      <p className="muted" style={{ fontSize: '0.76rem', marginTop: '0.75rem' }}>
        Prototype: “Send to Patient” marks the packet for the patient portal; full messaging is not wired.
      </p>
    </div>
  );

  return (
    <div className={embedded ? 'post-treatment-embed' : 'card mt-md'}>
      {!embedded ? (
        <>
          <h2 className="card-title">Post-Treatment Procedure</h2>
          <p className="muted page-sub" style={{ marginBottom: '1rem', maxWidth: '72ch' }}>
            Add post-treatment care instructions after completing treatment. Many patients forget verbal instructions — documenting
            here reduces complications, repeat visits, and dissatisfaction.
          </p>
        </>
      ) : (
        <>
          <h3 className="font-serif" style={{ fontSize: '1.05rem', margin: '0 0 0.35rem' }}>
            Post-treatment procedure
          </h3>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            After saving the treatment entry, add care instructions, warnings, and an optional attachment for the chart.
          </p>
        </>
      )}

      <div className={embedded ? 'post-treatment-embed__stack' : 'grid grid-2'}>
        {mainForm}
        {recentBlock}
      </div>
    </div>
  );
}
