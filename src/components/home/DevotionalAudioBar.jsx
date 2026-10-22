import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAudio } from '../../context/AudioContext';
import { AppText } from '../common/AppText';
import { ROUTES } from '../../navigation/routes';

export default function DevotionalAudioBar() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { isPlaying, currentTrack, resumeTrack, pauseTrack, playTrack, tracks } = useAudio();

  const handleTogglePlay = (e) => {
    e.stopPropagation?.();
    if (isPlaying) {
      pauseTrack();
    } else {
      if (currentTrack) {
        resumeTrack();
      } else if (tracks && tracks.length > 0) {
        playTrack(tracks[0]);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.bar,
        {
          backgroundColor: isDark ? colors.cardAlt : '#FFFFFF',
          borderColor: isDark ? colors.border : 'rgba(164, 55, 0, 0.2)',
        },
      ]}
      activeOpacity={0.88}
      onPress={() => navigation.navigate(ROUTES.AUDIO_PLAYER)}
    >
      {/* Play / Pause Circular Button */}
      <TouchableOpacity
        style={[styles.playBtn, { backgroundColor: colors.primary }]}
        onPress={handleTogglePlay}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppText variant="caption" weight="700" color="#FFFFFF">
          {isPlaying ? '❚❚' : '▶'}
        </AppText>
      </TouchableOpacity>

      {/* Track & Chanting Info */}
      <View style={styles.trackInfo}>
        <AppText variant="body" weight="700" color={colors.navy} numberOfLines={1}>
          {isHindi ? 'नाम संकीर्तन: "राधे राधे"' : "Chant: 'राधे राधे - Radha Radha'"}
        </AppText>
        <AppText variant="small" color={colors.primary} numberOfLines={1}>
          ılı {isHindi ? 'ब्रज धुन • मंदिर शांति नाद' : 'Braj Dhun • Temple Ambient Soundscape'}
        </AppText>
      </View>

      {/* Speaker Icon */}
      <View style={styles.speakerWrap}>
        <AppText variant="caption" color={colors.muted}>
          🔊
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 10,
    borderWidth: 1,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trackInfo: {
    flex: 1,
    marginRight: 8,
  },
  speakerWrap: {
    paddingHorizontal: 6,
  },
});
