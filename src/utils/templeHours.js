/**
 * Real-time darshan status for a temple, computed in Indian Standard Time (IST)
 * from that temple's own `timings.summer` / `timings.winter` text in temples.json,
 * e.g. 'प्रातः 07:45 से 12:00, सायं 05:30 से रात्रि 09:30'.
 *
 * Season switch is approximate (April–October = summer). Temples change timings on
 * festivals, so the UI should keep its 'timings may change' note.
 */

const IST_OFFSET_MINUTES = 330;

// Returns a Date whose local getters (getHours, getMonth, ...) show IST wall-clock time,
// whatever timezone the device is set to. Does not depend on Intl support.
export function getIndianStandardTime(now = new Date()) {
  return new Date(now.getTime() + (IST_OFFSET_MINUTES + now.getTimezoneOffset()) * 60000);
}

// Words written just before a time that mean afternoon/evening/night (PM).
const PM_WORDS = ['दोपहर', 'सायं', 'शाम', 'रात्रि', 'रात'];

/**
 * Parses 'HH:MM ... HH:MM[, ... HH:MM ... HH:MM]' into darshan windows in minutes from midnight.
 * Times are written on a 12-hour clock without AM/PM: a preceding दोपहर/सायं/रात्रि word marks PM,
 * and later times are moved past noon when they would otherwise go backwards.
 * Returns null if the text can't be read safely.
 */
export function parseDarshanWindows(text) {
  const times = [...String(text || '').matchAll(/(\S+)?\s*(\d{1,2}):(\d{2})/g)].map((m) => {
    const hour = Number(m[2]);
    const isPm = PM_WORDS.includes(m[1]) && hour < 12;
    return (isPm ? hour + 12 : hour) * 60 + Number(m[3]);
  });
  if (times.length !== 2 && times.length !== 4) return null;

  const fixed = [];
  for (const t of times) {
    let value = t;
    const prev = fixed[fixed.length - 1];
    while (prev !== undefined && value <= prev) value += 12 * 60;
    fixed.push(value);
  }
  if (fixed[fixed.length - 1] > 24 * 60) return null;

  const windows = [];
  for (let i = 0; i < fixed.length; i += 2) windows.push([fixed[i], fixed[i + 1]]);
  return windows;
}

export function getTodaysWindows(temple, istDate) {
  const month = istDate.getMonth();
  const isSummer = month >= 3 && month <= 9;
  const timings = temple?.timings || {};
  return parseDarshanWindows(isSummer ? timings.summer : timings.winter);
}

export function formatMinutes(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

export function getTempleStatus(temple, now = new Date()) {
  const istDate = getIndianStandardTime(now);
  const minutes = istDate.getHours() * 60 + istDate.getMinutes();
  const windows = getTodaysWindows(temple, istDate);

  if (!windows) {
    return {
      isOpen: false,
      isKnown: false,
      label: '🕐 दर्शन समय देखें',
      variant: 'warning',
      hint: 'इस मंदिर का समय अभी स्वचालित रूप से नहीं पढ़ा जा सका',
      badgeHi: '🕐 दर्शन समय देखें',
      badgeEn: '🕐 See darshan timings',
      subtextHi: 'इस मंदिर का समय अभी स्वचालित रूप से नहीं पढ़ा जा सका',
      subtextEn: 'Timings for this temple could not be read automatically',
      nextEvent: null
    };
  }

  const current = windows.find(([start, end]) => minutes >= start && minutes < end);
  if (current) {
    const closes = formatMinutes(current[1]);
    return {
      isOpen: true,
      isKnown: true,
      label: '🟢 दर्शन खुला है (Open)',
      variant: 'success',
      hint: `पट ${closes} पर बंद होंगे`,
      badgeHi: '🟢 दर्शन खुले हैं (Open Now)',
      badgeEn: '🟢 Open Now',
      subtextHi: `पट ${closes} पर बंद होंगे`,
      subtextEn: `Closes at ${closes}`,
      nextEvent: `Closes at ${closes}`
    };
  }

  const next = windows.find(([start]) => start > minutes) || windows[0];
  const opens = formatMinutes(next[0]);
  return {
    isOpen: false,
    isKnown: true,
    label: '🔴 पट बंद हैं',
    variant: 'warning',
    hint: `पट ${opens} पर खुलेंगे`,
    badgeHi: `🔴 पट बंद हैं (खुलेंगे ${opens})`,
    badgeEn: `🔴 Closed - Opens at ${opens}`,
    subtextHi: `पट ${opens} पर खुलेंगे`,
    subtextEn: `Opens at ${opens}`,
    nextEvent: `Opens at ${opens}`
  };
}
