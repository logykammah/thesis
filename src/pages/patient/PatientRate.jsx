import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';

export function PatientRate() {
  const { user } = useAuth();
  const { state, submitRating } = useAppData();

  const lastVisitToRate = useMemo(() => {
    const completed = state.appointments
      .filter((a) => a.patientId === user.id && a.status === 'Completed')
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    for (const a of completed) {
      const r = state.ratings.find((x) => x.appointmentId === a.id);
      if (!r?.submitted) return a;
    }
    return null;
  }, [state.appointments, state.ratings, user.id]);

  const [doctorStars, setDoctorStars] = useState(5);
  const [experienceStars, setExperienceStars] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setDoctorStars(5);
    setExperienceStars(5);
    setComment('');
  }, [lastVisitToRate?.id]);

  const dentistName = lastVisitToRate
    ? state.dentists.find((d) => d.id === lastVisitToRate.dentistId)?.fullName
    : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!lastVisitToRate) return;
    submitRating({
      appointmentId: lastVisitToRate.id,
      stars: experienceStars,
      doctorStars,
      experienceStars,
      comment,
    });
    setComment('');
  };

  return (
    <div>
      <h1 className="page-title font-serif">Patient feedback</h1>
      <p className="page-sub">
        Submit feedback after a completed visit — doctor care, overall experience, waiting time, and service quality. Ratings inform
        clinic improvement and owner dashboards.
      </p>
      {lastVisitToRate ? (
        <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
          <p style={{ marginTop: 0 }}>
            <strong>{lastVisitToRate.date}</strong>
            <span className="muted" style={{ marginLeft: '0.5rem' }}>
              · {dentistName}
            </span>
          </p>
          <div className="form-row">
            <label>Doctor care</label>
            <div className="star-row" aria-label="Doctor rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`star-btn ${doctorStars >= n ? 'active' : ''}`}
                  onClick={() => setDoctorStars(n)}
                  aria-label={`${n} stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Overall experience</label>
            <div className="star-row" aria-label="Experience rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`star-btn ${experienceStars >= n ? 'active' : ''}`}
                  onClick={() => setExperienceStars(n)}
                  aria-label={`${n} stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Comments (optional)</label>
            <textarea className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit rating
          </button>
        </form>
      ) : (
        <div className="card muted" style={{ maxWidth: 520 }}>
          You do not have any completed visits waiting for feedback. After your next completed appointment, you can rate your visit here.
        </div>
      )}
    </div>
  );
}
