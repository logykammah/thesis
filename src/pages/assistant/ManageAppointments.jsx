import { useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { dentistDisplaySpecialty, servicesForDentist, serviceByCode } from '../../data/serviceCatalog';
import { SearchBar } from '../../components/SearchBar';
import { Badge } from '../../components/Badge';
import { addDaysISODate, todayISODate } from '../../utils/format';
import { branchNameFromState } from '../../utils/branch';
import { appointmentStatusLabel, compareAppointmentsActiveUpcomingFirst, isActivePipelineStatus } from '../../utils/appointments';

const STATUS_OPTS = [
  'Scheduled',
  'Confirmed',
  'Checked In',
  'In Progress',
  'Rescheduled',
  'Completed',
  'Cancelled',
  'No Show',
];

const CAN_EDIT = ['Scheduled', 'Confirmed', 'Checked In', 'In Progress', 'Rescheduled'];

export function ManageAppointments() {
  const { state, upsertAppointment, cancelAppointment, rescheduleAppointment, completeAppointment, getAvailableSlots } = useAppData();
  const [status, setStatus] = useState('active');
  const [dentist, setDentist] = useState('all');
  const [branch, setBranch] = useState('all');
  const [datePreset, setDatePreset] = useState('all');
  const [pickDate, setPickDate] = useState('');
  const [q, setQ] = useState('');
  const today = todayISODate();
  const [walkOpen, setWalkOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rsDate, setRsDate] = useState('');
  const [rsTime, setRsTime] = useState('');
  const [walk, setWalk] = useState(() => {
    const branchId = state.branches[0]?.id;
    const d = state.dentists.find((x) => x.branchIds?.includes(branchId));
    const svcList = d ? servicesForDentist(state.serviceRates, d) : state.serviceRates;
    return {
      branchId,
      patientId: state.patients[0]?.id,
      dentistId: d?.id,
      specialty: d ? dentistDisplaySpecialty(d) : 'General Dentistry',
      requestedServiceCode: svcList[0]?.code || '',
      date: todayISODate(),
      time: '12:00',
      notes: 'Phone booking',
    };
  });

  const rows = useMemo(() => {
    const weekEnd = addDaysISODate(today, 7);
    const filtered = state.appointments.filter((a) => {
      if (status === 'active') {
        if (!isActivePipelineStatus(a.status)) return false;
      } else if (status !== 'all' && a.status !== status) return false;
      if (dentist !== 'all' && a.dentistId !== dentist) return false;
      if (branch !== 'all' && a.branchId !== branch) return false;
      if (datePreset === 'today' && a.date !== today) return false;
      if (datePreset === 'week' && (a.date < today || a.date > weekEnd)) return false;
      if (datePreset === 'day' && pickDate && a.date !== pickDate) return false;
      const name = state.patients.find((p) => p.id === a.patientId)?.fullName?.toLowerCase() || '';
      if (q && !name.includes(q.toLowerCase()) && !a.id.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    return [...filtered].sort(compareAppointmentsActiveUpcomingFirst);
  }, [state.appointments, state.patients, status, dentist, branch, datePreset, pickDate, q, today]);

  const dentistsAtWalk = state.dentists.filter((d) => d.branchIds?.includes(walk.branchId));
  const walkDentist = state.dentists.find((d) => d.id === walk.dentistId);
  const walkServices = useMemo(
    () => (walkDentist ? servicesForDentist(state.serviceRates, walkDentist) : state.serviceRates),
    [walkDentist, state.serviceRates],
  );
  const slots = useMemo(
    () => (walk.dentistId && walk.branchId ? getAvailableSlots(walk.dentistId, walk.date, walk.branchId) : []),
    [getAvailableSlots, walk.dentistId, walk.date, walk.branchId],
  );

  const rsSlots = useMemo(
    () =>
      rescheduleTarget?.dentistId && rescheduleTarget?.branchId && rsDate
        ? getAvailableSlots(rescheduleTarget.dentistId, rsDate, rescheduleTarget.branchId, rescheduleTarget.id)
        : [],
    [getAvailableSlots, rescheduleTarget, rsDate],
  );

  const openReschedule = (a) => {
    setRescheduleTarget(a);
    setRsDate(a.date);
    setRsTime(a.time);
  };

  return (
    <div>
      <h1 className="page-title font-serif">Manage appointments</h1>
      <p className="page-sub">
        Same shared ledger as patient &amp; dentist portals — patient bookings appear here automatically with branch, date, and status
        filters.
      </p>
      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} placeholder="Patient name or ID" />
        <select className="select" style={{ maxWidth: 140 }} value={datePreset} onChange={(e) => setDatePreset(e.target.value)}>
          <option value="all">Any date</option>
          <option value="today">Today</option>
          <option value="week">Next 7 days</option>
          <option value="day">Pick date…</option>
        </select>
        {datePreset === 'day' ? (
          <input className="input" type="date" style={{ maxWidth: 160 }} value={pickDate} onChange={(e) => setPickDate(e.target.value)} />
        ) : null}
        <select className="select" style={{ maxWidth: 150 }} value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="all">All branches</option>
          {state.branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.shortName}
            </option>
          ))}
        </select>
        <select className="select" style={{ maxWidth: 190 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active & upcoming</option>
          <option value="all">All statuses</option>
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="select" style={{ maxWidth: 200 }} value={dentist} onChange={(e) => setDentist(e.target.value)}>
          <option value="all">All dentists</option>
          {state.dentists.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setWalkOpen(true)}>
          Add walk-in / phone
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Branch</th>
              <th>Patient</th>
              <th>Dentist</th>
              <th>Service</th>
              <th>When</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className={a.createdBy === 'patient' ? 'data-table__row-patient-booked' : undefined}>
                <td>{a.id}</td>
                <td>{branchNameFromState(state, a.branchId)}</td>
                <td>{state.patients.find((p) => p.id === a.patientId)?.fullName}</td>
                <td>{state.dentists.find((d) => d.id === a.dentistId)?.fullName}</td>
                <td>{a.requestedServiceLabel || '—'}</td>
                <td>
                  {a.date} {a.time}
                  {a.patientNewForDentist && a.createdBy === 'patient' && CAN_EDIT.includes(a.status) ? (
                    <span className="badge badge-confirmed" style={{ marginLeft: '0.35rem', fontSize: '0.68rem' }}>
                      New
                    </span>
                  ) : null}
                </td>
                <td>
                  <Badge status={a.status}>{appointmentStatusLabel(a.status)}</Badge>
                </td>
                <td>
                  <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                    {CAN_EDIT.includes(a.status) ? (
                      <>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => openReschedule(a)}>
                          Reschedule
                        </button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => completeAppointment(a.id)}>
                          Complete
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => cancelAppointment(a.id)}>
                          Cancel
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {walkOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setWalkOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title font-serif">Walk-in / phone booking</h2>
              <button type="button" className="modal-close" onClick={() => setWalkOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Branch</label>
                <select
                  className="select"
                  value={walk.branchId}
                  onChange={(e) => {
                    const branchId = e.target.value;
                    const firstD = state.dentists.find((d) => d.branchIds?.includes(branchId));
                    const list = firstD ? servicesForDentist(state.serviceRates, firstD) : state.serviceRates;
                    setWalk({
                      ...walk,
                      branchId,
                      dentistId: firstD?.id || '',
                      specialty: firstD ? dentistDisplaySpecialty(firstD) : walk.specialty,
                      requestedServiceCode: list[0]?.code || '',
                    });
                  }}
                >
                  {state.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Patient</label>
                <select className="select" value={walk.patientId} onChange={(e) => setWalk({ ...walk, patientId: e.target.value })}>
                  {state.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Dentist</label>
                <select
                  className="select"
                  value={walk.dentistId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const d = state.dentists.find((x) => x.id === id);
                    const list = d ? servicesForDentist(state.serviceRates, d) : [];
                    setWalk({
                      ...walk,
                      dentistId: id,
                      specialty: d ? dentistDisplaySpecialty(d) : walk.specialty,
                      requestedServiceCode: list[0]?.code || '',
                    });
                  }}
                >
                  {dentistsAtWalk.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Service</label>
                <select
                  className="select"
                  value={walk.requestedServiceCode}
                  onChange={(e) => setWalk({ ...walk, requestedServiceCode: e.target.value })}
                >
                  {walkServices.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="muted" style={{ fontSize: '0.82rem', margin: '-0.35rem 0 0.5rem' }}>
                Department: <strong>{walk.specialty}</strong> (from dentist)
              </p>
              <div className="form-row">
                <label>Date</label>
                <input className="input" type="date" value={walk.date} onChange={(e) => setWalk({ ...walk, date: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Available slot</label>
                <select className="select" value={walk.time} onChange={(e) => setWalk({ ...walk, time: e.target.value })}>
                  {slots.length === 0 ? <option value="">No slots</option> : null}
                  {slots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setWalkOpen(false)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const res = upsertAppointment({
                    ...walk,
                    requestedServiceLabel: serviceByCode(walk.requestedServiceCode)?.label ?? null,
                  });
                  if (res?.ok !== false) setWalkOpen(false);
                }}
              >
                Save booking
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rescheduleTarget ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setRescheduleTarget(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title font-serif">Reschedule appointment</h2>
              <button type="button" className="modal-close" onClick={() => setRescheduleTarget(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="muted" style={{ fontSize: '0.88rem', marginTop: 0 }}>
                {state.patients.find((p) => p.id === rescheduleTarget.patientId)?.fullName} ·{' '}
                {state.dentists.find((d) => d.id === rescheduleTarget.dentistId)?.fullName}
              </p>
              <div className="form-row">
                <label>New date</label>
                <input className="input" type="date" value={rsDate} onChange={(e) => setRsDate(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Available slot</label>
                <select className="select" value={rsTime} onChange={(e) => setRsTime(e.target.value)}>
                  {rsSlots.length === 0 ? <option value="">No openings</option> : null}
                  {rsSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setRescheduleTarget(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const ok = rescheduleAppointment({
                    appointmentId: rescheduleTarget.id,
                    date: rsDate,
                    time: rsTime,
                  });
                  if (ok?.ok !== false) setRescheduleTarget(null);
                }}
              >
                Save new time
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
