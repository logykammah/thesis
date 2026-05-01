import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { AppointmentCard } from '../../components/AppointmentCard';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { branchNameFromState } from '../../utils/branch';
import { appointmentStatusLabel, compareAppointmentsActiveUpcomingFirst, isActivePipelineStatus } from '../../utils/appointments';

export function MyAppointments() {
  const { user } = useAuth();
  const { state, cancelAppointment, rescheduleAppointment, getAvailableSlots: slotsFn } = useAppData();
  const [filter, setFilter] = useState('upcoming');
  const appts = useMemo(() => {
    const mine = state.appointments.filter((a) => a.patientId === user.id);
    if (filter === 'upcoming') {
      return mine.filter((a) => isActivePipelineStatus(a.status)).sort(compareAppointmentsActiveUpcomingFirst);
    }
    if (filter === 'past') {
      return mine
        .filter((a) => ['Completed', 'No Show'].includes(a.status))
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    }
    if (filter === 'cancelled') {
      return mine.filter((a) => a.status === 'Cancelled').sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    }
    return [...mine].sort(compareAppointmentsActiveUpcomingFirst);
  }, [state.appointments, user.id, filter]);
  const [detail, setDetail] = useState(null);
  const [reschedule, setReschedule] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);

  const dentistName = (id) => state.dentists.find((d) => d.id === id)?.fullName || '—';

  const openReschedule = (a) => {
    setReschedule(a);
    setNewDate(a.date);
    setNewTime(a.time);
  };

  const slots = reschedule ? slotsFn(reschedule.dentistId, newDate, reschedule.branchId, reschedule.id) : [];

  return (
    <div>
      <h1 className="page-title font-serif">My appointments</h1>
      <p className="page-sub">
        Book, reschedule, or cancel upcoming visits — same ledger as clinic. Cancelling or rescheduling frees the chair slot so
        it can be rebooked (prototype — updates shared appointment state immediately).
      </p>
      <div
        className="card mb-md"
        style={{
          padding: '0.65rem 0.85rem',
          fontSize: '0.85rem',
          borderLeft: '4px solid var(--color-primary-soft)',
          background: 'rgba(241, 245, 249, 0.65)',
        }}
      >
        <strong>Reminders:</strong>{' '}
        <span className="muted">
          Upcoming visits show reminder status from the clinic. Changing your appointment releases your previous time slot back to
          available bookings — reducing empty chairs and lost production.
        </span>
      </div>
      <div className="toolbar" style={{ marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span className="muted" style={{ marginRight: '0.35rem', fontSize: '0.88rem' }}>
          Show:
        </span>
        {[
          { id: 'upcoming', label: 'Upcoming & active' },
          { id: 'all', label: 'All' },
          { id: 'past', label: 'Previous visits' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`btn btn-sm ${filter === opt.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="grid" style={{ gap: '0.75rem' }}>
        {appts.map((a) => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            dentistName={dentistName(a.dentistId)}
            branchShort={branchNameFromState(state, a.branchId)}
            onView={setDetail}
            onCancel={setCancelTarget}
            onReschedule={openReschedule}
          />
        ))}
        {appts.length === 0 ? (
          <div className="empty-state">
            {filter === 'upcoming'
              ? 'No upcoming or active appointments. Use “All” to see completed and cancelled visits.'
              : 'No appointments in this view.'}
          </div>
        ) : null}
      </div>

      <Modal title="Appointment details" open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail ? (
          <div>
            <p>
              <Badge status={detail.status}>{appointmentStatusLabel(detail.status)}</Badge>
            </p>
            <p>
              <strong>Dentist:</strong> {dentistName(detail.dentistId)}
            </p>
            <p>
              <strong>Department:</strong> {detail.specialty}
            </p>
            {detail.requestedServiceLabel ? (
              <p>
                <strong>Service:</strong> {detail.requestedServiceLabel}
              </p>
            ) : null}
            <p>
              <strong>Branch:</strong> {branchNameFromState(state, detail.branchId)}
            </p>
            <p>
              <strong>When:</strong> {detail.date} {detail.time}
            </p>
            <p>
              <strong>Reminder:</strong> {detail.reminderStatus}
              {detail.reminderAt ? (
                <span className="muted" style={{ marginLeft: '0.4rem' }}>
                  (scheduled for {detail.reminderAt.replace('T', ' ').slice(0, 16)})
                </span>
              ) : null}
            </p>
            <p>
              <strong>Notes:</strong> {detail.notes || '—'}
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        title="Cancel appointment?"
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setCancelTarget(null)}>
              Keep appointment
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                cancelAppointment(cancelTarget.id);
                setCancelTarget(null);
              }}
            >
              Cancel appointment
            </button>
          </>
        }
      >
        <p>This will mark the appointment as cancelled. You can book a new visit anytime.</p>
      </Modal>

      <Modal
        title="Reschedule appointment"
        open={Boolean(reschedule)}
        onClose={() => setReschedule(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setReschedule(null)}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const ok = rescheduleAppointment({ appointmentId: reschedule.id, date: newDate, time: newTime });
                if (ok?.ok !== false) setReschedule(null);
              }}
            >
              Save new time
            </button>
          </>
        }
      >
        {reschedule ? (
          <div className="form-row">
            <label>New date</label>
            <input className="input" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <label className="mt-md">Available slots</label>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              {slots.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-sm ${newTime === t ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setNewTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
