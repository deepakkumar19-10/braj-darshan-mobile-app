/**
 * Braj Darshan - Home
 * Layout from the Nov 2026 "Braj dusk" redesign (owner-approved mock, 9 Nov): a dusk-coloured
 * header behind the status bar with the greeting and today's date and tithi, a search box that
 * stays on top while scrolling, the "Today in Braj" card (tithi, sunrise, sunset, next festival),
 * eight colourful shortcuts, guide banners, temples open now, the dhams of Braj, upcoming
 * festivals and the 112 / 108 helplines.
 * Everything shown is computed from the app's own data; approximate values say so.
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Linking,
  Image,
  Keyboard,
  Animated,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Card,
  IconButton,
  LanguageToggle,
  SectionHeader,
  StatusBadge,
  Photo,
  SearchField,
  normalizeSearch,
  matchesSearch,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { daysUntil, istDateKey } from '../../utils/festivals';
import { useNow } from '../../hooks/useNow';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';
import {
  calculatePanchang,
  YEAR_FESTIVALS_MAP,
  TITHIS_SHUKLA,
  TITHIS_KRISHNA,
} from '../../services/panchangService';
import { getTempleStatus } from '../../utils/templeHours';
import { getTempleImage, isTempleImageRepresentative } from '../../utils/imageAssets';
import { usePlaces, useTemples } from '../../services/contentService';
import { BRAJ_PLACES, BRAJ_TOWNS } from '../../utils/brajPlaces';
import eventsData from '../../data/events.json';
import foodData from '../../data/food.json';
import yatraData from '../../data/yatra.json';
import bhaktiData from '../../data/bhakti.json';
import { GHATS } from '../../data/ghats';
import { searchTerms, searchFields } from '../../utils/searchText';

// Same logo as divyabraj.com, shown as the app icon in the header.
const LOGO = require('../../assets/images/brand/braj-logo.png');

// The header is a Braj dusk, top to bottom, in both themes; its text is always white.
const DUSK = ['#2B1A42', '#4E2752', '#8A4258', '#C9764F'];

const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];
const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTHS_FULL_HI = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
];
const MONTHS_FULL_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// The 30 tithis in order (Shukla 1–15, then Krishna 1–15): the one after a tithi is the next in this list.
const ALL_TITHIS = [...TITHIS_SHUKLA, ...TITHIS_KRISHNA];

function nextTithi(tithiHi) {
  const i = ALL_TITHIS.findIndex((t) => t.hi === tithiHi);
  return i < 0 ? null : ALL_TITHIS[(i + 1) % ALL_TITHIS.length];
}

const UPCOMING_FESTIVALS = 3;

// The next festivals on or after today (IST) from the app's festival calendar.
function upcomingFestivals(todayKey, count) {
  return Object.keys(YEAR_FESTIVALS_MAP)
    .sort()
    .filter((k) => k >= todayKey)
    .slice(0, count)
    .map((key) => ({ key, ...YEAR_FESTIVALS_MAP[key], isToday: key === todayKey }));
}

const RESULTS_PER_GROUP = 4;

const withSearchable = (items) => items.map((item) => ({ ...item, searchable: searchFields(item.fields) }));

// Everything Home can find, in one list: temples, towns, ghats, festivals and food.
function buildSearchIndex(templesData, placesData) {
  return withSearchable([
    ...templesData.map((t) => ({
      key: `temple-${t.id}`,
      icon: 'temple',
      group: 'temples',
      hi: t.nameHindi,
      en: t.name,
      subHi: t.cityHindi,
      subEn: t.city,
      fields: [t.name, t.nameHindi, t.city, t.cityHindi, t.deity, t.deityHindi],
      open: (go) => go(ROUTES.TEMPLE_DETAIL, { id: t.id, temple: t }),
    })),
    ...placesData.map((p) => ({
      key: `place-${p.id}`,
      icon: 'location',
      group: 'places',
      hi: p.nameHindi,
      en: p.name,
      subHi: 'ब्रज का नगर',
      subEn: 'Town of Braj',
      fields: [p.name, p.nameHindi, p.city, p.category],
      open: (go) => go(ROUTES.PLACE_DETAIL, { key: `place-${p.id}` }),
    })),
    ...GHATS.map((g) => ({
      key: `ghat-${g.id}`,
      icon: 'ghat',
      group: 'places',
      hi: g.nameHi,
      en: g.nameEn,
      subHi: g.townHi,
      subEn: g.townEn,
      fields: [g.nameHi, g.nameEn, g.townHi, g.townEn],
      open: (go) => go(ROUTES.PLACE_DETAIL, { key: `ghat-${g.id}` }),
    })),
    ...eventsData.map((e) => ({
      key: `event-${e.id}`,
      icon: 'festival',
      group: 'festivals',
      hi: e.title,
      en: e.titleEn,
      subHi: e.location,
      subEn: e.locationEn,
      fields: [e.title, e.titleEn, e.location, e.locationEn],
      open: (go) => go(ROUTES.EVENTS, { search: e.titleEn }),
    })),
    ...foodData.map((f) => ({
      key: `food-${f.id}`,
      icon: 'food',
      group: 'food',
      hi: f.nameHindi,
      en: f.name,
      subHi: f.category,
      subEn: f.categoryEn,
      fields: [f.name, f.nameHindi, f.place, f.category, f.categoryEn],
      open: (go) => go(ROUTES.FOOD, { search: f.name }),
    })),
  ]);
}

const GROUPS = [
  { id: 'temples', hi: 'मंदिर', en: 'Temples' },
  { id: 'places', hi: 'नगर व घाट', en: 'Towns & ghats' },
  { id: 'festivals', hi: 'त्योहार', en: 'Festivals' },
  { id: 'food', hi: 'ब्रज भोग', en: 'Braj food' },
];

function SearchResults({ query, index, onOpen, onSeeAllTemples, isHindi, colors }) {
  const terms = searchTerms(normalizeSearch(query));
  const matches = index.filter((item) => terms.every((t) => matchesSearch(t, ...item.searchable)));
  if (matches.length === 0) {
    return (
      <Card style={styles.results}>
        <View style={styles.emptyRow}>
          <Icon name="search" size={22} color={colors.muted} />
          <View style={styles.flex}>
            <AppText variant="body" weight="700" color={colors.navy}>
              {isHindi ? `"${query.trim()}" से कुछ नहीं मिला` : `Nothing found for "${query.trim()}"`}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              {isHindi
                ? 'मंदिर, नगर, घाट, त्योहार या भोग का नाम हिंदी या अंग्रेज़ी में लिखें।'
                : 'Try a temple, town, ghat, festival or food name, in Hindi or English.'}
            </AppText>
          </View>
        </View>
      </Card>
    );
  }
  const templeCount = matches.filter((m) => m.group === 'temples').length;
  return (
    <Card style={styles.results} padded={false}>
      {GROUPS.map((group) => {
        const items = matches.filter((m) => m.group === group.id);
        if (items.length === 0) return null;
        return (
          <View key={group.id} style={styles.resultGroup}>
            <AppText variant="small" weight="700" color={colors.primary} style={styles.resultGroupTitle}>
              {isHindi ? group.hi : group.en}
            </AppText>
            {items.slice(0, RESULTS_PER_GROUP).map((item) => (
              <Pressable
                key={item.key}
                onPress={() => onOpen(item)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.resultRow, { opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={[styles.resultIcon, { backgroundColor: colors.primaryLight }]}>
                  <Icon name={item.icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="body" weight="600" color={colors.navy} numberOfLines={1}>
                    {isHindi ? item.hi || item.en : item.en || item.hi}
                  </AppText>
                  {(isHindi ? item.subHi : item.subEn) ? (
                    <AppText variant="small" color={colors.muted} numberOfLines={1}>
                      {isHindi ? item.subHi : item.subEn}
                    </AppText>
                  ) : null}
                </View>
                <Icon name="chevronRight" size={20} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        );
      })}
      {templeCount > RESULTS_PER_GROUP ? (
        <Pressable onPress={onSeeAllTemples} accessibilityRole="button" style={styles.resultMore}>
          <AppText variant="caption" weight="700" color={colors.primary}>
            {isHindi ? `सभी ${templeCount} मंदिर देखें` : `See all ${templeCount} temples`}
          </AppText>
          <Icon name="chevronRight" size={18} color={colors.primary} />
        </Pressable>
      ) : null}
    </Card>
  );
}

/* ----------------------------------------------------------- Dusk header */

