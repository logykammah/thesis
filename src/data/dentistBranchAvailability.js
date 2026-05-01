/**
 * Realistic per-branch weekday windows for patient booking (core dentists).
 * Same dentist cannot appear at two branches at the same clock time — enforced globally via hasSlotConflict (dentist + date + time).
 *
 * Weekdays: 0 Sun … 6 Sat (JavaScript Date.getDay()).
 * Windows are half-open [start, end): last allowed slot starts before end.
 */

export function isoDateWeekday(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Half-open [start, end) — compare as HH:MM strings */
export function timeInHalfOpenWindow(time, start, end) {
  return time >= start && time < end;
}

/** All HH:MM starts every 30 minutes in [start, end) — e.g. 10:00–14:00 → 10:00 … 13:30 */
export function generateHalfHourSlotsBetween(start, end) {
  const out = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur < endMin) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    cur += 30;
  }
  return out;
}

/** Full 30-minute schedule grid for a dentist at a branch on a calendar day (sorted). */
export function getSlotTimesForDentistBranchDay(dentistId, branchId, isoDate, dentistsList) {
  const dentist = dentistsList?.find((d) => d.id === dentistId);
  if (!dentist?.branchIds?.includes(branchId)) return [];

  const windows = SCHEDULE[dentistId]?.[branchId];
  if (!windows?.length) return [];

  const wd = isoDateWeekday(isoDate);
  const acc = [];
  for (const w of windows) {
    if (!w.weekdays.includes(wd)) continue;
    acc.push(...generateHalfHourSlotsBetween(w.start, w.end));
  }
  return [...new Set(acc)].sort();
}

/**
 * Dr Youssef Hany (D-001): Dokki Sun/Tue/Thu mornings; Zayed Mon/Wed evenings.
 * Dr Amr Elkammah (D-002): Dokki Mon/Wed mid-day; Zayed Tue/Sat evenings.
 * Dr Ahmed Samir (D-003): Dokki Sat/Mon mornings; Zayed Thu afternoons.
 */
const SCHEDULE = {
  'D-001': {
    'BR-DOKKI': [{ weekdays: [0, 2, 4], start: '10:00', end: '14:00' }],
    'BR-ZAYED': [{ weekdays: [1, 3], start: '16:00', end: '20:00' }],
  },
  'D-002': {
    'BR-DOKKI': [{ weekdays: [1, 3], start: '11:00', end: '15:00' }],
    'BR-ZAYED': [{ weekdays: [2, 6], start: '17:00', end: '21:00' }],
  },
  'D-003': {
    'BR-DOKKI': [{ weekdays: [6, 1], start: '09:00', end: '13:00' }],
    'BR-ZAYED': [{ weekdays: [5], start: '15:00', end: '19:00' }],
  },
};

/**
 * @param {Array<{ id: string, branchIds?: string[] }>} dentistsList — pass state.dentists from AppDataContext
 */
export function isSlotAllowedForDentistBranch(dentistId, branchId, isoDate, time, dentistsList) {
  const dentist = dentistsList?.find((d) => d.id === dentistId);
  if (!dentist?.branchIds?.includes(branchId)) return false;

  const windows = SCHEDULE[dentistId]?.[branchId];
  if (!windows?.length) {
    return true;
  }

  const wd = isoDateWeekday(isoDate);
  return windows.some((w) => w.weekdays.includes(wd) && timeInHalfOpenWindow(time, w.start, w.end));
}
