import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../i18n/locales/en.json';
import hi from '../i18n/locales/hi.json';

const LANGUAGE_STORAGE_KEY = '@braj_language_v1';

const translations = {
  hi,
  en,
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('hi');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSavedLanguage() {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (isMounted && saved && (saved === 'hi' || saved === 'en')) {
          setLanguageState(saved);
        }
      } catch (err) {
        console.warn('Failed to load saved language:', err);
      } finally {
        if (isMounted) setIsReady(true);
      }
    }
    loadSavedLanguage();
    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (newLang) => {
    if (newLang !== 'hi' && newLang !== 'en') return;
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (err) {
      console.warn('Failed to persist language:', err);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const next = language === 'hi' ? 'en' : 'hi';
    setLanguage(next);
  }, [language, setLanguage]);

  // Nested dot-notation lookup with safe fallbacks
  const t = useCallback(
    (keyPath, fallback = '') => {
      if (!keyPath || typeof keyPath !== 'string') return fallback || '';

      const keys = keyPath.split('.');
      let current = translations[language];

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = null;
          break;
        }
      }

      if (current !== null && current !== undefined) {
        return current;
      }

      // Fallback to alternate language
      const altLang = language === 'hi' ? 'en' : 'hi';
      let altCurrent = translations[altLang];
      for (const k of keys) {
        if (altCurrent && typeof altCurrent === 'object' && k in altCurrent) {
          altCurrent = altCurrent[k];
        } else {
          altCurrent = null;
          break;
        }
      }

      if (altCurrent !== null && altCurrent !== undefined) {
        return altCurrent;
      }

      return fallback || keyPath;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        isHindi: language === 'hi',
        isEnglish: language === 'en',
        setLanguage,
        toggleLanguage,
        t,
        isReady,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

export default LanguageContext;
