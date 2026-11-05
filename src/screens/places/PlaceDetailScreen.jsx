/**
 * Braj Darshan - Place / ghat details
 * Layout from the Nov 2026 redesign (PlaceDetail artboard): photo hero, a rounded
 * content sheet with the kind, name and description, evening aarti for ghats that
 * have one, water safety, temples in the same town, and one fixed primary action:
 * Get directions. Opened from the Places list and from Home search with
 * { key } ("place-<id>" / "ghat-<id>").
 * Everything shown comes from places.json / ghats.js (today's sunset from the
 * app's own panchang); fields a place does not have are left out, and the long
 * description that exists only in Hindi says so.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Share, Linking, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
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
import { ROUTES } from '../../navigation/routes';
import { usePlaces, useTemples } from '../../services/contentService';
import { calculatePanchang } from '../../services/panchangService';
import { getTempleImage } from '../../utils/imageAssets';
import { getTempleStatus } from '../../utils/templeHours';
import { istDateKey } from '../../utils/festivals';
import { findPlaceItem, openPlaceDirections, bestTimeEn, visitLengthEn } from '../../utils/placeItems';
import { getPhotoCredit, creditLine } from '../../utils/photoCredits';

const HERO_HEIGHT = 300;
const SHEET_OVERLAP = 20;

function DetailRow({ icon, label, value, colors }) {
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText variant="small" color={colors.muted}>
          {label}
        </AppText>
        <AppText variant="body" color={colors.text}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

// Temples whose town appears in this place's town (ghats list "Radha Kund, Govardhan" etc.).
function templesNear(item, templesData) {
  const town = String(item.townEn || '').toLowerCase();
  return templesData.filter((t) => t.city && town.includes(String(t.city).toLowerCase())).slice(0, 4);
}

// Today's sunset in Braj (Mathura) from the app's panchang; null if it cannot be worked out.
function todaysSunset() {
  try {
    const [y, m, d] = istDateKey().split('-').map(Number);
    return calculatePanchang(new Date(y, m - 1, d)).sunset || null;
  } catch {
    return null;
  }
}

export default function PlaceDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const placeData = usePlaces();
  const templesData = useTemples();
  const item = useMemo(() => findPlaceItem(route?.params?.key, placeData), [route?.params?.key, placeData]);
  const hasAarti = Boolean(item?.ghat?.aarti);
  const sunset = useMemo(() => (hasAarti ? todaysSunset() : null), [hasAarti]);

  if (!item) {
    return (
      <View style={[styles.root, styles.missing, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}>
        <InfoNote icon="alert">{isHindi ? 'यह स्थान नहीं मिला।' : 'This place could not be found.'}</InfoNote>
        <Button title={isHindi ? 'वापस' : 'Go back'} variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const name = isHindi ? item.nameHi : item.nameEn;
  const altName = isHindi ? item.nameEn : item.nameHi;
  const town = isHindi ? item.townHi : item.townEn;
  const credit = getPhotoCredit(item.photoKey);
  const nearby = templesNear(item, templesData);
  const isGhat = item.kind === 'ghat';
  const isYamunaGhat = isGhat && item.icon === 'ghat';

  const p = item.place;
  const longDesc = item.kind === 'place' && isHindi ? p.description : null;
  const highlights = item.kind === 'place' && isHindi && Array.isArray(p.highlights) ? p.highlights : [];
  const bestTime = item.kind === 'place' ? (isHindi ? p.bestTime : bestTimeEn(p.bestTime)) : null;
  const visit = item.kind === 'place' ? (isHindi ? p.visitDuration : visitLengthEn(p.visitDuration)) : null;
  const hindiOnly = item.kind === 'place' && !isHindi && Boolean(p.description || (p.highlights || []).length);

  let kindLabel;
  if (isGhat) {
    kindLabel = isHindi ? 'घाट व कुंड' : 'Ghats & kunds';
    if (isYamunaGhat) kindLabel += isHindi ? ' · यमुना' : ' · Yamuna';
  } else {
    kindLabel = isHindi ? 'पावन स्थल' : 'Sacred place';
  }
  const kindTint = isGhat
    ? { bg: colors.purnimaLight, fg: colors.purnima }
    : { bg: colors.primaryLight, fg: colors.primary };
  const nameLine = [altName, town && town !== name ? town : null].filter(Boolean).join(' · ');

  let aartiText = null;
  if (hasAarti) {
    if (sunset) {
      aartiText = isHindi
        ? `सूर्यास्त के आस-पास होती है — आज सूर्यास्त लगभग ${sunset}। समय मौसम के साथ बदलता है, स्थानीय पुष्टि करें।`
        : `Held around sunset — today’s sunset is about ${sunset}. The time shifts with the season, so confirm locally.`;
    } else {
      aartiText = isHindi
        ? 'सूर्यास्त के आस-पास होती है; समय मौसम के साथ बदलता है, स्थानीय पुष्टि करें।'
        : 'Held around sunset; the time shifts with the season, so confirm locally.';
    }
  }

  const share = () => {
    Share.share({ message: `${item.nameHi} (${item.nameEn}), ${item.townEn} — DivyaBraj` }).catch(() => {});
  };

  const directionsLabel = isHindi ? 'रास्ता देखें (Google Maps)' : 'Directions (Google Maps)';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <Photo source={item.image} fallbackIcon={item.icon} style={styles.hero} accessibilityLabel={item.nameEn}>
          <View style={[styles.heroBar, { top: insets.top + 8 }]}>
            <IconButton
              icon="chevronLeft"
              size={28}
              filled
              onPress={() => navigation.goBack()}
              accessibilityLabel={isHindi ? 'वापस' : 'Back'}
            />
            <IconButton icon="share" filled onPress={share} accessibilityLabel={isHindi ? 'साझा करें' : 'Share'} />
          </View>
          {/* Above the sheet's rounded edge, so the photo notes stay visible. */}
          <View style={styles.heroNotes}>
            {item.representative ? <RepresentativeTag /> : null}
            {credit ? (
              <Pressable
                onPress={() => Linking.openURL(credit.source).catch(() => {})}
                accessibilityRole="link"
                hitSlop={12}
                style={styles.creditPill}
              >
                <AppText variant="badge" weight="500" color="#FFFFFF" numberOfLines={2} maxFontSizeMultiplier={1.2}>
                  {creditLine(credit, isHindi)}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </Photo>

        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.titleBlock}>
            <View style={[styles.kindPill, { backgroundColor: kindTint.bg }]}>
              <AppText variant="small" weight="600" color={kindTint.fg}>
                {kindLabel}
              </AppText>
            </View>
            <AppText variant="h1" weight="700" color={colors.navy}>
              {name}
            </AppText>
            {nameLine ? (
              <AppText variant="body" color={colors.muted}>
                {nameLine}
              </AppText>
            ) : null}
          </View>

          <AppText variant="bodyLarge" color={colors.text}>
            {isHindi ? item.descHi : item.descEn}
          </AppText>

          {longDesc && longDesc !== item.descHi ? (
            <AppText variant="body" color={colors.text}>
              {longDesc}
            </AppText>
          ) : null}

          {highlights.length ? (
            <Card>
              <AppText variant="h4" weight="700" color={colors.navy}>
                प्रमुख आकर्षण
              </AppText>
              {highlights.map((h) => (
                <View key={h} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                  <AppText variant="body" color={colors.text} style={styles.flex}>
                    {h}
                  </AppText>
                </View>
              ))}
            </Card>
          ) : null}

          {bestTime || visit ? (
            <Card>
              <View style={styles.rows}>
                {bestTime ? (
                  <DetailRow icon="calendar" label={isHindi ? 'घूमने का अच्छा समय' : 'Good time to visit'} value={bestTime} colors={colors} />
                ) : null}
                {visit ? (
                  <DetailRow icon="timer" label={isHindi ? 'घूमने में लगने वाला समय' : 'Time to allow'} value={visit} colors={colors} />
                ) : null}
              </View>
            </Card>
          ) : null}

          {aartiText ? (
            <Card>
              <View style={styles.aartiRow}>
                <View style={[styles.aartiIcon, { backgroundColor: colors.goldLight }]}>
                  <Icon name="aarti" size={22} color={colors.primary} />
                </View>
                <View style={[styles.flex, styles.aartiText]}>
                  <AppText variant="h4" weight="700" color={colors.navy}>
                    {isHindi ? 'संध्या आरती' : 'Evening aarti'}
                  </AppText>
                  <AppText variant="caption" color={colors.text}>
                    {aartiText}
                  </AppText>
                </View>
              </View>
            </Card>
          ) : null}

          {hindiOnly ? (
            <InfoNote icon="language">
              The full description and highlights for this place are available in Hindi — switch to हिं at the top of the app.
            </InfoNote>
          ) : null}

          {/* Yamuna ghats and still-water kunds need different advice. */}
          {isYamunaGhat ? (
            <InfoNote tone="water" icon="safety">
              {isHindi
                ? 'यमुना की धारा और गहराई बदलती रहती है। वहीं स्नान करें जहाँ स्थानीय लोग स्नान करते हैं, सीढ़ियों के पास रहें और बच्चों को साथ रखें।'
                : 'The Yamuna’s current and depth can change. Bathe only where local people bathe, stay near the steps and keep children close.'}
            </InfoNote>
          ) : null}
          {isGhat && !isYamunaGhat ? (
            <InfoNote tone="water" icon="safety">
              {isHindi
                ? 'कुंड की सीढ़ियाँ फिसलन भरी हो सकती हैं और पानी गहरा होता है। बच्चों को साथ रखें, और पानी में साबुन या प्लास्टिक न डालें।'
                : 'Kund steps can be slippery and the water is deep. Keep children close, and keep soap and plastic out of the water.'}
            </InfoNote>
          ) : null}

          {nearby.length ? (
            <View>
              <SectionHeader title={isHindi ? 'आस-पास के मंदिर' : 'Temples nearby'} />
              <View style={styles.nearList}>
                {nearby.map((t) => (
                  <Card
                    key={t.id}
                    style={styles.nearCard}
                    onPress={() => navigation.navigate(ROUTES.TEMPLE_DETAIL, { id: t.id, temple: t })}
                    accessibilityLabel={t.name}
                  >
                    <View style={styles.nearInner}>
                      <Photo source={getTempleImage(t)} style={styles.nearThumb} accessibilityLabel={t.name} />
                      <View style={[styles.flex, styles.nearText]}>
                        <AppText variant="body" weight="600" color={colors.navy}>
                          {isHindi ? t.nameHindi : t.name}
                        </AppText>
                        <StatusBadge status={getTempleStatus(t)} size="sm" />
                      </View>
                      <Icon name="chevronRight" size={20} color={colors.muted} />
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        <Button
          title={directionsLabel}
          icon="directions"
          onPress={() => openPlaceDirections(item)}
          accessibilityLabel={isHindi ? `${name} का रास्ता देखें (Google Maps)` : `Directions to ${name} (Google Maps)`}
          style={styles.flex}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  missing: { padding: GUTTER, gap: 16 },
  hero: { height: HERO_HEIGHT },
  heroBar: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroNotes: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    bottom: SHEET_OVERLAP + 10,
    alignItems: 'flex-start',
    gap: 6,
  },
  creditPill: {
    maxWidth: '100%',
    backgroundColor: 'rgba(30, 24, 18, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sheet: {
    marginTop: -SHEET_OVERLAP,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: GUTTER,
    paddingTop: 20,
    gap: 20,
  },
  titleBlock: { gap: 6 },
  kindPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999 },
  rows: { gap: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 9 },
  aartiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  aartiIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aartiText: { gap: 4 },
  nearList: { gap: 10 },
  nearCard: { padding: 10, borderRadius: 16 },
  nearInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nearThumb: { width: 60, height: 60, borderRadius: 12 },
  nearText: { gap: 4 },
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
});
