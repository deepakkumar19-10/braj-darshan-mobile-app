/**
 * Braj Darshan - Temple details
 * Design: design-input/figma "Light · Temple details". Photo, name, address,
 * darshan timings with a summer/winter switch, aarti times, before-you-visit
 * guidance, nearby temples and one primary action: Get directions.
 * Timings come from the temple's own data and are labelled as regular, not live.
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Linking, Share, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Button,
  Card,
  Chip,
  IconButton,
  InfoNote,
  ListRow,
  Photo,
  SectionHeader,
  StatusBadge,
  GUTTER,
} from '../../components/ui';
import { ROUTES } from '../../navigation/routes';
import { getPhotoCredit, creditLine } from '../../utils/photoCredits';
import { useNow } from '../../hooks/useNow';
import templesData from '../../data/temples.json';
import audioTracks from '../../data/audioTracks.json';
import { isTrackPlayable } from '../../context/AudioContext';
import { getTempleImage, isTempleImageRepresentative, templePhotoKey } from '../../utils/imageAssets';
import {
  getTempleStatus,
  parseDarshanWindows,
  getIndianStandardTime,
  formatMinutes,
} from '../../utils/templeHours';

const GUIDELINE_ICONS = {
  '👗': 'dress',
  '📵': 'noPhoto',
  '👟': 'parikrama',
  '🐒': 'alert',
};

const HINDI_MONTHS_EN = {
  जनवरी: 'January', फ़रवरी: 'February', फरवरी: 'February', मार्च: 'March', अप्रैल: 'April', मई: 'May',
  जून: 'June', जुलाई: 'July', अगस्त: 'August', सितंबर: 'September', अक्टूबर: 'October', नवंबर: 'November', दिसंबर: 'December',
};

// "अक्टूबर 2026" -> "October 2026"; anything else is shown as it is.
function monthYearEn(text) {
  const [month, year] = String(text).split(/\s+/);
  return HINDI_MONTHS_EN[month] && year ? `${HINDI_MONTHS_EN[month]} ${year}` : text;
}

function isSummerNow() {
  const month = getIndianStandardTime(new Date()).getMonth();
  return month >= 3 && month <= 9;
}

export default function TempleDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  const { id, temple: initialTemple } = route.params || {};
  const temple = useMemo(
    () => templesData.find((t) => t.id === id) || initialTemple || null,
    [id, initialTemple]
  );
  if (!temple) {
    return <TempleNotFound navigation={navigation} isHindi={isHindi} colors={colors} insets={insets} />;
  }
  return <TempleDetail temple={temple} navigation={navigation} isHindi={isHindi} colors={colors} insets={insets} />;
}

function TempleNotFound({ navigation, isHindi, colors, insets }) {
  return (
    <View style={[styles.root, styles.notFound, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
      <InfoNote icon="alert">
        {isHindi ? 'यह मंदिर नहीं मिला। लिंक पुराना या गलत हो सकता है।' : 'This temple could not be found. The link may be old or wrong.'}
      </InfoNote>
      <Button
        title={isHindi ? 'सभी मंदिर देखें' : 'See all temples'}
        variant="secondary"
        onPress={() => navigation.navigate(ROUTES.TEMPLES)}
      />
    </View>
  );
}

function TempleDetail({ temple, navigation, isHindi, colors, insets }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const [season, setSeason] = useState(isSummerNow() ? 'summer' : 'winter');
  const [showFullAbout, setShowFullAbout] = useState(false);

  const fav = isFavorite(temple.id);
  const photoCredit = getPhotoCredit(templePhotoKey(temple));
  const now = useNow(); // keeps the open/closed badge current while the page stays open
  const status = getTempleStatus(temple, now);
  const windows = parseDarshanWindows(temple.timings?.[season]);
  const nearby = (temple.nearbyTempleIds || [])
    .map((nid) => templesData.find((t) => t.id === nid))
    .filter(Boolean);
  const sameTown = templesData.filter((t) => t.city === temple.city && t.id !== temple.id);
  const alsoHere = nearby.length ? nearby : sameTown.slice(0, 3);

  const name = isHindi ? temple.nameHindi : temple.name;
  const altName = isHindi ? temple.name : temple.nameHindi;
  const about = isHindi
    ? temple.history || temple.shortDescription
    : temple.shortDescriptionEn || temple.shortDescription;

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const share = () => {
    Share.share({
      message: `${temple.nameHindi} (${temple.name}), ${temple.city}\n${
        isHindi ? 'दर्शन समय' : 'Darshan'
      }: ${temple.timings?.[season] || ''}\nhttps://www.divyabraj.com/temples\n॥ राधे राधे ॥`,
    }).catch(() => {});
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo */}
        <Photo
          source={getTempleImage(temple)}
          representative={isTempleImageRepresentative(temple)}
          style={styles.hero}
          accessibilityLabel={temple.name}
        >
          <View style={[styles.heroBar, { top: insets.top + 8 }]}>
            <IconButton icon="chevronLeft" size={28} filled onPress={() => navigation.goBack()} accessibilityLabel={isHindi ? 'वापस' : 'Back'} />
            <View style={styles.heroRight}>
              <IconButton icon="share" filled onPress={share} accessibilityLabel={isHindi ? 'साझा करें' : 'Share'} />
              <IconButton
                icon={fav ? 'heartFilled' : 'heart'}
                filled
                color={fav ? colors.warning : undefined}
                onPress={() => toggleFavorite(temple)}
                accessibilityLabel={fav ? (isHindi ? 'सहेजे से हटाएँ' : 'Remove from saved') : (isHindi ? 'सहेजें' : 'Save')}
              />
            </View>
          </View>
        </Photo>
        {photoCredit ? (
          <Pressable onPress={() => Linking.openURL(photoCredit.source).catch(() => {})} accessibilityRole="link" hitSlop={6}>
            <AppText variant="badge" color={colors.muted} style={styles.credit} numberOfLines={2}>
              {creditLine(photoCredit, isHindi)}
            </AppText>
          </Pressable>
        ) : null}

        <View style={styles.body}>
          {/* Title */}
          <View style={styles.titleBlock}>
            <AppText variant="h1" weight="700" color={colors.navy}>
              {name}
            </AppText>
            {altName ? (
              <AppText variant="h4" weight="600" color={colors.textSecondary}>
                {altName}
              </AppText>
            ) : null}
            {temple.location ? (
              <View style={styles.addressRow}>
                <Icon name="location" size={20} color={colors.primary} />
                <AppText variant="caption" color={colors.textSecondary} style={styles.flex}>
                  {isHindi ? temple.location : `${temple.city} · Local address (Hindi): ${temple.location}`}
                </AppText>
              </View>
            ) : null}
          </View>

          {/* Darshan timings */}
          <Card>
            <AppText variant="h3" weight="700" color={colors.navy}>
              {isHindi ? 'दर्शन समय' : 'Darshan timings'}
            </AppText>
            <View style={styles.gap8}>
              <StatusBadge status={status} />
            </View>
            <View style={styles.seasonRow}>
              <Chip label={isHindi ? 'ग्रीष्म' : 'Summer'} icon="sun" selected={season === 'summer'} onPress={() => setSeason('summer')} />
              <Chip label={isHindi ? 'शीत' : 'Winter'} icon="tithi" selected={season === 'winter'} onPress={() => setSeason('winter')} />
            </View>
            {windows ? (
              windows.map(([start, end], i) => (
                <View key={`${start}-${end}`} style={styles.windowRow}>
                  <View style={[styles.windowIcon, { backgroundColor: colors.primaryLight }]}>
                    <Icon name={i === 0 ? 'sunrise' : 'tithi'} size={20} color={colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="caption" color={colors.muted}>
                      {i === 0 ? (isHindi ? 'प्रातः दर्शन' : 'Morning darshan') : (isHindi ? 'सायं दर्शन' : 'Evening darshan')}
                    </AppText>
                    <AppText variant="bodyBold" color={colors.navy}>
                      {formatMinutes(start)} – {formatMinutes(end)}
                    </AppText>
                  </View>
                </View>
              ))
            ) : (
              <AppText variant="body" color={colors.text} style={styles.gap8}>
                {temple.timings?.[season]}
              </AppText>
            )}
            <InfoNote style={styles.gap12}>
              {isHindi
                ? 'यह मंदिर का नियमित समय है, लाइव नहीं। त्योहारों पर बदल सकता है — स्थानीय पुष्टि करें।'
                : 'Regular temple timings, not live. They change on festivals — confirm locally.'}
            </InfoNote>
            {temple.lastVerified || temple.sourceAttribution ? (
              <AppText variant="small" color={colors.muted} style={styles.gap8}>
                {[
                  temple.lastVerified
                    ? `${isHindi ? 'अंतिम जाँच' : 'Last checked'}: ${isHindi ? temple.lastVerified : monthYearEn(temple.lastVerified)}`
                    : null,
                  temple.sourceAttribution && isHindi ? `स्रोत: ${temple.sourceAttribution}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </AppText>
            ) : null}
          </Card>

          {/* Aarti */}
          {Array.isArray(temple.aartiSchedule) && temple.aartiSchedule.length ? (
            <Card>
              <AppText variant="h3" weight="700" color={colors.navy}>
                {isHindi ? 'आरती' : 'Aarti'}
              </AppText>
              {temple.aartiSchedule.map((a) => (
                <View key={a.id} style={styles.windowRow}>
                  <View style={[styles.windowIcon, { backgroundColor: colors.goldLight }]}>
                    <Icon name="aarti" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="bodyBold" color={colors.navy}>
                      {isHindi ? a.nameHi : a.nameEn} · {season === 'summer' ? a.timeSummer : a.timeWinter}
                    </AppText>
                    {isHindi && a.significanceHi ? (
                      <AppText variant="small" color={colors.muted}>
                        {a.significanceHi}
                      </AppText>
                    ) : null}
                  </View>
                </View>
              ))}
              {isTrackPlayable(audioTracks.find((t) => t.id === temple.audioTrackId)) ? (
                <Button
                  title={isHindi ? 'आरती सुनें' : 'Listen to aarti'}
                  icon="music"
                  variant="text"
                  onPress={() => navigation.navigate(ROUTES.AUDIO_PLAYER, { trackId: temple.audioTrackId })}
                  style={styles.leftButton}
                />
              ) : null}
            </Card>
          ) : null}

          {/* About */}
          {about ? (
            <View>
              <SectionHeader title={isHindi ? 'मंदिर के बारे में' : 'About this temple'} />
              <AppText variant="body" color={colors.text} numberOfLines={showFullAbout ? undefined : 4}>
                {about}
              </AppText>
              {String(about).length > 180 ? (
                <Button
                  title={showFullAbout ? (isHindi ? 'कम दिखाएँ' : 'Show less') : (isHindi ? 'और पढ़ें' : 'Read more')}
                  variant="text"
                  onPress={() => setShowFullAbout((v) => !v)}
                  style={styles.leftButton}
                />
              ) : null}
            </View>
          ) : null}

          {/* Before you visit */}
          <Card>
            <AppText variant="h3" weight="700" color={colors.navy}>
              {isHindi ? 'जाने से पहले' : 'Before you visit'}
            </AppText>
            {(temple.guidelines || []).map((g) => (
              <ListRow
                key={g.labelEn}
                icon={GUIDELINE_ICONS[g.icon] || 'info'}
                title={isHindi ? g.labelHi : g.labelEn}
                subtitle={isHindi ? g.descHi : g.descEn}
              />
            ))}
            {temple.recommendedDurationEn || temple.recommendedDuration ? (
              <ListRow
                icon="clock"
                title={isHindi ? 'दर्शन में लगने वाला समय' : 'Time needed'}
                subtitle={isHindi ? temple.recommendedDuration : temple.recommendedDurationEn}
              />
            ) : null}
            {temple.nearestStationEn || temple.nearestStation ? (
              <ListRow
                icon="train"
                title={isHindi ? 'निकटतम स्टेशन' : 'Nearest station'}
                subtitle={isHindi ? temple.nearestStation : temple.nearestStationEn}
              />
            ) : null}
            {temple.darshanTips && isHindi ? (
              <ListRow icon="people" title={isHindi ? 'सुझाव' : 'Tip'} subtitle={temple.darshanTips} />
            ) : null}
          </Card>

          {/* Festivals */}
          {isHindi && Array.isArray(temple.festivals) && temple.festivals.length ? (
            <View>
              <SectionHeader title={isHindi ? 'प्रमुख उत्सव' : 'Main festivals'} />
              <View style={styles.festivals}>
                {temple.festivals.map((f) => (
                  <View key={f} style={[styles.festivalTag, { backgroundColor: colors.surfaceAlt }]}>
                    <Icon name="festival" size={16} color={colors.primary} />
                    <AppText variant="small" color={colors.text}>
                      {f}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Nearby */}
          {alsoHere.length ? (
            <View>
              <SectionHeader
                title={
                  nearby.length
                    ? isHindi ? 'आस-पास के मंदिर' : 'Nearby temples'
                    : isHindi ? `${temple.cityHindi} में और` : `Also in ${temple.city}`
                }
              />
              {alsoHere.map((t) => (
                <Card
                  key={t.id}
                  style={styles.nearCard}
                  onPress={() => navigation.push(ROUTES.TEMPLE_DETAIL, { id: t.id, temple: t })}
                  accessibilityLabel={t.name}
                >
                  <View style={styles.nearInner}>
                    <Photo source={getTempleImage(t)} style={styles.nearThumb} accessibilityLabel={t.name} />
                    <View style={styles.flex}>
                      <AppText variant="body" weight="700" color={colors.navy}>
                        {isHindi ? t.nameHindi : t.name}
                      </AppText>
                      <StatusBadge status={getTempleStatus(t, now)} size="sm" />
                    </View>
                    <Icon name="chevronRight" size={20} color={colors.muted} />
                  </View>
                </Card>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky primary action */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <Button
          title={isHindi ? 'नक्शे पर' : 'On map'}
          variant="secondary"
          icon="map"
          onPress={() => navigation.navigate(ROUTES.MAP)}
          style={styles.mapBtn}
        />
        <Button
          title={isHindi ? 'रास्ता देखें' : 'Get directions'}
          icon="directions"
          onPress={openDirections}
          style={styles.flex}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  hero: { height: 300 },
  notFound: { paddingHorizontal: GUTTER, gap: 16 },
  credit: { paddingHorizontal: GUTTER, paddingTop: 6 },
  heroBar: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroRight: { flexDirection: 'row', gap: 8 },
  body: { paddingHorizontal: GUTTER, paddingTop: 20, gap: 20 },
  titleBlock: { gap: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8 },
  gap8: { marginTop: 8 },
  gap12: { marginTop: 12 },
  seasonRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 4 },
  windowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  windowIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  leftButton: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 0 },
  festivals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  festivalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  nearCard: { padding: 12, marginBottom: 10 },
  nearInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nearThumb: { width: 64, height: 64, borderRadius: 12 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  mapBtn: { paddingHorizontal: 16 },
});
