/**
 * Saves the navigation state so the app reopens on the same screen after the
 * phone kills it in the background, runs out of battery, or the user swipes it away.
 * Written on every navigation change (cheap, small JSON); a broken or outdated
 * state is discarded instead of crashing the app.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@braj_nav_state_v2';
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // after 12 hours, start fresh on Home

export async function loadNavigationState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw);
    if (!saved || !saved.state || Date.now() - saved.at > MAX_AGE_MS) return undefined;
    return saved.state;
  } catch (e) {
    await clearNavigationState();
    return undefined;
  }
}

export function saveNavigationState(state) {
  if (!state) return;
  AsyncStorage.setItem(KEY, JSON.stringify({ at: Date.now(), state })).catch(() => {
    // Storage full or unavailable: the app keeps working, it just won't restore the screen.
  });
}

export async function clearNavigationState() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    // Ignore
  }
}
