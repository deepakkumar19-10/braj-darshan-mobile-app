/**
 * Braj Darshan - temple and place data, refreshed from the website when possible.
 *
 * The app ships with src/data/temples.json and src/data/places.json. On start, and
 * when it comes back to the foreground (at most once every 12 hours), it asks the
 * website for newer copies, checks them, and keeps the last good copy in
 * AsyncStorage. Screens read through getTemples() / getPlaces() (or the
 * useTemples() / usePlaces() hooks, which re-render when new data arrives). These
 * return the downloaded copy when there is one and the bundled data otherwise.
 *
 * Every failure (offline, 8 s timeout, HTTP error, bad JSON, wrong shape) leaves the
 * data in use untouched, so the app works exactly as before without the website.
 */

import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bundledTemples from '../data/temples.json';
import bundledPlaces from '../data/places.json';

export const API_BASE = 'https://www.divyabraj.com';
export const FETCH_TIMEOUT_MS = 8000;
export const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;

const STORAGE_PREFIX = '@braj_content_v1_';
export const LAST_CHECK_KEY = `${STORAGE_PREFIX}last_check`;
export const storageKey = (name) => `${STORAGE_PREFIX}${name}`;

// Response shape: { version: string, updatedAt: ISO date, data: [...same objects as the bundled JSON] }
export const CONTENT_SOURCES = {
  temples: { path: '/api/v1/legacy/temples', bundled: bundledTemples },
  places: { path: '/api/v1/legacy/places', bundled: bundledPlaces },
};
const NAMES = Object.keys(CONTENT_SOURCES);

let current = { temples: bundledTemples, places: bundledPlaces };
let versions = {}; // name -> version of the downloaded copy in use (absent = bundled)
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      // A broken listener must not stop the others.
    }
  });
}

function applyData(name, data, version) {
  current = { ...current, [name]: data };
  versions = { ...versions, [name]: version };
  emit();
}

export function getTemples() {
  return current.temples;
}

export function getPlaces() {
  return current.places;
}

