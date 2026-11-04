/**
 * Braj Darshan - Temple details
 * Design: Claude Design canvas "Braj Darshan app redesign", artboard TempleDetail (Nov 2026).
 * Photo hero with round back / share / save buttons, then a content sheet with rounded top
 * that overlaps the photo: name, address, open/closed panel, darshan timings with a
 * summer/winter switch, aarti, about, before-you-visit, festivals and nearby temples.
 * A fixed bottom bar holds "On map" and the primary action, Get directions.
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
  IconButton,
  InfoNote,
  Photo,
  RepresentativeTag,
  SectionHeader,
  StatusBadge,
  GUTTER,
} from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';
import { getPhotoCredit, creditLine } from '../../utils/photoCredits';
import { useNow } from '../../hooks/useNow';
import { useTemples } from '../../services/contentService';
import { findBhaktiTrack } from '../../services/bhaktiCatalog';
import { getTempleImage, isTempleImageRepresentative, templePhotoKey } from '../../utils/imageAssets';
import {
  getTempleStatus,
  parseDarshanWindows,
  getIndianStandardTime,
  formatMinutes,
} from '../../utils/templeHours';

const HINDI_MONTHS_EN = {
  जनवरी: 'January', फ़रवरी: 'February', फरवरी: 'February', मार्च: 'March', अप्रैल: 'April', मई: 'May',
  जून: 'June', जुलाई: 'July', अगस्त: 'August', सितंबर: 'September', अक्टूबर: 'October', नवंबर: 'November', दिसंबर: 'December',
};

// The photo buttons keep a white face in both themes, so their icons use the light palette.
const ON_PHOTO = lightColors;

// "अक्टूबर 2026" -> "October 2026"; anything else is shown as it is.
function monthYearEn(text) {
  const [month, year] = String(text).split(/\s+/);
  return HINDI_MONTHS_EN[month] && year ? `${HINDI_MONTHS_EN[month]} ${year}` : text;
}

function isSummerNow() {
  const month = getIndianStandardTime(new Date()).getMonth();
  return month >= 3 && month <= 9;
}

// A darshan window as the big clock line and its AM/PM line: ["8:00 – 1:30", "AM – PM"].
function windowText(start, end) {
  const [a, ap] = formatMinutes(start).split(' ');
  const [b, bp] = formatMinutes(end).split(' ');
  return [`${a} – ${b}`, ap === bp ? ap : `${ap} – ${bp}`];
}

export default function TempleDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  const { id, temple: initialTemple } = route.params || {};
  const templesData = useTemples();
  const temple = useMemo(
    () => templesData.find((t) => t.id === id) || initialTemple || null,
    [templesData, id, initialTemple]
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

/* ------------------------------------------------------------ Pieces */

