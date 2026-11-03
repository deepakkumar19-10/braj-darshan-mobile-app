/**
 * Braj Darshan - Bhakti audio
 * Layout from the redesign (design-input/figma "Light · Bhakti audio" and
 * "Light · Full audio player").
 *
 * Honesty rules:
 * - Only tracks that isTrackPlayable() allows (an audio URL AND a recorded
 *   licence) are listed or played. Tracks without one are hidden, never shown
 *   as "coming soon" rows.
 * - The player (artwork, transport, track list, lyrics) only appears when at
 *   least one track is playable, and the progress bar and ±10 s skips only
 *   while a track is actually loaded (playing or paused). No fake progress.
 * - Previous / Next step through the playable tracks only (the context's
 *   nextTrack/previousTrack walk the whole list, licensed or not).
 * - Naam jap is spoken by the phone's own text-to-speech voice through the
 *   native DevotionalAudio module (Android). If the voice cannot start, the
 *   screen says so instead of pretending.
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAudio, isTrackPlayable } from '../../context/AudioContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  TopBar,
  LanguageToggle,
  Card,
  Chip,
  Button,
  InfoNote,
  SectionHeader,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';

const SKIP_MS = 10000;

// `text` is exactly what the phone's voice speaks.
const CHANTS = [
  { id: 'jai', text: 'जय श्री राधे', hi: 'जय श्री राधे', en: 'Jai Shri Radhe' },
  { id: 'radhe', text: 'राधे राधे, जय श्री राधे', hi: 'राधे राधे, जय श्री राधे', en: 'Radhe Radhe, Jai Shri Radhe' },
  {
    id: 'mahamantra',
    text: 'हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे। हरे राम हरे राम, राम राम हरे हरे॥',
    hi: 'हरे कृष्ण महामंत्र',
    en: 'Hare Krishna mahamantra',
  },
];

function formatTime(ms) {
  if (!ms || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/* ------------------------------------------------------------- Naam jap */

function ChantRow({ chant, onSpeak, isHindi, colors }) {
  const guarded = usePressGuard(onSpeak, 600);
  const title = isHindi ? chant.hi : chant.en;
  // Show the spoken words under the title unless the title already is them.
  const words = chant.text !== title ? chant.text : null;
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? `${title} सुनें` : `Hear ${title}`}
      style={({ pressed }) => [
        styles.chantRow,
        // Background set in both states (Android drops the radius of conditional backgrounds).
        { backgroundColor: pressed ? colors.surfaceContainerLow : colors.card },
      ]}
    >
      <View style={[styles.chantIcon, { backgroundColor: colors.primaryLight }]}>
        <Icon name="music" size={20} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyBold" color={colors.navy}>
          {title}
        </AppText>
        {words ? (
          <AppText variant="caption" color={colors.textSecondary}>
            {words}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.chantPlay, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon name="play" size={20} color={colors.primary} />
      </View>
    </Pressable>
  );
}

function ChantSection({ speakChant, isHindi, colors }) {
  const [voiceFailed, setVoiceFailed] = useState(false);

  // audioService.speakChant resolves to null when the native voice is missing
  // or not ready, and to { success: true } when speech started.
  const speak = async (text) => {
    let started = false;
    try {
      started = Boolean(await speakChant(text));
    } catch (e) {
      started = false;
    }
    setVoiceFailed(!started);
  };

  return (
    <View style={styles.section}>
      <SectionHeader title={isHindi ? 'नाम जप सुनें' : 'Hear a chant'} style={styles.sectionHeader} />
      <AppText variant="caption" color={colors.muted}>
        {isHindi
          ? 'दबाते ही फ़ोन की अपनी आवाज़ (टेक्स्ट-टू-स्पीच) में बोला जाता है।'
          : "Tap to hear it in your phone's own text-to-speech voice."}
      </AppText>
      <Card padded={false}>
        {CHANTS.map((c, index) => (
          <View key={c.id}>
            {index > 0 ? <View style={[styles.rowDivider, { backgroundColor: colors.border }]} /> : null}
            <ChantRow chant={c} onSpeak={() => speak(c.text)} isHindi={isHindi} colors={colors} />
          </View>
        ))}
      </Card>
      {voiceFailed ? (
        <InfoNote icon="info">
          {isHindi
            ? 'फ़ोन की आवाज़ शुरू नहीं हो सकी। फ़ोन की सेटिंग में टेक्स्ट-टू-स्पीच (हिंदी आवाज़ सहित) चालू करके फिर कोशिश करें।'
            : "Your phone's voice could not start. Turn on text-to-speech (with a Hindi voice) in your phone's settings and try again."}
        </InfoNote>
      ) : (
        <AppText variant="small" color={colors.muted}>
          {isHindi
            ? 'कुछ सुनाई न दे तो फ़ोन की आवाज़ (वॉल्यूम) और सेटिंग में हिंदी आवाज़ देख लें।'
            : "Hear nothing? Check your media volume and that a Hindi voice is installed in your phone's settings."}
        </AppText>
      )}
    </View>
  );
}

