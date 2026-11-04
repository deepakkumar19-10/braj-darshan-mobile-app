import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bundledTemples from '../src/data/temples.json';
import bundledPlaces from '../src/data/places.json';
import { storageService } from '../src/services/storageService';
import {
  API_BASE,
  FETCH_TIMEOUT_MS,
  LAST_CHECK_KEY,
  REFRESH_INTERVAL_MS,
  clearDownloadedContent,
  getContentVersions,
  getPlaces,
  getTemples,
  loadCachedContent,
  refreshContent,
  resetContentForTests,
  storageKey,
  useTemples,
  validatePayload,
} from '../src/services/contentService';

const payload = (data, version = 'v2') => ({ version, updatedAt: '2026-11-01T00:00:00.000Z', data });
const ok = (body) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
const newTemples = [{ ...bundledTemples[0], name: 'Updated temple' }, { id: 999, name: 'New temple' }];
const newPlaces = [{ id: 501, name: 'New place' }];

// Answers per endpoint; anything else fails like a network error.
function mockFetch(byPath) {
  global.fetch = jest.fn((url) => {
    const hit = Object.keys(byPath).find((path) => url === `${API_BASE}${path}`);
    return hit ? byPath[hit]() : Promise.reject(new TypeError('Network request failed'));
  });
}

const mockValidResponses = () =>
  mockFetch({
    '/api/v1/legacy/temples': () => ok(payload(newTemples)),
    '/api/v1/legacy/places': () => ok(payload(newPlaces)),
  });

beforeEach(async () => {
  resetContentForTests();
  await AsyncStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('offline fallback', () => {
  test('serves the bundled data before anything is loaded', () => {
    expect(getTemples()).toBe(bundledTemples);
    expect(getPlaces()).toBe(bundledPlaces);
    expect(getContentVersions()).toEqual({});
  });

  test('keeps the bundled data when the request fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Network request failed')));

    const result = await refreshContent();

    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/api/v1/legacy/temples`, expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/api/v1/legacy/places`, expect.any(Object));
    expect(result.results).toEqual({ temples: 'network-error', places: 'network-error' });
    expect(getTemples()).toBe(bundledTemples);
    expect(getPlaces()).toBe(bundledPlaces);
    // No answer from the server is not a check, so the next start tries again.
    expect(await AsyncStorage.getItem(LAST_CHECK_KEY)).toBeNull();
  });

  test('gives up after 8 seconds and keeps the bundled data', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(() => new Promise(() => {})); // never answers
    let settled = false;
    const pending = refreshContent().then((r) => {
      settled = true;
      return r;
    });
    for (let i = 0; i < 50 && global.fetch.mock.calls.length < 2; i++) await Promise.resolve();
    expect(global.fetch).toHaveBeenCalledTimes(2);

    await jest.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS - 1);
    expect(settled).toBe(false);
    await jest.advanceTimersByTimeAsync(1);
    const result = await pending;

    expect(result.results).toEqual({ temples: 'network-error', places: 'network-error' });
    expect(getTemples()).toBe(bundledTemples);
    expect(getPlaces()).toBe(bundledPlaces);
  });

  test('keeps the bundled data on an HTTP error, and waits 12 h before asking again', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) }));

    const result = await refreshContent();

    expect(result.results).toEqual({ temples: 'http-error', places: 'http-error' });
    expect(getTemples()).toBe(bundledTemples);
    expect(await AsyncStorage.getItem(LAST_CHECK_KEY)).not.toBeNull();
  });
});

describe('payload validation', () => {
  test.each([
    ['null', null],
    ['an array', []],
    ['no data', { version: 'v2' }],
    ['empty data', payload([])],
    ['data that is not an array', payload({ 0: { id: 1, name: 'x' } })],
    ['an item that is not an object', payload([{ id: 1, name: 'x' }, 'oops'])],
    ['an item without id', payload([{ name: 'No id' }])],
    ['an item without name', payload([{ id: 1 }])],
    ['an item with an empty name', payload([{ id: 1, name: '  ' }])],
    ['a string id where the bundled ids are numbers', payload([{ id: '1', name: 'x' }])],
    ['duplicate ids', payload([{ id: 1, name: 'a' }, { id: 1, name: 'b' }])],
  ])('rejects %s', (_, body) => {
    expect(validatePayload('temples', body)).toBeNull();
  });

  test('accepts the documented shape', () => {
    expect(validatePayload('temples', payload(newTemples))).toEqual({
      version: 'v2',
      updatedAt: '2026-11-01T00:00:00.000Z',
      data: newTemples,
    });
  });

  test('a malformed or non-JSON response changes nothing and stores nothing', async () => {
    mockFetch({
      '/api/v1/legacy/temples': () => ok(payload([{ id: 1 }])),
      '/api/v1/legacy/places': () =>
        Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError('Unexpected token <')) }),
    });

    const result = await refreshContent();

    expect(result.results).toEqual({ temples: 'invalid', places: 'invalid' });
    expect(getTemples()).toBe(bundledTemples);
    expect(getPlaces()).toBe(bundledPlaces);
    expect(await AsyncStorage.getItem(storageKey('temples'))).toBeNull();
    expect(await AsyncStorage.getItem(storageKey('places'))).toBeNull();
  });
});

