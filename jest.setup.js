/* eslint-env jest */
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js')
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The phone's text-to-speech voice (naam jap) is a native module.
jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn(), isSpeakingAsync: jest.fn(async () => false) }));

// No real network in tests: the app's content refresh (src/services/contentService.js)
// then falls back to the bundled data. Tests that need answers replace global.fetch.
global.fetch = jest.fn(() => Promise.reject(new TypeError('Network request failed')));