/* --------------------------------------------------------------- Player */

function TransportButton({ icon, label, onPress, colors }) {
  const guarded = usePressGuard(onPress, 400);
  return (
    <View style={styles.transportItem}>
      <Pressable
        onPress={guarded}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.transportBtn,
          { backgroundColor: colors.surfaceContainer, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Icon name={icon} size={26} color={colors.navy} />
      </Pressable>
      <AppText variant="small" color={colors.muted} align="center">
        {label}
      </AppText>
    </View>
  );
}

function TrackRow({ track, index, isCurrent, isPlaying, onPress, isHindi, colors }) {
  const title = isHindi ? track.titleHindi : track.titleEn;
  const playingNow = isCurrent && isPlaying;
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={isHindi ? `${title} चलाएँ` : `Play ${title}`}
      style={isCurrent ? { borderColor: colors.primary, backgroundColor: colors.primaryLight } : null}
    >
      <View style={styles.trackRow}>
        <View
          style={[
            styles.trackIcon,
            { backgroundColor: isCurrent ? colors.surface : colors.surfaceContainer },
          ]}
        >
          <Icon name={playingNow ? 'music' : 'play'} size={22} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyBold" color={colors.navy}>
            {title}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {track.deity}
          </AppText>
          <AppText variant="small" color={colors.muted}>
            {isCurrent
              ? playingNow
                ? isHindi ? 'अभी बज रहा है' : 'Now playing'
                : isHindi ? 'चुना हुआ' : 'Selected'
              : `${isHindi ? 'ट्रैक' : 'Track'} ${index + 1}`}
            {track.durationDisplay
              ? ` · ${isHindi ? 'लगभग' : 'about'} ${track.durationDisplay}`
              : ''}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

function Player({ playable, requestedId, isHindi, colors }) {
  const {
    tracks,
    currentTrack,
    isPlaying,
    isPaused,
    position,
    duration,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTo,
    playError,
  } = useAudio();

  const [activeTab, setActiveTab] = useState('tracks'); // 'tracks' | 'lyrics'
  const [barWidth, setBarWidth] = useState(0);

  const currentIsPlayable = isTrackPlayable(currentTrack);
  // A track is "loaded" only while the native player really has it.
  const loaded = currentIsPlayable && (isPlaying || isPaused) ? currentTrack : null;
  const requested = playable.find((t) => t.id === requestedId) || null;
  const shown = loaded || requested || (currentIsPlayable ? currentTrack : null) || playable[0];
  const shownIsLoaded = Boolean(loaded && loaded.id === shown.id);
  const showProgress = shownIsLoaded && duration > 0;

  const progress = showProgress ? Math.min(1, Math.max(0, position / duration)) : 0;
  const progressPct = `${progress * 100}%`;

  // playTrack wants the index in the full list (audioService keeps that index).
  const start = (track) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    playTrack(track, idx >= 0 ? idx : null);
  };

  const togglePlay = () => {
    if (shownIsLoaded && isPlaying) {
      pauseTrack();
    } else if (shownIsLoaded && isPaused) {
      resumeTrack();
    } else {
      start(shown);
    }
  };
  const guardedToggle = usePressGuard(togglePlay, 400);

  // Previous / Next only ever land on a playable track.
  const step = (dir) => {
    const n = playable.length;
    if (n < 2) return;
    const i = playable.findIndex((t) => t.id === shown.id);
    const next = playable[(((i < 0 ? 0 : i + dir) % n) + n) % n];
    start(next);
  };

  const skipBy = (deltaMs) => {
    if (!showProgress) return;
    seekTo(Math.min(duration, Math.max(0, position + deltaMs)));
  };

  const handleSeek = (event) => {
    if (!barWidth || !showProgress) return;
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / barWidth));
    seekTo(ratio * duration);
  };

  const title = isHindi ? shown.titleHindi : shown.titleEn;
  const altTitle = isHindi ? shown.titleEn : shown.titleHindi;
  const status = shownIsLoaded && isPlaying
    ? { icon: 'music', text: isHindi ? 'अभी बज रहा है' : 'Now playing' }
    : shownIsLoaded && isPaused
      ? { icon: 'pause', text: isHindi ? 'रुका हुआ' : 'Paused' }
      : { icon: 'info', text: isHindi ? 'अभी नहीं बज रहा' : 'Not playing' };
  const playingShown = shownIsLoaded && isPlaying;

  return (
    <>
      {/* Artwork */}
      <View
        style={[styles.artwork, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}
        accessible={false}
      >
        <View style={[styles.artworkInner, { backgroundColor: colors.surface }]}>
          <Icon name="music" size={64} color={colors.primary} />
        </View>
      </View>

      {/* Now playing */}
      <View style={styles.meta}>
        <AppText variant="h2" weight="700" color={colors.navy} align="center">
          {title}
        </AppText>
        <AppText variant="caption" color={colors.muted} align="center">
          {altTitle}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} align="center">
          {shown.deity}
        </AppText>
        {shown.temple ? (
          <View style={styles.inline}>
            <Icon name="location" size={16} color={colors.primary} />
            <AppText variant="caption" color={colors.textSecondary}>
              {shown.temple}
            </AppText>
          </View>
        ) : null}
        <View style={styles.inline}>
          <Icon name={status.icon} size={16} color={colors.muted} />
          <AppText variant="caption" weight="600" color={colors.muted}>
            {status.text}
          </AppText>
        </View>
      </View>

      {/* Progress: only while this track is really loaded in the player */}
      {showProgress ? (
        <View>
          <Pressable
            onPress={handleSeek}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            style={styles.progressHit}
            accessibilityRole="adjustable"
            accessibilityLabel={isHindi ? 'ट्रैक की प्रगति' : 'Track progress'}
            accessibilityValue={{ text: `${formatTime(position)} / ${formatTime(duration)}` }}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) =>
              skipBy(e.nativeEvent.actionName === 'increment' ? SKIP_MS : -SKIP_MS)
            }
          >
            <View
              pointerEvents="none"
              style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerHigh }]}
            >
              <View style={[styles.progressFill, { width: progressPct, backgroundColor: colors.primary }]} />
            </View>
            <View
              pointerEvents="none"
              style={[
                styles.progressThumb,
                { left: progressPct, backgroundColor: colors.primary, borderColor: colors.surface },
              ]}
            />
          </Pressable>
          <View style={styles.timeRow}>
            <AppText variant="small" color={colors.muted}>
              {formatTime(position)}
            </AppText>
            <AppText variant="small" color={colors.muted}>
              {formatTime(duration)}
            </AppText>
          </View>
        </View>
      ) : null}

      {/* Transport */}
      <View style={styles.transport}>
        {playable.length > 1 ? (
          <TransportButton
            icon="previous"
            label={isHindi ? 'पिछला' : 'Previous'}
            onPress={() => step(-1)}
            colors={colors}
          />
        ) : null}
        <View style={styles.transportItem}>
          <Pressable
            onPress={guardedToggle}
            accessibilityRole="button"
            accessibilityLabel={playingShown ? (isHindi ? 'रोकें' : 'Pause') : isHindi ? 'चलाएँ' : 'Play'}
            style={({ pressed }) => [
              styles.playBtn,
              { backgroundColor: pressed ? colors.primaryDark : colors.primary },
            ]}
          >
            <Icon name={playingShown ? 'pause' : 'play'} size={34} color="#FFFFFF" />
          </Pressable>
          <AppText variant="small" weight="700" color={colors.navy} align="center">
            {playingShown ? (isHindi ? 'रोकें' : 'Pause') : isHindi ? 'चलाएँ' : 'Play'}
          </AppText>
        </View>
        {playable.length > 1 ? (
          <TransportButton
            icon="next"
            label={isHindi ? 'अगला' : 'Next'}
            onPress={() => step(1)}
            colors={colors}
          />
        ) : null}
      </View>

      {showProgress ? (
        <View style={styles.skipRow}>
          <Button
            variant="secondary"
            title={isHindi ? '10 सेकंड पीछे' : 'Back 10 sec'}
            onPress={() => skipBy(-SKIP_MS)}
            style={styles.flex}
          />
          <Button
            variant="secondary"
            title={isHindi ? '10 सेकंड आगे' : 'Ahead 10 sec'}
            onPress={() => skipBy(SKIP_MS)}
            style={styles.flex}
          />
        </View>
      ) : null}

      <InfoNote icon="offline">
        {playError === 'failed'
          ? isHindi
            ? 'ट्रैक शुरू नहीं हो सका। इंटरनेट जाँचकर फिर कोशिश करें।'
            : 'The track could not start. Check your internet and try again.'
          : isHindi
            ? 'ऑडियो इंटरनेट से चलता है। ट्रैक शुरू न हो तो कनेक्शन जाँचकर फिर कोशिश करें।'
            : 'Audio streams over the internet. If a track does not start, check your connection and try again.'}
      </InfoNote>

      {/* Tracks / lyrics */}
      <View style={styles.tabs}>
        <Chip
          icon="list"
          label={isHindi ? `भजन व आरती (${playable.length})` : `Tracks (${playable.length})`}
          selected={activeTab === 'tracks'}
          onPress={() => setActiveTab('tracks')}
        />
        <Chip
          icon="book"
          label={isHindi ? 'पावन पाठ' : 'Lyrics'}
          selected={activeTab === 'lyrics'}
          onPress={() => setActiveTab('lyrics')}
        />
      </View>

      {activeTab === 'tracks' ? (
        <View style={styles.list}>
          {playable.map((item, index) => (
            <TrackRow
              key={item.id}
              track={item}
              index={index}
              isCurrent={item.id === shown.id}
              isPlaying={shownIsLoaded && isPlaying}
              onPress={() => start(item)}
              isHindi={isHindi}
              colors={colors}
            />
          ))}
        </View>
      ) : (
        <Card>
          {shown.significance ? (
            <View style={[styles.significance, { backgroundColor: colors.primaryLight }]}>
              <AppText variant="bodyBold" color={colors.navy}>
                {isHindi ? 'महत्व' : 'Significance'}
              </AppText>
              <AppText variant="body" color={colors.text}>
                {shown.significance}
              </AppText>
            </View>
          ) : null}
          {!isHindi ? (
            <AppText variant="small" color={colors.muted} style={styles.lyricsNote}>
              Lyrics are in Hindi / Sanskrit.
            </AppText>
          ) : null}
          <View style={styles.lyrics}>
            {(shown.lyrics || []).map((verse, i) => (
              <AppText key={`${shown.id}-${i}`} variant="bodyLarge" color={colors.navy}>
                {verse}
              </AppText>
            ))}
          </View>
        </Card>
      )}
    </>
  );
}

