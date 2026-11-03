/**
 * DivyaBraj Panchang engine (Nov 2026), built on astronomy-engine (MIT, offline, no API key).
 *
 * Accuracy: checked against Swiss Ephemeris within 6 s on every tithi, nakshatra and yoga boundary for
 * 2026–2027, and against Drik Panchang (Mathura) and Prokerala on 18 sample dates (see
 * Braj/reports/research/PANCHANG_ACCURACY_REPORT.md). Two corrections make that possible:
 *  - Delta T is fixed near the IERS value for 2025–2028 (69.1 s) instead of the library's extrapolation.
 *  - Elongation is Moon minus Sun apparent longitude (not the library's MoonPhase, which drops the Sun's
 *    aberration and shifts tithi ends by ~40 s).
 * Lahiri ayanamsa is reproduced the Swiss Ephemeris way (value at 1956-03-21 + IAU 2006 precession +
 * nutation). Sunrise/sunset: upper limb with standard refraction. Moonrise/moonset: centre of the disc on
 * the horizon without refraction, which is what Drik prints. A Hindu day runs sunrise to next sunrise.
 * All times are India Standard Time, whatever time zone the device uses.
 */
import * as A from "astronomy-engine";

export const MATHURA = { lat: 27.4924, lng: 77.6737 };
const IST_OFFSET_MIN = 330;
const DAY_MS = 86400000;
const DELTA_T_SECONDS = 69.1; // revisit after 2028 (IERS bulletins)
A.SetDeltaTFunction(() => DELTA_T_SECONDS);

const mod360 = (x) => ((x % 360) + 360) % 360;
const norm180 = (x) => {
  const y = mod360(x);
  return y > 180 ? y - 360 : y;
};

// ---- Lahiri (Chitrapaksha) ayanamsa
const LAHIRI_T0_JD_TT = 2435553.5;
const LAHIRI_AYAN_T0 = 23.245524743;
const precessionPA = (T) => 5028.796195 * T + 1.1054348 * T ** 2 + 0.00007964 * T ** 3 - 0.000023857 * T ** 4 - 0.0000000383 * T ** 5;
const T0 = (LAHIRI_T0_JD_TT - 2451545.0) / 36525;
function ayanamsa(time) {
  const T = time.tt / 36525;
  return LAHIRI_AYAN_T0 + (precessionPA(T) - precessionPA(T0)) / 3600 + A.e_tilt(time).dpsi / 3600;
}

// ---- angles
export const elongation = (date) => {
  const t = A.MakeTime(date);
  return mod360(A.EclipticGeoMoon(t).lon - A.SunPosition(t).elon);
};
export const sunSidereal = (date) => {
  const t = A.MakeTime(date);
  return mod360(A.SunPosition(t).elon - ayanamsa(t));
};
export const moonSidereal = (date) => {
  const t = A.MakeTime(date);
  return mod360(A.EclipticGeoMoon(t).lon - ayanamsa(t));
};
const yogaAngle = (date) => {
  const t = A.MakeTime(date);
  const ay = ayanamsa(t);
  return mod360(A.SunPosition(t).elon - ay + A.EclipticGeoMoon(t).lon - ay);
};

// ---- root finding on increasing angles
function rate(f, ms) {
  const h = 3600000;
  return norm180(f(new Date(ms + h)) - f(new Date(ms - h))) / ((2 * h) / DAY_MS);
}
function nextCrossing(f, target, fromMs, approxRate) {
  const fd = mod360(target - f(new Date(fromMs)));
  let t = fromMs + ((fd === 0 ? 360 : fd) / approxRate) * DAY_MS;
  for (let i = 0; i < 40; i += 1) {
    const dt = (norm180(target - f(new Date(t))) / rate(f, t)) * DAY_MS;
    t += dt;
    if (Math.abs(dt) < 50) break;
  }
  return t;
}
function prevCrossing(f, target, fromMs, approxRate) {
  let t = fromMs - (mod360(f(new Date(fromMs)) - target) / approxRate) * DAY_MS;
  for (let i = 0; i < 40; i += 1) {
    const dt = (norm180(target - f(new Date(t))) / rate(f, t)) * DAY_MS;
    t += dt;
    if (Math.abs(dt) < 50) break;
  }
  return t;
}

