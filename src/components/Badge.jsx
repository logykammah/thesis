const MAP = {
  Scheduled: 'badge-scheduled',
  Confirmed: 'badge-confirmed',
  'Checked In': 'badge-checked-in',
  'In Progress': 'badge-in-progress',
  Completed: 'badge-completed',
  Cancelled: 'badge-cancelled',
  'No Show': 'badge-no-show',
  Rescheduled: 'badge-rescheduled',
  Pending: 'badge-pending',
  Paid: 'badge-paid',
  'Partially Paid': 'badge-partial',
  Unpaid: 'badge-unpaid',
  OK: 'badge-ok',
  'Low Stock': 'badge-low',
  Critical: 'badge-critical',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
  'Pending Approval': 'badge-pending',
  Received: 'badge-completed',
  Current: 'badge-scheduled',
  Partial: 'badge-partial',
  Cleared: 'badge-paid',
  Ordered: 'badge-scheduled',
};

export function Badge({ children, status }) {
  const key = status || children;
  const cls = MAP[key] || 'badge-muted';
  return <span className={`badge ${cls}`}>{children}</span>;
}
