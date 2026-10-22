import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

const THEME_STORAGE_KEY = '@braj_theme_mode_v1';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState('light'); // 'light' | 'dark' | 'system'
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');
  const [isReady, setIsReady] = useState(false);

  // Listen to system appearance changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => sub.remove();
  }, []);

  // Hydrate saved preference from AsyncStorage
  useEffect(() => {
    let isMounted = true;
    async function loadSavedTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && saved && ['light', 'dark', 'system'].includes(saved)) {
          setThemeModeState(saved);
        }
      } catch (err) {
        console.warn('Failed to load saved theme mode:', err);
      } finally {
        if (isMounted) setIsReady(true);
      }
    }
    loadSavedTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) return;
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Failed to persist theme mode:', err);
    }
  }, []);

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = useCallback(() => {
    const nextMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [isDark, setThemeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        setThemeMode,
        toggleTheme,
        isReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export default ThemeContext;
