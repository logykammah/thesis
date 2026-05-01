import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { todayISODate } from '../../utils/format';
import { PostTreatmentProcedureBlock } from '../../components/dentist/PostTreatmentProcedureBlock';

export function TreatmentRecords() {
  const { user } = useAuth();
  const { state, addTreatmentRecord } = useAppData();
  const myVisits = state.visits.filter((v) => v.dentistId === user.id);
  const rows = state.treatmentRecords.filter((t) => t.dentistId === user.id);
  const [form, setForm] = useState({
    patientId: state.patients[0]?.id || '',
    visitId: myVisits[0]?.id || '',
    procedureType: '',
    diagnosis: '',
    details: '',
    notes: '',
    date: todayISODate(),
  });

  const submit = (e) => {
    e.preventDefault();
    const v = state.visits.find((x) => x.id === form.visitId);
    addTreatmentRecord({ ...form, dentistId: user.id, branchId: v?.branchId || null });
    setForm((f) => ({ ...f, procedureType: '', diagnosis: '', details: '', notes: '' }));
  };

  return (
    <div>
      <h1 className="page-title font-serif">Treatment records</h1>
      <p className="page-sub">Document diagnosis and procedures — entries sync to the patient chart.</p>
      <div className="grid grid-2">
        <form className="card" onSubmit={submit}>
          <h2 className="card-title">New treatment entry</h2>
          <div className="form-row">
            <label>Patient</label>
            <select className="select" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              {state.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Linked visit</label>
            <select className="select" value={form.visitId} onChange={(e) => setForm({ ...form, visitId: e.target.value })}>
              {myVisits.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} — {v.date}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Date</label>
            <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-row">
            <label>Procedure</label>
            <input className="input" value={form.procedureType} onChange={(e) => setForm({ ...form, procedureType: e.target.value })} required />
          </div>
          <div className="form-row">
            <label>Diagnosis</label>
            <input className="input" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required />
          </div>
          <div className="form-row">
            <label>Treatment details</label>
            <textarea className="textarea" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} required />
          </div>
          <div className="form-row">
            <label>Notes</label>
            <textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">
            Save treatment
          </button>

          <PostTreatmentProcedureBlock layout="embedded" linkedPatientId={form.patientId} />
        </form>
        <div className="card">
          <h2 className="card-title">Your entries</h2>
          {rows.map((t) => (
            <div key={t.id} className="mb-md" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <strong>{t.date}</strong> — {t.procedureType}
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                {t.diagnosis}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
