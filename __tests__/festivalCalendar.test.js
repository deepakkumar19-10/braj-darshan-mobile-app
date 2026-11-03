import { YEAR_FESTIVALS_MAP } from '../src/services/panchangService';
import { julianDay, siderealSun, sunTimesIST, panchangAt, istInstant } from '../src/services/vedicAstro';
import { getNextFestival } from '../src/utils/festivals';

const KEYS = Object.keys(YEAR_FESTIVALS_MAP).sort();

// Tithi index: 0–14 Shukla Pratipada…Purnima, 15–29 Krishna Pratipada…Amavasya.
const atSunrise = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return panchangAt(istInstant(y, m, d, sunTimesIST(y, m, d).sunriseIST));
};
const atDusk = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return panchangAt(istInstant(y, m, d, sunTimesIST(y, m, d).sunsetIST + 0.75));
};

describe('festival calendar data', () => {
  test('every key is a real date and every entry has names and a badge', () => {
    for (const key of KEYS) {
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${key}T00:00:00Z`).toISOString().slice(0, 10)).toBe(key);
      const fest = YEAR_FESTIVALS_MAP[key];
      for (const field of ['nameHi', 'nameEn', 'shortHi', 'shortEn', 'badge']) {
        expect(typeof fest[field]).toBe('string');
        expect(fest[field].length).toBeGreaterThan(0);
      }
    }
  });

  test('"next festival" never runs out between now and December 2027', () => {
    for (let t = Date.UTC(2026, 10, 3); t <= Date.UTC(2027, 11, 9); t += 86400000) {
      expect(getNextFestival(new Date(t))).not.toBeNull();
    }
  });

  test('after Devutthana Ekadashi 2026 the next festival is Kartik Purnima', () => {
    expect(getNextFestival(new Date('2026-11-21T03:00:00Z')).key).toBe('2026-11-24');
  });
});

describe('festival dates agree with the Panchang engine (tithi at Mathura sunrise)', () => {
  const BY_SUNRISE = {
    '2026-11-10': 0, // Govardhan Puja: Pratipada (Amavasya was still at sunrise on 9 Nov)
    '2026-11-11': 1, // Yama Dwitiya
    '2026-11-18': 8, // Akshaya Navami
    '2026-11-24': 14, // Kartik Purnima
    '2026-12-14': 4, // Vihar Panchami
    '2026-12-20': 10, // Gita Jayanti
    '2027-02-11': 4, // Basant Panchami
    '2027-03-18': 10, // Rangbhari Ekadashi
    '2027-04-07': 0, // Chaitra Navratri
    '2027-04-15': 8, // Ram Navami
    '2027-05-09': 2, // Akshaya Tritiya
    '2027-06-14': 10, // Nirjala Ekadashi
    '2027-07-18': 14, // Guru Purnima
    '2027-08-17': 14, // Raksha Bandhan
    '2027-08-25': 22, // Janmashtami (Krishna Ashtami)
    '2027-09-08': 7, // Radhashtami
    '2027-10-29': 29, // Deepawali (Amavasya)
    '2027-10-30': 0, // Govardhan Puja
    '2027-10-31': 1, // Yama Dwitiya
    '2027-11-06': 7, // Gopashtami
    '2027-11-07': 8, // Akshaya Navami
    '2027-11-10': 10, // Devutthana Ekadashi
    '2027-11-14': 14, // Kartik Purnima
    '2027-12-03': 4, // Vihar Panchami
    '2027-12-09': 10, // Gita Jayanti
  };

  test.each(Object.entries(BY_SUNRISE))('%s', (key, tithi) => {
    expect(YEAR_FESTIVALS_MAP[key]).toBeDefined();
    expect(atSunrise(key).tithi).toBe(tithi);
  });

  test('Janmashtami and Radhashtami 2027 fall in Bhadrapada, Deepawali in Kartika', () => {
    expect(atSunrise('2027-08-25').monthPurnimanta).toBe(5);
    expect(atSunrise('2027-09-08').monthPurnimanta).toBe(5);
    expect(atSunrise('2027-10-29').monthPurnimanta).toBe(7);
  });

  test('Holika Dahan 2027: Purnima at dusk on 21 March', () => {
    expect(atDusk('2027-03-21').tithi).toBe(14);
  });

  test('Makar Sankranti 2027: Sun enters Capricorn after sunset on 14 Jan, so the festival is 15 Jan', () => {
    expect(siderealSun(julianDay(new Date('2027-01-14T15:00:00Z')))).toBeLessThan(270);
    expect(siderealSun(julianDay(new Date('2027-01-14T16:00:00Z')))).toBeGreaterThan(270);
    expect(YEAR_FESTIVALS_MAP['2027-01-15']).toBeDefined();
    expect(YEAR_FESTIVALS_MAP['2027-01-14']).toBeUndefined();
  });
});
