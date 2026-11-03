/**
 * Braj Darshan - Mini audio player
 * Sits in the layout above the tab bar (RootNavigator renders it between the
 * stack and the tab bar, so it takes space instead of covering content).
 * Tap the track to open the full player; play/pause and close are 48px.
 *
 * Hidden on the full player screen itself. On screens without the tab bar it
 * adds the bottom safe-area inset so it stays clear of the gesture bar.
 */

import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../../context/AudioContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';
import { Icon } from '../common/Icon';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';

// Same list as RootNavigator: these routes show the tab bar below the player.
const TAB_ROUTES = [ROUTES.HOME, ROUTES.TEMPLES, ROUTES.MAP, ROUTES.PANCHANG, ROUTES.MORE];

function readRouteName(navigation) {
  return typeof navigation?.getCurrentRoute === 'function'
    ? navigation.getCurrentRoute()?.name
    : undefined;
}

// Outside a navigator useNavigation() returns the container, which can report
// the focused route; inside a navigator this simply stays undefined.
function useCurrentRouteName(navigation) {
  const [name, setName] = useState(() => readRouteName(navigation));
  useEffect(() => {
    if (typeof navigation?.addListener !== 'function' || typeof navigation?.getCurrentRoute !== 'function') {
      return undefined;
    }
    setName(readRouteName(navigation));
    return navigation.addListener('state', () => setName(readRouteName(navigation)));
  }, [navigation]);
  return name;
}

export default function MiniAudioPlayer() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const {
    tracks,
    currentTrack,
    isPlaying,
    isPaused,
    position,
    duration,
    isMiniPlayerVisible,
    playTrack,
    resumeTrack,
    pauseTrack,
    closeMiniPlayer,
  } = useAudio();
  const routeName = useCurrentRouteName(navigation);

  const openFull = usePressGuard(() => navigation.navigate(ROUTES.AUDIO_PLAYER));
  const togglePlay = usePressGuard(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      pauseTrack();
    } else if (isPaused) {
      resumeTrack();
    } else {
      // Stopped or ended: nothing to resume, so start the track again.
      const idx = tracks.findIndex((t) => t.id === currentTrack.id);
      playTrack(currentTrack, idx >= 0 ? idx : null);
    }
  }, 400);
  const close = usePressGuard(closeMiniPlayer, 400);

  if (!isMiniPlayerVisible || !currentTrack || routeName === ROUTES.AUDIO_PLAYER) {
    return null;
  }

  const needsInset = routeName !== undefined && !TAB_ROUTES.includes(routeName);
  const progressPct = `${duration > 0 ? Math.min(100, (position / duration) * 100) : 0}%`;
  const title = isHindi ? currentTrack.titleHindi : currentTrack.titleEn || currentTrack.titleHindi;
  const statusText = isPlaying
    ? isHindi ? 'अभी बज रहा है' : 'Now playing'
    : isPaused
      ? isHindi ? 'रुका हुआ' : 'Paused'
      : isHindi ? 'अभी नहीं बज रहा' : 'Not playing';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          shadowColor: colors.shadow,
          paddingBottom: needsInset ? insets.bottom : 0,
        },
        !isDark && styles.shadow,
      ]}
    >
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerHigh }]}>
        <View style={[styles.progressFill, { width: progressPct, backgroundColor: colors.primary }]} />
      </View>

      <View style={styles.row}>
        <Pressable
          onPress={openFull}
          accessibilityRole="button"
          accessibilityLabel={
            isHindi ? `${title}, ${statusText}। पूरा प्लेयर खोलें` : `${title}, ${statusText}. Open full player`
          }
          style={({ pressed }) => [styles.info, pressed && styles.pressed]}
        >
          <View style={[styles.art, { backgroundColor: colors.primaryLight }]}>
            <Icon name="music" size={22} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="bodyBold" color={colors.navy} numberOfLines={1}>
              {title}
            </AppText>
            <View style={styles.statusRow}>
              <Icon name={isPlaying ? 'music' : isPaused ? 'pause' : 'info'} size={14} color={colors.muted} />
              <AppText variant="small" color={colors.muted} numberOfLines={1} style={styles.flex}>
                {statusText}
                {currentTrack.deity ? ` · ${currentTrack.deity}` : ''}
              </AppText>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={togglePlay}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? (isHindi ? 'रोकें' : 'Pause') : isHindi ? 'चलाएँ' : 'Play'}
          style={({ pressed }) => [
            styles.playBtn,
            { backgroundColor: pressed ? colors.primaryDark : colors.primary },
          ]}
        >
          <Icon name={isPlaying ? 'pause' : 'play'} size={22} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={isHindi ? 'ऑडियो बंद करें' : 'Stop and close audio'}
          style={({ pressed }) => [
            styles.closeBtn,
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Icon name="close" size={20} color={colors.navy} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    borderTopWidth: 1,
  },
  shadow: Platform.select({
    ios: {
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    default: {},
  }),
  progressTrack: { height: 3, width: '100%' },
  progressFill: { height: 3 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 8,
    minHeight: 64,
  },
  info: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  pressed: { opacity: 0.75 },
  art: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  playBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
