/**
 * Braj Darshan - Bhakti audio
 *
 * Every bhajan, aarti, path, pravachan, kirtan and live channel here is the OFFICIAL YouTube upload or
 * channel of whoever owns it (label, artist, temple, ashram). Tapping one opens it in the YouTube app
 * (or the browser), so the views and any revenue go to the owner; the app streams nothing itself.
 * The list is the same catalogue as the website (src/data/bhakti.json, from packages/data).
 *
 * Naam jap is spoken by the phone's own text-to-speech voice (expo-speech). If the voice cannot
 * start, the screen says so instead of pretending.
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  TopBar,
  LanguageToggle,
  Card,
  Chip,
  InfoNote,
  SectionHeader,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import {
  BHAKTI_CATEGORIES,
  BHAKTI_PLAYLISTS,
  findBhaktiTrack,
  itemsInCategory,
  playlistsInCategory,
  performerOf,
  openOnYouTube,
} from '../../services/bhaktiCatalog';

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

function ChantSection({ isHindi, colors }) {
  const [voiceFailed, setVoiceFailed] = useState(false);

  const speak = (text) => {
    try {
      Speech.stop();
      Speech.speak(text, {
        language: 'hi-IN',
        rate: 0.9,
        onStart: () => setVoiceFailed(false),
        onError: () => setVoiceFailed(true),
      });
    } catch (e) {
      setVoiceFailed(true);
    }
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

/* ---------------------------------------------------------------- Cards */

