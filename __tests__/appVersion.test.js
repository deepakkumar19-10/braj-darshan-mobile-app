import { getAppVersion } from '../src/utils/appVersion';
const appJson = require('../app.json');
const pkg = require('../package.json');

test('shows the version and versionCode from the build config (app.json)', () => {
  const { version, android } = appJson.expo;
  expect(getAppVersion()).toBe(`${version} (${android.versionCode})`);
});

test('handles a config without a versionCode, or no config at all', () => {
  expect(getAppVersion({ version: '1.2.3' })).toBe('1.2.3');
  expect(getAppVersion({ version: '1.2.3', android: { versionCode: 0 } })).toBe('1.2.3');
  expect(getAppVersion(null)).toBe('');
  expect(getAppVersion({})).toBe('');
});

test('versions stay in step: package.json = app.json, semver, versionCode a positive integer', () => {
  expect(appJson.expo.version).toMatch(/^\d+\.\d+\.\d+$/);
  expect(pkg.version).toBe(appJson.expo.version);
  expect(Number.isInteger(appJson.expo.android.versionCode)).toBe(true);
  expect(appJson.expo.android.versionCode).toBeGreaterThan(0);
});
