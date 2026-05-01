import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { StatCard } from '../../components/StatCard';
import { AppointmentCard } from '../../components/AppointmentCard';
import { formatMoney } from '../../utils/format';
import { CLINIC } from '../../data/initialState';
import { branchNameFromState } from '../../utils/branch';
import { isActivePipelineStatus } from '../../utils/appointments';

function isPendingEstimate(inv) {
  return Boolean(inv.visitPending) || inv.status === 'Pending';
}

function balanceDue(inv) {
  return (inv.amount || 0) - (inv.amountPaid || 0);
}

export function PatientDashboard() {
  const { user } = useAuth();
  const { state } = useAppData();
  const pid = user?.id;
  const patient = state.patients.find((p) => p.id === pid);
  const appts = state.appointments.filter((a) => a.patientId === pid);
  const upcoming = appts
    .filter((a) => isActivePipelineStatus(a.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const dentist = upcoming ? state.dentists.find((d) => d.id === upcoming.dentistId) : null;

  const invoices = state.invoices.filter((i) => i.patientId === pid);
  const finalizedInvoices = invoices.filter((i) => !isPendingEstimate(i));
  const outstandingTotal = finalizedInvoices.reduce((s, i) => s + Math.max(0, balanceDue(i)), 0);

  const treatments = state.treatmentRecords.filter((t) => t.patientId === pid);

  const completedSorted = appts
    .filter((a) => a.status === 'Completed')
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const lastAppt = completedSorted[0];
  const lastVisit = lastAppt ? state.visits.find((v) => v.appointmentId === lastAppt.id) : null;
  const lastTreatment = lastVisit ? state.treatmentRecords.find((t) => t.visitId === lastVisit.id) : null;
  const lastDentist = lastAppt ? state.dentists.find((d) => d.id === lastAppt.dentistId) : null;

  return (
    <div>
      <h1 className="page-title font-serif">Welcome, {patient?.fullName || user?.displayName}</h1>
      <p className="page-sub">Your care journey at {CLINIC.name}.</p>

      <div className="grid grid-4 mb-md">
        <StatCard
          label="Next visit"
          value={upcoming ? `${upcoming.date}` : '—'}
        />
        <StatCard label="Outstanding (EGP)" value={formatMoney(outstandingTotal)} />
        <StatCard label="Completed treatments" value={treatments.length} />
        <StatCard label="Finalized invoices" value={finalizedInvoices.length} />
      </div>

      <div className="grid grid-2">
        <div>
          <h2 className="card-title">Next appointment</h2>
          {upcoming ? (
            <AppointmentCard
              appointment={upcoming}
              dentistName={dentist?.fullName || '—'}
              branchShort={branchNameFromState(state, upcoming.branchId)}
              actions={false}
            />
          ) : (
            <div className="empty-state">No upcoming visits scheduled.</div>
          )}
        </div>
        <div>
          <h2 className="card-title">Last visit</h2>
          <div className="card">
            {lastAppt ? (
              <>
                <div style={{ fontWeight: 600 }}>
                  {lastAppt.date} · {branchNameFromState(state, lastAppt.branchId)}
                </div>
                <div className="muted" style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  {lastDentist?.fullName || '—'}
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  {lastTreatment?.procedureType || lastAppt.requestedServiceLabel || 'Treatment completed'}
                </div>
              </>
            ) : (
              <div className="muted">No completed visits yet.</div>
            )}
          </div>

          <h2 className="card-title mt-md">Balance</h2>
          <div className="card">
            <div className="flex-between">
              <span>Amount due</span>
              <strong>{formatMoney(outstandingTotal)}</strong>
            </div>
            <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
              Invoices are payable after your visit once treatment and fees are finalized.
            </p>
            {outstandingTotal > 0 ? (
              <Link className="btn btn-primary btn-sm mt-md" to="/patient/pay">
                Pay balance
              </Link>
            ) : (
              <p className="muted mt-sm" style={{ fontSize: '0.88rem' }}>
                No balance due on finalized invoices.
              </p>
            )}
          </div>
        </div>
      </div>

      <h2 className="card-title mt-md">Quick actions</h2>
      <p className="muted" style={{ fontSize: '0.82rem', marginBottom: '0.6rem', maxWidth: '68ch' }}>
        Book new visits, manage upcoming appointments (cancel / reschedule / reminders), pay balances, and submit feedback — all on
        the shared clinic ledger for Dokki and Zayed.
      </p>
      <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
        <Link className="btn btn-primary btn-sm" to="/patient/book">
          Book appointment
        </Link>
        <Link className="btn btn-secondary btn-sm" to="/patient/visits">
          View visits
        </Link>
        <Link className="btn btn-secondary btn-sm" to="/patient/invoices">
          View invoices
        </Link>
        <Link className="btn btn-secondary btn-sm" to="/patient/appointments">
          My appointments
        </Link>
      </div>
    </div>
  );
}
