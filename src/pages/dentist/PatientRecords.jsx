import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { SearchBar } from '../../components/SearchBar';
import { Badge } from '../../components/Badge';
import { branchNameFromState } from '../../utils/branch';

export function PatientRecords() {
  const { user } = useAuth();
  const { state } = useAppData();
  const [q, setQ] = useState('');

  const linkedPatientIds = useMemo(() => {
    const ids = new Set();
    state.visits.filter((v) => v.dentistId === user.id).forEach((v) => ids.add(v.patientId));
    state.treatmentRecords.filter((t) => t.dentistId === user.id).forEach((t) => ids.add(t.patientId));
    state.appointments.filter((a) => a.dentistId === user.id).forEach((a) => ids.add(a.patientId));
    return ids;
  }, [state, user.id]);

  const directory = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.patients.filter((p) => {
      if (!linkedPatientIds.has(p.id)) return false;
      if (!term) return true;
      return p.fullName.toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
    });
  }, [q, state.patients, linkedPatientIds]);

  const [selectedId, setSelectedId] = useState(() => [...linkedPatientIds][0] || state.patients[0]?.id);

  const patient = state.patients.find((p) => p.id === selectedId);
  const record = state.medicalRecords.find((m) => m.patientId === selectedId);
  const visits = state.visits.filter((v) => v.patientId === selectedId && v.dentistId === user.id);
  const treatments = state.treatmentRecords.filter((t) => t.patientId === selectedId && t.dentistId === user.id);
  const rx = state.prescriptions.filter((p) => p.patientId === selectedId && p.dentistId === user.id);

  return (
    <div>
      <h1 className="page-title font-serif">Patient records</h1>
      <p className="page-sub">
        Unified patient record across branches — continue care whether the patient visits Dokki or Zayed. Procedures, prescriptions,
        invoices, and visits stay on one profile.
      </p>
      <div
        className="card mb-md"
        style={{
          padding: '0.65rem 0.85rem',
          fontSize: '0.88rem',
          borderLeft: '4px solid var(--color-primary-soft)',
          background: 'linear-gradient(90deg, rgba(74, 98, 122, 0.06), transparent)',
        }}
      >
        <strong>Branch history:</strong>{' '}
        <span className="muted">
          When selected, scroll visits and treatments below — entries are tagged by branch so you see previous visits in Dokki /
          Zayed at a glance.
        </span>
      </div>
      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} placeholder="Search in your patient list" />
      </div>
      <div className="grid grid-2">
        <div className="card" style={{ maxHeight: 420, overflow: 'auto' }}>
          <h2 className="card-title">Your patient list ({directory.length})</h2>
          {directory.length === 0 ? <div className="muted">No matches.</div> : null}
          {directory.map((p) => (
            <button
              key={p.id}
              type="button"
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.35rem' }}
              onClick={() => setSelectedId(p.id)}
            >
              {p.fullName} · {p.id}
            </button>
          ))}
        </div>
        {patient ? (
          <div className="card">
            <h2 className="card-title">{patient.fullName}</h2>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              {patient.gender} · DOB {patient.dob} · Blood {patient.bloodType}
            </p>
            <p>
              <strong>Allergies:</strong> {patient.allergies}
            </p>
            <p>
              <strong>Medical record summary:</strong> {record?.summary}
            </p>
            <h3 className="font-serif" style={{ marginTop: '1rem' }}>
              Your visits
            </h3>
            {visits.map((v) => (
              <div key={v.id} className="mb-sm muted" style={{ fontSize: '0.88rem' }}>
                {v.date} · {branchNameFromState(state, v.branchId)} — {v.chiefComplaint}
              </div>
            ))}
            {visits.length === 0 ? <div className="muted">No visits yet under your provider ID.</div> : null}
            <h3 className="font-serif" style={{ marginTop: '1rem' }}>
              Your treatments
            </h3>
            {treatments.map((t) => (
              <div key={t.id} className="mb-sm">
                <Badge status="Completed">{t.procedureType}</Badge>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {t.diagnosis}
                </div>
              </div>
            ))}
            <h3 className="font-serif" style={{ marginTop: '1rem' }}>
              Your prescriptions
            </h3>
            {rx.map((p) => (
              <div key={p.id} className="mb-sm">
                {p.medicine} {p.dosage} · {p.duration}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Select a patient</div>
        )}
      </div>
    </div>
  );
}
