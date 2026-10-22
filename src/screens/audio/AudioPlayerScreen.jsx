import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import AppText from '../../components/common/AppText';
import { useAudio } from '../../context/AudioContext';

const formatTime = (ms) => {
  if (!ms || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function AudioPlayerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    tracks,
    currentTrack,
    isPlaying,
    position,
    duration,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTo,
    nextTrack,
    previousTrack,
    speakChant,
  } = useAudio();

  const [activeTab, setActiveTab] = useState('lyrics'); // 'lyrics' | 'playlist'
  const spinValue = useRef(new Animated.Value(0)).current;

  // Spin animation when playing
  useEffect(() => {
    let anim;
    if (isPlaying) {
      anim = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 10000,
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

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  const handleProgressBarPress = (event) => {
    const { locationX } = event.nativeEvent;
    const targetRatio = Math.max(0, Math.min(1, locationX / 300));
    seekTo(targetRatio * duration);
  };

  const handleRewind10 = () => {
    const newPos = Math.max(0, position - 10000);
    seekTo(newPos);
  };

  const handleForward10 = () => {
    const newPos = Math.min(duration, position + 10000);
    seekTo(newPos);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <AppText style={styles.backArrow}>←</AppText>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <AppText style={styles.headerTitle}>आरती व संकीर्तन सेवा</AppText>
          <AppText style={styles.headerSubtitle}>ब्रज भक्ति रस धारा</AppText>
        </View>
        <TouchableOpacity
          style={styles.chantHeaderButton}
          onPress={() => speakChant('जय श्री राधे')}
        >
          <AppText style={styles.chantHeaderText}>🔔 राधे</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Disc Visualizer Card */}
        <View style={styles.heroCard}>
          <View style={styles.discOuterGlow}>
            <Animated.View style={[styles.discCircle, { transform: [{ rotate: spin }] }]}>
              <View style={styles.discInnerRing}>
                <View style={styles.discCenter}>
                  <AppText style={styles.discPeacock}>🦚</AppText>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Current Track Meta */}
          <AppText style={styles.trackTitle}>{currentTrack.titleHindi}</AppText>
          <AppText style={styles.trackDeity}>{currentTrack.deity}</AppText>
          <View style={styles.templeBadge}>
            <AppText style={styles.templeBadgeText}>📍 {currentTrack.temple}</AppText>
          </View>
        </View>

        {/* Player Controls Container */}
        <View style={styles.controlsCard}>
          {/* Progress Bar */}
          <TouchableOpacity
            style={styles.progressContainer}
            activeOpacity={0.9}
            onPress={handleProgressBarPress}
          >
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
            </View>
          </TouchableOpacity>

          {/* Time row */}
          <View style={styles.timeRow}>
            <AppText style={styles.timeText}>{formatTime(position)}</AppText>
            <AppText style={styles.timeText}>{formatTime(duration)}</AppText>
          </View>

          {/* Main Controls Row */}
          <View style={styles.transportRow}>
            {/* Rewind 10s */}
            <TouchableOpacity style={styles.subCtrlBtn} onPress={handleRewind10}>
              <AppText style={styles.subCtrlText}>-10s</AppText>
            </TouchableOpacity>

            {/* Prev Track */}
            <TouchableOpacity style={styles.skipBtn} onPress={previousTrack}>
              <AppText style={styles.skipIcon}>⏮</AppText>
            </TouchableOpacity>

            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.playPauseBtn}
              activeOpacity={0.85}
              onPress={() => (isPlaying ? pauseTrack() : resumeTrack())}
            >
              <AppText style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</AppText>
            </TouchableOpacity>

            {/* Next Track */}
            <TouchableOpacity style={styles.skipBtn} onPress={nextTrack}>
              <AppText style={styles.skipIcon}>⏭</AppText>
            </TouchableOpacity>

            {/* Forward 10s */}
            <TouchableOpacity style={styles.subCtrlBtn} onPress={handleForward10}>
              <AppText style={styles.subCtrlText}>+10s</AppText>
            </TouchableOpacity>
          </View>

          {/* Devotional Chant Buttons */}
          <View style={styles.chantRow}>
            <TouchableOpacity
              style={styles.quickChantBtn}
              onPress={() => speakChant('राधे राधे, जय श्री राधे')}
            >
              <AppText style={styles.quickChantText}>📿 राधे राधे बोलो</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickChantBtn, styles.quickChantBtnGold]}
              onPress={() => speakChant('हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे')}
            >
              <AppText style={styles.quickChantText}>✨ महामंत्र जप</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Switch: Lyrics vs Playlist */}
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'lyrics' && styles.tabButtonActive]}
            onPress={() => setActiveTab('lyrics')}
          >
            <AppText
              style={[styles.tabText, activeTab === 'lyrics' && styles.tabTextActive]}
            >
              📜 पावन पाठ (Lyrics)
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'playlist' && styles.tabButtonActive]}
            onPress={() => setActiveTab('playlist')}
          >
            <AppText
              style={[styles.tabText, activeTab === 'playlist' && styles.tabTextActive]}
            >
              🎶 भजन व आरती संग्रह ({tracks.length})
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Content based on Tab */}
        {activeTab === 'lyrics' ? (
          <View style={styles.lyricsCard}>
            <View style={styles.significanceBox}>
              <AppText style={styles.significanceLabel}>🌸 फलश्रुति व महत्व:</AppText>
              <AppText style={styles.significanceText}>{currentTrack.significance}</AppText>
            </View>

            <View style={styles.lyricsBody}>
              {currentTrack.lyrics &&
                currentTrack.lyrics.map((verse, index) => (
                  <View key={index} style={styles.verseRow}>
                    <AppText style={styles.verseDot}>🪷</AppText>
                    <AppText style={styles.verseText}>{verse}</AppText>
                  </View>
                ))}
            </View>
          </View>
        ) : (
          <View style={styles.playlistCard}>
            {tracks.map((item, index) => {
              const isSelected = item.id === currentTrack.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.playlistItem,
                    isSelected && styles.playlistItemSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => playTrack(item, index)}
                >
                  <View style={styles.playlistIndexCircle}>
                    <AppText style={styles.playlistIndexText}>
                      {isSelected && isPlaying ? '▶' : index + 1}
                    </AppText>
                  </View>
                  <View style={styles.playlistMeta}>
                    <AppText
                      style={[
                        styles.playlistTitle,
                        isSelected && styles.playlistTitleActive,
                      ]}
                    >
                      {item.titleHindi}
                    </AppText>
                    <AppText style={styles.playlistSub}>
                      {item.deity} • {item.durationDisplay}
                    </AppText>
                  </View>
                  <View style={styles.playIndicator}>
                    <AppText style={styles.playIndicatorText}>
                      {isSelected ? 'सक्रिय' : 'बजाएं'}
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 119, 6, 0.15)',
    backgroundColor: colors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  backArrow: {
    fontSize: 22,
    color: colors.primaryNavy,
    fontWeight: '700',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryNavy,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.saffron,
    lineHeight: 16,
  },
  chantHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    borderWidth: 1,
    borderColor: colors.saffron,
  },
  chantHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.saffron,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.15)',
    ...shadows.md,
    marginBottom: 16,
  },
  discOuterGlow: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.md,
  },
  discCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primaryNavy,
    borderWidth: 4,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discInnerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(244, 197, 66, 0.5)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discPeacock: {
    fontSize: 24,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryNavy,
    textAlign: 'center',
    lineHeight: 28,
  },
  trackDeity: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.saffron,
    marginTop: 4,
  },
  templeBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
  },
  templeBadgeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.15)',
    ...shadows.md,
    marginBottom: 16,
  },
  progressContainer: {
    paddingVertical: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.saffron,
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.saffron,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -8,
    ...shadows.sm,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -2,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 6,
  },
  subCtrlBtn: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  subCtrlText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  skipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  skipIcon: {
    fontSize: 20,
    color: colors.primaryNavy,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
    ...shadows.md,
  },
  playPauseIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    lineHeight: 30,
  },
  chantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quickChantBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: colors.saffron,
    alignItems: 'center',
  },
  quickChantBtnGold: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  quickChantText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.saffron,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  lyricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.15)',
    ...shadows.md,
  },
  significanceBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.saffron,
    marginBottom: 16,
  },
  significanceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  significanceText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#78350F',
    lineHeight: 20,
  },
  lyricsBody: {
    paddingVertical: 8,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  verseDot: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  verseText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryNavy,
    lineHeight: 24,
  },
  playlistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.15)',
    ...shadows.md,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  playlistItemSelected: {
    backgroundColor: '#FEF3C7',
    borderBottomColor: 'transparent',
  },
  playlistIndexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playlistIndexText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.saffron,
  },
  playlistMeta: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryNavy,
    lineHeight: 21,
  },
  playlistTitleActive: {
    color: colors.saffron,
  },
  playlistSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  playIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
  },
  playIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.saffron,
  },
});
