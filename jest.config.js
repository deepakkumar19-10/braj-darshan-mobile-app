const preset = require('@react-native/jest-preset');

module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Most of the app is written in .jsx, which the preset does not transform by default.
  transform: {
    ...preset.transform,
    '^.+\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@react-native-async-storage|react-native-screens|react-native-safe-area-context|react-native-svg)/)',
  ],
};
