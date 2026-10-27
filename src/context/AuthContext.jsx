import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@braj_auth_session_v1';
export const ACCOUNTS_UNAVAILABLE = 'accounts-unavailable';

const DEFAULT_GUEST_USER = {
  id: 'guest_user',
  name: 'अतिथि तीर्थयात्री',
  nameEn: 'Guest Pilgrim',
  email: 'guest@brajdarshan.org',
  isGuest: true,
  memberSince: '2026',
  avatar: '🪷',
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load session from AsyncStorage
  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (isMounted && stored) {
          const parsed = JSON.parse(stored);
          if (parsed && !parsed.isGuest) {
            // Any stored non-guest session was created by the old simulated login; drop it.
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
          setUser(DEFAULT_GUEST_USER);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.warn('Failed to load auth session:', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }
    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real accounts are not available yet. Earlier builds accepted any email/password
  // and created a local fake account; that is no longer done.
  const login = useCallback(async () => {
    throw new Error(ACCOUNTS_UNAVAILABLE);
  }, []);

  const register = useCallback(async () => {
    throw new Error(ACCOUNTS_UNAVAILABLE);
  }, []);

  const loginAsGuest = useCallback(async () => {
    setUser(DEFAULT_GUEST_USER);
    setIsAuthenticated(false);
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_GUEST_USER));
    } catch (e) {
      console.warn('Error persisting guest session:', e);
    }
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    setUser(DEFAULT_GUEST_USER);
    setIsAuthenticated(false);
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_GUEST_USER));
    } catch (e) {
      console.warn('Error clearing session:', e);
    }
  }, []);

  const updateProfile = useCallback(async (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser)).catch(() => {});
      return nextUser;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isGuest: !isAuthenticated || user?.isGuest,
        login,
        register,
        loginAsGuest,
        logout,
        updateProfile,
        isLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
