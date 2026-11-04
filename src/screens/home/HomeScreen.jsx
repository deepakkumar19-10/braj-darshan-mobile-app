/**
 * Braj Darshan - Home
 * Layout from the Nov 2026 "clean Braj" redesign (artboard Main): brand header, welcome
 * title, search, the navy "Today in Braj" panel (tithi, sunrise, sunset), quick actions,
 * temples open now, upcoming festivals and the 112 / 108 helplines.
 * Everything shown is computed from the app's own data; approximate values say so.
 */

import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Linking, Image, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Card,
  IconButton,
  LanguageToggle,
  QuickAction,
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
import eventsData from '../../data/events.json';
import foodData from '../../data/food.json';
import { GHATS } from '../../data/ghats';
import { searchTerms, searchFields } from '../../utils/searchText';

// Same logo as divyabraj.com, shown as the app icon in the header.
const LOGO = require('../../assets/images/brand/braj-logo.png');

// The "Today in Braj" panel is deliberately dark navy in both themes.
const HERO = {
  bg: '#17324D',
  tile: '#24476B',
  accent: '#F4D9A8',
  text: '#FFFFFF',
  soft: 'rgba(255,255,255,0.88)',
  faint: 'rgba(255,255,255,0.74)',
};

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

const UPCOMING_FESTIVALS = 2;

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

function SunTile({ icon, label, value }) {
  return (
    <View style={styles.sunTile}>
      <Icon name={icon} size={20} color={HERO.accent} />
      <View>
        <AppText variant="small" color={HERO.soft}>
          {label}
        </AppText>
        <AppText variant="body" weight="600" color={HERO.text}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

// Navy "Today in Braj" panel: today's tithi, nakshatra, sunrise and sunset. Tap for the full Panchang.
function TodayPanel({ today, todayKey, isHindi, onPress }) {
  const guarded = usePressGuard(onPress);
  const [, m, d] = todayKey.split('-').map(Number);
  const dateLabel = isHindi
    ? `${today.dayNameHi}, ${d} ${MONTHS_FULL_HI[m - 1]}`
    : `${today.dayNameEn}, ${d} ${MONTHS_FULL_EN[m - 1]}`;
  const tithiLine = isHindi
    ? `${today.hinduMonthHi} ${today.tithiHi}`
    : `${today.hinduMonthEn} ${today.tithiEn}`;
  const next = nextTithi(today.tithiHi);
  const until = today.tithiEndsAt
    ? isHindi
      ? `${today.tithiEndsAt} तक${next ? `, फिर ${next.shortHi}` : ''}`
      : `Until ${today.tithiEndsAt}${next ? `, then ${next.shortEn}` : ''}`
    : '';
  const nakshatra = isHindi ? `नक्षत्र ${today.nakshatraHi}` : `Nakshatra ${today.nakshatraEn}`;
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? 'आज का पंचांग' : "Today's Panchang"}
      style={({ pressed }) => [styles.today, { opacity: pressed ? 0.92 : 1 }]}
    >
      <View style={styles.rowBetween}>
        <AppText variant="caption" weight="600" color={HERO.accent}>
          {isHindi ? 'आज ब्रज में' : 'Today in Braj'}
        </AppText>
        <AppText variant="caption" color={HERO.soft}>
          {dateLabel}
        </AppText>
      </View>
      <View>
        <AppText variant="h2" weight="700" color={HERO.text} style={styles.todayTithi}>
          {tithiLine}
        </AppText>
        <AppText variant="caption" color={HERO.soft}>
          {until ? `${until} · ${nakshatra}` : nakshatra}
        </AppText>
      </View>
      <View style={styles.sunGrid}>
        <SunTile icon="sunrise" label={isHindi ? 'सूर्योदय' : 'Sunrise'} value={today.sunrise} />
        <SunTile icon="sunset" label={isHindi ? 'सूर्यास्त' : 'Sunset'} value={today.sunset} />
      </View>
      <View style={styles.rowBetween}>
        <AppText variant="small" color={HERO.faint} style={styles.flex}>
          {isHindi ? 'तिथि अनुमानित है — स्थानीय पंचांग से मिलाएँ' : 'Approximate tithi — check a local panchang'}
        </AppText>
        <View style={styles.inlineLink}>
          <AppText variant="caption" weight="600" color={HERO.accent}>
            {isHindi ? 'पूरा पंचांग' : 'Full Panchang'}
          </AppText>
          <Icon name="chevronRight" size={18} color={HERO.accent} />
        </View>
      </View>
    </Pressable>
  );
}

