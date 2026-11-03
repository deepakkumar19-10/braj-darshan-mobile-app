/**
 * DivyaBraj - small astronomy engine for the Panchang.
 *
 * True (not mean) Sun and Moon positions after Jean Meeus, "Astronomical
 * Algorithms" (2nd ed.): Sun ch. 25 (low accuracy, ~0.01°), Moon ch. 47
 * (all longitude terms of Table 47.A, ~0.01–0.02°), sunrise/sunset with the
 * NOAA method (equation of time + refraction, ~1 minute). Sidereal positions use
 * the Lahiri (Chitrapaksha) ayanamsa.
 *
 * Panchang elements are taken at sunrise in Mathura, as Hindu calendars do.
 * Results are reliable except within a few minutes of a boundary, so the UI
 * still labels them "approximate". Keep this file identical in shared/services,
 * app/src/services and the website's src/services.
 */

const DEG = Math.PI / 180;
const SYNODIC_DAYS = 29.530588853;
const MOON_GAIN_PER_DAY = 360 / SYNODIC_DAYS; // mean growth of the Moon–Sun elongation

export const MATHURA = { lat: 27.4924, lon: 77.6737 };
const IST_HOURS = 5.5;

const norm360 = (x) => ((x % 360) + 360) % 360;
const sin = (x) => Math.sin(x * DEG);
const cos = (x) => Math.cos(x * DEG);

export function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function jdToDate(jd) {
  return new Date((jd - 2440587.5) * 86400000);
}

const centuries = (jd) => (jd - 2451545.0) / 36525;

/** Apparent geocentric (tropical) longitude of the Sun, degrees. */
export function sunLongitude(jd) {
  const T = centuries(jd);
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) +
    (0.019993 - 0.000101 * T) * sin(2 * M) +
    0.000289 * sin(3 * M);
  const omega = 125.04 - 1934.136 * T;
  return norm360(L0 + C - 0.00569 - 0.00478 * sin(omega));
}

// Meeus Table 47.A, longitude terms: [D, M, M', F, coefficient in 1e-6 degrees].
const MOON_TERMS = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
  [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
  [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294],
];

/** Apparent geocentric (tropical) longitude of the Moon, degrees. */
export function moonLongitude(jd) {
  const T = centuries(jd);
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.29 * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;

  let sum = 0;
  for (const [d, m, mp, f, c] of MOON_TERMS) {
    const e = m === 0 ? 1 : Math.abs(m) === 1 ? E : E * E;
    sum += c * e * sin(d * D + m * M + mp * Mp + f * F);
  }
  sum += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);

  const omega = 125.04452 - 1934.136261 * T;
  return norm360(Lp + sum / 1e6 - 0.00478 * sin(omega)); // + nutation in longitude
}

/** Lahiri (Chitrapaksha) ayanamsa, degrees. */
export function lahiriAyanamsa(jd) {
  const T = centuries(jd);
  return 23.857092 + 1.396971 * T + 0.000308 * T * T;
}

export const siderealSun = (jd) => norm360(sunLongitude(jd) - lahiriAyanamsa(jd));
export const siderealMoon = (jd) => norm360(moonLongitude(jd) - lahiriAyanamsa(jd));

/** Moon minus Sun, 0–360°. 0 = new moon (Amavasya ends), 180 = full moon. */
export function elongation(jd) {
  return norm360(moonLongitude(jd) - sunLongitude(jd));
}

function signedElongation(jd) {
  const e = elongation(jd);
  return e > 180 ? e - 360 : e;
}

/** Julian Day of the new moon at or before `jd`. */
export function newMoonBefore(jd) {
  let t = jd - elongation(jd) / MOON_GAIN_PER_DAY;
  for (let i = 0; i < 6; i += 1) t -= signedElongation(t) / MOON_GAIN_PER_DAY;
  return t > jd ? newMoonBefore(jd - 2) : t;
}

/** Julian Day of the first new moon after `jd`. */
export function newMoonAfter(jd) {
  return newMoonBefore(newMoonBefore(jd) + SYNODIC_DAYS + 2);
}

/**
 * Sunrise, sunset and solar noon (decimal hours, IST) for a civil date at a place,
 * NOAA method: Sun position at local noon, equation of time, -0.833° altitude.
 */