/** Versions of the downloaded copies in use, e.g. { temples: '2026-11-01' }. Empty = all bundled. */
export function getContentVersions() {
  return versions;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTemples() {
  return useSyncExternalStore(subscribe, getTemples);
}

export function usePlaces() {
  return useSyncExternalStore(subscribe, getPlaces);
}

function isValidId(id, expectedType) {
  if (typeof id !== expectedType) return false;
  if (typeof id === 'number') return Number.isFinite(id);
  return typeof id === 'string' && id.trim() !== '';
}

/**
 * Checks a response (or a stored copy). Returns { version, updatedAt, data } when
 * `data` is a non-empty array of objects that each have an `id` (same type as the
 * bundled ids, no duplicates) and a non-empty `name`; otherwise null.
 */
export function validatePayload(name, payload) {
  const source = CONTENT_SOURCES[name];
  if (!source || !payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const { data, version, updatedAt } = payload;
  if (!Array.isArray(data) || data.length === 0) return null;
  const idType = typeof source.bundled[0]?.id;
  const seen = new Set();
  for (const item of data) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    if (!isValidId(item.id, idType) || seen.has(item.id)) return null;
    if (typeof item.name !== 'string' || item.name.trim() === '') return null;
    seen.add(item.id);
  }
  return {
    version: typeof version === 'string' || typeof version === 'number' ? String(version) : '',
    updatedAt: typeof updatedAt === 'string' ? updatedAt : null,
    data,
  };
}

class HttpError extends Error {
  constructor(status) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

/** GET + JSON parse, rejected after FETCH_TIMEOUT_MS (the whole request, body included). */
async function fetchJson(url) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      if (controller) controller.abort();
      reject(new Error('timeout'));
    }, FETCH_TIMEOUT_MS);
  });
  const request = (async () => {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined,
    });
    if (!response || !response.ok) throw new HttpError(response ? response.status : 0);
    return response.json();
  })();
  request.catch(() => {}); // the loser of the race must not surface as an unhandled rejection
  try {
    return await Promise.race([request, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/** Result: 'updated' | 'unchanged' | 'invalid' | 'http-error' | 'network-error'. */
async function refreshOne(name) {
  let payload;
  try {
    payload = await fetchJson(`${API_BASE}${CONTENT_SOURCES[name].path}`);
  } catch (error) {
    // Invalid JSON from a server that answered counts as an invalid payload.
    if (error instanceof HttpError) return 'http-error';
    if (error instanceof SyntaxError) return 'invalid';
    return 'network-error';
  }
  const valid = validatePayload(name, payload);
  if (!valid) return 'invalid';
  if (valid.version && valid.version === versions[name]) return 'unchanged';
  applyData(name, valid.data, valid.version);
  try {
    await AsyncStorage.setItem(
      storageKey(name),
      JSON.stringify({ version: valid.version, updatedAt: valid.updatedAt, fetchedAt: Date.now(), data: valid.data })
    );
  } catch (e) {
    // Still used for this session; the next start falls back to the previous copy.
  }
  return 'updated';
}

let cacheLoad = null;

/** Puts the last good downloaded copies (if any) in place of the bundled data. Runs once. */
export function loadCachedContent() {
  if (!cacheLoad) {
    cacheLoad = Promise.all(
      NAMES.map(async (name) => {
        try {
          const raw = await AsyncStorage.getItem(storageKey(name));
          if (!raw) return;
          const valid = validatePayload(name, JSON.parse(raw));
          if (valid) applyData(name, valid.data, valid.version);
        } catch (e) {
          // Unreadable cache: keep the bundled data.
        }
      })
    ).then(() => undefined);
  }
  return cacheLoad;
}

let inFlight = null;

/**
 * Fetches both lists unless the website was reached less than 12 hours ago (`force`
 * skips that check). Network errors and timeouts do not count as a check, so the
 * next start or foreground tries again; any answer from the server does.
 * Never throws. Resolves to { skipped: true } or { skipped: false, results }.
 */
export function refreshContent({ force = false } = {}) {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      await loadCachedContent();
      const now = Date.now();
      if (!force) {
        const last = Number(await AsyncStorage.getItem(LAST_CHECK_KEY));
        if (last > 0 && now >= last && now - last < REFRESH_INTERVAL_MS) return { skipped: true };
      }
      const outcomes = await Promise.all(NAMES.map(refreshOne));
      const results = {};
      NAMES.forEach((name, i) => {
        results[name] = outcomes[i];
      });
      if (outcomes.some((r) => r !== 'network-error')) {
        await AsyncStorage.setItem(LAST_CHECK_KEY, String(now));
      }
      return { skipped: false, results };
    } catch (e) {
      return { skipped: false, error: String(e && e.message ? e.message : e) };
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Call once at app start: loads the cache, refreshes, and re-checks on every return to the foreground. */
export function startContentRefresh() {
  refreshContent();
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') refreshContent();
  });
  return () => subscription.remove();
}

/**
 * "Clear offline data" in Settings: deletes every downloaded copy and the 12-hour check
 * time (all `@braj_content_v1_*` keys) and switches the screens back to the bundled data
 * at once. The next start or return to the foreground downloads fresh copies when the
 * website can be reached. Never throws. Resolves to { success, removed }.
 */
export async function clearDownloadedContent() {
  try {
    // Let a cache load or refresh that is already running finish first, so it cannot
    // put the old copy back after this.
    await Promise.all([cacheLoad, inFlight]);
    current = { temples: bundledTemples, places: bundledPlaces };
    versions = {};
    emit();
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
    if (ours.length) await AsyncStorage.multiRemove(ours);
    return { success: true, removed: ours.length };
  } catch (e) {
    return { success: false, removed: 0 };
  }
}

/** Test helper: back to the bundled data with nothing loaded. */
export function resetContentForTests() {
  current = { temples: bundledTemples, places: bundledPlaces };
  versions = {};
  cacheLoad = null;
  inFlight = null;
  listeners.clear();
}
