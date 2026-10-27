import AsyncStorage from '@react-native-async-storage/async-storage';
import templesData from '../data/temples.json';

const STORAGE_KEYS = {
  FAVORITES: '@braj_favorites_v1',
  RECENT_TEMPLES: '@braj_recent_temples_v1',
  SETTINGS: '@braj_user_settings_v1',
  OFFLINE_CACHE: '@braj_offline_cache_v1',
  AUDIO_PREFERENCES: '@braj_audio_prefs_v1',
};

// Initial default favorites
const DEFAULT_FAVORITES = [templesData[0], templesData[4]];

export const storageService = {
  /**
   * Favorites Persistence
   */
  async getFavorites() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (data) {
        return JSON.parse(data);
      }
      // If first run, persist default and return
      await this.saveFavorites(DEFAULT_FAVORITES);
      return DEFAULT_FAVORITES;
    } catch (error) {
      console.warn('Failed to load favorites from storage:', error);
      return DEFAULT_FAVORITES;
    }
  },

  async saveFavorites(favorites) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.warn('Failed to save favorites to storage:', error);
      return false;
    }
  },

  /**
   * Recent Viewed Temples
   */
  async getRecentTemples() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_TEMPLES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Failed to load recent temples:', error);
      return [];
    }
  },

  async addRecentTemple(temple) {
    try {
      if (!temple || !temple.id) return;
      const recents = await this.getRecentTemples();
      const filtered = recents.filter((t) => String(t.id) !== String(temple.id));
      const updated = [temple, ...filtered].slice(0, 10);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_TEMPLES, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save recent temple:', error);
    }
  },

  /**
   * User Settings (Devotional Audio Auto-play, Notifications, Language)
   */
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data
        ? JSON.parse(data)
        : {
            chantEnabled: true,
            offlineModePrompt: true,
            highQualityAudio: true,
            language: 'hi',
          };
    } catch (error) {
      return { chantEnabled: true, offlineModePrompt: true, highQualityAudio: true, language: 'hi' };
    }
  },

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.warn('Failed to save settings:', error);
      return false;
    }
  },

  /**
   * Offline Cache for Darshan & Itineraries
   */
  async getCache(cacheKey) {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.OFFLINE_CACHE}_${cacheKey}`);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.data;
    } catch (error) {
      return null;
    }
  },

  async setCache(cacheKey, data) {
    try {
      const payload = {
        timestamp: Date.now(),
        data,
      };
      await AsyncStorage.setItem(`${STORAGE_KEYS.OFFLINE_CACHE}_${cacheKey}`, JSON.stringify(payload));
      return true;
    } catch (error) {
      return false;
    }
  },

  // Removes cached/recent data only. Favourites, settings, language and theme are kept.
  clearCache: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        (key) => key.startsWith(STORAGE_KEYS.OFFLINE_CACHE) || key === STORAGE_KEYS.RECENT_TEMPLES
      );
      await AsyncStorage.removeMany(cacheKeys);
      return { success: true, removed: cacheKeys.length };
    } catch (error) {
      console.warn('Error clearing cache:', error);
      return { success: false, removed: 0 };
    }
  },
};

export default storageService;