export function sunTimesIST(year, month1to12, day, place = MATHURA) {
  const noonJd = julianDay(new Date(Date.UTC(year, month1to12 - 1, day, 12))) - place.lon / 360;
  const T = centuries(noonJd);
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const omega = 125.04 - 1934.136 * T;
  const lambda = sunLongitude(noonJd);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * cos(omega);
  const decl = Math.asin(Math.sin(eps * DEG) * Math.sin(lambda * DEG)) / DEG;

  const y = Math.tan((eps / 2) * DEG) ** 2;
  const eqTimeMin =
    4 *
    (y * Math.sin(2 * L0 * DEG) -
      2 * e * Math.sin(M * DEG) +
      4 * e * y * Math.sin(M * DEG) * Math.cos(2 * L0 * DEG) -
      0.5 * y * y * Math.sin(4 * L0 * DEG) -
      1.25 * e * e * Math.sin(2 * M * DEG)) /
    DEG;

  const cosH =
    cos(90.833) / (cos(place.lat) * cos(decl)) - Math.tan(place.lat * DEG) * Math.tan(decl * DEG);
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / DEG;

  const noonUtcMin = 720 - 4 * place.lon - eqTimeMin;
  const toIST = (utcMin) => utcMin / 60 + IST_HOURS;
  return {
    sunriseIST: toIST(noonUtcMin - 4 * H),
    sunsetIST: toIST(noonUtcMin + 4 * H),
    solarNoonIST: toIST(noonUtcMin),
  };
}

/** The instant (Date) of an IST clock time on a civil date. */
export function istInstant(year, month1to12, day, hoursIST) {
  return new Date(Date.UTC(year, month1to12 - 1, day) + (hoursIST - IST_HOURS) * 3600000);
}

/**
 * Index of the karana (0–10 in the order Bava, Balava, Kaulava, Taitila, Gara,
 * Vanija, Vishti, Shakuni, Chatushpada, Naga, Kimstughna) for an elongation.
 */
export function karanaIndex(elong) {
  const k = Math.floor(norm360(elong) / 6); // 0–59 half-tithis
  if (k === 0) return 10; // Kimstughna: first half of Shukla Pratipada
  if (k >= 57) return k - 50; // Shakuni, Chatushpada, Naga at the end of Amavasya
  return (k - 1) % 7; // the seven movable karanas repeat
}

/**
 * Panchang elements at one instant.
 * monthAmanta: 0 = Chaitra … 11 = Phalguna, month counted from new moon (amanta).
 * monthPurnimanta: as used in Braj/North India — Krishna paksha belongs to the next month.
 */
export function panchangAt(instant) {
  const jd = julianDay(instant);
  const elong = elongation(jd);
  const sunSid = siderealSun(jd);
  const moonSid = siderealMoon(jd);

  const tithi = Math.floor(elong / 12); // 0–29, 0 = Shukla Pratipada
  const nakshatra = Math.floor(moonSid / (360 / 27)); // 0 = Ashwini
  const yoga = Math.floor(norm360(sunSid + moonSid) / (360 / 27)); // 0 = Vishkumbha
  const karana = karanaIndex(elong);

  // Lunar month: named after the solar sign the Sun is in at the new moon that starts it.
  const prevNewMoon = newMoonBefore(jd);
  const nextNewMoon = newMoonAfter(jd);
  const signAtStart = Math.floor(siderealSun(prevNewMoon) / 30); // 0 = Mesha
  const signAtEnd = Math.floor(siderealSun(nextNewMoon) / 30);
  const monthAmanta = (signAtStart + 1) % 12;
  const isAdhik = signAtStart === signAtEnd; // no sankranti in this lunation
  const monthPurnimanta = tithi >= 15 && !isAdhik ? (monthAmanta + 1) % 12 : monthAmanta;

  const sunSign = Math.floor(sunSid / 30);
  return {
    tithi,
    nakshatra,
    yoga,
    karana,
    monthAmanta,
    monthPurnimanta,
    isAdhik,
    sunSign,
    // Makar Sankranti to Karka Sankranti: Sun in Makara … Mithuna.
    isUttarayana: sunSign >= 9 || sunSign <= 2,
    newMoonBefore: jdToDate(prevNewMoon),
    newMoonAfter: jdToDate(nextNewMoon),
  };
}

/** Rahu / Yamaganda / Gulika: the n-th (1–8) eighth of daylight for each weekday. */
const KAAL_PART = {
  rahu: [8, 2, 7, 5, 6, 4, 3],
  yamaganda: [5, 4, 3, 2, 1, 7, 6],
  gulika: [7, 6, 5, 4, 3, 2, 1],
};

export function kaalWindow(kind, weekday, sunriseIST, sunsetIST) {
  const part = KAAL_PART[kind][weekday];
  const span = (sunsetIST - sunriseIST) / 8;
  const start = sunriseIST + (part - 1) * span;
  return [start, start + span];
}
