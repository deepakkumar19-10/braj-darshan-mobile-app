/**
 * Braj Darshan - Home
 * Layout from the redesign (design-input/figma "Light · Home"): greeting, search,
 * quick actions, today in Braj (Panchang + next festival), temples open now, helplines.
 * Everything shown is computed from the app's own data; approximate values say so.
 */

import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Linking, Image, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Card,
  LanguageToggle,
  QuickAction,
  SectionHeader,
  StatusBadge,
  Photo,
  RepresentativeTag,
  SearchField,
  normalizeSearch,
  matchesSearch,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { getNextFestival, daysUntil, istDateKey } from '../../utils/festivals';
import { useNow } from '../../hooks/useNow';
import { getFestivalImage, getFestivalIcon } from '../../utils/festivalImages';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';
import { calculatePanchang } from '../../services/panchangService';
import { getTempleStatus } from '../../utils/templeHours';
import { getTempleImage, isTempleImageRepresentative } from '../../utils/imageAssets';
import { usePlaces, useTemples } from '../../services/contentService';
import eventsData from '../../data/events.json';
import foodData from '../../data/food.json';
import { GHATS } from '../../data/ghats';
import { searchTerms, searchFields } from '../../utils/searchText';

// Same logo and hero photo as divyabraj.com (hero: Unsplash photo used on the website).
const LOGO = require('../../assets/images/brand/braj-logo.png');
const HERO = require('../../assets/images/brand/home-hero.jpg');

const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];
const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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

