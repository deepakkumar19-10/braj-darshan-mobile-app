/**
 * Braj Darshan (श्री ब्रज दर्शन) - Mobile Application
 * UI/UX Redesign & Feature Polish
 * Apple HIG Compliant Devotional Mobile Application
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { AudioProvider } from './src/context/AudioContext';
import { DrawerProvider } from './src/context/DrawerContext';
import { RootNavigator, navigationRef } from './src/navigation/RootNavigator';

function ThemedApp() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <FavoritesProvider>
              <AudioProvider>
                <DrawerProvider>
                  <ThemedApp />
                </DrawerProvider>
              </AudioProvider>
            </FavoritesProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
