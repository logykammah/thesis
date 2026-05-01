import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/Badge';
import { branchNameFromState } from '../../utils/branch';

function visitForAppointment(state, appointmentId) {
  return state.visits.find((v) => v.appointmentId === appointmentId);
}

function treatmentForVisit(state, visitId) {
  return state.treatmentRecords.find((t) => t.visitId === visitId);
}

export function PreviousVisits() {
  const { user } = useAuth();
  const { state } = useAppData();

  const rows = useMemo(() => {
    return state.appointments
      .filter((a) => a.patientId === user.id && a.status === 'Completed')
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
      .map((a) => {
        const d = state.dentists.find((x) => x.id === a.dentistId);
        const v = visitForAppointment(state, a.id);
        const tr = v ? treatmentForVisit(state, v.id) : null;
        const label = tr?.procedureType || a.requestedServiceLabel || 'Visit completed';
        return {
          id: a.id,
          date: a.date,
          time: a.time,
          doctor: d?.fullName || '—',
          treatment: label,
          branch: branchNameFromState(state, a.branchId),
        };
      });
  }, [state.appointments, state.dentists, state.visits, state.treatmentRecords, user.id]);

  return (
    <div>
      <h1 className="page-title font-serif">Previous visits</h1>
      <p className="page-sub">Completed appointments at Clarity Dental.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Branch</th>
              <th>Doctor</th>
              <th>Treatment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.date}
                  <span className="muted" style={{ fontSize: '0.82rem', marginLeft: '0.35rem' }}>
                    {r.time}
                  </span>
                </td>
                <td>{r.branch}</td>
                <td>{r.doctor}</td>
                <td>{r.treatment}</td>
                <td>
                  <Badge status="Completed">Completed</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <div className="empty-state">No completed visits yet.</div> : null}
      </div>
    </div>
  );
}
