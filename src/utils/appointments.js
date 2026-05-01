/**
 * Only these statuses release the chair for new bookings.
 * (Rescheduled is not included — a row still on the calendar must block its slot to prevent overbooking.)
 */
const SLOT_FREE_STATUSES = ['Cancelled', 'No Show', 'Completed'];

export function isSlotBlockingStatus(status) {
  return !SLOT_FREE_STATUSES.includes(status);
}

/**
 * Another booking already uses this dentist at this date/time (any branch).
 * A dentist cannot be in two places at once.
 */
export function hasSlotConflict(appointments, { dentistId, date, time, excludeAppointmentId = null }) {
  return appointments.some(
    (a) =>
      (!excludeAppointmentId || a.id !== excludeAppointmentId) &&
      a.dentistId === dentistId &&
      a.date === date &&
      a.time === time &&
      isSlotBlockingStatus(a.status),
  );
}

export const APPOINTMENT_STATUS_OPTIONS = [
  'Scheduled',
  'Confirmed',
  'Checked In',
  'In Progress',
  'Completed',
  'Cancelled',
  'No Show',
  'Rescheduled',
];

/** Not yet finished — these must stay visible on “Appointments” default views. */
export const ACTIVE_PIPELINE_STATUSES = ['Scheduled', 'Confirmed', 'Checked In', 'In Progress', 'Rescheduled'];

export function isActivePipelineStatus(status) {
  return ACTIVE_PIPELINE_STATUSES.includes(status);
}

/** Assistant “today” lane — show everything except cancelled / no-show (includes completed same-day). */
export function includeInAssistantTodayLane(status) {
  return status !== 'Cancelled' && status !== 'No Show';
}

/** User-facing label (internal state stays Scheduled, etc.) */
export function appointmentStatusLabel(status) {
  const map = {
    Scheduled: 'Pending',
    Confirmed: 'Confirmed',
    'Checked In': 'Checked in',
    'In Progress': 'In progress',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
    'No Show': 'No show',
    Rescheduled: 'Rescheduled',
  };
  return map[status] || status;
}

/** Booking recency for list ordering — real bookings always set `bookedAt`. */
export function bookingTimestampMs(a) {
  if (a.bookedAt) return new Date(a.bookedAt).getTime();
  return 0;
}

/**
 * Active pipeline first (newest booking at top), then terminal rows by visit date (most recent first).
 */
export function compareAppointmentsActiveUpcomingFirst(a, b) {
  const aAct = isActivePipelineStatus(a.status);
  const bAct = isActivePipelineStatus(b.status);
  if (aAct !== bAct) return aAct ? -1 : 1;
  if (aAct) {
    const newestFirst = bookingTimestampMs(b) - bookingTimestampMs(a);
    if (newestFirst !== 0) return newestFirst;
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.time.localeCompare(b.time);
  }
  const d2 = b.date.localeCompare(a.date);
  return d2 !== 0 ? d2 : b.time.localeCompare(a.time);
}