function DuskBackground() {
  // Stretches to whatever height the header content needs.
  return (
    // width/height 100% as in the photo Scrim: without them the SVG stays square and only its top shows.
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={DUSK[0]} />
          <Stop offset="0.45" stopColor={DUSK[1]} />
          <Stop offset="0.8" stopColor={DUSK[2]} />
          <Stop offset="1" stopColor={DUSK[3]} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill="url(#dusk)" />
    </Svg>
  );
}

/* ---------------------------------------------------- Today in Braj card */

// Soft tiles for sunrise and sunset, readable in both themes.
const SUN_TONES = {
  sunrise: { light: ['#FFF3DC', '#9A5B00'], dark: ['#3A2A17', '#F2B36B'] },
  sunset: { light: ['#FDE7E7', '#A23B45'], dark: ['#3A1E24', '#F19AA2'] },
};

function SunTile({ kind, label, value, isDark, colors }) {
  const [bg, fg] = SUN_TONES[kind][isDark ? 'dark' : 'light'];
  return (
    <View style={[styles.sunTile, { backgroundColor: bg }]}>
      <Icon name={kind} size={20} color={fg} />
      <View>
        <AppText variant="badge" color={colors.muted}>
          {label}
        </AppText>
        <AppText variant="body" weight="700" color={colors.navy}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

// Today's tithi, nakshatra, sunrise, sunset and the next festival. Tap for the full Panchang.
function TodayCard({ today, nextFestival, nextWhen, isHindi, isDark, colors, onPress }) {
  const guarded = usePressGuard(onPress);
  const next = nextTithi(today.tithiHi);
  const until = today.tithiEndsAt
    ? isHindi
      ? `${today.tithiEndsAt} तक${next ? ` · फिर ${next.shortHi}` : ''}`
      : `Until ${today.tithiEndsAt}${next ? ` · then ${next.shortEn}` : ''}`
    : '';
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? 'आज का पंचांग' : "Today's Panchang"}
      style={({ pressed }) => [
        styles.today,
        { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.gold, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.todayTop}>
        <View style={[styles.flex, styles.todayText]}>
          <AppText variant="small" weight="700" color={colors.primary}>
            {isHindi ? 'आज का ब्रज' : 'Today in Braj'}
          </AppText>
          <AppText variant="h2" weight="700" color={colors.navy} style={styles.todayTithi} numberOfLines={2}>
            {isHindi ? today.tithiHi : today.tithiEn}
          </AppText>
          {until ? (
            <AppText variant="caption" color={colors.text}>
              {until}
            </AppText>
          ) : null}
          <AppText variant="caption" color={colors.muted}>
            {isHindi ? `नक्षत्र: ${today.nakshatraHi}` : `Nakshatra: ${today.nakshatraEn}`}
          </AppText>
        </View>
        <View style={styles.sunCol}>
          <SunTile kind="sunrise" label={isHindi ? 'सूर्योदय' : 'Sunrise'} value={today.sunrise} isDark={isDark} colors={colors} />
          <SunTile kind="sunset" label={isHindi ? 'सूर्यास्त' : 'Sunset'} value={today.sunset} isDark={isDark} colors={colors} />
        </View>
      </View>

      <View style={[styles.todayRule, { borderTopColor: colors.border }]} />

      <View style={styles.rowBetween}>
        {nextFestival ? (
          <View style={[styles.row, styles.flex]}>
            <Icon name="aarti" size={20} color={colors.primary} />
            <AppText variant="caption" weight="700" color={colors.navy} numberOfLines={1} style={styles.shrink}>
              {isHindi ? nextFestival.nameHi : nextFestival.nameEn}
            </AppText>
            <View style={[styles.pill, { backgroundColor: colors.primaryLight }]}>
              <AppText variant="badge" weight="700" color={colors.primary}>
                {nextWhen}
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.flex} />
        )}
        <View style={styles.inlineLink}>
          <AppText variant="caption" weight="700" color={colors.primary}>
            {isHindi ? 'पंचांग' : 'Panchang'}
          </AppText>
          <Icon name="chevronRight" size={18} color={colors.primary} />
        </View>
      </View>
      <AppText variant="badge" color={colors.muted}>
        {isHindi ? 'तिथि अनुमानित है — स्थानीय पंचांग से मिलाएँ' : 'Approximate tithi — check a local panchang'}
      </AppText>
    </Pressable>
  );
}

/* --------------------------------------------------------------- Tiles */

// Pastel face and icon colour per tile, light and dark.
const TONES = {
  saffron: { light: ['#FDEBD3', '#A85400'], dark: ['#3B2A16', '#F5B56A'] },
  rose: { light: ['#FCE4E8', '#A8334E'], dark: ['#3B1D25', '#F29AB0'] },
  teal: { light: ['#DDF3EC', '#1B6E52'], dark: ['#15332B', '#7FD6B6'] },
  lavender: { light: ['#E9E5FB', '#5143A8'], dark: ['#26213F', '#B3A6F5'] },
  blue: { light: ['#E2EEFB', '#285F9F'], dark: ['#182A3E', '#8DBBF0'] },
  yellow: { light: ['#FCF1D2', '#8A5F00'], dark: ['#372D12', '#EBCB6E'] },
  violet: { light: ['#F3E2F4', '#833687'], dark: ['#33193A', '#E0A0E4'] },
  red: { light: ['#FCE3E1', '#B3322A'], dark: ['#3D1A18', '#F59A92'] },
};

function Tile({ icon, label, tone, onPress, isDark, colors }) {
  const guarded = usePressGuard(onPress);
  const [bg, fg] = TONES[tone][isDark ? 'dark' : 'light'];
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={[styles.tileFace, { backgroundColor: bg }]}>
        <Icon name={icon} size={28} color={fg} />
      </View>
      <AppText variant="small" weight="700" color={colors.navy} align="center" numberOfLines={2}>
        {label}
      </AppText>
    </Pressable>
  );
}

