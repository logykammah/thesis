import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { branchNameFromState } from '../../utils/branch';

export function VisitNotes() {
  const { user } = useAuth();
  const { state, updateVisitNotes } = useAppData();
  const visits = state.visits.filter((v) => v.dentistId === user.id);
  const [visitId, setVisitId] = useState(visits[0]?.id || '');
  const current = state.visits.find((v) => v.id === visitId);
  const [notes, setNotes] = useState(current?.notes || '');

  const syncNotes = (id) => {
    const v = state.visits.find((x) => x.id === id);
    setNotes(v?.notes || '');
  };

  return (
    <div>
      <h1 className="page-title font-serif">Visit notes</h1>
      <p className="page-sub">Editable clinical narrative tied to each encounter.</p>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="form-row">
          <label>Visit</label>
          <select
            className="select"
            value={visitId}
            onChange={(e) => {
              setVisitId(e.target.value);
              syncNotes(e.target.value);
            }}
          >
            {visits.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} — {v.date} — {branchNameFromState(state, v.branchId)} — {state.patients.find((p) => p.id === v.patientId)?.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Notes</label>
          <textarea className="textarea" rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => updateVisitNotes(visitId, notes)}>
          Save notes
        </button>
      </div>
    </div>
  );
}
