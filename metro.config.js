// Metro configuration (Master Plan V3, 4.3): Expo's defaults, since the app now builds with the
// Expo CLI (`npx expo start`, `npx expo run:android`, and `export:embed` for release builds).
// Kept from the earlier React Native config: only this folder is watched, and .avif images
// are bundled.
// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.resolver.assetExts = [...config.resolver.assetExts, 'avif'];

module.exports = config;