/* ------------------------------------------------------------- Banners */

const PEEK = 36;

function Banner({ banner, width, isHindi, onPress }) {
  const guarded = usePressGuard(onPress);
  return (
    <Pressable onPress={guarded} accessibilityRole="button" accessibilityLabel={isHindi ? banner.titleHi : banner.titleEn}>
      <Photo source={banner.image} scrim style={[styles.banner, { width }]}>
        <View style={styles.bannerText}>
          <View style={[styles.pill, styles.bannerTag]}>
            <AppText variant="badge" weight="700" color="#3B2410">
              {isHindi ? banner.tagHi : banner.tagEn}
            </AppText>
          </View>
          <AppText variant="h3" weight="700" color="#FFFFFF" numberOfLines={1}>
            {isHindi ? banner.titleHi : banner.titleEn}
          </AppText>
          <AppText variant="caption" weight="600" color="rgba(255,255,255,0.9)" numberOfLines={1}>
            {isHindi ? banner.subHi : banner.subEn}
          </AppText>
        </View>
      </Photo>
    </Pressable>
  );
}

/* ---------------------------------------------------------- Rails & rows */

function OpenTempleCard({ temple, now, onPress, isHindi, colors }) {
  const status = getTempleStatus(temple, now);
  return (
    <Card onPress={onPress} padded={false} style={styles.openCard} accessibilityLabel={temple.name}>
      <Photo
        source={getTempleImage(temple)}
        representative={isTempleImageRepresentative(temple)}
        style={styles.openPhoto}
        accessibilityLabel={temple.name}
      >
        <View style={styles.openBadge}>
          <StatusBadge status={status} size="sm" />
        </View>
      </Photo>
      <View style={styles.openBody}>
        <AppText variant="body" weight="700" color={colors.navy} numberOfLines={2}>
          {isHindi ? temple.nameHindi : temple.name}
        </AppText>
        <AppText variant="small" color={colors.muted}>
          {isHindi ? temple.cityHindi : temple.city}
        </AppText>
      </View>
    </Card>
  );
}

