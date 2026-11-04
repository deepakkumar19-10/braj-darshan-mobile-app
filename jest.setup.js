/* eslint-env jest */
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js')
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The phone's text-to-speech voice (naam jap) is a native module.
jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn(), isSpeakingAsync: jest.fn(async () => false) }));

// Fonts and the splash screen are native; tests run with the font "loaded".
jest.mock('expo-font', () => ({ useFonts: () => [true, null], loadAsync: jest.fn(async () => {}), isLoaded: () => true }));
jest.mock('expo-splash-screen', () => ({ preventAutoHideAsync: jest.fn(async () => {}), hideAsync: jest.fn(async () => {}) }));
jest.mock('@expo-google-fonts/mukta', () => ({
  Mukta_400Regular: 1, Mukta_500Medium: 2, Mukta_600SemiBold: 3, Mukta_700Bold: 4, Mukta_800ExtraBold: 5,
}));

// No real network in tests: the app's content refresh (src/services/contentService.js)
// then falls back to the bundled data. Tests that need answers replace global.fetch.
global.fetch = jest.fn(() => Promise.reject(new TypeError('Network request failed')));
