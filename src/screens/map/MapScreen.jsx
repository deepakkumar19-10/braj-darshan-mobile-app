/**
 * Braj Darshan - Map
 * Design: Claude Design canvas "Braj Darshan app redesign", artboard Map (Nov 2026).
 * An illustrative, offline vector map of Braj drawn from each temple's real
 * latitude/longitude (no map SDK, no API key, works without internet).
 * It is not to scale for navigation: "Directions" hands off to Google Maps.
 * Temples are grouped into one numbered pin per town; tapping a town lists its temples.
 * A faint photo of Vrindavan sits behind the drawing for atmosphere only.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Linking,
  useWindowDimensions,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  TopBar,
  LanguageToggle,
  Chip,
  StatusBadge,
  Button,
  Card,
  Photo,
  InfoNote,
  SectionHeader,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { useNow } from '../../hooks/useNow';
import { ROUTES } from '../../navigation/routes';
import { useTemples } from '../../services/contentService';
import { getTempleStatus, getTodaysWindows, getIndianStandardTime, formatMinutes } from '../../utils/templeHours';
import { getTempleImage, isTempleImageRepresentative } from '../../utils/imageAssets';

const TOWNS = [
  { id: 'mathura', hi: 'मथुरा', en: 'Mathura', lat: 27.4924, lon: 77.6737 },
  { id: 'vrindavan', hi: 'वृंदावन', en: 'Vrindavan', lat: 27.5807, lon: 77.7019 },
  { id: 'gokul', hi: 'गोकुल', en: 'Gokul', lat: 27.4379, lon: 77.7214 },
  { id: 'govardhan', hi: 'गोवर्धन', en: 'Govardhan', lat: 27.4998, lon: 77.4649 },
  { id: 'barsana', hi: 'बरसाना', en: 'Barsana', lat: 27.6477, lon: 77.3752 },
  { id: 'baldev', hi: 'बलदेव', en: 'Baldev', lat: 27.4116, lon: 77.8188 },
];

// Approximate course of the Yamuna past Vrindavan, Mathura and Gokul.
const YAMUNA = [
  [27.69, 77.655], [27.62, 77.69], [27.585, 77.712], [27.56, 77.7], [27.53, 77.688],
  [27.5, 77.692], [27.47, 77.712], [27.44, 77.73], [27.4, 77.76], [27.37, 77.79],
];

// Main roads between the towns (illustrative).
const ROADS = [
  ['mathura', 'vrindavan'],
  ['mathura', 'govardhan'],
  ['govardhan', 'barsana'],
  ['mathura', 'gokul'],
  ['gokul', 'baldev'],
];

// The website's own photo of Vrindavan, shown faintly behind the drawn map.
const MAP_BACKDROP = require('../../assets/images/places/vrindavan.jpg');

// Colours of the drawing itself (river, roads, wash over the photo), one set per theme.
const MAP_ART = {
  light: {
    wash: 'rgba(243, 237, 225, 0.62)',
    river: '#A9CBD0',
    riverCore: '#CFE3E5',
    road: '#D9C7A6',
    townDot: '#A85A06',
    photoOpacity: 0.22,
  },
  dark: {
    wash: 'rgba(35, 32, 29, 0.6)',
    river: '#1F4A4F',
    riverCore: '#2B6066',
    road: '#4A4036',
    townDot: '#B8A99A',
    photoOpacity: 0.16,
  },
};

const BOUNDS = { minLat: 27.39, maxLat: 27.67, minLon: 77.355, maxLon: 77.84 };
const PIN = 44; // touch target; the drawn circle inside is smaller
const LON_SCALE = Math.cos((27.5 * Math.PI) / 180);

function makeProjector(width, height, pad) {
  const spanX = (BOUNDS.maxLon - BOUNDS.minLon) * LON_SCALE;
  const spanY = BOUNDS.maxLat - BOUNDS.minLat;
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;
  return (lat, lon) => ({
    x: offsetX + (lon - BOUNDS.minLon) * LON_SCALE * scale,
    y: offsetY + (BOUNDS.maxLat - lat) * scale,
  });
}

// Where each town's name sits next to its pin, chosen so the dense
// Vrindavan–Mathura–Gokul stretch never overlaps.
const LABEL_SIDE = { Vrindavan: 'above', Mathura: 'left', Gokul: 'below', Baldev: 'above' };

// One pin per town (temples in the same town are a few hundred metres apart).
function clusterPins(temples, project) {
  const byTown = new Map();
  temples.forEach((temple) => {
    const key = temple.city;
    if (!byTown.has(key)) byTown.set(key, []);
    byTown.get(key).push(temple);
  });
  return [...byTown.entries()].map(([city, list]) => {
    const town = TOWNS.find((t) => t.en === city);
    const lat = town ? town.lat : list.reduce((a, t) => a + t.latitude, 0) / list.length;
    const lon = town ? town.lon : list.reduce((a, t) => a + t.longitude, 0) / list.length;
    const p = project(lat, lon);
    return { id: `town-${city}`, x: p.x, y: p.y, temples: list, side: LABEL_SIDE[city] || 'below' };
  });
}

function todayLine(temple, isHindi, now) {
  const windows = getTodaysWindows(temple, getIndianStandardTime(now));
  if (!windows) return isHindi ? 'दर्शन समय मंदिर से पुष्टि करें' : 'Confirm timings at the temple';
  return windows.map(([s, e]) => `${formatMinutes(s)} – ${formatMinutes(e)}`).join(' · ');
}

function openDirections(temple) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`;
  Linking.openURL(url).catch(() => {});
}

function clusterTownLabel(cluster, isHindi) {
  const towns = [];
  cluster.temples.forEach((t) => {
    const name = isHindi ? t.cityHindi || t.city : t.city;
    if (!towns.includes(name)) towns.push(name);
  });
  return towns.join(' · ');
}

function MapPin({ cluster, selected, onPress, colors, isDark, isHindi }) {
  const guarded = usePressGuard(onPress, 300);
  const onFill = isDark ? '#1E1B18' : '#FFFFFF';
  const count = cluster.temples.length;
  const label = count > 1
    ? isHindi ? `${count} मंदिर` : `${count} temples`
    : isHindi ? cluster.temples[0].nameHindi : cluster.temples[0].name;
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${clusterTownLabel(cluster, isHindi)}: ${label}`}
      style={[styles.pin, { left: cluster.x - PIN / 2, top: cluster.y - PIN / 2 }]}
    >
      <View
        style={[
          styles.pinDot,
          selected
            ? [styles.pinDotSelected, { backgroundColor: colors.primary, borderColor: colors.surface }]
            : { backgroundColor: colors.surface, borderColor: colors.primary },
        ]}
      >
        <AppText variant="caption" weight="700" color={selected ? onFill : colors.primary} maxFontSizeMultiplier={1.15}>
          {count}
        </AppText>
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.pinLabel,
          cluster.side === 'above' && styles.pinLabelAbove,
          cluster.side === 'left' && styles.pinLabelLeft,
        ]}
      >
        <AppText
          variant="small"
          weight={selected ? '700' : '600'}
          color={colors.navy}
          numberOfLines={1}
          maxFontSizeMultiplier={1.15}
          style={[styles.pinLabelText, { backgroundColor: colors.surface }]}
        >
          {clusterTownLabel(cluster, isHindi)}
        </AppText>
      </View>
    </Pressable>
  );
}

function TempleRow({ temple, onOpen, showCity, isHindi, colors, isDark, now }) {
  const status = getTempleStatus(temple, now);
  const name = isHindi ? temple.nameHindi : temple.name;
  const open = usePressGuard(onOpen);
  const go = usePressGuard(() => openDirections(temple));
  return (
    <Card style={styles.row}>
      <View style={styles.rowInner}>
        <Photo
          source={getTempleImage(temple)}
          representative={false}
          style={styles.thumb}
          accessibilityLabel={temple.name}
        />
        <View style={[styles.flex, styles.rowText]}>
          <AppText variant="body" weight="600" color={colors.navy} numberOfLines={2}>
            {name}
          </AppText>
          {showCity ? (
            <AppText variant="small" color={colors.muted}>
              {isHindi ? temple.cityHindi : temple.city}
            </AppText>
          ) : null}
          <StatusBadge status={status} size="sm" />
        </View>
        {/* The two buttons stack, so the name and status keep enough width on a phone
            (side by side they squeezed "खुला · 9:00 PM तक" onto two lines). */}
        <View style={styles.rowActions}>
          <Pressable
            onPress={open}
            accessibilityRole="button"
            accessibilityLabel={isHindi ? `विवरण — ${name}` : `Details — ${name}`}
            style={({ pressed }) => [styles.detailsBtn, { backgroundColor: colors.primaryLight }, pressed && styles.pressed]}
          >
            <AppText variant="caption" weight="600" color={colors.primary}>
              {isHindi ? 'विवरण' : 'Details'}
            </AppText>
          </Pressable>
          <Pressable
            onPress={go}
            accessibilityRole="button"
            accessibilityLabel={isHindi ? `रास्ता देखें — ${name}` : `Directions — ${name}`}
            style={({ pressed }) => [styles.goBtn, { backgroundColor: pressed ? colors.primaryDark : colors.primary }]}
          >
            <Icon name="directions" size={22} color={isDark ? '#1E1B18' : '#FFFFFF'} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