// ---- civil dates (IST)
export const istMidnightMs = (dateKey) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d) - IST_OFFSET_MIN * 60000;
};
export const addDaysKey = (dateKey, n) => new Date(Date.parse(`${dateKey}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
export const weekdayOf = (dateKey) => new Date(`${dateKey}T12:00:00Z`).getUTCDay();
/** Minutes after IST midnight of dateKey (can be below 0 or above 1440). */
export const istMinutes = (ms, dateKey) => (ms - istMidnightMs(dateKey)) / 60000;

// ---- rise and set
const observerOf = (place) => new A.Observer(place.lat, place.lng, 0);
function riseSet(body, direction, fromMs, limitDays, place) {
  const t = A.SearchRiseSet(body, observerOf(place), direction, new Date(fromMs), limitDays);
  return t ? t.date.getTime() : null;
}
export const sunriseMs = (dateKey, place = MATHURA) => riseSet(A.Body.Sun, +1, istMidnightMs(dateKey), 1, place);
export const sunsetMs = (dateKey, place = MATHURA) => riseSet(A.Body.Sun, -1, istMidnightMs(dateKey) + 12 * 3600000, 1, place);
function moonAtHorizon(direction, fromMs, limitDays, place) {
  const t = A.SearchAltitude(A.Body.Moon, observerOf(place), direction, new Date(fromMs), limitDays, 0);
  return t ? t.date.getTime() : null;
}

// ---- elements
const SEG = { tithi: 12, karana: 6, nakshatra: 360 / 27, yoga: 360 / 27 };
const FN = { tithi: elongation, karana: elongation, nakshatra: moonSidereal, yoga: yogaAngle };
const RATE = { tithi: 12.19, karana: 12.19, nakshatra: 13.18, yoga: 14.17 };
const indexAt = (kind, ms) => Math.floor(FN[kind](new Date(ms)) / SEG[kind]) % Math.round(360 / SEG[kind]);

/** Every span of `kind` current between startMs and endMs: [{ index, startMs, endMs }]. */
function spansBetween(kind, startMs, endMs) {
  const n = Math.round(360 / SEG[kind]);
  const out = [];
  let idx = indexAt(kind, startMs);
  let begin = prevCrossing(FN[kind], idx * SEG[kind], startMs, RATE[kind]);
  for (let guard = 0; guard < 8; guard += 1) {
    const end = nextCrossing(FN[kind], ((idx + 1) % n) * SEG[kind], guard === 0 ? startMs : begin + 1000, RATE[kind]);
    out.push({ index: idx, startMs: begin, endMs: end });
    if (end >= endMs) break;
    idx = (idx + 1) % n;
    begin = end;
  }
  return out;
}

/** 0..59 half-tithi -> karana index 0..10 (Bava … Naga, Kimstughna). */
export function karanaOfHalf(k) {
  if (k === 0) return 10;
  if (k >= 57) return k - 50;
  return (k - 1) % 7;
}

/** Lunar month at an instant: amanta/purnimanta index (0 = Chaitra) and adhik maas. */
function lunarMonthAt(ms, tithiIndex) {
  const nm0 = prevCrossing(elongation, 0, ms, 12.19);
  const nm1 = nextCrossing(elongation, 0, nm0 + 2 * DAY_MS, 12.19);
  const s0 = Math.floor(sunSidereal(new Date(nm0)) / 30);
  const s1 = Math.floor(sunSidereal(new Date(nm1)) / 30);
  const amanta = (s0 + 1) % 12;
  const isAdhik = s0 === s1;
  return { amanta, purnimanta: tithiIndex >= 15 && !isAdhik ? (amanta + 1) % 12 : amanta, isAdhik };
}

// Rahu / Yamaganda / Gulika: the n-th eighth of daylight by weekday (0 = Sunday).
const KAAL_PART = { rahu: [8, 2, 7, 5, 6, 4, 3], yamaganda: [5, 4, 3, 2, 1, 7, 6], gulika: [7, 6, 5, 4, 3, 2, 1] };
const kaal = (kind, weekday, rise, set) => {
  const span = (set - rise) / 8;
  const start = rise + (KAAL_PART[kind][weekday] - 1) * span;
  return { startMs: start, endMs: start + span };
};

/** Tithi at sunrise only — fast enough for month calendars and the crowd estimate. */
export function tithiAtSunrise(dateKey, place = MATHURA) {
  const rise = sunriseMs(dateKey, place);
  return Math.floor(elongation(new Date(rise)) / 12) % 30;
}

/**
 * Full Panchang for one civil date (IST) at a place. Every span lists start and end instants, so a
 * tithi that ends before the next sunrise (kshaya) or covers two sunrises (vriddhi) is visible.
 */
export function computeDay(dateKey, place = MATHURA) {
  const rise = sunriseMs(dateKey, place);
  const set = sunsetMs(dateKey, place);
  const nextRise = sunriseMs(addDaysKey(dateKey, 1), place);
  const prevSet = sunsetMs(addDaysKey(dateKey, -1), place);
  const weekday = weekdayOf(dateKey);
  const lim = (nextRise - rise) / DAY_MS;
  const tithis = spansBetween("tithi", rise, nextRise);
  const tithi = tithis[0].index;
  const karanas = spansBetween("karana", rise, nextRise);
  const sunSign = Math.floor(sunSidereal(new Date(rise)) / 30);
  const dayMuhurta = (set - rise) / 15;
  const nightMuhurta = (rise - prevSet) / 15;
  return {
    dateKey,
    weekday,
    sunriseMs: rise,
    sunsetMs: set,
    nextSunriseMs: nextRise,
    moonriseMs: moonAtHorizon(+1, rise, lim, place),
    moonsetMs: moonAtHorizon(-1, rise, lim, place),
    tithi,
    tithis,
    kshayaTithis: tithis.slice(1).filter((s) => s.endMs < nextRise).map((s) => s.index),
    tithiCoversNextSunrise: tithis[0].endMs > nextRise,
    nakshatras: spansBetween("nakshatra", rise, nextRise),
    yogas: spansBetween("yoga", rise, nextRise),
    karanas: karanas.map((k) => ({ ...k, index: karanaOfHalf(k.index) })),
    month: lunarMonthAt(rise, tithi),
    sunSign,
    isUttarayana: sunSign >= 9 || sunSign <= 2, // Makar Sankranti to Karka Sankranti (sidereal)
    rahu: kaal("rahu", weekday, rise, set),
    yamaganda: kaal("yamaganda", weekday, rise, set),
    gulika: kaal("gulika", weekday, rise, set),
    // Abhijit: the 8th of 15 day muhurtas; Drik and Prokerala do not observe it on Wednesdays.
    abhijit: weekday === 3 ? null : { startMs: rise + 7 * dayMuhurta, endMs: rise + 8 * dayMuhurta },
    // Brahma muhurta: the 14th of 15 night muhurtas (ends one night-muhurta before sunrise).
    brahmaMuhurta: { startMs: rise - 2 * nightMuhurta, endMs: rise - nightMuhurta },
  };
}
