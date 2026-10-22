import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../../context/AudioContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import AppText from '../common/AppText';
import { ROUTES } from '../../navigation/routes';

export default function MiniAudioPlayer() {
  const navigation = useNavigation();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    isMiniPlayerVisible,
    resumeTrack,
    pauseTrack,
    closeMiniPlayer,
  } = useAudio();

  const spinValue = useRef(new Animated.Value(0)).current;

  // Rotation animation for devotional chakra / disc
  useEffect(() => {
    let anim;
    if (isPlaying) {
      anim = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      anim.start();
    } else {
      spinValue.stopAnimation();
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isPlaying, spinValue]);

  if (!isMiniPlayerVisible || !currentTrack) {
    return null;
  }

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  const handleOpenFullPlayer = () => {
    navigation.navigate(ROUTES.AUDIO_PLAYER);
  };

  return (
    <View style={styles.container}>
      {/* Top thin progress line */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>

      <TouchableOpacity
        style={styles.contentRow}
        activeOpacity={0.88}
        onPress={handleOpenFullPlayer}
      >
        {/* Rotating Devotional Disc */}
        <Animated.View style={[styles.discIcon, { transform: [{ rotate: spin }] }]}>
          <AppText style={styles.discEmoji}>🦚</AppText>
        </Animated.View>

        {/* Track Details */}
        <View style={styles.metaCol}>
          <AppText style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.titleHindi}
          </AppText>
          <AppText style={styles.trackSub} numberOfLines={1}>
            {isPlaying ? '▶ अब बज रहा है • ' : '⏸ विराम • '}
            {currentTrack.deity}
          </AppText>
        </View>

        {/* Play/Pause Button */}
        <TouchableOpacity
          style={styles.playButton}
          activeOpacity={0.7}
          onPress={() => (isPlaying ? pauseTrack() : resumeTrack())}
        >
          <AppText style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</AppText>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          activeOpacity={0.7}
          onPress={closeMiniPlayer}
        >
          <AppText style={styles.closeIcon}>✕</AppText>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B', // Rich dark devotional slate for high contrast
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(217, 119, 6, 0.4)',
    overflow: 'hidden',
    ...shadows.lg,
    elevation: 10,
    zIndex: 999,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.gold,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 58,
  },
  discIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  discEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  metaCol: {
    flex: 1,
    marginRight: 8,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF9ED',
    lineHeight: 20,
  },
  trackSub: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gold,
    marginTop: 1,
    lineHeight: 15,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 18,
  },
});
