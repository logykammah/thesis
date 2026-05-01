import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Modal } from '../../components/Modal';
import { todayISODate, addDaysISODate } from '../../utils/format';
import { branchNameFromState } from '../../utils/branch';
import { dentistDisplaySpecialty } from '../../data/serviceCatalog';
import {
  BOOKING_PHYSICIAN_IDS,
  BOOKING_PHYSICIAN_META,
  AUTO_BOOKING_VALUE,
} from '../../data/patientPortalBooking';
import { getSlotTimesForDentistBranchDay } from '../../data/dentistBranchAvailability';
import { isSlotBlockingStatus } from '../../utils/appointments';

const BOOKING_HORIZON_DAYS = 56;

function isDentistSlotTaken(appointments, dentistId, date, time) {
  return appointments.some(
    (a) =>
      a.dentistId === dentistId && a.date === date && a.time === time && isSlotBlockingStatus(a.status),
  );
}

function formatDateLabel(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDateLong(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function subtitleForDentist(id) {
  return BOOKING_PHYSICIAN_META.find((m) => m.id === id)?.subtitle || '';
}

const STEPS = [
  { n: 1, label: 'Branch' },
  { n: 2, label: 'Doctor' },
  { n: 3, label: 'Date' },
  { n: 4, label: 'Time' },
  { n: 5, label: 'Review' },
];

export function BookAppointment() {
  const { user } = useAuth();
  const { state, bookAppointment, getAvailableSlots, pushToast } = useAppData();
  const [step, setStep] = useState(1);
  const [branchId, setBranchId] = useState('');
  const [dentistChoice, setDentistChoice] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [slotError, setSlotError] = useState('');

  const bookingBranches = useMemo(() => state.branches.filter((b) => ['BR-DOKKI', 'BR-ZAYED'].includes(b.id)), [state.branches]);

  useEffect(() => {
    if (!branchId && bookingBranches[0]) setBranchId(bookingBranches[0].id);
  }, [bookingBranches, branchId]);

  const dentistsForBooking = useMemo(
    () => BOOKING_PHYSICIAN_IDS.map((id) => state.dentists.find((d) => d.id === id)).filter(Boolean),
    [state.dentists],
  );

  const selectedDoctor = useMemo(() => {
    if (!dentistChoice || dentistChoice === AUTO_BOOKING_VALUE) return null;
    return state.dentists.find((d) => d.id === dentistChoice);
  }, [dentistChoice, state.dentists]);

  /** Dates where the doctor (or at least one clinician in auto mode) has sessions at this branch */
  const availableDates = useMemo(() => {
    if (!branchId || !dentistChoice) return [];
    const out = [];
    const today = todayISODate();
    for (let i = 1; i <= BOOKING_HORIZON_DAYS; i++) {
      const d = addDaysISODate(today, i);
      if (dentistChoice === AUTO_BOOKING_VALUE) {
        const hasHours = BOOKING_PHYSICIAN_IDS.some(
          (id) => getSlotTimesForDentistBranchDay(id, branchId, d, state.dentists).length > 0,
        );
        if (hasHours) out.push(d);
      } else {
        const hasHours = getSlotTimesForDentistBranchDay(dentistChoice, branchId, d, state.dentists).length > 0;
        if (hasHours) out.push(d);
      }
    }
    return out;
  }, [dentistChoice, branchId, state.dentists]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (step < 3 || !dentistChoice || !branchId) return;
    if (availableDates.length === 0) {
      if (date) setDate('');
      setTime('');
      if (step > 3) setStep(3);
      return;
    }
    if (date && !availableDates.includes(date)) {
      setDate('');
      setTime('');
      if (step > 3) setStep(3);
    }
  }, [availableDates, date, step, dentistChoice, branchId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Every 30-minute slot for the day; booked = already taken (cannot double-book) */
  const slotRows = useMemo(() => {
    if (!branchId || !date || !dentistChoice) return [];
    const appts = state.appointments;

    if (dentistChoice !== AUTO_BOOKING_VALUE) {
      const times = getSlotTimesForDentistBranchDay(dentistChoice, branchId, date, state.dentists);
      return times.map((t) => {
        const booked = isDentistSlotTaken(appts, dentistChoice, date, t);
        return { time: t, booked, available: !booked };
      });
    }

    const union = new Set();
    BOOKING_PHYSICIAN_IDS.forEach((id) => {
      getSlotTimesForDentistBranchDay(id, branchId, date, state.dentists).forEach((t) => union.add(t));
    });
    const sorted = [...union].sort();
    return sorted.map((t) => {
      const anyClinicianFree = BOOKING_PHYSICIAN_IDS.some((id) => {
        if (!getSlotTimesForDentistBranchDay(id, branchId, date, state.dentists).includes(t)) return false;
        return !isDentistSlotTaken(appts, id, date, t);
      });
      return { time: t, booked: !anyClinicianFree, available: anyClinicianFree };
    });
  }, [branchId, date, dentistChoice, state.appointments, state.dentists]);

  const resolvedDentistId = useMemo(() => {
    if (!date || !time || !branchId) return '';
    if (dentistChoice === AUTO_BOOKING_VALUE) {
      return (
        BOOKING_PHYSICIAN_IDS.find((id) => {
          if (!getSlotTimesForDentistBranchDay(id, branchId, date, state.dentists).includes(time)) return false;
          return !isDentistSlotTaken(state.appointments, id, date, time);
        }) || ''
      );
    }
    return dentistChoice;
  }, [dentistChoice, date, time, branchId, state.appointments, state.dentists]);

  const resolvedDentist = state.dentists.find((d) => d.id === resolvedDentistId);
  const resolvedSpecialty = useMemo(() => dentistDisplaySpecialty(resolvedDentist), [resolvedDentist]);

  const selectBranch = (id) => {
    setBranchId(id);
    setStep(2);
    setDentistChoice('');
    setTime('');
    setDate('');
  };

  const selectDentist = (id) => {
    setDentistChoice(id);
    setStep(3);
    setTime('');
    setDate('');
  };

  const selectDate = (d) => {
    setDate(d);
    setTime('');
    setStep(4);
  };

  const selectSlot = (row) => {
    if (row.booked) {
      pushToast('This time slot is already booked. Please choose another time.', 'error');
      return;
    }
    setTime(row.time);
    setSlotError('');
    setStep(5);
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
    setSlotError('');
  };

  const openConfirm = () => {
    if (!time) {
      setSlotError('Please choose an available time.');
      return;
    }
    const picked = slotRows.find((r) => r.time === time);
    if (picked?.booked) {
      pushToast('This time slot is already booked. Please choose another time.', 'error');
      return;
    }
    if (!resolvedDentistId) {
      setSlotError('Unable to assign a doctor for this slot. Pick another time.');
      return;
    }
    setSlotError('');
    setConfirmOpen(true);
  };

  const confirm = () => {
    if (!resolvedDentistId || !date || !time || !branchId) {
      pushToast('Missing booking details. Please start again.', 'error');
      setConfirmOpen(false);
      return;
    }
    const stillAvailable = getAvailableSlots(resolvedDentistId, date, branchId).includes(time);
    if (!stillAvailable) {
      pushToast('This slot was just booked. Please choose another available time.', 'error');
      setConfirmOpen(false);
      setTime('');
      setStep(4);
      return;
    }
    const res = bookAppointment({
      patientId: user.id,
      branchId,
      dentistId: resolvedDentistId,
      specialty: resolvedSpecialty,
      date,
      time,
      notes,
      createdBy: 'patient',
      requestedServiceCode: null,
      requestedServiceLabel: null,
    });
    setConfirmOpen(false);
    if (res?.ok) {
      setNotes('');
      setTime('');
      setDate('');
      setDentistChoice('');
      setStep(1);
    }
  };

  return (
    <div className="booking-page">
      <header className="booking-page-header">
        <h1 className="page-title font-serif">Book an appointment</h1>
        <p className="booking-page-lead muted">Choose branch and dentist — then pick a live opening. Fees are confirmed after your visit.</p>
      </header>

      <nav className="booking-progress" aria-label="Booking steps">
        {STEPS.map((s, idx) => (
          <div
            key={s.n}
            className={`booking-progress-step${step >= s.n ? ' is-done' : ''}${step === s.n ? ' is-current' : ''}`}
          >
            <span className="booking-progress-num">{s.n}</span>
            <span className="booking-progress-label">{s.label}</span>
            {idx < STEPS.length - 1 ? <span className="booking-progress-chev" aria-hidden /> : null}
          </div>
        ))}
      </nav>

      <div className="booking-panel card">
        {step === 1 && (
          <div className="booking-step">
            <h2 className="booking-step-title">Select a branch</h2>
            <p className="booking-step-hint muted">Where would you like to be seen?</p>
            <div className="booking-choice-grid">
              {bookingBranches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`booking-choice-card${branchId === b.id ? ' is-selected' : ''}`}
                  onClick={() => selectBranch(b.id)}
                >
                  <span className="booking-choice-title font-serif">{b.shortName}</span>
                  <span className="booking-choice-sub muted">{b.area}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-step">
            <h2 className="booking-step-title">Select your doctor</h2>
            <p className="booking-step-hint muted">Clinicians available for online booking at {branchNameFromState(state, branchId)}.</p>
            <div className="booking-choice-grid booking-choice-grid--dentists">
              {dentistsForBooking.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`booking-choice-card booking-choice-card--dentist${dentistChoice === d.id ? ' is-selected' : ''}`}
                  onClick={() => selectDentist(d.id)}
                >
                  <span className="booking-choice-title">{d.fullName}</span>
                  <span className="booking-choice-sub muted">{subtitleForDentist(d.id)}</span>
                </button>
              ))}
              <button
                type="button"
                className={`booking-choice-card booking-choice-card--dentist${dentistChoice === AUTO_BOOKING_VALUE ? ' is-selected' : ''}`}
                onClick={() => selectDentist(AUTO_BOOKING_VALUE)}
              >
                <span className="booking-choice-title">No preference</span>
                <span className="booking-choice-sub muted">Assign me automatically to the next available clinician</span>
              </button>
            </div>
            <div className="booking-step-actions">
              <button type="button" className="btn btn-secondary" onClick={goBack}>
                Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="booking-step">
            <h2 className="booking-step-title">Choose from available dates</h2>
            <p className="booking-step-hint muted">Only days when this clinician works at this branch are listed.</p>
            {availableDates.length === 0 ? (
              <p className="muted">No openings in the next several weeks for this selection. Try another doctor or branch.</p>
            ) : (
              <div className="booking-date-strip">
                {availableDates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`booking-date-pill${date === d ? ' is-selected' : ''}`}
                    onClick={() => selectDate(d)}
                  >
                    <span className="booking-date-pill-main">{formatDateLabel(d)}</span>
                    <span className="booking-date-pill-sub">{d}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="booking-step-actions">
              <button type="button" className="btn btn-secondary" onClick={goBack}>
                Back
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="booking-step">
            <h2 className="booking-step-title">Choose a time</h2>
            <p className="booking-step-hint muted">
              {formatDateLong(date)}
              {dentistChoice === AUTO_BOOKING_VALUE ? (
                <span className="muted"> · You’ll be assigned to the next available clinician for your selection</span>
              ) : (
                <>
                  {' · '}
                  {selectedDoctor?.fullName}
                </>
              )}
            </p>
            {slotRows.length === 0 ? (
              <p className="muted">No sessions are scheduled on this day for this selection. Pick another date.</p>
            ) : (
              <>
                <div className="booking-slot-legend" aria-hidden>
                  <span className="booking-slot-legend-item">
                    <span className="booking-slot-legend-swatch booking-slot-legend-swatch--free" /> Available
                  </span>
                  <span className="booking-slot-legend-item">
                    <span className="booking-slot-legend-swatch booking-slot-legend-swatch--taken" /> Booked
                  </span>
                </div>
                <div className="booking-slot-grid">
                  {slotRows.map((row) => (
                    <button
                      key={row.time}
                      type="button"
                      disabled={row.booked}
                      title={row.booked ? 'Already booked' : `Book ${row.time}`}
                      className={`booking-slot${row.booked ? ' booking-slot--booked' : ' booking-slot--free'}${time === row.time && !row.booked ? ' is-selected' : ''}`}
                      onClick={() => selectSlot(row)}
                    >
                      {row.time}
                    </button>
                  ))}
                </div>
              </>
            )}
            {slotError ? <p className="booking-error">{slotError}</p> : null}
            <div className="booking-step-actions">
              <button type="button" className="btn btn-secondary" onClick={goBack}>
                Back
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="booking-step">
            <h2 className="booking-step-title">Review your appointment</h2>
            <dl className="booking-review">
              <div className="booking-review-row">
                <dt>Branch</dt>
                <dd>{branchNameFromState(state, branchId)}</dd>
              </div>
              <div className="booking-review-row">
                <dt>Doctor</dt>
                <dd>{resolvedDentist?.fullName || '—'}</dd>
              </div>
              <div className="booking-review-row">
                <dt>Specialty</dt>
                <dd>{resolvedSpecialty}</dd>
              </div>
              <div className="booking-review-row">
                <dt>Date</dt>
                <dd>{formatDateLong(date)}</dd>
              </div>
              <div className="booking-review-row">
                <dt>Time</dt>
                <dd>{time}</dd>
              </div>
            </dl>
            <p className="muted" style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>
              Treatment plan and pricing are finalized at the clinic after examination.
            </p>
            <div className="form-row">
              <label htmlFor="bk-notes">Notes (optional)</label>
              <textarea id="bk-notes" className="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {slotError ? <p className="booking-error">{slotError}</p> : null}
            <div className="booking-step-actions booking-step-actions--split">
              <button type="button" className="btn btn-secondary" onClick={goBack}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={openConfirm}>
                Confirm appointment
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm your booking"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmOpen(false)}>
              Edit
            </button>
            <button type="button" className="btn btn-primary" onClick={confirm}>
              Confirm
            </button>
          </>
        }
      >
        <p>
          Visit with <strong>{resolvedDentist?.fullName}</strong> ({resolvedSpecialty})
        </p>
        <p className="muted" style={{ fontSize: '0.88rem' }}>
          Your invoice will list treatment and fees after this visit is completed.
        </p>
        <p>
          <strong>{branchNameFromState(state, branchId)}</strong>
          <br />
          {formatDateLong(date)} at <strong>{time}</strong>
        </p>
        <p className="muted" style={{ fontSize: '0.88rem' }}>
          You will see this under My appointments after confirmation.
        </p>
        <p className="muted" style={{ fontSize: '0.88rem', marginTop: '0.85rem' }}>
          A reminder will be scheduled 24 hours before your appointment.
        </p>
      </Modal>
    </div>
  );
}
