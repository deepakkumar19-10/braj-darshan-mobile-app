import { getTempleStatus, parseDarshanWindows, describeDarshanWindows } from '../src/utils/templeHours';
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
  // Banke Bihari hours as set by the temple committee in Sep 2025.
  test('opens exactly at 07:00 IST in summer', () => {
    expect(getTempleStatus(bankeBihari, at('2026-06-15T01:29:00Z')).isOpen).toBe(false);
    expect(getTempleStatus(bankeBihari, at('2026-06-15T01:30:00Z')).isOpen).toBe(true);
  });

  test('closes at 12:30 IST and reopens at 16:15 IST in summer', () => {
    expect(getTempleStatus(bankeBihari, at('2026-06-15T06:59:00Z')).isOpen).toBe(true);
    expect(getTempleStatus(bankeBihari, at('2026-06-15T07:00:00Z')).isOpen).toBe(false);
    expect(getTempleStatus(bankeBihari, at('2026-06-15T10:44:00Z')).isOpen).toBe(false);
    expect(getTempleStatus(bankeBihari, at('2026-06-15T10:45:00Z')).isOpen).toBe(true);
  });

  test('winter hours: 08:00–13:30 and 16:00–21:00 IST', () => {
    expect(getTempleStatus(bankeBihari, at('2026-12-10T02:29:00Z')).isOpen).toBe(false);
    expect(getTempleStatus(bankeBihari, at('2026-12-10T02:30:00Z')).isOpen).toBe(true);
    expect(getTempleStatus(bankeBihari, at('2026-12-10T08:00:00Z')).isOpen).toBe(false);
    expect(getTempleStatus(bankeBihari, at('2026-12-10T10:30:00Z')).isOpen).toBe(true);
    expect(getTempleStatus(bankeBihari, at('2026-12-10T15:30:00Z')).isOpen).toBe(false);
  });

  test('closed at 23:59 IST', () => {
    expect(getTempleStatus(bankeBihari, at('2026-06-15T18:29:00Z')).isOpen).toBe(false);
  });

  test('different temples can differ at the same moment', () => {
    // 05:45 IST: Prem Mandir opens 05:30, Banke Bihari opens 07:00
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

describe('describeDarshanWindows', () => {
  test('shows the temple\'s own hours, not a fixed schedule', () => {
    expect(describeDarshanWindows(bankeBihari.timings.summer)).toEqual([
      '7:00 AM - 12:30 PM',
      '4:15 PM - 9:30 PM',
    ]);
  });

  test('falls back to the original text when it cannot be read', () => {
    expect(describeDarshanWindows('त्योहार पर समय बदलता है')).toEqual(['त्योहार पर समय बदलता है']);
    expect(describeDarshanWindows(undefined)).toEqual([]);
  });
});
