/**
 * Braj Darshan (श्री ब्रज दर्शन) - Mobile Application
 *
 * App shell: providers, error boundary, offline banner, deep links, temple/place
 * data refresh from the website, and navigation-state restore so the app reopens
 * where the user left it after the OS kills it, the battery dies or it is swiped away.
 */

import React, { useEffect, useState } from 'react';
import { Linking, StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { DrawerProvider } from './src/context/DrawerContext';
import { RootNavigator, navigationRef, routeSync } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';
import { loadNavigationState, saveNavigationState } from './src/navigation/persistence';
import AppErrorBoundary from './src/components/system/AppErrorBoundary';
import OfflineBanner from './src/components/system/OfflineBanner';
import { startContentRefresh } from './src/services/contentService';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { FONT_FILES, fontState } from './src/theme/fonts';

function ThemedApp() {
  const { colors, isDark } = useTheme();
  const [isRestored, setIsRestored] = useState(false);
  const [initialState, setInitialState] = useState<any>();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // A deep link wins over the saved screen.
        const initialUrl = await Linking.getInitialURL();
        if (!initialUrl) {
          const state = await loadNavigationState();
          if (alive && state) setInitialState(state);
        }
      } finally {
        if (alive) setIsRestored(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!isRestored) {
    return <View style={[styles.fill, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {/* Android draws edge-to-edge, so the status bar has no colour of its own (React Native 0.88
          dropped backgroundColor/translucent); this View's background shows through it. */}
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        initialState={initialState}
        onReady={() => routeSync.notify()}
        onStateChange={saveNavigationState}
      >
        <RootNavigator />
      </NavigationContainer>
      <OfflineBanner />
    </View>
  );
}

// Keep the splash screen up until the Mukta font is ready, so no text flashes in the system font.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  // Newer temple/place data from the website (cached; bundled data when offline).
  useEffect(() => startContentRefresh(), []);

  // If the font cannot load, the app still opens, in the phone's own font.
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const fontsReady = fontsLoaded || Boolean(fontError);
  fontState.loaded = fontsLoaded;
  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady]);
  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppErrorBoundary>
            <AuthProvider>
              <FavoritesProvider>
                <DrawerProvider>
                  <ThemedApp />
                </DrawerProvider>
              </FavoritesProvider>
            </AuthProvider>
          </AppErrorBoundary>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
