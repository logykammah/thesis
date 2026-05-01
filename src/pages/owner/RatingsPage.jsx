import { useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';

export function RatingsPage() {
  const { state } = useAppData();
  const done = useMemo(() => state.ratings.filter((r) => r.submitted), [state.ratings]);
  const avgExp = done.length
    ? done.reduce((s, r) => s + (r.experienceStars ?? r.stars ?? 0), 0) / done.length
    : null;

  return (
    <div>
      <h1 className="page-title font-serif">Patient feedback &amp; ratings</h1>
      <p className="page-sub">
        Service quality feedback — doctor care, experience, and comments for owner monitoring and improvement loops.
      </p>
      <div className="card mb-md">
        <div className="font-serif" style={{ fontSize: '2rem' }}>
          {avgExp != null ? avgExp.toFixed(1) : '—'} <span style={{ fontSize: '1rem' }}>/ 5</span>
        </div>
        <div className="muted">Average overall experience ({done.length} submitted)</div>
      </div>
      <div className="grid">
        {state.ratings.map((r) => (
          <div key={r.id} className="card">
            <div className="flex-between">
              <strong>{r.appointmentId}</strong>
              <span>
                {r.submitted ? (
                  <>
                    Doctor {r.doctorStars ?? r.stars ?? '—'}★ · Experience {r.experienceStars ?? r.stars ?? '—'}★
                  </>
                ) : (
                  'Pending'
                )}
              </span>
            </div>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              Patient: {state.patients.find((p) => p.id === r.patientId)?.fullName}
            </p>
            <p>{r.comment || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
