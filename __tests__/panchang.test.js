import {
  julianDay,
  elongation,
  siderealSun,
  newMoonAfter,
  sunTimesIST,
  panchangAt,
  istInstant,
  karanaIndex,
} from '../src/services/vedicAstro';
import { calculatePanchang } from '../src/services/panchangService';

const jd = (iso) => julianDay(new Date(iso));
const near = (a, b, tol) => Math.abs(a - b) <= tol;

describe('true Sun/Moon positions', () => {
  test('eclipses: full moon 3 Mar 2026, new moon 12 Aug 2026', () => {
    expect(near(elongation(jd('2026-03-03T11:33:00Z')), 180, 0.3)).toBe(true);
    const e = elongation(jd('2026-08-12T17:46:00Z'));
    expect(e < 0.3 || e > 359.7).toBe(true);
  });

  test('Makar Sankranti 2026 falls on 14 January (sidereal Sun reaches 270°)', () => {
    expect(siderealSun(jd('2026-01-14T06:00:00Z'))).toBeLessThan(270);
    expect(siderealSun(jd('2026-01-14T12:00:00Z'))).toBeGreaterThan(270);
  });

  test('new moon of Deepawali 2026 is on 9 November (UTC)', () => {
    const nm = new Date((newMoonAfter(jd('2026-11-02T00:00:00Z')) - 2440587.5) * 86400000);
    expect(nm.toISOString().slice(0, 10)).toBe('2026-11-09');
  });

  test('Mathura sunrise in early November is about 6:30 IST, not 6:49', () => {
    const { sunriseIST, sunsetIST } = sunTimesIST(2026, 11, 2);
    expect(near(sunriseIST, 6.5, 0.05)).toBe(true);
    expect(near(sunsetIST, 17.58, 0.05)).toBe(true);
  });
});

describe('Panchang elements', () => {
  const at = (y, m, d) => panchangAt(istInstant(y, m, d, sunTimesIST(y, m, d).sunriseIST));

  test('Janmashtami 4 Sep 2026: Krishna Ashtami, Rohini, Bhadrapada', () => {
    const p = at(2026, 9, 4);
    expect(p.tithi).toBe(22);
    expect(p.nakshatra).toBe(3);
    expect(p.monthPurnimanta).toBe(5);
  });

  test('2026 has an Adhik Jyeshtha', () => {
    const p = at(2026, 6, 1);
    expect(p.isAdhik).toBe(true);
    expect(p.monthAmanta).toBe(2);
  });

  test('karana sequence: Kimstughna, movable seven, then Shakuni/Chatushpada/Naga', () => {
    expect(karanaIndex(3)).toBe(10);
    expect(karanaIndex(7)).toBe(0);
    expect(karanaIndex(6 * 7 + 1)).toBe(6); // first Vishti
    expect(karanaIndex(343)).toBe(7);
    expect(karanaIndex(349)).toBe(8);
    expect(karanaIndex(355)).toBe(9);
  });

  test('calculatePanchang for 2 Nov 2026 (Monday) in Braj', () => {
    const p = calculatePanchang(new Date(2026, 10, 2));
    expect(p.tithiEn).toBe('Krishna Ashtami');
    expect(p.nakshatraEn).toBe('Ashlesha');
    expect(p.hinduMonthEn).toBe('Kartika');
    expect(p.samvat).toBe('2083');
    expect(p.shakaSamvat).toBe('1948');
    expect(p.ayanaEn).toBe('Dakshinayana');
    expect(p.sunrise).toBe('06:30 AM');
    // Monday's Rahu kaal is the 2nd eighth of daylight.
    expect(p.rahukaal).toMatch(/^07:5\d AM – 09:1\d AM$/);
  });

  test('every day of 2026–2027 produces complete values', () => {
    for (let t = new Date(2026, 0, 1); t < new Date(2028, 0, 1); t = new Date(t.getTime() + 86400000)) {
      const p = calculatePanchang(t);
      for (const k of ['tithiEn', 'nakshatraEn', 'yogaEn', 'karanaEn', 'hinduMonthEn', 'rituEn', 'sunrise', 'rahukaal']) {
        expect(p[k]).toBeTruthy();
      }
    }
  });
});
