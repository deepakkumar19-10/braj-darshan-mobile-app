/**
 * Thin banner shown while the phone has no internet.
 * Everything except maps hand-off and streamed audio works offline (data is bundled),
 * so this only informs — it never blocks the screen.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';
import { Icon } from '../common/Icon';

export default function OfflineBanner() {
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isInternetReachable is null while unknown; only show the banner when sure.
      setOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return unsubscribe;
  }, []);

  if (!offline) return null;

  // Floats just above the tab bar so it never shifts or covers screen headers.
  return (
    <View
      pointerEvents="none"
      style={[styles.banner, { backgroundColor: colors.navy, bottom: insets.bottom + 88 }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Icon name="offline" size={18} color={colors.background} />
      <AppText variant="small" weight="600" color={colors.background} style={styles.text}>
        {isHindi
          ? 'इंटरनेट नहीं है — मंदिर, समय और पंचांग फिर भी दिखेंगे।'
          : 'No internet — temples, timings and Panchang still work.'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    elevation: 6,
  },
  text: { flex: 1 },
});