export default function MapScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const now = useNow();
  const { isHindi } = useLanguage();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const art = isDark ? MAP_ART.dark : MAP_ART.light;

  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const mapWidth = width - GUTTER * 2;
  const mapHeight = Math.round(mapWidth * 0.82);
  const project = useMemo(() => makeProjector(mapWidth, mapHeight, 28), [mapWidth, mapHeight]);

  const templesData = useTemples();
  const temples = useMemo(
    () => templesData.filter((t) => !openOnly || getTempleStatus(t, now).isOpen),
    [templesData, openOnly, now]
  );
  const clusters = useMemo(() => clusterPins(temples, project), [temples, project]);
  const selected = clusters.find((c) => c.id === selectedId) || null;

  const river = useMemo(
    () =>
      YAMUNA.map(([lat, lon], i) => {
        const p = project(lat, lon);
        return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      }).join(' '),
    [project]
  );
  const roads = useMemo(
    () =>
      ROADS.map(([a, b]) => {
        const ta = TOWNS.find((t) => t.id === a);
        const tb = TOWNS.find((t) => t.id === b);
        const pa = project(ta.lat, ta.lon);
        const pb = project(tb.lat, tb.lon);
        return `M${pa.x.toFixed(1)} ${pa.y.toFixed(1)} L${pb.x.toFixed(1)} ${pb.y.toFixed(1)}`;
      }),
    [project]
  );

  const townDots = useMemo(() => TOWNS.map((t) => ({ id: t.id, ...project(t.lat, t.lon) })), [project]);

  const openTemple = useCallback(
    (temple) => navigation.navigate(ROUTES.TEMPLE_DETAIL, { id: temple.id, temple }),
    [navigation]
  );

  const sheetTemples = selected ? selected.temples : temples;
  const single = selected && selected.temples.length === 1 ? selected.temples[0] : null;
  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={isHindi ? 'ब्रज का नक्शा' : 'Braj map'}
          subtitle={isHindi ? 'नगर पर टैप करें, फिर मंदिर चुनें' : 'Tap a town, then pick a temple'}
          right={<LanguageToggle />}
        />

        <View style={styles.chips}>
          <Chip
            label={isHindi ? 'सभी मंदिर' : 'All temples'}
            selected={!openOnly}
            onPress={() => setOpenOnly(false)}
          />
          <Chip
            label={isHindi ? 'अभी खुले' : 'Open now'}
            icon="open"
            selected={openOnly}
            onPress={() => {
              setOpenOnly(true);
              setSelectedId(null);
            }}
          />
        </View>

        <View
          style={[
            styles.mapBox,
            { width: mapWidth, height: mapHeight, backgroundColor: colors.surfaceContainer, borderColor: colors.border },
          ]}
          accessibilityLabel={isHindi ? 'ब्रज का चित्रात्मक नक्शा' : 'Illustrative map of Braj'}
        >
          {/* Faint photo for atmosphere, then a warm wash so roads, river and pins stay clear. */}
          <Image
            source={MAP_BACKDROP}
            style={[styles.mapBackdrop, { opacity: art.photoOpacity }]}
            resizeMode="cover"
            fadeDuration={0}
            accessible={false}
          />
          <View pointerEvents="none" style={[styles.mapWash, { backgroundColor: art.wash }]} />
          <Svg width={mapWidth} height={mapHeight} style={StyleSheet.absoluteFill} pointerEvents="none">
            {roads.map((d) => (
              <Path
                key={d}
                d={d}
                stroke={art.road}
                strokeWidth={2.5}
                strokeDasharray="5 6"
                strokeLinecap="round"
                fill="none"
              />
            ))}
            <Path d={river} stroke={art.river} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d={river} stroke={art.riverCore} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {townDots.map((t) => (
              <Circle key={t.id} cx={t.x} cy={t.y} r={5} fill={art.townDot} opacity={0.5} />
            ))}
          </Svg>

          {clusters.map((cluster) => (
            <MapPin
              key={cluster.id}
              cluster={cluster}
              selected={cluster.id === selectedId}
              onPress={() => setSelectedId(cluster.id === selectedId ? null : cluster.id)}
              colors={colors}
              isDark={isDark}
              isHindi={isHindi}
            />
          ))}

          <View style={[styles.riverTag, { backgroundColor: colors.surface }]} pointerEvents="none">
            <Icon name="ghat" size={16} color={colors.purnima} />
            <AppText variant="small" color={colors.purnima} weight="600">
              {isHindi ? 'यमुना' : 'Yamuna'}
            </AppText>
          </View>
          <View style={[styles.scaleTag, { backgroundColor: colors.surface, maxWidth: mapWidth - 24 }]} pointerEvents="none">
            <AppText variant="badge" color={colors.muted} weight="500">
              {isHindi
                ? 'चित्रात्मक · पैमाने पर नहीं · अंक = नगर में मंदिर'
                : 'Illustrative · not to scale · number = temples in town'}
            </AppText>
          </View>
        </View>

        <View style={styles.body}>
          {single ? (
            <Card padded={false} style={styles.singleCard}>
              <Photo
                source={getTempleImage(single)}
                representative={isTempleImageRepresentative(single)}
                style={styles.sheetPhoto}
                accessibilityLabel={single.name}
              />
              <View style={styles.sheetBody}>
                <AppText variant="h3" weight="700" color={colors.navy}>
                  {isHindi ? single.nameHindi : single.name}
                </AppText>
                <AppText variant="caption" color={colors.muted}>
                  {isHindi ? single.cityHindi : single.city}
                </AppText>
                <StatusBadge status={getTempleStatus(single, now)} />
                <View style={styles.timeLine}>
                  <Icon name="clock" size={18} color={colors.muted} />
                  <AppText variant="caption" color={colors.text} style={styles.flex}>
                    {todayLine(single, isHindi, now)}
                  </AppText>
                </View>
                <View style={styles.actions}>
                  <Button
                    title={isHindi ? 'विवरण' : 'Details'}
                    variant="secondary"
                    onPress={() => openTemple(single)}
                    style={styles.flex}
                  />
                  <Button
                    title={isHindi ? 'रास्ता देखें' : 'Directions'}
                    icon="directions"
                    onPress={() => openDirections(single)}
                    style={styles.flexWide}
                  />
                </View>
              </View>
            </Card>
          ) : (
            <View>
              <SectionHeader
                title={
                  selected
                    ? isHindi
                      ? `${clusterTownLabel(selected, true)} के मंदिर`
                      : `Temples in ${clusterTownLabel(selected, false)}`
                    : isHindi
                      ? `${temples.length} मंदिर`
                      : `${temples.length} temples`
                }
                actionLabel={selected ? (isHindi ? 'सभी मंदिर' : 'All temples') : undefined}
                onAction={selected ? () => setSelectedId(null) : undefined}
                style={styles.listHeader}
              />
              <View style={styles.list}>
                {sheetTemples.map((temple) => (
                  <TempleRow
                    key={temple.id}
                    temple={temple}
                    onOpen={() => openTemple(temple)}
                    showCity={!selected}
                    isHindi={isHindi}
                    colors={colors}
                    isDark={isDark}
                    now={now}
                  />
                ))}
              </View>
              {sheetTemples.length === 0 ? (
                <InfoNote>
                  {isHindi ? 'इस समय कोई मंदिर खुला नहीं दिख रहा।' : 'No temple shows as open right now.'}
                </InfoNote>
              ) : null}
            </View>
          )}

          <AppText variant="small" color={colors.muted}>
            {isHindi
              ? 'यह चित्रात्मक नक्शा है, पैमाने पर नहीं। रास्ते के लिए "रास्ता देखें" दबाएँ — रास्ता Google Maps में खुलेगा। त्योहारों पर दर्शन समय बदल सकता है।'
              : 'Illustrative map, not to scale. Use Directions for navigation — it opens in Google Maps. Timings may change on festivals.'}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  flexWide: { flex: 1.4 },
  pressed: { opacity: 0.75 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: GUTTER, marginBottom: 16 },
  mapBox: {
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Explicit size: absoluteFill alone lets Android draw the image at its own size.
  mapBackdrop: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  mapWash: { ...StyleSheet.absoluteFill },
  scaleTag: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pin: {
    position: 'absolute',
    width: PIN,
    height: PIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotSelected: { width: 42, height: 42, borderRadius: 21, borderWidth: 3 },
  pinLabel: {
    position: 'absolute',
    top: PIN - 2,
    left: (PIN - 140) / 2,
    width: 140,
    alignItems: 'center',
  },
  pinLabelAbove: { top: -24 },
  pinLabelLeft: { top: 11, left: -146, alignItems: 'flex-end' },
  pinLabelText: {
    paddingHorizontal: 6,
    paddingVertical: 0,
    borderRadius: 999,
    overflow: 'hidden',
  },
  riverTag: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  body: { paddingHorizontal: GUTTER, paddingTop: 20, gap: 14 },
  listHeader: { marginBottom: 10 },
  list: { gap: 10 },
  row: { padding: 10, borderRadius: 16 },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { gap: 3 },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  detailsBtn: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowActions: { width: 84, gap: 6 },
  goBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  singleCard: { borderRadius: 20 },
  sheetPhoto: { height: 160 },
  sheetBody: { padding: 16, gap: 8 },
  timeLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
});
