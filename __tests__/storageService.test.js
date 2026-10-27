import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '../src/services/storageService';

test('clearCache removes cache and recent items but keeps favourites and settings', async () => {
  await AsyncStorage.setItem('@braj_favorites_v1', '[1]');
  await AsyncStorage.setItem('@braj_user_settings_v1', '{}');
  await AsyncStorage.setItem('@braj_recent_temples_v1', '[]');
  await AsyncStorage.setItem('@braj_offline_cache_v1_temples', '{}');

  const result = await storageService.clearCache();

  expect(result).toEqual({ success: true, removed: 2 });
  expect(await AsyncStorage.getItem('@braj_favorites_v1')).toBe('[1]');
  expect(await AsyncStorage.getItem('@braj_user_settings_v1')).toBe('{}');
  expect(await AsyncStorage.getItem('@braj_recent_temples_v1')).toBeNull();
  expect(await AsyncStorage.getItem('@braj_offline_cache_v1_temples')).toBeNull();
});
