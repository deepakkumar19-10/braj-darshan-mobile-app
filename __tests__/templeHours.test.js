import { getTempleStatus, parseDarshanWindows, describeDarshanWindows } from '../src/utils/templeHours';
import temples from '../src/data/temples.json';

const bankeBihari = temples.find((t) => t.id === 1);
const premMandir = temples.find((t) => t.id === 3);
const daanGhati = temples.find((t) => t.id === 5);

// Times are given as UTC instants; IST = UTC + 5:30.
const at = (iso) => new Date(iso);

describe('parseDarshanWindows', () => {
  // Since Nov 2026 a temple with no sourced hours says "confirm with the temple" instead of showing times.
  test('every temple timing is either readable or an explicit "not confirmed" note', () => {
    for (const temple of temples) {
      for (const text of [temple.timings.summer, temple.timings.winter]) {
        if (parseDarshanWindows(text) === null) expect(text).toMatch(/पुष्टि|नहीं मिला|झांकियाँ/);
      }
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
    // 07:30 IST in summer: Banke Bihari opened at 07:00, Prem Mandir opens at 08:30 (premmandir.org.in)
    const moment = at('2026-06-15T02:00:00Z');
    expect(getTempleStatus(bankeBihari, moment).isOpen).toBe(true);
    expect(getTempleStatus(premMandir, moment).isOpen).toBe(false);
  });

  test('a temple without sourced hours (Daan Ghati) shows no open/closed guess', () => {
    const status = getTempleStatus(daanGhati, at('2026-06-15T16:30:00Z'));
    expect(status.isKnown).toBe(false);
    expect(status.isOpen).toBe(false);
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