function DhamItem({ town, onPress, isHindi, colors }) {
  const guarded = usePressGuard(onPress);
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? `${town.hi}, ${town.count} स्थल` : `${town.en}, ${town.count} places`}
      style={({ pressed }) => [styles.dham, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={[styles.dhamPhoto, { borderColor: colors.primaryLight, backgroundColor: colors.primaryLight }]}>
        {town.image ? (
          <Image source={town.image} style={styles.dhamImage} resizeMode="cover" fadeDuration={0} />
        ) : (
          <Icon name="temple" size={28} color={colors.primary} />
        )}
      </View>
      <AppText variant="caption" weight="700" color={colors.navy} align="center" numberOfLines={1}>
        {isHindi ? town.hi : town.en}
      </AppText>
      <AppText variant="badge" color={colors.muted} align="center">
        {isHindi ? `${town.count} स्थल` : `${town.count} places`}
      </AppText>
    </Pressable>
  );
}

function FestivalRow({ festival, when, onPress, isHindi, colors, first }) {
  const guarded = usePressGuard(onPress);
  const [, month, day] = festival.key.split('-').map(Number);
  const name = isHindi ? festival.nameHi : festival.nameEn;
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? `आगामी पर्व: ${festival.nameHi}, ${when}` : `Next festival: ${festival.nameEn}, ${when}`}
      style={({ pressed }) => [
        styles.festRow,
        !first && { borderTopWidth: 1, borderTopColor: colors.border },
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.dateChip, { backgroundColor: colors.primaryLight }]}>
        <AppText variant="h3" weight="700" color={colors.primary} style={styles.dateDay}>
          {day}
        </AppText>
        <AppText variant="badge" weight="600" color={colors.primary} style={styles.dateMonth}>
          {isHindi ? MONTHS_HI[month - 1] : MONTHS_EN[month - 1]}
        </AppText>
      </View>
      <View style={styles.flex}>
        <AppText variant="body" weight="700" color={colors.navy} numberOfLines={2}>
          {name}
        </AppText>
        {/* Only Hindi descriptions exist in the calendar. */}
        {isHindi && festival.descHi ? (
          <AppText variant="small" color={colors.muted} numberOfLines={2}>
            {festival.descHi}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.pill, { backgroundColor: colors.primaryLight }]}>
        <AppText variant="badge" weight="700" color={colors.primary}>
          {when}
        </AppText>
      </View>
    </Pressable>
  );
}

