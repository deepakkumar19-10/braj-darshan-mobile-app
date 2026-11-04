/**
 * The app version shown to the user, read from the build instead of being typed in by hand.
 *
 * `app.json` is the only place the version is set: `expo.version` (e.g. "1.0.0") and
 * `expo.android.versionCode` (e.g. 2). expo-constants embeds that config in every build
 * (release APK, EAS build) and Expo Go serves it with the app, so this always matches
 * the build that is running. Returns "1.0.0 (2)", "1.0.0" without a versionCode, or ''
 * when the config is not available.
 */

import Constants from 'expo-constants';

export function getAppVersion(config = Constants.expoConfig) {
  const version = config && typeof config.version === 'string' ? config.version.trim() : '';
  if (!version) return '';
  const code = config.android && config.android.versionCode;
  return Number.isInteger(code) && code > 0 ? `${version} (${code})` : version;
}

export default getAppVersion;
