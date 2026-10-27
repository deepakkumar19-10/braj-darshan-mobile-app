import { getTempleStatus, parseDarshanWindows } from '../src/utils/templeHours';
import temples from '../src/data/temples.json';

const bankeBihari = temples.find((t) => t.id === 1);
const premMandir = temples.find((t) => t.id === 3);
const daanGhati = temples.find((t) => t.id === 5);

// Times are given as UTC instants; IST = UTC + 5:30.
const at = (iso) => new Date(iso);

describe('parseDarshanWindows', () => {
  test('every temple timing in the data can be read', () => {
    for (const temple of temples) {
      expect(parseDarshanWindows(temple.timings.summer)).not.toBeNull();
      expect(parseDarshanWindows(temple.timings.winter)).not.toBeNull();
    }
  });

  test('reads morning and evening windows', () => {
    expect(parseDarshanWindows('प्रातः 07:45 से 12:00, सायं 05:30 से रात्रि 09:30')).toEqual([
      [465, 720],
      [1050, 1290],
    ]);
  });

  test('reads a single continuous window with रात्रि', () => {
    expect(parseDarshanWindows('प्रातः 05:00 से रात्रि 11:00 (अविरल दर्शन)')).toEqual([[300, 1380]]);
  });

  test('returns null for unreadable text', () => {
    expect(parseDarshanWindows('')).toBeNull();
    expect(parseDarshanWindows('केवल त्योहारों पर')).toBeNull();
  });
});

describe('getTempleStatus (IST)', () => {
  test('opens exactly at 07:45 IST in summer', () => {
    expect(getTempleStatus(bankeBihari, at('2026-06-15T02:14:00Z')).isOpen).toBe(false);
    expect(getTempleStatus(bankeBihari, at('2026-06-15T02:15:00Z')).isOpen).toBe(true);
  });

  test('closes at 12:00 IST and reopens at 17:30 IST', () => {
    expect(getTempleStatus(bankeBihari, at('2026-06-15T06:30:00Z')).isOpen).toBe(false);
    expect(getTempleStatus(bankeBihari, at('2026-06-15T12:00:00Z')).isOpen).toBe(true);
  });

  test('closed at 23:59 IST', () => {
    expect(getTempleStatus(bankeBihari, at('2026-06-15T18:29:00Z')).isOpen).toBe(false);
  });

  test('different temples can differ at the same moment', () => {
    // 05:45 IST: Prem Mandir opens 05:30, Banke Bihari opens 07:45
    const moment = at('2026-06-15T00:15:00Z');
    expect(getTempleStatus(premMandir, moment).isOpen).toBe(true);
    expect(getTempleStatus(bankeBihari, moment).isOpen).toBe(false);
  });

  test('continuous window: Daan Ghati open at 22:00 IST, closed at 23:30 IST', () => {
    expect(getTempleStatus(daanGhati, at('2026-06-15T16:30:00Z')).isOpen).toBe(true);
    expect(getTempleStatus(daanGhati, at('2026-06-15T18:00:00Z')).isOpen).toBe(false);
  });

  test('unknown timings give a neutral status', () => {
    const status = getTempleStatus({ timings: {} }, at('2026-06-15T06:00:00Z'));
    expect(status.isKnown).toBe(false);
    expect(status.isOpen).toBe(false);
  });
});
