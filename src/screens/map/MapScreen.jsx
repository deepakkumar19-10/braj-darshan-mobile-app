/**
 * Braj Darshan - Map
 * An illustrative, offline vector map of Braj drawn from each temple's real
 * latitude/longitude (no map SDK, no API key, works without internet).
 * It is not to scale for navigation: "Directions" hands off to Google Maps.
 * Temples closer than a pin's width are grouped into one numbered pin.
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
  Platform,
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
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { useNow } from '../../hooks/useNow';
import { ROUTES } from '../../navigation/routes';
import templesData from '../../data/temples.json';
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

const BOUNDS = { minLat: 27.39, maxLat: 27.67, minLon: 77.355, maxLon: 77.84 };
const PIN = 44;
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

function todayLine(temple, isHindi) {
  const windows = getTodaysWindows(temple, getIndianStandardTime(new Date()));
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
  const glyph = isDark && !selected ? '#1E1B18' : '#FFFFFF';
  const count = cluster.temples.length;
  const label = count > 1
    ? isHindi ? `${count} मंदिर` : `${count} temples`
    : isHindi ? cluster.temples[0].nameHindi : cluster.temples[0].name;
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.pin,
        {
          left: cluster.x - PIN / 2,
          top: cluster.y - PIN / 2,
          backgroundColor: selected ? colors.navy : colors.primary,
          borderColor: colors.surface,
        },
        selected && styles.pinSelected,
      ]}
    >
      {count > 1 ? (
        <AppText variant="caption" weight="700" color={glyph}>
          {count}
        </AppText>
      ) : (
        <Icon name="temple" size={22} color={glyph} />
      )}
      <View
        pointerEvents="none"
        style={[
          styles.pinLabel,
          cluster.side === 'above' && styles.pinLabelAbove,
          cluster.side === 'left' && styles.pinLabelLeft,
        ]}
      >
        <AppText
          variant="badge"
          weight="600"
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

function TempleSheetRow({ temple, onOpen, isHindi, colors }) {
  const status = getTempleStatus(temple);
  return (
    <Card onPress={onOpen} style={styles.sheetRow} accessibilityLabel={temple.name}>
      <View style={styles.sheetRowInner}>
        <Photo
          source={getTempleImage(temple)}
          representative={false}
          style={styles.thumb}
          accessibilityLabel={temple.name}
        />
        <View style={styles.flex}>
          <AppText variant="body" weight="700" color={colors.navy} numberOfLines={2}>
            {isHindi ? temple.nameHindi : temple.name}
          </AppText>
          <AppText variant="small" color={colors.muted}>
            {isHindi ? temple.cityHindi : temple.city}
          </AppText>
          <View style={styles.gapTop}>
            <StatusBadge status={status} size="sm" />
          </View>
        </View>
        <Icon name="chevronRight" size={20} color={colors.muted} />
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

  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const mapWidth = width - GUTTER * 2;
  const mapHeight = Math.round(mapWidth * 0.82);
  const project = useMemo(() => makeProjector(mapWidth, mapHeight, 28), [mapWidth, mapHeight]);

  const temples = useMemo(
    () => templesData.filter((t) => !openOnly || getTempleStatus(t, now).isOpen),
    [openOnly, now]
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
          subtitle={isHindi ? 'मंदिर पर टैप करें — दिशा Google Maps में खुलेगी' : 'Tap a temple — directions open in Google Maps'}
          right={<LanguageToggle />}
        />

        <View style={styles.chips}>
          <Chip
            label={isHindi ? 'सभी मंदिर' : 'All temples'}
            icon="temple"
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
            { width: mapWidth, height: mapHeight, backgroundColor: isDark ? '#1F1C18' : '#F6EEE2', borderColor: colors.borderGold },
          ]}
          accessibilityLabel={isHindi ? 'ब्रज का चित्रात्मक नक्शा' : 'Illustrative map of Braj'}
        >
          {/* Faint photo for atmosphere, then a warm wash so roads, river and pins stay clear. */}
          <Image
            source={MAP_BACKDROP}
            style={[styles.mapBackdrop, { opacity: isDark ? 0.2 : 0.3 }]}
            resizeMode="cover"
            fadeDuration={0}
            accessible={false}
          />
          <View
            pointerEvents="none"
            style={[styles.mapWash, { backgroundColor: isDark ? 'rgba(18,18,18,0.55)' : 'rgba(255,249,237,0.55)' }]}
          />
          <Svg width={mapWidth} height={mapHeight} style={StyleSheet.absoluteFill} pointerEvents="none">
            {roads.map((d) => (
              <Path
                key={d}
                d={d}
                stroke={isDark ? '#4A4036' : '#D9C3A0'}
                strokeWidth={5}
                strokeDasharray="10 6"
                strokeLinecap="round"
                fill="none"
              />
            ))}
            <Path d={river} stroke={isDark ? '#1F4A4F' : '#9FCBCA'} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {townDots.map((t) => (
              <Circle key={t.id} cx={t.x} cy={t.y} r={5} fill={isDark ? '#B8A99A' : '#A85A06'} opacity={0.5} />
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
          <View style={[styles.scaleTag, { backgroundColor: colors.surface }]} pointerEvents="none">
            <AppText variant="badge" color={colors.muted} weight="600">
              {isHindi ? 'चित्रात्मक · पैमाने पर नहीं' : 'Illustrative · not to scale'}
            </AppText>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendPin, { backgroundColor: colors.primary }]}>
              <Icon name="temple" size={12} color={isDark ? '#1E1B18' : '#FFFFFF'} />
            </View>
            <AppText variant="small" color={colors.textSecondary}>
              {isHindi ? 'मंदिर (अंक = नगर में मंदिर)' : 'Temples (number = temples in town)'}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: isDark ? '#1F4A4F' : '#9FCBCA' }]} />
            <AppText variant="small" color={colors.textSecondary}>
              {isHindi ? 'यमुना' : 'Yamuna'}
            </AppText>
          </View>
        </View>

        <View style={styles.body}>
          {single ? (
            <Card padded={false}>
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
                <StatusBadge status={getTempleStatus(single)} />
                <View style={styles.timeLine}>
                  <Icon name="clock" size={18} color={colors.muted} />
                  <AppText variant="caption" color={colors.text} style={styles.flex}>
                    {todayLine(single, isHindi)}
                  </AppText>
                </View>
                <View style={styles.actions}>
                  <Button
                    title={isHindi ? 'रास्ता देखें' : 'Directions'}
                    icon="directions"
                    onPress={() => openDirections(single)}
                    style={styles.flex}
                  />
                  <Button
                    title={isHindi ? 'विवरण' : 'Details'}
                    variant="secondary"
                    onPress={() => openTemple(single)}
                    style={styles.flex}
                  />
                </View>
              </View>
            </Card>
          ) : (
            <>
              <AppText variant="h3" weight="700" color={colors.navy} style={styles.listTitle}>
                {selected
                  ? isHindi
                    ? `यहाँ ${selected.temples.length} मंदिर`
                    : `${selected.temples.length} temples here`
                  : isHindi
                    ? `${temples.length} मंदिर`
                    : `${temples.length} temples`}
              </AppText>
              {sheetTemples.map((temple) => (
                <TempleSheetRow
                  key={temple.id}
                  temple={temple}
                  onOpen={() => openTemple(temple)}
                  isHindi={isHindi}
                  colors={colors}
                />
              ))}
              {sheetTemples.length === 0 ? (
                <InfoNote>
                  {isHindi ? 'इस समय कोई मंदिर खुला नहीं दिख रहा।' : 'No temple shows as open right now.'}
                </InfoNote>
              ) : null}
            </>
          )}

          <InfoNote style={styles.gapTop}>
            {isHindi
              ? 'यह चित्रात्मक नक्शा है, पैमाने पर नहीं। रास्ते के लिए "रास्ता देखें" दबाएँ। त्योहारों पर दर्शन समय बदल सकता है।'
              : 'Illustrative map, not to scale. Use Directions for navigation. Timings may change on festivals.'}
          </InfoNote>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: GUTTER, marginBottom: 12 },
  mapBox: {
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  // Explicit size: absoluteFill alone lets Android draw the image at its own size.
  mapBackdrop: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  mapWash: { ...StyleSheet.absoluteFill },
  scaleTag: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: GUTTER, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendPin: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  legendLine: { width: 22, height: 6, borderRadius: 3 },
  pin: {
    position: 'absolute',
    width: PIN,
    height: PIN,
    borderRadius: PIN / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#2D2018', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  pinSelected: { borderWidth: 4, transform: [{ scale: 1.12 }] },
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
    paddingVertical: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  riverTag: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  body: { paddingHorizontal: GUTTER, paddingTop: 16, gap: 12 },
  listTitle: { marginBottom: 2 },
  sheetRow: { padding: 12 },
  sheetRowInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 14 },
  sheetPhoto: { height: 160 },
  sheetBody: { padding: 16, gap: 8 },
  timeLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  gapTop: { marginTop: 6 },
});
