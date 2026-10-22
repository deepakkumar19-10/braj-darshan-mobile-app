import React, { createContext, useContext, useState, useEffect } from 'react';
import templesData from '../data/temples.json';
import { storageService } from '../services/storageService';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  // Pre-seed initial state
  const [favorites, setFavorites] = useState([templesData[0], templesData[4]]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate favorites from persistent AsyncStorage on mount
  useEffect(() => {
    let isMounted = true;
    async function loadStoredFavorites() {
      try {
        const stored = await storageService.getFavorites();
        if (isMounted && stored && Array.isArray(stored)) {
          setFavorites(stored);
        }
      } catch (err) {
        console.warn('Error hydrating favorites:', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }
    loadStoredFavorites();
    return () => {
      isMounted = false;
    };
  }, []);

  const isFavorite = (id) => {
    return favorites.some((t) => String(t.id) === String(id));
  };

  const toggleFavorite = (temple) => {
    setFavorites((prev) => {
      const exists = prev.some((t) => String(t.id) === String(temple.id));
      const nextFavorites = exists
        ? prev.filter((t) => String(t.id) !== String(temple.id))
        : [...prev, temple];
      
      // Async persist in background
      storageService.saveFavorites(nextFavorites);
      return nextFavorites;
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, isLoaded }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