// Soft diagonal colour wash behind a card's content (top-left to bottom-right), in both themes.
// LinearGradient clones each child, so the stops are built without null entries.
function Wash({ id, from, via, to }) {
  const stops = via
    ? [[0, from], [0.6, via], [1, to]]
    : [[0, from], [1, to]];
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {stops.map(([offset, color]) => (
            <Stop key={offset} offset={String(offset)} stopColor={color} stopOpacity="1" />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

function OpenTempleCard({ temple, onPress, isHindi, colors }) {
  const status = getTempleStatus(temple);
  return (
    <Card onPress={onPress} padded={false} style={styles.openCard} accessibilityLabel={temple.name}>
      <Photo
        source={getTempleImage(temple)}
        representative={isTempleImageRepresentative(temple)}
        style={styles.openPhoto}
        accessibilityLabel={temple.name}
      />
      <View style={styles.openBody}>
        <AppText variant="body" weight="700" color={colors.navy} numberOfLines={2}>
          {isHindi ? temple.nameHindi : temple.name}
        </AppText>
        <AppText variant="small" color={colors.muted}>
          {isHindi ? temple.cityHindi : temple.city}
        </AppText>
        <StatusBadge status={status} size="sm" />
      </View>
    </Card>
  );
}

function HelplineRow({ number, label, icon, onCall, colors, isHindi, last }) {
  return (
    <Pressable
      onPress={() => onCall(number)}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? `${label}, ${number} पर कॉल करें` : `${label}, call ${number}`}
      style={({ pressed }) => [
        styles.helpRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Icon name={icon} size={20} color={colors.muted} />
      <AppText variant="body" color={colors.text} style={styles.flex}>
        {label}
      </AppText>
      <AppText variant="body" weight="700" color={colors.navy}>
        {number}
      </AppText>
      <Icon name="phone" size={20} color={colors.primary} />
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
  const festival = useMemo(() => {
    const [y, m, d] = todayKey.split('-').map(Number);
    return getNextFestival(new Date(Date.UTC(y, m - 1, d, 6, 30))); // noon IST of today
  }, [todayKey]);
  const festivalDays = festival ? daysUntil(festival.key, now) : null;
  const festivalImage = useMemo(() => getFestivalImage(festival), [festival]);
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

  const [, month, day] = festival ? festival.key.split('-').map(Number) : [];
  const festivalWhen = festival
    ? festival.isToday || festivalDays === 0
      ? isHindi ? 'आज' : 'Today'
      : festivalDays === 1
        ? isHindi ? 'कल' : 'Tomorrow'
        : isHindi ? `${festivalDays} दिन बाकी` : `In ${festivalDays} days`
    : '';
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
        {/* Brand header: the divyabraj.com emblem in a circle, greeting, actions */}
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.surface, borderColor: colors.borderGold }]}>
            <Image source={LOGO} style={styles.logo} resizeMode="cover" fadeDuration={0} accessibilityLabel="DivyaBraj — Braj Dharshan" />
          </View>
          <View style={styles.flex}>
            <AppText variant="small" weight="700" color={colors.primary}>
              राधे राधे
            </AppText>
            <AppText variant="h3" weight="700" color={colors.navy} numberOfLines={2}>
              {isHindi ? 'श्री ब्रज दर्शन' : 'Braj Darshan'}
            </AppText>
          </View>
          {/* Only the language switch here, so the name has room; Saved lives in More. */}
          <LanguageToggle />
        </View>

        {/* Welcome banner */}
        <View style={styles.heroWrap}>
          <Photo source={HERO} scrim style={styles.hero} accessibilityLabel={isHindi ? 'ब्रज में श्रद्धालु' : 'Pilgrims in Braj'}>
            <View style={styles.heroText}>
              <AppText variant="small" weight="700" color="#FDE7B3">
                {isHindi ? 'ब्रज में आपका स्वागत है' : 'Welcome to Braj'}
              </AppText>
              <AppText variant="h2" weight="700" color="#FFFFFF">
                {isHindi ? 'मंदिर, दर्शन समय और यात्रा — एक ही जगह' : 'Temples, darshan times and yatra — in one place'}
              </AppText>
              <Pressable
                onPress={() => go(ROUTES.TEMPLES)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.heroBtn, { opacity: pressed ? 0.85 : 1 }]}
              >
                <Icon name="temple" size={18} color="#8A4A05" />
                <AppText variant="caption" weight="700" color="#8A4A05">
                  {isHindi ? 'मंदिर देखें' : 'Explore temples'}
                </AppText>
              </Pressable>
            </View>
          </Photo>
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

        {/* Quick actions */}
        <View style={styles.section}>
          <SectionHeader title={isHindi ? 'आपकी ब्रज यात्रा' : 'Your Braj, at your pace'} />
          <View style={styles.grid}>
            <QuickAction icon="temple" label={isHindi ? 'मंदिर' : 'Temples'} onPress={() => go(ROUTES.TEMPLES)} />
            <QuickAction icon="map" tone="teal" label={isHindi ? 'नक्शा' : 'Map'} onPress={() => go(ROUTES.MAP)} />
            <QuickAction icon="route" label={isHindi ? 'यात्रा योजना' : 'Yatra plans'} onPress={() => go(ROUTES.YATRA)} />
            <QuickAction
              icon="parikrama"
              tone="teal"
              label={isHindi ? 'परिक्रमा' : 'Parikrama'}
              onPress={() => go(ROUTES.PARIKRAMA_DETAIL, { id: 'govardhan-parikrama' })}
            />
            <QuickAction icon="panchang" label={isHindi ? 'पंचांग' : 'Panchang'} onPress={() => go(ROUTES.PANCHANG)} />
            <QuickAction icon="ghat" tone="teal" label={isHindi ? 'घाट व स्थल' : 'Ghats & places'} onPress={() => go(ROUTES.PLACES)} />
            <QuickAction icon="food" label={isHindi ? 'ब्रज भोग' : 'Braj food'} onPress={() => go(ROUTES.FOOD)} />
            <QuickAction icon="phone" tone="teal" label={isHindi ? 'सहायता' : 'Help'} onPress={() => go(ROUTES.HELPDESK)} />
          </View>
        </View>

        {/* Today in Braj: Panchang and the next festival */}
        <View style={styles.section}>
          <SectionHeader title={isHindi ? 'आज ब्रज में' : 'Today in Braj'} />
          <Card
            onPress={() => go(ROUTES.PANCHANG)}
            padded={false}
            accessibilityLabel={isHindi ? 'आज का पंचांग' : "Today's Panchang"}
          >
            <Wash id="home-panchang-wash" from={colors.primaryLight} via={colors.surface} to={colors.purnimaLight} />
            <View style={styles.panchangBody}>
              <View style={styles.rowBetween}>
                <AppText variant="small" weight="700" color={colors.primary}>
                  {isHindi ? 'आज का पंचांग' : "Today's Panchang"}
                </AppText>
                <View style={styles.inlineLink}>
                  <AppText variant="caption" weight="700" color={colors.primary}>
                    {isHindi ? 'पूरा पंचांग' : 'Full Panchang'}
                  </AppText>
                  <Icon name="chevronRight" size={18} color={colors.primary} />
                </View>
              </View>
              <View style={styles.tithiRow}>
                <View style={[styles.tithiIcon, { backgroundColor: colors.surface, borderColor: colors.borderGold }]}>
                  <Icon name="tithi" size={26} color={colors.purnima} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="h3" weight="700" color={colors.navy}>
                    {isHindi ? today.tithiHi : today.tithiEn}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {isHindi ? 'तिथि अनुमानित है — स्थानीय पंचांग से मिलाएँ' : 'Approximate tithi — check a local panchang'}
                  </AppText>
                </View>
              </View>
              <View style={[styles.sunRow, { borderTopColor: colors.border }]}>
                <View style={styles.sunItem}>
                  <Icon name="sunrise" size={20} color={colors.primary} />
                  <View>
                    <AppText variant="small" color={colors.muted}>{isHindi ? 'सूर्योदय' : 'Sunrise'}</AppText>
                    <AppText variant="body" weight="700" color={colors.navy}>{today.sunrise}</AppText>
                  </View>
                </View>
                <View style={styles.sunItem}>
                  <Icon name="sunset" size={20} color={colors.primary} />
                  <View>
                    <AppText variant="small" color={colors.muted}>{isHindi ? 'सूर्यास्त' : 'Sunset'}</AppText>
                    <AppText variant="body" weight="700" color={colors.navy}>{today.sunset}</AppText>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* Next festival: that festival's own photo when the app has one, else a plain card */}
          {festival && festivalImage ? (
            <Card
              onPress={() => go(ROUTES.EVENTS)}
              padded={false}
              style={styles.festCardGap}
              accessibilityLabel={isHindi ? `आगामी पर्व: ${festival.nameHi}` : `Next festival: ${festival.nameEn}`}
            >
              <Photo source={festivalImage} scrim style={styles.festPhoto}>
                <View style={[styles.dateBlock, styles.festDateOnPhoto]}>
                  <AppText variant="h2" weight="700" color="#A85A06">
                    {day}
                  </AppText>
                  <AppText variant="small" weight="700" color="#786A5D">
                    {isHindi ? MONTHS_HI[month - 1] : MONTHS_EN[month - 1]}
                  </AppText>
                </View>
                <RepresentativeTag style={styles.festRepTag} />
                <View style={styles.festText}>
                  <AppText variant="small" weight="700" color="#FDE7B3">
                    {isHindi ? 'आगामी पर्व' : 'Next festival'}
                  </AppText>
                  <AppText variant="h3" weight="700" color="#FFFFFF" numberOfLines={2}>
                    {isHindi ? festival.nameHi : festival.nameEn}
                  </AppText>
                  <AppText variant="caption" weight="600" color="#FFFFFF">
                    {festivalWhen}
                  </AppText>
                </View>
              </Photo>
            </Card>
          ) : festival ? (
            <Card
              onPress={() => go(ROUTES.EVENTS)}
              padded={false}
              style={[styles.festCardGap, { borderColor: colors.primaryFixed }]}
              accessibilityLabel={isHindi ? `आगामी पर्व: ${festival.nameHi}` : `Next festival: ${festival.nameEn}`}
            >
              <Wash id="home-festival-wash" from={colors.primaryLight} to={colors.primaryFixed} />
              <View style={styles.festMark} pointerEvents="none">
                <Icon name={getFestivalIcon(festival)} size={132} color={colors.primary} style={styles.festMarkIcon} />
              </View>
              <View style={[styles.festRow, styles.festPlainBody]}>
                <View style={[styles.dateBlock, { backgroundColor: colors.surface }]}>
                  <AppText variant="h2" weight="700" color={colors.primary}>
                    {day}
                  </AppText>
                  <AppText variant="small" weight="700" color={colors.muted}>
                    {isHindi ? MONTHS_HI[month - 1] : MONTHS_EN[month - 1]}
                  </AppText>
                </View>
                <View style={styles.flex}>
                  <AppText variant="small" weight="700" color={colors.primary}>
                    {isHindi ? 'आगामी पर्व' : 'Next festival'}
                  </AppText>
                  <AppText variant="h4" weight="700" color={colors.navy}>
                    {isHindi ? festival.nameHi : festival.nameEn}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {festivalWhen}
                  </AppText>
                </View>
                <Icon name="chevronRight" size={20} color={colors.muted} />
              </View>
            </Card>
          ) : null}
        </View>

        {/* Temples */}
        <View style={styles.sectionTight}>
          <SectionHeader
            title={anyOpen ? (isHindi ? 'अभी दर्शन खुले हैं' : 'Open for darshan now') : (isHindi ? 'प्रमुख मंदिर' : 'Major temples')}
            actionLabel={isHindi ? `सभी ${templesData.length}` : `See all ${templesData.length}`}
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

        {/* Helplines: plain list, tap to call */}
        <View style={styles.section}>
          <Card>
            <View style={styles.rowBetween}>
              <AppText variant="h4" weight="700" color={colors.navy}>
                {isHindi ? 'हेल्पलाइन नंबर' : 'Helpline numbers'}
              </AppText>
              <Pressable onPress={() => go(ROUTES.HELPDESK)} hitSlop={12} accessibilityRole="button" style={styles.inlineLink}>
                <AppText variant="caption" weight="700" color={colors.primary}>
                  {isHindi ? 'सभी नंबर' : 'All numbers'}
                </AppText>
                <Icon name="chevronRight" size={18} color={colors.primary} />
              </Pressable>
            </View>
            <HelplineRow
              number="112"
              label={isHindi ? 'आपातकाल' : 'Emergency'}
              icon="emergency"
              onCall={callNumber}
              colors={colors}
              isHindi={isHindi}
            />
            <HelplineRow
              number="108"
              label={isHindi ? 'एंबुलेंस' : 'Ambulance'}
              icon="ambulance"
              onCall={callNumber}
              colors={colors}
              isHindi={isHindi}
              last
            />
          </Card>
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
    paddingTop: 12,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 60, height: 60 },
  heroWrap: { paddingHorizontal: GUTTER, marginTop: 16 },
  hero: { height: 196, borderRadius: 24 },
  heroText: { position: 'absolute', left: 18, right: 18, bottom: 16, gap: 6 },
  heroBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#FFF9ED',
    marginTop: 4,
  },
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
  sectionTight: { paddingHorizontal: GUTTER, marginTop: 24 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  inlineLink: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32 },
  panchangBody: { padding: 16 },
  tithiRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  tithiIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunRow: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexWrap: 'wrap',
  },
  sunItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  festCardGap: { marginTop: 12 },
  festPhoto: { height: 188 },
  festDateOnPhoto: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FFF9ED' },
  festRepTag: { position: 'absolute', top: 12, right: 12 },
  festText: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 2 },
  festRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  festPlainBody: { padding: 16 },
  festMark: { position: 'absolute', right: -16, bottom: -28 },
  festMarkIcon: { opacity: 0.1 },
  dateBlock: { width: 64, height: 68, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  hScroll: { paddingHorizontal: GUTTER, gap: 12 },
  openCard: { width: 236 },
  openPhoto: { height: 140 },
  openBody: { padding: 14, gap: 6 },
  note: { paddingHorizontal: GUTTER, marginTop: 10 },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
  },
});