/* --------------------------------------------------------------- Screen */

export default function AudioPlayerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const { tracks, speakChant } = useAudio();

  // Tracks without a recorded licence are not listed at all.
  const playable = useMemo(() => (tracks || []).filter(isTrackPlayable), [tracks]);
  const hasTracks = playable.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={isHindi ? 'भक्ति संगीत' : 'Bhakti audio'}
          subtitle={
            hasTracks
              ? isHindi ? 'आरती, भजन और नाम जप' : 'Aarti, bhajans and naam jap'
              : isHindi ? 'फ़ोन की आवाज़ में नाम जप' : "Naam jap in your phone's voice"
          }
          onBack={() => navigation.goBack()}
          right={<LanguageToggle />}
        />

        <View style={styles.content}>
          {hasTracks ? (
            <Player
              playable={playable}
              requestedId={route?.params?.trackId}
              isHindi={isHindi}
              colors={colors}
            />
          ) : null}

          <ChantSection speakChant={speakChant} isHindi={isHindi} colors={colors} />

          {!hasTracks ? (
            <InfoNote icon="music">
              {isHindi
                ? 'रिकॉर्ड किए गए भजन और आरती, उन्हें साझा करने की अनुमति मिलने के बाद यहाँ जोड़े जाएँगे।'
                : 'Recorded bhajans and aartis will be added here once we have permission to share them.'}
            </InfoNote>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 20 },
  artwork: {
    height: 220,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkInner: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { alignItems: 'center', gap: 4 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  progressHit: { height: 48, justifyContent: 'center' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6 },
  progressThumb: {
    position: 'absolute',
    top: 24 - 9,
    width: 18,
    height: 18,
    marginLeft: -9,
    borderRadius: 9,
    borderWidth: 2,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -6 },
  transport: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around' },
  transportItem: { alignItems: 'center', gap: 6, minWidth: 80 },
  transportBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipRow: { flexDirection: 'row', gap: 12 },
  section: { gap: 10 },
  sectionHeader: { marginBottom: 0 },
  chantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chantIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chantPlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDivider: { height: StyleSheet.hairlineWidth, marginLeft: 68 },
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  list: { gap: 12 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  trackIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  significance: { borderRadius: 14, padding: 14, gap: 4 },
  lyricsNote: { marginTop: 12 },
  lyrics: { gap: 10, marginTop: 16 },
});