describe('cached data', () => {
  test('uses the stored copy when present', async () => {
    await AsyncStorage.setItem(storageKey('temples'), JSON.stringify(payload(newTemples, 'v1')));

    await loadCachedContent();

    expect(getTemples()).toEqual(newTemples);
    expect(getPlaces()).toBe(bundledPlaces); // nothing stored for places
    expect(getContentVersions()).toEqual({ temples: 'v1' });
  });

  test('ignores a corrupt stored copy', async () => {
    await AsyncStorage.setItem(storageKey('temples'), '{not json');
    await AsyncStorage.setItem(storageKey('places'), JSON.stringify(payload([])));

    await loadCachedContent();

    expect(getTemples()).toBe(bundledTemples);
    expect(getPlaces()).toBe(bundledPlaces);
  });

  test('keeps the stored copy when a later refresh fails', async () => {
    await AsyncStorage.setItem(storageKey('temples'), JSON.stringify(payload(newTemples, 'v1')));
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Network request failed')));

    await refreshContent();

    expect(getTemples()).toEqual(newTemples);
  });

  test('a valid response is used at once, stored, and survives a restart', async () => {
    mockValidResponses();

    const result = await refreshContent();

    expect(result.results).toEqual({ temples: 'updated', places: 'updated' });
    expect(getTemples()).toEqual(newTemples);
    expect(getPlaces()).toEqual(newPlaces);
    const stored = JSON.parse(await AsyncStorage.getItem(storageKey('temples')));
    expect(stored).toMatchObject({ version: 'v2', data: newTemples });

    resetContentForTests(); // as after an app restart
    expect(getTemples()).toBe(bundledTemples);
    await loadCachedContent();
    expect(getTemples()).toEqual(newTemples);
    expect(getContentVersions()).toEqual({ temples: 'v2', places: 'v2' });
  });

  test('asks the website at most once per 12 hours', async () => {
    mockValidResponses();
    const start = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(start);

    await refreshContent();
    expect(global.fetch).toHaveBeenCalledTimes(2);

    clock.mockReturnValue(start + REFRESH_INTERVAL_MS - 1);
    expect(await refreshContent()).toEqual({ skipped: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);

    clock.mockReturnValue(start + REFRESH_INTERVAL_MS);
    const later = await refreshContent();
    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect(later.results).toEqual({ temples: 'unchanged', places: 'unchanged' }); // same version
  });

  test('screens using useTemples() re-render with the new data', async () => {
    function Count() {
      return <Text>{useTemples().length}</Text>;
    }
    let tree;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Count />);
    });
    expect(tree.root.findByType(Text).props.children).toBe(bundledTemples.length);

    mockValidResponses();
    await ReactTestRenderer.act(() => refreshContent());

    expect(tree.root.findByType(Text).props.children).toBe(newTemples.length);
    await ReactTestRenderer.act(() => tree.unmount());
  });
});

describe('clear offline data (Settings)', () => {
  test('removes the downloaded copies and goes back to the bundled data at once', async () => {
    await AsyncStorage.setItem('@braj_favorites_v1', '[1]');
    await AsyncStorage.setItem('@braj_language_v1', 'en');
    mockValidResponses();
    await refreshContent();
    expect(getTemples()).toEqual(newTemples);
    expect(await AsyncStorage.getItem(storageKey('temples'))).not.toBeNull();
    expect(await AsyncStorage.getItem(LAST_CHECK_KEY)).not.toBeNull();
    const listener = jest.fn();
    const { subscribe } = require('../src/services/contentService');
    const unsubscribe = subscribe(listener);

    const result = await clearDownloadedContent();

    expect(result).toEqual({ success: true, removed: 3 }); // temples, places, last_check
    expect(getTemples()).toBe(bundledTemples);
    expect(getPlaces()).toBe(bundledPlaces);
    expect(getContentVersions()).toEqual({});
    expect(listener).toHaveBeenCalled();
    const left = await AsyncStorage.getAllKeys();
    expect(left.filter((key) => key.startsWith('@braj_content_v1_'))).toEqual([]);
    // Saved temples and settings are kept.
    expect(await AsyncStorage.getItem('@braj_favorites_v1')).toBe('[1]');
    expect(await AsyncStorage.getItem('@braj_language_v1')).toBe('en');
    unsubscribe();
  });

  test('after a restart the app uses the bundled data, and the next refresh asks the website again', async () => {
    mockValidResponses();
    await refreshContent();
    await clearDownloadedContent();

    resetContentForTests(); // app restart
    await loadCachedContent();
    expect(getTemples()).toBe(bundledTemples);

    global.fetch = jest.fn(() => Promise.reject(new TypeError('Network request failed')));
    const next = await refreshContent();
    expect(next.skipped).toBe(false); // the 12-hour wait was cleared too
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('works when nothing was downloaded', async () => {
    expect(await clearDownloadedContent()).toEqual({ success: true, removed: 0 });
    expect(getTemples()).toBe(bundledTemples);
  });

  test('the Settings button clears both the old cache keys and the downloaded content', async () => {
    mockValidResponses();
    await refreshContent();
    await AsyncStorage.setItem('@braj_offline_cache_v1_x', '{}');

    const [cache, content] = await Promise.all([storageService.clearCache(), clearDownloadedContent()]);

    expect(cache).toEqual({ success: true, removed: 1 });
    expect(content.success).toBe(true);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });
});
