/**
 * Next-festival helpers built on the app's own festival calendar
 * (YEAR_FESTIVALS_MAP in services/panchangService.js, dates are IST days).
 */

import { YEAR_FESTIVALS_MAP } from '../services/panchangService';

const IST_OFFSET_MINUTES = 330;

// "YYYY-MM-DD" of the given instant in India, whatever the phone's timezone.
export function istDateKey(now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MINUTES * 60000);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const d = String(ist.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// The first festival on or after today (IST); null when the calendar has run out.
export function getNextFestival(now = new Date(), calendar = YEAR_FESTIVALS_MAP) {
  const todayKey = istDateKey(now);
  const key = Object.keys(calendar).sort().find((k) => k >= todayKey);
  if (!key) return null;
  return { key, ...calendar[key], isToday: key === todayKey };
}

// Whole days from today (IST) to a "YYYY-MM-DD" key; 0 means today.
export function daysUntil(dateKey, now = new Date()) {
  const today = Date.parse(`${istDateKey(now)}T00:00:00Z`);
  const target = Date.parse(`${dateKey}T00:00:00Z`);
  return Math.round((target - today) / 86400000);
}