function OpenTempleCard({ temple, now, onPress, isHindi, colors }) {
  const status = getTempleStatus(temple, now);
  return (
    <Card onPress={onPress} padded={false} style={styles.openCard} accessibilityLabel={temple.name}>
      <Photo
        source={getTempleImage(temple)}
        representative={isTempleImageRepresentative(temple)}
        style={styles.openPhoto}
        accessibilityLabel={temple.name}
      />
      <View style={styles.openBody}>
        <StatusBadge status={status} size="sm" />
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

function FestivalRow({ festival, when, onPress, isHindi, colors, first }) {
  const guarded = usePressGuard(onPress);
  const [, month, day] = festival.key.split('-').map(Number);
  const name = isHindi ? festival.nameHi : festival.nameEn;
  // Only Hindi descriptions exist in the calendar, so English shows the countdown alone.
  const detail = isHindi && festival.descHi ? `${when} · ${festival.descHi}` : when;
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
        <AppText variant="body" weight="600" color={colors.navy} numberOfLines={2}>
          {name}
        </AppText>
        <AppText variant="small" color={colors.muted} numberOfLines={2}>
          {detail}
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

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef(null);
  const searchY = useRef(0);
  // Bring the search box to the top when typing starts, so results show above the keyboard.
  const revealSearch = () => scrollRef.current?.scrollTo({ y: Math.max(0, searchY.current - 12), animated: true });

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
    return isHindi ? `${days} दिन बाद` : `In ${days} days`;
  };
  const searching = searchQuery.trim().length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {/* Header: app icon, name, language switch, saved temples */}
        <View style={styles.header}>
          <Image
            source={LOGO}
            style={[styles.logo, { backgroundColor: colors.surface }]}
            resizeMode="cover"
            fadeDuration={0}
            accessibilityLabel="DivyaBraj — Braj Dharshan"
          />
          <View style={styles.flex}>
            <AppText variant="h4" weight="700" color={colors.navy} numberOfLines={1} style={styles.brandName}>
              {isHindi ? 'श्री ब्रज दर्शन' : 'Braj Darshan'}
            </AppText>
            <AppText variant="small" color={colors.muted} numberOfLines={2}>
              {isHindi ? 'राधे राधे · ब्रज में आपका साथी' : 'Radhe Radhe · your companion in Braj'}
            </AppText>
          </View>
          <LanguageToggle />
          <IconButton
            icon="heart"
            color={colors.primary}
            accessibilityLabel={isHindi ? 'सहेजे गए' : 'Saved'}
            onPress={() => go(ROUTES.FAVORITES)}
          />
        </View>

        {/* Welcome */}
        <View style={styles.welcome}>
          <AppText variant="heroHindi" weight="700" color={colors.navy} accessibilityRole="header">
            {isHindi ? 'ब्रज में आपका स्वागत है' : 'Welcome to Braj'}
          </AppText>
          <AppText variant="body" color={colors.muted}>
            {isHindi ? 'मंदिर, दर्शन समय और यात्रा — एक ही जगह' : 'Temples, darshan times and yatra — in one place'}
          </AppText>
        </View>

        {/* Search: temples, towns, ghats, festivals and food, results right here */}
        <View style={styles.searchWrap} onLayout={(e) => { searchY.current = e.nativeEvent.layout.y; }}>
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={Keyboard.dismiss}
            onFocus={revealSearch}
            placeholder={isHindi ? 'मंदिर, घाट, त्योहार या भोग' : 'Temple, ghat, festival or food'}
          />
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

        {/* Today in Braj: tithi, sunrise and sunset; opens the full Panchang */}
        <View style={styles.section}>
          <TodayPanel today={today} todayKey={todayKey} isHindi={isHindi} onPress={() => go(ROUTES.PANCHANG)} />
        </View>

        {/* Quick actions (Temples and Panchang are tabs, and linked from this page) */}
        <View style={[styles.section, styles.grid]}>
          <QuickAction icon="map" label={isHindi ? 'नक्शा' : 'Map'} onPress={() => go(ROUTES.MAP)} />
          <QuickAction icon="route" label={isHindi ? 'यात्रा योजना' : 'Yatra plans'} onPress={() => go(ROUTES.YATRA)} />
          <QuickAction
            icon="parikrama"
            label={isHindi ? 'परिक्रमा' : 'Parikrama'}
            onPress={() => go(ROUTES.PARIKRAMA_DETAIL, { id: 'govardhan-parikrama' })}
          />
          <QuickAction icon="ghat" label={isHindi ? 'घाट व स्थल' : 'Ghats & places'} onPress={() => go(ROUTES.PLACES)} />
          <QuickAction icon="aarti" label={isHindi ? 'उत्सव' : 'Festivals'} onPress={() => go(ROUTES.EVENTS)} />
          <QuickAction icon="food" label={isHindi ? 'ब्रज भोग' : 'Braj food'} onPress={() => go(ROUTES.FOOD)} />
          <QuickAction icon="music" label={isHindi ? 'भक्ति ऑडियो' : 'Bhakti audio'} onPress={() => go(ROUTES.AUDIO_PLAYER)} />
          <QuickAction icon="phone" tone="red" label={isHindi ? 'सहायता' : 'Help'} onPress={() => go(ROUTES.HELPDESK)} />
        </View>

        {/* Temples: open now first */}
        <View style={styles.section}>
          <SectionHeader
            title={anyOpen ? (isHindi ? 'अभी दर्शन खुले हैं' : 'Open for darshan now') : (isHindi ? 'प्रमुख मंदिर' : 'Major temples')}
            actionLabel={isHindi ? 'सभी मंदिर' : 'All temples'}
            onAction={() => go(ROUTES.TEMPLES)}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
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

        {/* Upcoming festivals from the app's festival calendar */}
        {festivals.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title={isHindi ? 'आगामी पर्व' : 'Upcoming festivals'}
              actionLabel={isHindi ? 'सभी उत्सव' : 'All festivals'}
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
            <HelplineTile
              number="112"
              label={isHindi ? 'आपातकाल' : 'Emergency'}
              onCall={callNumber}
              colors={colors}
              isHindi={isHindi}
            />
            <HelplineTile
              number="108"
              label={isHindi ? 'एंबुलेंस' : 'Ambulance'}
              onCall={callNumber}
              colors={colors}
              isHindi={isHindi}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingTop: 16,
  },
  logo: { width: 40, height: 40, borderRadius: 12 },
  brandName: { fontSize: 18 },
  welcome: { paddingHorizontal: GUTTER, marginTop: 24, gap: 4 },
  searchWrap: { paddingHorizontal: GUTTER, marginTop: 14 },
  results: { marginTop: 8 },
  resultGroup: { paddingTop: 12, paddingHorizontal: 16 },
  resultGroupTitle: { marginBottom: 4 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 6 },
  resultIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  emptyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  section: { paddingHorizontal: GUTTER, marginTop: 24 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  inlineLink: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32 },
  today: { backgroundColor: HERO.bg, borderRadius: 20, padding: 18, gap: 14 },
  todayTithi: { fontSize: 24, lineHeight: 32 },
  sunGrid: { flexDirection: 'row', gap: 10 },
  sunTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: HERO.tile,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  hScroll: { paddingHorizontal: GUTTER, gap: 12 },
  openCard: { width: 220 },
  openPhoto: { height: 130 },
  openBody: { padding: 12, gap: 6 },
  note: { paddingHorizontal: GUTTER, marginTop: 10 },
  festRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dateChip: { width: 52, paddingVertical: 6, borderRadius: 12, alignItems: 'center' },
  dateDay: { fontSize: 20, lineHeight: 24 },
  dateMonth: { letterSpacing: 0 },
  helpGrid: { flexDirection: 'row', gap: 10 },
  helpTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  helpNumber: { fontSize: 18, lineHeight: 22 },
});
