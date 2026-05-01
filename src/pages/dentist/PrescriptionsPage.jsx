import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { todayISODate } from '../../utils/format';
import { branchNameFromState } from '../../utils/branch';

export function PrescriptionsPage() {
  const { user } = useAuth();
  const { state, addPrescription } = useAppData();

  const myTreatments = useMemo(
    () => state.treatmentRecords.filter((t) => t.dentistId === user.id),
    [state.treatmentRecords, user.id],
  );

  const patientIds = useMemo(() => new Set(myTreatments.map((t) => t.patientId)), [myTreatments]);
  const myPatients = useMemo(() => state.patients.filter((p) => patientIds.has(p.id)), [state.patients, patientIds]);

  const rows = state.prescriptions.filter((p) => p.dentistId === user.id);

  const [form, setForm] = useState({
    patientId: myPatients[0]?.id || '',
    treatmentRecordId: myTreatments[0]?.id || '',
    medicine: '',
    dosage: '',
    duration: '',
    instructions: '',
    date: todayISODate(),
  });

  const submit = (e) => {
    e.preventDefault();
    const tr = state.treatmentRecords.find((t) => t.id === form.treatmentRecordId);
    addPrescription({ ...form, dentistId: user.id, branchId: tr?.branchId });
    setForm((f) => ({ ...f, medicine: '', dosage: '', duration: '', instructions: '' }));
  };

  return (
    <div>
      <h1 className="page-title font-serif">Prescriptions</h1>
      <p className="page-sub">E-prescriptions linked to your treatment records and branch context.</p>
      <div className="grid grid-2">
        <form className="card" onSubmit={submit}>
          <h2 className="card-title">New prescription</h2>
          <div className="form-row">
            <label>Patient</label>
            <select className="select" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              {myPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Treatment record</label>
            <select
              className="select"
              value={form.treatmentRecordId}
              onChange={(e) => setForm({ ...form, treatmentRecordId: e.target.value })}
            >
              {myTreatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {branchNameFromState(state, t.branchId)} — {t.id} — {t.procedureType}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Medicine</label>
            <input className="input" value={form.medicine} onChange={(e) => setForm({ ...form, medicine: e.target.value })} required />
          </div>
          <div className="form-row">
            <label>Dosage</label>
            <input className="input" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} required />
          </div>
          <div className="form-row">
            <label>Duration</label>
            <input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
          </div>
          <div className="form-row">
            <label>Instructions</label>
            <textarea className="textarea" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">
            Save prescription
          </button>
        </form>
        <div className="card">
          <h2 className="card-title">Issued</h2>
          {rows.length === 0 ? <p className="muted">No prescriptions yet for this profile.</p> : null}
          {rows.map((p) => (
            <div key={p.id} className="mb-md">
              <strong>{p.medicine}</strong> {p.dosage} · {p.duration}
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                {branchNameFromState(state, p.branchId)} · {p.instructions}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