function HelplineTile({ number, label, onCall, colors, isHindi }) {
  return (
    <Pressable
      onPress={() => onCall(number)}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? `${label}, ${number} पर कॉल करें` : `${label}, call ${number}`}
      style={({ pressed }) => [styles.helpTile, { backgroundColor: colors.warningBg, opacity: pressed ? 0.75 : 1 }]}
    >
      <Icon name="phone" size={22} color={colors.warning} />
      <View style={styles.flex}>
        <AppText variant="h4" weight="700" color={colors.warning} style={styles.helpNumber}>
          {number}
        </AppText>
        <AppText variant="small" weight="500" color={colors.warning} numberOfLines={1}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

/* ---------------------------------------------------------------- Screen */

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef(null);
  // Where the search box sits in the page; it sticks to the top once scrolled past.
  const [searchTop, setSearchTop] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  // Bring the search box to the top when typing starts, so results show above the keyboard.
  const revealSearch = () => {
    if (searchTop != null) scrollRef.current?.scrollTo({ y: searchTop, animated: true });
  };
  // Once the search box sticks under the status bar, its strip turns the status bar's colour.
  const stuckFill = scrollY.interpolate({
    inputRange: searchTop == null ? [0, 1] : [Math.max(0, searchTop - 16), Math.max(1, searchTop)],
    outputRange: searchTop == null ? [0, 0] : [0, 1],
    extrapolate: 'clamp',
  });

  // Refreshed every minute and when the app returns, so a Home left open overnight moves on.
  const now = useNow();
  const todayKey = istDateKey(now);
  const today = useMemo(() => {
    const [y, m, d] = todayKey.split('-').map(Number);
    return calculatePanchang(new Date(y, m - 1, d));
  }, [todayKey]);
  const festivals = useMemo(() => upcomingFestivals(todayKey, UPCOMING_FESTIVALS), [todayKey]);
  const templesData = useTemples();
  const placesData = usePlaces();
  const searchIndex = useMemo(() => buildSearchIndex(templesData, placesData), [templesData, placesData]);

  // Temples open right now first, then the rest, so the row is never empty.
  const featured = useMemo(() => {
    const withStatus = templesData.map((t) => ({ t, open: getTempleStatus(t, now).isOpen }));
    return [...withStatus.filter((x) => x.open), ...withStatus.filter((x) => !x.open)]
      .slice(0, 6)
      .map((x) => x.t);
  }, [now, templesData]);
  const anyOpen = featured.length > 0 && getTempleStatus(featured[0], now).isOpen;

  const go = (route, params) => navigation.navigate(route, params);
  const openResult = usePressGuard((item) => {
    Keyboard.dismiss();
    item.open(go);
  });
  const callNumber = usePressGuard((n) => Linking.openURL(`tel:${n}`).catch(() => {}));

  const festivalWhen = (festival) => {
    const days = daysUntil(festival.key, now);
    if (festival.isToday || days <= 0) return isHindi ? 'आज' : 'Today';
    if (days === 1) return isHindi ? 'कल' : 'Tomorrow';
    return isHindi ? `${days} दिन` : `${days} days`;
  };
  const searching = searchQuery.trim().length > 0;

  const [, month, day] = todayKey.split('-').map(Number);
  const dateLine = isHindi
    ? `${today.dayNameHi}, ${day} ${MONTHS_FULL_HI[month - 1]} · ${today.hinduMonthHi} ${today.tithiHi}`
    : `${today.dayNameEn}, ${day} ${MONTHS_FULL_EN[month - 1]} · ${today.hinduMonthEn} ${today.tithiEn}`;

  const tiles = [
    { icon: 'temple', tone: 'saffron', hi: 'मंदिर', en: 'Temples', to: () => go(ROUTES.TEMPLES) },
    { icon: 'panchang', tone: 'rose', hi: 'पंचांग', en: 'Panchang', to: () => go(ROUTES.PANCHANG) },
    { icon: 'route', tone: 'teal', hi: 'यात्रा योजना', en: 'Yatra plans', to: () => go(ROUTES.YATRA) },
    { icon: 'parikrama', tone: 'lavender', hi: 'परिक्रमा', en: 'Parikrama', to: () => go(ROUTES.PARIKRAMA_DETAIL, { id: 'govardhan' }) },
    { icon: 'location', tone: 'blue', hi: 'ब्रज के स्थल', en: 'Places', to: () => go(ROUTES.BRAJ_PLACES) },
    { icon: 'food', tone: 'yellow', hi: 'ब्रज भोग', en: 'Braj food', to: () => go(ROUTES.FOOD) },
    { icon: 'music', tone: 'violet', hi: 'भक्ति', en: 'Bhakti', to: () => go(ROUTES.AUDIO_PLAYER) },
    { icon: 'safety', tone: 'red', hi: 'सहायता', en: 'Help', to: () => go(ROUTES.HELPDESK) },
  ];

  // Guide banners: what each opens is in the app; the counts come from the app's own data.
  const banners = [
    {
      key: 'parikrama',
      image: require('../../assets/images/events/braj-parikrama.jpg'),
      tagHi: 'गाइड',
      tagEn: 'Guide',
      titleHi: 'गोवर्धन परिक्रमा',
      titleEn: 'Govardhan Parikrama',
      subHi: 'रास्ता, पड़ाव, नियम और सुझाव',
      subEn: 'Route, stops, rules and tips',
      to: () => go(ROUTES.PARIKRAMA_DETAIL, { id: 'govardhan' }),
    },
    {
      key: 'places',
      image: require('../../assets/images/ghats/keshi-ghat.jpg'),
      tagHi: 'स्थल',
      tagEn: 'Places',
      titleHi: 'ब्रज के स्थल',
      titleEn: 'Places of Braj',
      subHi: `${BRAJ_TOWNS.length} धाम · ${BRAJ_PLACES.length} स्थल, फ़ोटो सहित`,
      subEn: `${BRAJ_TOWNS.length} towns · ${BRAJ_PLACES.length} places, with photos`,
      to: () => go(ROUTES.BRAJ_PLACES),
    },
    {
      key: 'yatra',
      image: require('../../assets/images/places/vrindavan.jpg'),
      tagHi: 'योजना',
      tagEn: 'Plans',
      titleHi: 'ब्रज यात्रा योजना',
      titleEn: 'Braj yatra plans',
      subHi: `${yatraData.length} तैयार एक-दिन की योजनाएँ`,
      subEn: `${yatraData.length} ready one-day plans`,
      to: () => go(ROUTES.YATRA),
    },
    {
      key: 'bhakti',
      image: require('../../assets/images/events/deepotsav-river.jpg'),
      tagHi: 'भक्ति',
      tagEn: 'Bhakti',
      titleHi: 'भक्ति ऑडियो',
      titleEn: 'Bhakti audio',
      subHi: `${bhaktiData.tracks.length} आरती व भजन · आधिकारिक YouTube से`,
      subEn: `${bhaktiData.tracks.length} aartis & bhajans · from official YouTube`,
      to: () => go(ROUTES.AUDIO_PLAYER),
    },
  ];
  const bannerWidth = Math.min(width - GUTTER * 2 - PEEK, 520);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Light status-bar icons over the dusk header, only while Home is on screen. */}
      {isFocused ? <StatusBar barStyle="light-content" /> : null}
      <View style={{ height: insets.top, backgroundColor: DUSK[0] }} />

      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        {/* 0 · Dusk header: app icon, name, language switch, saved; greeting with today's date and tithi */}
        <View style={styles.dusk}>
          <DuskBackground />
          <View style={styles.header}>
            <Image source={LOGO} style={styles.logo} resizeMode="cover" fadeDuration={0} accessibilityLabel="DivyaBraj" />
            <AppText variant="h4" weight="700" color="#FFFFFF" numberOfLines={1} style={[styles.flex, styles.brandName]}>
              {isHindi ? 'दिव्यब्रज' : 'DivyaBraj'}
            </AppText>
            <LanguageToggle />
            <IconButton
              icon="heart"
              color="#FFFFFF"
              style={styles.headerButton}
              accessibilityLabel={isHindi ? 'सहेजे गए' : 'Saved'}
              onPress={() => go(ROUTES.FAVORITES)}
            />
          </View>
          <View style={styles.greeting}>
            <AppText variant="heroHindi" weight="700" color="#FFFFFF" accessibilityRole="header">
              {isHindi ? 'राधे राधे 🙏' : 'Radhe Radhe 🙏'}
            </AppText>
            <AppText variant="caption" weight="600" color="rgba(255,255,255,0.88)" numberOfLines={2}>
              {dateLine}
            </AppText>
          </View>
        </View>

        {/* 1 · Search (sticky): temples, towns, ghats, festivals and food, results right below */}
        <View
          style={styles.searchWrap}
          onLayout={(e) => {
            const y = Math.round(e.nativeEvent.layout.y);
            if (y !== searchTop) setSearchTop(y);
          }}
        >
          {/* The dusk carries on behind the top half of the box, so it sits across the header's edge. */}
          <View pointerEvents="none" style={styles.searchBand} />
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.searchStuck, { opacity: stuckFill }]} />
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={Keyboard.dismiss}
            onFocus={revealSearch}
            style={styles.searchField}
            placeholder={isHindi ? 'मंदिर, स्थल, पर्व, भोग खोजें' : 'Search temples, places, festivals, food'}
          />
        </View>

        {/* 2 · Search results */}
        <View style={styles.resultsWrap}>
          {searching ? (
            <SearchResults
              query={searchQuery}
              index={searchIndex}
              onOpen={openResult}
              onSeeAllTemples={() => go(ROUTES.TEMPLES, { search: searchQuery.trim() })}
              isHindi={isHindi}
              colors={colors}
            />
          ) : null}
        </View>

        {/* Today in Braj: tithi, sunrise, sunset, next festival; opens the full Panchang */}
        <View style={styles.sectionTight}>
          <TodayCard
            today={today}
            nextFestival={festivals[0]}
            nextWhen={festivals[0] ? festivalWhen(festivals[0]) : ''}
            isHindi={isHindi}
            isDark={isDark}
            colors={colors}
            onPress={() => go(ROUTES.PANCHANG)}
          />
        </View>

        {/* Eight shortcuts */}
        <View style={[styles.section, styles.tiles]}>
          {tiles.map((t) => (
            <Tile key={t.icon} icon={t.icon} tone={t.tone} label={isHindi ? t.hi : t.en} onPress={t.to} isDark={isDark} colors={colors} />
          ))}
        </View>

        {/* Guide banners */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={bannerWidth + 12}
          decelerationRate="fast"
          contentContainerStyle={[styles.hScroll, styles.bannerRow]}
        >
          {banners.map((b) => (
            <Banner key={b.key} banner={b} width={bannerWidth} isHindi={isHindi} onPress={b.to} />
          ))}
        </ScrollView>

        {/* Temples: open now first */}
        <View style={styles.section}>
          <SectionHeader
            title={anyOpen ? (isHindi ? 'अभी दर्शन खुले हैं' : 'Open for darshan now') : (isHindi ? 'प्रमुख मंदिर' : 'Major temples')}
            actionLabel={isHindi ? 'सब देखें' : 'See all'}
            onAction={() => go(ROUTES.TEMPLES)}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {featured.map((temple) => (
            <OpenTempleCard
              key={temple.id}
              temple={temple}
              now={now}
              isHindi={isHindi}
              colors={colors}
              onPress={() => go(ROUTES.TEMPLE_DETAIL, { id: temple.id, temple })}
            />
          ))}
        </ScrollView>
        <AppText variant="small" color={colors.muted} style={styles.note}>
          {isHindi
            ? 'समय मंदिरों के नियमित समय पर आधारित है। त्योहारों पर बदल सकता है — कृपया स्थानीय पुष्टि करें।'
            : 'Based on regular temple timings. They change on festivals — please confirm locally.'}
        </AppText>

        {/* Dhams of Braj: each opens its places */}
        <View style={styles.section}>
          <SectionHeader
            title={isHindi ? 'ब्रज के धाम' : 'Dhams of Braj'}
            actionLabel={isHindi ? 'सब' : 'All'}
            onAction={() => go(ROUTES.BRAJ_PLACES)}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {BRAJ_TOWNS.map((town) => (
            <DhamItem key={town.id} town={town} isHindi={isHindi} colors={colors} onPress={() => go(ROUTES.BRAJ_PLACES, { town: town.id })} />
          ))}
        </ScrollView>

        {/* Upcoming festivals from the app's festival calendar */}
        {festivals.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title={isHindi ? 'आने वाले पर्व' : 'Upcoming festivals'}
              actionLabel={isHindi ? 'कैलेंडर' : 'Calendar'}
              onAction={() => go(ROUTES.EVENTS)}
            />
            <Card padded={false}>
              {festivals.map((festival, index) => (
                <FestivalRow
                  key={festival.key}
                  festival={festival}
                  when={festivalWhen(festival)}
                  first={index === 0}
                  isHindi={isHindi}
                  colors={colors}
                  onPress={() => go(ROUTES.EVENTS)}
                />
              ))}
            </Card>
          </View>
        ) : null}

        {/* Helplines: tap to call */}
        <View style={styles.section}>
          <SectionHeader
            title={isHindi ? 'ज़रूरत पड़े तो' : 'If you need help'}
            actionLabel={isHindi ? 'सभी नंबर' : 'All numbers'}
            onAction={() => go(ROUTES.HELPDESK)}
          />
          <View style={styles.helpGrid}>
            <HelplineTile number="112" label={isHindi ? 'आपातकाल' : 'Emergency'} onCall={callNumber} colors={colors} isHindi={isHindi} />
            <HelplineTile number="108" label={isHindi ? 'एंबुलेंस' : 'Ambulance'} onCall={callNumber} colors={colors} isHindi={isHindi} />
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },

  // Base colour = the gradient's last stop, so no light seam shows where the SVG edge is anti-aliased.
  dusk: { paddingBottom: 14, overflow: 'hidden', backgroundColor: DUSK[3] },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: GUTTER, paddingTop: 12 },
  logo: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF' },
  brandName: { fontSize: 20 },
  headerButton: { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.32)' },
  greeting: { paddingHorizontal: GUTTER, marginTop: 22, gap: 4 },

  // No negative margin here: a sticky child drawn above its own frame would be cut off once stuck.
  searchWrap: { paddingHorizontal: GUTTER, paddingVertical: 10 },
  searchBand: { position: 'absolute', left: 0, right: 0, top: 0, height: '50%', backgroundColor: DUSK[3] },
  searchStuck: { backgroundColor: DUSK[0] },
  searchField: {
    shadowColor: '#2B1A42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  resultsWrap: { paddingHorizontal: GUTTER },
  results: { marginTop: 4 },
  resultGroup: { paddingTop: 12, paddingHorizontal: 16 },
  resultGroupTitle: { marginBottom: 4 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 6 },
  resultIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultMore: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 48, paddingHorizontal: 16 },
  emptyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },

  section: { paddingHorizontal: GUTTER, marginTop: 24 },
  sectionTight: { paddingHorizontal: GUTTER, marginTop: 6 },
  inlineLink: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32 },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },

  today: { borderRadius: 20, borderWidth: 1, borderLeftWidth: 5, padding: 16, gap: 10 },
  todayTop: { flexDirection: 'row', gap: 12 },
  todayText: { gap: 2 },
  todayTithi: { fontSize: 26, lineHeight: 34 },
  sunCol: { gap: 8 },
  sunTile: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 14, minWidth: 112 },
  todayRule: { borderTopWidth: 1, borderStyle: 'dashed' },

  tiles: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  tile: { width: '25%', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  tileFace: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  hScroll: { paddingHorizontal: GUTTER, gap: 12 },
  bannerRow: { marginTop: 24 },
  banner: { height: 150, borderRadius: 20, overflow: 'hidden' },
  bannerText: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 2 },
  bannerTag: { alignSelf: 'flex-start', backgroundColor: '#F4C542', marginBottom: 4 },

  openCard: { width: 220 },
  openPhoto: { height: 130 },
  // Top-left: a representative photo has its own tag at the bottom-left.
  openBadge: { position: 'absolute', left: 8, top: 8 },
  openBody: { padding: 12, gap: 4 },
  note: { paddingHorizontal: GUTTER, marginTop: 10 },

  dham: { width: 84, alignItems: 'center', gap: 2 },
  dhamPhoto: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dhamImage: { width: '100%', height: '100%' },

  festRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, paddingVertical: 14, paddingHorizontal: 16 },
  dateChip: { width: 52, paddingVertical: 6, borderRadius: 12, alignItems: 'center' },
  dateDay: { fontSize: 20, lineHeight: 24 },
  dateMonth: { letterSpacing: 0 },
  helpGrid: { flexDirection: 'row', gap: 10 },
  helpTile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  helpNumber: { fontSize: 18, lineHeight: 22 },
});
