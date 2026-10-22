const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const realRoot = 'C:\\Users\\sunit\\OneDrive\\Desktop\\Projects\\Braj\\Braj-darshan-app';
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  watchFolders: [__dirname, realRoot],
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'avif'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