// Open / closed / unknown, as a tinted panel: dot (or clock) + word + when it changes.
function StatusPanel({ status, isHindi, colors }) {
  const tone = !status.isKnown ? 'info' : status.isOpen ? 'open' : 'closed';
  const t = {
    open: {
      fg: colors.success,
      bg: colors.successLight,
      title: isHindi ? 'दर्शन खुले हैं' : 'Open now',
    },
    closed: {
      fg: colors.warning,
      bg: colors.warningBg,
      title: isHindi ? 'पट बंद हैं' : 'Closed now',
    },
    info: {
      fg: colors.textSecondary,
      bg: colors.infoBg,
      title: isHindi ? 'समय मंदिर से पुष्टि करें' : 'Check timings locally',
    },
  }[tone];
  const sub = isHindi ? status.subtextHi : status.subtextEn;
  return (
    <View
      style={[styles.statusPanel, { backgroundColor: t.bg }]}
      accessible
      accessibilityLabel={[t.title, sub].filter(Boolean).join('. ')}
    >
      {tone === 'info' ? (
        <Icon name="clock" size={18} color={t.fg} />
      ) : (
        <View style={[styles.statusDot, { backgroundColor: t.fg }]} />
      )}
      <View style={styles.flex}>
        <AppText variant="body" weight="700" color={t.fg}>
          {t.title}
        </AppText>
        {sub ? (
          <AppText variant="small" color={colors.text}>
            {sub}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

// Two-segment summer / winter switch (the selected segment is a white pill).
function SeasonToggle({ season, onChange, isHindi, colors }) {
  const pickSummer = usePressGuard(() => onChange('summer'), 250);
  const pickWinter = usePressGuard(() => onChange('winter'), 250);
  const seg = (key, label, onPress) => {
    const active = season === key;
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={label}
        hitSlop={{ top: 4, bottom: 4 }}
        style={[styles.seasonSeg, { backgroundColor: active ? colors.surface : colors.infoBg }]}
      >
        <AppText variant="small" weight={active ? '700' : '600'} color={active ? colors.navy : colors.muted}>
          {label}
        </AppText>
      </Pressable>
    );
  };
  return (
    <View
      style={[styles.seasonToggle, { backgroundColor: colors.infoBg }]}
      accessibilityLabel={isHindi ? 'मौसम' : 'Season'}
    >
      {seg('summer', isHindi ? 'ग्रीष्म' : 'Summer', pickSummer)}
      {seg('winter', isHindi ? 'शीत' : 'Winter', pickWinter)}
    </View>
  );
}

function InfoTile({ label, value, valueColor, wide, colors }) {
  return (
    <View style={[styles.infoTile, wide && styles.infoTileWide, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="small" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="body" weight="600" color={valueColor || colors.navy}>
        {value}
      </AppText>
    </View>
  );
}

function Bullet({ children, colors }) {
  return (
    <View style={styles.bullet}>
      <View style={[styles.bulletDot, { backgroundColor: colors.primaryContainer }]} />
      <AppText variant="body" color={colors.text} style={styles.flex}>
        {children}
      </AppText>
    </View>
  );
}

/* ------------------------------------------------------------ Screen */

function TempleDetail({ temple, navigation, isHindi, colors, insets }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const templesData = useTemples();

  const [season, setSeason] = useState(isSummerNow() ? 'summer' : 'winter');
  const [showFullAbout, setShowFullAbout] = useState(false);

  const fav = isFavorite(temple.id);
  const photoCredit = getPhotoCredit(templePhotoKey(temple));
  const representative = isTempleImageRepresentative(temple);
  const now = useNow(); // keeps the open/closed panel current while the page stays open
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
  const duration = isHindi ? temple.recommendedDuration : temple.recommendedDurationEn;
  const station = isHindi ? temple.nearestStation : temple.nearestStationEn;
  const hasAudio = Boolean(findBhaktiTrack(temple.audioTrackId));
  const hasVisitTiles = Boolean(duration || station || temple.photographyAllowed === false);

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
        {/* Photo. Its tag and credit sit above the sheet's overlap so they stay visible. */}
        <Photo
          source={getTempleImage(temple)}
          representative={false}
          style={styles.hero}
          accessibilityLabel={temple.name}
        >
          <View style={[styles.heroBar, { top: insets.top + 8 }]}>
            <IconButton icon="chevronLeft" size={26} filled onPress={() => navigation.goBack()} accessibilityLabel={isHindi ? 'वापस' : 'Back'} />
            <View style={styles.heroRight}>
              <IconButton icon="share" size={20} filled onPress={share} accessibilityLabel={isHindi ? 'साझा करें' : 'Share'} />
              <IconButton
                icon={fav ? 'heartFilled' : 'heart'}
                size={20}
                filled
                color={fav ? ON_PHOTO.warning : ON_PHOTO.primary}
                onPress={() => toggleFavorite(temple)}
                accessibilityLabel={fav ? (isHindi ? 'सहेजे से हटाएँ' : 'Remove from saved') : (isHindi ? 'सहेजें' : 'Save')}
              />
            </View>
          </View>
          <View style={styles.heroFoot}>
            {representative ? <RepresentativeTag style={styles.heroTag} /> : null}
            {photoCredit ? (
              <Pressable
                onPress={() => Linking.openURL(photoCredit.source).catch(() => {})}
                accessibilityRole="link"
                hitSlop={8}
                style={styles.heroTag}
              >
                <AppText variant="badge" color="#FFFFFF" numberOfLines={2}>
                  {creditLine(photoCredit, isHindi)}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </Photo>

        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {/* Title */}
          <View style={styles.titleBlock}>
            <AppText variant="h1" weight="700" color={colors.navy}>
              {name}
            </AppText>
            {altName ? (
              <AppText variant="body" color={colors.muted}>
                {altName}
              </AppText>
            ) : null}
            {temple.location ? (
              <View style={styles.addressRow}>
                <Icon name="location" size={18} color={colors.primary} />
                <AppText variant="caption" color={colors.text} style={styles.flex}>
                  {isHindi ? temple.location : `${temple.city} · Local address (Hindi): ${temple.location}`}
                </AppText>
              </View>
            ) : null}
          </View>

          <StatusPanel status={status} isHindi={isHindi} colors={colors} />

          {/* Darshan timings */}
          <Card style={styles.card}>
            <View style={styles.cardHead}>
              <AppText variant="h3" weight="700" color={colors.navy} style={styles.flexShrink}>
                {isHindi ? 'दर्शन समय' : 'Darshan timings'}
              </AppText>
              <SeasonToggle season={season} onChange={setSeason} isHindi={isHindi} colors={colors} />
            </View>
            {windows ? (
              <View style={styles.tileGrid}>
                {windows.map(([start, end], i) => {
                  const [clock, period] = windowText(start, end);
                  return (
                    <View key={`${start}-${end}`} style={[styles.timeTile, { backgroundColor: colors.background }]}>
                      <AppText variant="small" color={colors.muted}>
                        {i === 0 ? (isHindi ? 'प्रातः दर्शन' : 'Morning darshan') : (isHindi ? 'सायं दर्शन' : 'Evening darshan')}
                      </AppText>
                      <AppText variant="h4" weight="700" color={colors.navy}>
                        {clock}
                      </AppText>
                      <AppText variant="badge" color={colors.muted}>
                        {period}
                      </AppText>
                    </View>
                  );
                })}
              </View>
            ) : (
              <AppText variant="body" color={colors.text}>
                {temple.timings?.[season]}
              </AppText>
            )}
            <InfoNote tone="warning" icon="clock">
              {isHindi
                ? 'यह मंदिर का नियमित समय है, लाइव नहीं। त्योहारों पर बदल सकता है — स्थानीय पुष्टि करें।'
                : 'Regular temple timings, not live. They change on festivals — confirm locally.'}
            </InfoNote>
            {temple.lastVerified || temple.sourceAttribution ? (
              <AppText variant="small" color={colors.muted}>
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
            <Card style={styles.card}>
              <AppText variant="h3" weight="700" color={colors.navy}>
                {isHindi ? 'आरती' : 'Aarti'}
              </AppText>
              {temple.aartiSchedule.map((a) => (
                <View key={a.id} style={styles.aartiRow}>
                  <View style={[styles.aartiIcon, { backgroundColor: colors.goldLight }]}>
                    <Icon name="aarti" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="body" weight="600" color={colors.navy}>
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
              {hasAudio ? (
                <Button
                  title={isHindi ? 'आरती सुनें · YouTube' : 'Listen to aarti · YouTube'}
                  accessibilityLabel={isHindi ? 'आरती सुनें' : 'Listen to aarti'}
                  icon="play"
                  variant="text"
                  onPress={() => navigation.navigate(ROUTES.AUDIO_PLAYER, { trackId: temple.audioTrackId })}
                  style={[styles.listenButton, { backgroundColor: colors.primaryLight }]}
                />
              ) : null}
            </Card>
          ) : null}

          {/* About */}
          {about ? (
            <View>
              <SectionHeader title={isHindi ? 'मंदिर के बारे में' : 'About this temple'} style={styles.headerTight} />
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
          <View>
            <SectionHeader title={isHindi ? 'जाने से पहले' : 'Before you visit'} />
            {hasVisitTiles ? (
              <View style={styles.tileGrid}>
                {duration ? (
                  <InfoTile
                    colors={colors}
                    label={isHindi ? 'दर्शन में लगने वाला समय' : 'Time needed'}
                    value={duration}
                  />
                ) : null}
                {temple.photographyAllowed === false ? (
                  <InfoTile
                    colors={colors}
                    label={isHindi ? 'फ़ोटोग्राफ़ी' : 'Photography'}
                    value={isHindi ? 'वर्जित' : 'Not allowed'}
                    valueColor={colors.warning}
                  />
                ) : null}
                {station ? (
                  <InfoTile
                    colors={colors}
                    wide
                    label={isHindi ? 'निकटतम स्टेशन' : 'Nearest station'}
                    value={station}
                  />
                ) : null}
              </View>
            ) : null}
            <View style={[styles.bullets, hasVisitTiles && styles.bulletsAfterTiles]}>
              {(temple.guidelines || []).map((g) => {
                const label = isHindi ? g.labelHi : g.labelEn;
                const desc = isHindi ? g.descHi : g.descEn;
                return (
                  <Bullet key={g.labelEn} colors={colors}>
                    <AppText variant="body" weight="600" color={colors.navy}>
                      {label}
                    </AppText>
                    {desc ? ` — ${desc}` : ''}
                  </Bullet>
                );
              })}
              {temple.darshanTips && isHindi ? (
                <Bullet colors={colors}>
                  <AppText variant="body" weight="600" color={colors.navy}>
                    सुझाव
                  </AppText>
                  {` — ${temple.darshanTips}`}
                </Bullet>
              ) : null}
            </View>
          </View>

          {/* Festivals */}
          {isHindi && Array.isArray(temple.festivals) && temple.festivals.length ? (
            <View>
              <SectionHeader title={isHindi ? 'प्रमुख उत्सव' : 'Main festivals'} />
              <View style={styles.festivals}>
                {temple.festivals.map((f) => (
                  <View key={f} style={[styles.festivalPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <AppText variant="caption" color={colors.text}>
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
                    <View style={[styles.flex, styles.nearText]}>
                      <AppText variant="body" weight="600" color={colors.navy}>
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

      {/* Fixed actions */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        <Button
          title={isHindi ? 'नक्शे पर' : 'On map'}
          variant="secondary"
          icon="location"
          onPress={() => navigation.navigate(ROUTES.MAP)}
          style={styles.mapBtn}
        />
        <Button
          title={isHindi ? 'रास्ता देखें' : 'Get directions'}
          icon="directions"
          onPress={openDirections}
          style={styles.directionsBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  notFound: { paddingHorizontal: GUTTER, gap: 16 },
  hero: { height: 300 },
  heroBar: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroRight: { flexDirection: 'row', gap: 10 },
  // The sheet overlaps the photo by 24px, so the tag sits just above that.
  heroFoot: { position: 'absolute', left: GUTTER, right: GUTTER, bottom: 36, alignItems: 'flex-start', gap: 6 },
  heroTag: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: 'rgba(23, 18, 14, 0.66)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: GUTTER,
    paddingTop: 20,
    gap: 20,
  },
  titleBlock: { gap: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  statusPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  card: { borderRadius: 20, padding: 18, gap: 14 },
  cardHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  seasonToggle: { flexDirection: 'row', padding: 3, borderRadius: 999 },
  seasonSeg: {
    minHeight: 40,
    minWidth: 56,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeTile: { flexGrow: 1, flexBasis: '45%', padding: 12, borderRadius: 14, gap: 2 },
  infoTile: { flexGrow: 1, flexBasis: '45%', padding: 14, borderRadius: 16, borderWidth: 1, gap: 4 },
  infoTileWide: { flexBasis: '100%' },
  aartiRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aartiIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  listenButton: { minHeight: 48, borderRadius: 14 },
  headerTight: { marginBottom: 8 },
  leftButton: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 0 },
  bullets: { gap: 10 },
  bulletsAfterTiles: { marginTop: 14 },
  bullet: { flexDirection: 'row', gap: 10 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 9 },
  festivals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  festivalPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  nearCard: { padding: 10, marginBottom: 10, borderRadius: 16 },
  nearInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nearText: { gap: 4 },
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
  mapBtn: { flex: 1, paddingHorizontal: 12 },
  directionsBtn: { flex: 1.4, paddingHorizontal: 12 },
});
