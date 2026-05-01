import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { branchNameFromState } from '../../utils/branch';
import {
  appointmentStatusLabel,
  compareAppointmentsActiveUpcomingFirst,
  isActivePipelineStatus,
} from '../../utils/appointments';

const CAN_COMPLETE = ['Scheduled', 'Confirmed', 'Checked In', 'In Progress', 'Rescheduled'];

export function DentistAppointments() {
  const { user } = useAuth();
  const { state, completeAppointment } = useAppData();
  const [detail, setDetail] = useState(null);
  const [view, setView] = useState('active');

  const rows = useMemo(() => {
    const mine = state.appointments.filter((a) => a.dentistId === user.id);
    let list;
    if (view === 'active') {
      list = mine.filter((a) => isActivePipelineStatus(a.status));
      list.sort(compareAppointmentsActiveUpcomingFirst);
    } else if (view === 'history') {
      list = mine.filter((a) => !isActivePipelineStatus(a.status));
      list.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    } else {
      list = [...mine].sort(compareAppointmentsActiveUpcomingFirst);
    }
    return list;
  }, [state.appointments, user.id, view]);

  const dentistSelf = state.dentists.find((d) => d.id === user.id)?.fullName || user.displayName;

  return (
    <div>
      <h1 className="page-title font-serif">Appointments</h1>
      <p className="page-sub">Same schedule as patient portal and front desk — one shared ledger.</p>
      <div className="toolbar" style={{ marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span className="muted" style={{ marginRight: '0.35rem', fontSize: '0.88rem' }}>
          Show:
        </span>
        {[
          { id: 'active', label: 'Active & upcoming' },
          { id: 'all', label: 'All' },
          { id: 'history', label: 'Past & cancelled' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`btn btn-sm ${view === opt.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Branch</th>
              <th>Patient</th>
              <th>Specialty</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state" style={{ padding: '1rem' }}>
                    {view === 'active'
                      ? 'No active or upcoming appointments. Try “All” or “Past & cancelled”, or confirm the booking exists in shared state.'
                      : 'Nothing in this view.'}
                  </div>
                </td>
              </tr>
            ) : null}
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  {a.date} {a.time}
                  {a.patientNewForDentist && CAN_COMPLETE.includes(a.status) && a.createdBy === 'patient' ? (
                    <span className="badge badge-confirmed" style={{ marginLeft: '0.35rem', fontSize: '0.7rem' }}>
                      New
                    </span>
                  ) : null}
                </td>
                <td>{branchNameFromState(state, a.branchId)}</td>
                <td>{state.patients.find((p) => p.id === a.patientId)?.fullName}</td>
                <td>{a.specialty}</td>
                <td>
                  <Badge status={a.status}>{appointmentStatusLabel(a.status)}</Badge>
                </td>
                <td>
                  <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetail(a)}>
                      Details
                    </button>
                    {CAN_COMPLETE.includes(a.status) ? (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => completeAppointment(a.id)}>
                        Complete visit
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal title="Appointment" open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail ? (
          <div>
            <p>
              <Badge status={detail.status}>{appointmentStatusLabel(detail.status)}</Badge>
            </p>
            <p>
              <strong>Patient:</strong> {state.patients.find((p) => p.id === detail.patientId)?.fullName}
            </p>
            <p>
              <strong>Dentist:</strong> {dentistSelf}
            </p>
            <p>
              <strong>Branch:</strong> {branchNameFromState(state, detail.branchId)}
            </p>
            <p>
              <strong>Slot:</strong> {detail.date} {detail.time}
            </p>
            <p>
              <strong>Booked:</strong> {detail.createdBy === 'patient' ? 'Patient portal' : 'Clinic / assistant'}
              {detail.bookedAt ? ` · ${new Date(detail.bookedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
            </p>
            <p>
              <strong>Notes:</strong> {detail.notes || '—'}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
