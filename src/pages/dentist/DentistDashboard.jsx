import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { formatDate, todayISODate } from '../../utils/format';
import { branchNameFromState } from '../../utils/branch';
import { appointmentStatusLabel, isActivePipelineStatus } from '../../utils/appointments';

export function DentistDashboard() {
  const { user } = useAuth();
  const { state, acknowledgeDentistPatientBookings } = useAppData();
  const today = todayISODate();
  const myAppts = state.appointments.filter((a) => a.dentistId === user.id);

  const newPatientBookings = useMemo(
    () =>
      myAppts.filter(
        (a) => a.patientNewForDentist && isActivePipelineStatus(a.status) && a.createdBy === 'patient',
      ),
    [myAppts],
  );

  const todayAppts = myAppts
    .filter((a) => a.date === today && isActivePipelineStatus(a.status))
    .sort((a, b) => a.time.localeCompare(b.time));
  const pendingFiles = state.visits.filter((v) => v.dentistId === user.id && (!v.notes || v.notes.length < 8)).length;
  const rxCount = state.prescriptions.filter((p) => p.dentistId === user.id).length;
  const recentNotes = state.visits.filter((v) => v.dentistId === user.id).slice(-5).reverse();

  const patientName = (pid) => state.patients.find((p) => p.id === pid)?.fullName || '—';

  return (
    <div>
      <h1 className="page-title font-serif">
        {user.displayName}
        <span className="muted" style={{ fontSize: '1rem', fontWeight: 500 }}>
          {' '}
          · {user.specialty}
        </span>
      </h1>
      <p className="page-sub">Your daily patient flow, branch context, and documentation queue — synced with patient self-booking.</p>

      <div className="card mb-md" style={{ borderLeft: '4px solid rgba(74, 98, 122, 0.65)' }}>
        <h2 className="card-title">AI Smile Preview (consultation)</h2>
        <p className="muted" style={{ fontSize: '0.88rem', maxWidth: '72ch', marginBottom: '0.85rem' }}>
          Upload a patient smile photo, pick a cosmetic procedure (veneers, whitening, braces, crowns, smile makeover), preview
          a simulated before/after, and optionally save it to the patient profile — useful chair-side explanations.
        </p>
        <Link className="btn btn-primary btn-sm" to="/dentist/profile">
          Open AI Smile Preview tool
        </Link>
      </div>

      {newPatientBookings.length > 0 ? (
        <div
          className="card mb-md"
          style={{
            borderLeft: '4px solid var(--color-primary)',
            background: 'linear-gradient(90deg, rgba(74, 98, 122, 0.06), transparent)',
          }}
        >
          <div className="flex-between gap-md" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <strong style={{ fontSize: '0.92rem' }}>
                {newPatientBookings.length === 1
                  ? '1 new appointment added to your schedule'
                  : `${newPatientBookings.length} new appointments added to your schedule`}
              </strong>
              <span className="muted" style={{ fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                from patient portal
              </span>
              <ul style={{ margin: '0.65rem 0 0', paddingLeft: '1.15rem', fontSize: '0.9rem' }}>
                {newPatientBookings.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <span className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>
                      New
                    </span>{' '}
                    <strong>{patientName(a.patientId)}</strong>
                    <span className="muted">
                      {' '}
                      · {branchNameFromState(state, a.branchId)} · {a.date} {a.time}
                    </span>
                  </li>
                ))}
              </ul>
              {newPatientBookings.length > 5 ? (
                <p className="muted" style={{ fontSize: '0.82rem', margin: '0.35rem 0 0' }}>
                  +{newPatientBookings.length - 5} more in your full schedule.
                </p>
              ) : null}
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => acknowledgeDentistPatientBookings(user.id)}>
              Mark all as seen
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-4 mb-md">
        <StatCard label="Today’s chair time" value={todayAppts.length} />
        <StatCard label="Active pipeline" value={myAppts.filter((a) => isActivePipelineStatus(a.status)).length} />
        <StatCard label="Prescriptions issued" value={rxCount} />
        <StatCard label="Charts needing notes" value={pendingFiles} hint="From your visits only" />
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-title">Today’s schedule</h2>
          {todayAppts.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              No active visits on your schedule for today.
            </div>
          ) : (
            todayAppts.map((a) => (
              <div key={a.id} className="flex-between mb-md" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <div>
                  <strong>
                    {a.time} · {patientName(a.patientId)}
                  </strong>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    {branchNameFromState(state, a.branchId)} · {a.specialty}
                  </div>
                </div>
                <Badge status={a.status}>{appointmentStatusLabel(a.status)}</Badge>
              </div>
            ))
          )}
          <Link className="btn btn-secondary btn-sm" to="/dentist/appointments">
            Full schedule
          </Link>
        </div>
        <div className="card">
          <h2 className="card-title">Recent visit notes</h2>
          {recentNotes.map((v) => (
            <div key={v.id} className="mb-md">
              <div className="muted" style={{ fontSize: '0.8rem' }}>
                {formatDate(v.date)} · {branchNameFromState(state, v.branchId)} · {patientName(v.patientId)}
              </div>
              <div>{v.notes || '—'}</div>
            </div>
          ))}
          <Link className="btn btn-secondary btn-sm" to="/dentist/visit-notes">
            Update notes
          </Link>
        </div>
      </div>
    </div>
  );
}
