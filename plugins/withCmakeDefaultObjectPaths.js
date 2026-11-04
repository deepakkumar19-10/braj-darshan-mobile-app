/**
 * Config plugin: keep CMake's own object-path limit when building on Windows.
 *
 * Expo's root Gradle plugin raises CMAKE_OBJECT_PATH_MAX to 1024 by default. CMake then stops
 * shortening long object-file paths, but the Ninja bundled with the Android SDK's CMake 3.22.1
 * cannot open paths over 260 characters on Windows (long paths are off), so native builds of
 * libraries such as react-native-safe-area-context fail with "Filename longer than 260
 * characters". Setting the Gradle property `expo.android.cmakeObjectPathMax=0` opts out and
 * keeps CMake's defaults, which hash over-long paths (what the bare React Native build did).
 */
const { withGradleProperties } = require('expo/config-plugins');

const KEY = 'expo.android.cmakeObjectPathMax';

module.exports = function withCmakeDefaultObjectPaths(config) {
  return withGradleProperties(config, (cfg) => {
    cfg.modResults = cfg.modResults.filter((item) => !(item.type === 'property' && item.key === KEY));
    cfg.modResults.push({ type: 'property', key: KEY, value: '0' });
    return cfg;
  });
};
