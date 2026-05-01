import { formatDate } from '../utils/format';
import { appointmentStatusLabel } from '../utils/appointments';
import { Badge } from './Badge';

const CAN_MODIFY = ['Scheduled', 'Confirmed', 'Rescheduled'];

export function AppointmentCard({ appointment, dentistName, branchShort, onView, onCancel, onReschedule, actions = true }) {
  const canModify = CAN_MODIFY.includes(appointment.status);
  return (
    <div className="card card-hover flex-between gap-md" style={{ alignItems: 'flex-start' }}>
      <div>
        <div className="flex gap-sm" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <strong>{formatDate(appointment.date)}</strong>
          <span className="muted">{appointment.time}</span>
          <Badge status={appointment.status}>{appointmentStatusLabel(appointment.status)}</Badge>
        </div>
        <div className="mt-sm">
          <strong>{dentistName}</strong>
          {branchShort ? (
            <span className="muted" style={{ fontSize: '0.85rem', marginLeft: '0.35rem' }}>
              · {branchShort}
            </span>
          ) : null}
        </div>
        <div className="muted mt-sm" style={{ fontSize: '0.85rem' }}>
          {appointment.specialty}
          {appointment.requestedServiceLabel ? ` · ${appointment.requestedServiceLabel}` : ''}
          {appointment.reminderStatus ? ` · Reminder: ${appointment.reminderStatus}` : ''}
        </div>
        {appointment.notes ? (
          <div className="muted mt-sm" style={{ fontSize: '0.85rem' }}>
            {appointment.notes}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex gap-sm" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onView?.(appointment)}>
            Details
          </button>
          {canModify ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReschedule?.(appointment)}>
                Reschedule
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => onCancel?.(appointment)}>
                Cancel
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
