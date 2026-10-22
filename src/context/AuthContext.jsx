import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@braj_auth_session_v1';

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
          if (parsed && parsed.email && !parsed.isGuest) {
            setUser(parsed);
            setIsAuthenticated(true);
          } else {
            setUser(DEFAULT_GUEST_USER);
            setIsAuthenticated(false);
          }
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

  const login = useCallback(async (email, password) => {
    // Validate and simulate authentication
    const trimmedEmail = email ? email.trim() : '';
    const namePart = trimmedEmail.split('@')[0] || 'श्री कृष्ण भक्त';
    const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const loggedInUser = {
      id: `devotee_${Date.now()}`,
      name: capitalized,
      nameEn: capitalized,
      email: trimmedEmail,
      isGuest: false,
      memberSince: new Date().getFullYear().toString(),
      avatar: '🦚',
    };

    setUser(loggedInUser);
    setIsAuthenticated(true);
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (e) {
      console.warn('Error persisting session:', e);
    }
    return { success: true, user: loggedInUser };
  }, []);

  const register = useCallback(async (name, email, password) => {
    const trimmedEmail = email ? email.trim() : '';
    const trimmedName = name ? name.trim() : 'श्री कृष्ण भक्त';

    const newUser = {
      id: `devotee_${Date.now()}`,
      name: trimmedName,
      nameEn: trimmedName,
      email: trimmedEmail,
      isGuest: false,
      memberSince: new Date().getFullYear().toString(),
      avatar: '🦚',
    };

    setUser(newUser);
    setIsAuthenticated(true);
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.warn('Error persisting session:', e);
    }
    return { success: true, user: newUser };
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