function TrackCard({ item, highlighted, onOpen, isHindi, colors }) {
  const [showText, setShowText] = useState(false);
  const title = isHindi ? item.titleHi : item.titleEn;
  const isLive = item.kind === 'live';
  const isPlaylist = item.kind === 'playlist';
  const hasText = Boolean(item.lyrics?.length || item.significance);
  const actionText = isLive
    ? isHindi ? 'YouTube पर लाइव देखें' : 'Watch live on YouTube'
    : isPlaylist
      ? isHindi ? 'YouTube पर पूरी प्लेलिस्ट' : 'Whole playlist on YouTube'
      : isHindi ? 'YouTube पर सुनें' : 'Listen on YouTube';

  return (
    <Card
      onPress={() => onOpen(item)}
      accessibilityLabel={`${title}. ${actionText}`}
      style={highlighted ? { borderColor: colors.primary, backgroundColor: colors.primaryLight } : null}
    >
      <View style={styles.trackRow}>
        {item.artworkUrl ? (
          <Image
            source={{ uri: item.artworkUrl }}
            style={[styles.thumb, { backgroundColor: colors.surfaceContainer }]}
            resizeMode="cover"
            accessible={false}
          />
        ) : (
          <View style={[styles.thumb, styles.thumbIcon, { backgroundColor: colors.surfaceContainer }]}>
            <Icon name={isLive ? 'aarti' : isPlaylist ? 'list' : 'music'} size={28} color={colors.primary} />
          </View>
        )}
        <View style={styles.flex}>
          {isLive ? (
            <View style={styles.inline}>
              <View style={[styles.liveDot, { backgroundColor: colors.error }]} />
              <AppText variant="small" weight="700" color={colors.error}>
                {isHindi ? 'लाइव' : 'LIVE'}
              </AppText>
            </View>
          ) : null}
          <AppText variant="bodyBold" color={colors.navy} numberOfLines={3}>
            {title}
          </AppText>
          {!isLive && !isPlaylist ? (
            <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
              {performerOf(item, isHindi)}
            </AppText>
          ) : null}
          <AppText variant="small" color={colors.muted} numberOfLines={2}>
            {isHindi ? 'आधिकारिक चैनल: ' : 'Official channel: '}
            {item.channel}
          </AppText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.inline}>
          <Icon name="externalLink" size={16} color={colors.primary} />
          <AppText variant="caption" weight="700" color={colors.primary}>
            {actionText}
          </AppText>
        </View>
        {hasText ? (
          <Pressable
            onPress={() => setShowText((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityState={{ expanded: showText }}
          >
            <AppText variant="caption" weight="700" color={colors.navy}>
              {showText ? (isHindi ? 'पाठ छुपाएँ' : 'Hide text') : isHindi ? 'पावन पाठ' : 'Text'}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {showText ? (
        <View style={styles.textBox}>
          {item.significance ? (
            <View style={[styles.significance, { backgroundColor: colors.primaryLight }]}>
              <AppText variant="bodyBold" color={colors.navy}>
                {isHindi ? 'महत्व' : 'Significance'}
              </AppText>
              <AppText variant="body" color={colors.text}>
                {item.significance}
              </AppText>
            </View>
          ) : null}
          {!isHindi ? (
            <AppText variant="small" color={colors.muted}>
              The text is in Hindi / Sanskrit.
            </AppText>
          ) : null}
          {(item.lyrics || []).map((verse, i) => (
            <AppText key={`${item.id}-${i}`} variant="bodyLarge" color={colors.navy}>
              {verse}
            </AppText>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

/* --------------------------------------------------------------- Screen */

export default function AudioPlayerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  // A temple page can ask for its aarti: open that track's category and show it first.
  const requested = findBhaktiTrack(route?.params?.trackId);
  const categories = useMemo(
    () =>
      BHAKTI_CATEGORIES.filter(
        (c) => itemsInCategory(c.id).length > 0 || BHAKTI_PLAYLISTS.some((p) => p.category === c.id)
      ),
    []
  );
  const [category, setCategory] = useState(requested?.category || categories[0]?.id || 'aarti_bhajan');
  const [openFailed, setOpenFailed] = useState(false);

  const items = useMemo(() => {
    const list = itemsInCategory(category);
    if (!requested || requested.category !== category) return list;
    return [requested, ...list.filter((t) => t.id !== requested.id)];
  }, [category, requested]);
  const playlists = playlistsInCategory(category);

  const open = async (item) => {
    setOpenFailed(!(await openOnYouTube(item)));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={isHindi ? 'भक्ति संगीत' : 'Bhakti audio'}
          subtitle={isHindi ? 'आधिकारिक YouTube चैनलों से' : 'From official YouTube channels'}
          onBack={() => navigation.goBack()}
          right={<LanguageToggle />}
        />

        <View style={styles.content}>
          <InfoNote icon="music">
            {isHindi
              ? 'हर भजन उसके असली मालिक (लेबल, कलाकार, मंदिर या आश्रम) के आधिकारिक YouTube चैनल पर खुलता है, ताकि व्यूज़ और कमाई उन्हीं को मिले। YouTube ऐप न हो तो ब्राउज़र में खुलेगा।'
              : 'Each bhajan opens on the official YouTube channel of its owner (label, artist, temple or ashram), so the views and revenue go to them. Without the YouTube app it opens in the browser.'}
          </InfoNote>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {categories.map((c) => (
              <Chip
                key={c.id}
                label={`${c.icon} ${isHindi ? c.titleHi : c.titleEn} (${itemsInCategory(c.id).length})`}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </ScrollView>

          {openFailed ? (
            <InfoNote icon="offline">
              {isHindi
                ? 'YouTube नहीं खुल सका। इंटरनेट जाँचकर फिर कोशिश करें।'
                : 'YouTube could not open. Check your internet and try again.'}
            </InfoNote>
          ) : null}

          {category === 'live' ? (
            <AppText variant="caption" color={colors.muted}>
              {isHindi
                ? 'ये चैनल आरती, दर्शन या कथा के समय लाइव आते हैं। उस समय लाइव न हो तो YouTube पर चैनल के पिछले वीडियो दिखेंगे।'
                : 'These channels go live for aarti, darshan or katha. If nothing is live right now, YouTube shows the channel instead.'}
            </AppText>
          ) : null}

          <View style={styles.list}>
            {items.map((item) => (
              <TrackCard
                key={item.id}
                item={item}
                highlighted={item.id === requested?.id}
                onOpen={open}
                isHindi={isHindi}
                colors={colors}
              />
            ))}
            {playlists.map((p) => (
              <TrackCard key={p.id} item={p} highlighted={false} onOpen={open} isHindi={isHindi} colors={colors} />
            ))}
          </View>

          <ChantSection isHindi={isHindi} colors={colors} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 20 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tabs: { flexDirection: 'row', gap: 8 },
  list: { gap: 12 },
  trackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  // YouTube thumbnails are 16:9.
  thumb: { width: 128, height: 72, borderRadius: 10 },
  thumbIcon: { alignItems: 'center', justifyContent: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  textBox: { gap: 10, marginTop: 14 },
  significance: { borderRadius: 14, padding: 14, gap: 4 },
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
});
