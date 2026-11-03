import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNextFestival, daysUntil, istDateKey } from '../src/utils/festivals';
import {
  loadNavigationState,
  saveNavigationState,
  clearNavigationState,
} from '../src/navigation/persistence';

const CALENDAR = {
  '2026-10-20': { nameEn: 'Dussehra' },
  '2026-11-08': { nameEn: 'Deepawali' },
  '2026-11-09': { nameEn: 'Govardhan Puja' },
};

describe('festivals', () => {
  test('uses the Indian date, not the phone timezone', () => {
    // 20:00 UTC on 7 Nov is already 8 Nov in India.
    expect(istDateKey(new Date('2026-11-07T20:00:00Z'))).toBe('2026-11-08');
  });

  test('picks the next festival on or after today', () => {
    const next = getNextFestival(new Date('2026-10-27T06:00:00Z'), CALENDAR);
    expect(next.nameEn).toBe('Deepawali');
    expect(next.isToday).toBe(false);
    expect(daysUntil(next.key, new Date('2026-10-27T06:00:00Z'))).toBe(12);
  });

  test('marks a festival that is today', () => {
    const next = getNextFestival(new Date('2026-11-08T03:00:00Z'), CALENDAR);
    expect(next.isToday).toBe(true);
    expect(daysUntil(next.key, new Date('2026-11-08T03:00:00Z'))).toBe(0);
  });

  test('returns null when the calendar has run out', () => {
    expect(getNextFestival(new Date('2027-02-01T00:00:00Z'), CALENDAR)).toBeNull();
  });
});

describe('navigation state persistence', () => {
  beforeEach(async () => {
    await clearNavigationState();
  });

  test('restores the last saved screen', async () => {
    const state = { index: 1, routes: [{ name: 'Home' }, { name: 'TempleDetail', params: { id: 3 } }] };
    saveNavigationState(state);
    await new Promise((r) => setTimeout(r, 0));
    expect(await loadNavigationState()).toEqual(state);
  });

  test('ignores a stale state older than 12 hours', async () => {
    await AsyncStorage.setItem(
      '@braj_nav_state_v2',
      JSON.stringify({ at: Date.now() - 13 * 60 * 60 * 1000, state: { routes: [] } })
    );
    expect(await loadNavigationState()).toBeUndefined();
  });

  test('a corrupt saved state is discarded instead of crashing', async () => {
    await AsyncStorage.setItem('@braj_nav_state_v2', '{not json');
    expect(await loadNavigationState()).toBeUndefined();
    expect(await AsyncStorage.getItem('@braj_nav_state_v2')).toBeNull();
  });
});
