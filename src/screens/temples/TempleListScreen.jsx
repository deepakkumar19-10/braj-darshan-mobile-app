/**
 * Braj Darshan - Temples
 * Look: the Nov 2026 "clean Braj" redesign (artboard Temples): title with a List / Map
 * switch, search, pill filters ("All", "Open now" and town chips built from the data, so
 * no filter is ever empty), a count line, and row cards showing each temple's photo,
 * town and deity, its own open/closed status, today's hours and a save button.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Card,
  Chip,
  InfoNote,
  LanguageToggle,
  Photo,
  SearchField,
  StatusBadge,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';
import { useTemples } from '../../services/contentService';
import {
  getTempleStatus,
  getTodaysWindows,
  getIndianStandardTime,
  formatMinutes,
} from '../../utils/templeHours';
import { getTempleImage, isTempleImageRepresentative } from '../../utils/imageAssets';
import { searchTerms, searchFields } from '../../utils/searchText';
import { useNow } from '../../hooks/useNow';

function todayHours(temple) {
  const windows = getTodaysWindows(temple, getIndianStandardTime(new Date()));
  if (!windows) return null;
  return windows.map(([s, e]) => `${formatMinutes(s)}–${formatMinutes(e)}`).join(' · ');
}

// Same season rule the timings use (utils/templeHours: April–October = summer timings).
function isSummerTimings(now) {
  const month = getIndianStandardTime(now).getMonth();
  return month >= 3 && month <= 9;
}

function townsOf(templesData) {
  const seen = new Map();
  templesData.forEach((t) => {
    if (!seen.has(t.city)) seen.set(t.city, { id: t.city, en: t.city, hi: t.cityHindi || t.city });
  });
  return [...seen.values()];
}

// Every typed word must appear in the temple's names, deity or town; Hindi spelling variants are folded.
function matches(temple, terms) {
  if (!terms.length) return true;
  const hay = searchFields(temple.name, temple.nameHindi, temple.deity, temple.deityHindi, temple.city, temple.cityHindi).join(' ');
  return terms.every((t) => hay.includes(t));
}

// List / Map switch: a pill track with the current view raised in white.
function ViewSwitch({ isHindi, colors, onMap }) {
  const guardedMap = usePressGuard(onMap);
  const seg = (selected) => [
    styles.seg,
    selected && { backgroundColor: colors.surface, borderColor: colors.border },
  ];
  return (
    <View style={[styles.segTrack, { backgroundColor: colors.infoBg }]}>
      <View
        style={seg(true)}
        accessible
        accessibilityRole="button"
        accessibilityState={{ selected: true }}
        accessibilityLabel={isHindi ? 'सूची' : 'List'}
      >
        <AppText variant="caption" weight="600" color={colors.navy} maxFontSizeMultiplier={1.2}>
          {isHindi ? 'सूची' : 'List'}
        </AppText>
      </View>
      <Pressable
        onPress={guardedMap}
        hitSlop={{ top: 4, bottom: 4 }}
        accessibilityRole="button"
        accessibilityState={{ selected: false }}
        accessibilityLabel={isHindi ? 'नक्शा' : 'Map'}
        style={({ pressed }) => [seg(false), { opacity: pressed ? 0.7 : 1 }]}
      >
        <AppText variant="caption" weight="600" color={colors.muted} maxFontSizeMultiplier={1.2}>
          {isHindi ? 'नक्शा' : 'Map'}
        </AppText>
      </Pressable>
    </View>
  );
}

const TempleRow = React.memo(function TempleRow({ temple, isHindi, colors, onOpen, isFav, onToggleFav, now }) {
  const status = getTempleStatus(temple, now);
  const hours = todayHours(temple);
  const favGuard = usePressGuard(onToggleFav, 300);
  const place = isHindi
    ? [temple.cityHindi, temple.deityHindi].filter(Boolean).join(' · ')
    : [temple.city, temple.deity].filter(Boolean).join(' · ');
  return (
    <Card onPress={onOpen} style={styles.row} accessibilityLabel={temple.name}>
      <View style={styles.rowInner}>
        <Photo
          source={getTempleImage(temple)}
          style={styles.thumb}
          accessibilityLabel={temple.name}
        />
        <View style={styles.rowText}>
          <AppText variant="h4" weight="700" color={colors.navy} numberOfLines={2}>
            {isHindi ? temple.nameHindi : temple.name}
          </AppText>
          <AppText variant="small" color={colors.muted} numberOfLines={2}>
            {place}
          </AppText>
          <View style={styles.badgeWrap}>
            <StatusBadge status={status} size="sm" />
          </View>
          {hours ? (
            <AppText variant="small" color={colors.textSecondary}>
              {isHindi ? `आज: ${hours}` : `Today: ${hours}`}
            </AppText>
          ) : null}
          {isTempleImageRepresentative(temple) ? (
            <AppText variant="small" color={colors.muted}>
              {isHindi ? 'प्रतीकात्मक चित्र' : 'Representative photo'}
            </AppText>
          ) : null}
        </View>
        <Pressable
          onPress={favGuard}
          hitSlop={4}
          style={({ pressed }) => [styles.favBtn, { opacity: pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={isFav ? (isHindi ? 'सहेजे से हटाएँ' : 'Remove from saved') : isHindi ? 'सहेजें' : 'Save'}
          accessibilityState={{ selected: isFav }}
        >
          <Icon name="heart" filled={isFav} size={22} color={colors.primary} />
        </Pressable>
      </View>
    </Card>
  );
});

export default function TempleListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchQuery, setSearchQuery] = useState(route?.params?.search || '');
  const [town, setTown] = useState('All');
  const [openOnly, setOpenOnly] = useState(false);
  const now = useNow(); // open/closed badges move on while the list stays open
  const templesData = useTemples();
  const towns = useMemo(() => townsOf(templesData), [templesData]);

  // A new search from Home reaches an already-open Temples screen too.
  useEffect(() => {
    if (route?.params?.search !== undefined) setSearchQuery(route.params.search);
  }, [route?.params?.search]);

  const temples = useMemo(() => {
    const q = searchTerms(searchQuery.trim().toLowerCase());
    return templesData.filter(
      (t) =>
        (town === 'All' || t.city === town) &&
        matches(t, q) &&
        (!openOnly || getTempleStatus(t, now).isOpen)
    );
  }, [templesData, searchQuery, town, openOnly, now]);

  const openTemple = useCallback(
    (temple) => navigation.navigate(ROUTES.TEMPLE_DETAIL, { id: temple.id, temple }),
    [navigation]
  );

  const clearFilters = () => {
    setTown('All');
    setOpenOnly(false);
  };

  const summer = isSummerTimings(now);
  const countLine = isHindi
    ? `${temples.length} मंदिर · आज ${summer ? 'ग्रीष्म' : 'शीत'} ऋतु का समय`
    : `${temples.length} temples · ${summer ? 'summer' : 'winter'} timings today`;

  const header = (
    <View>
      {/* Title row: name and language switch, then the subtitle with the List / Map switch */}
      <View style={styles.titleRow}>
        <AppText
          variant="h1"
          weight="700"
          color={colors.navy}
          accessibilityRole="header"
          numberOfLines={1}
          style={styles.flex}
        >
          {isHindi ? 'मंदिर' : 'Temples'}
        </AppText>
        <LanguageToggle />
      </View>
      <View style={styles.subRow}>
        <AppText variant="caption" color={colors.muted} style={styles.flex}>
          {isHindi ? 'ब्रज के प्रमुख मंदिर और दर्शन समय' : 'Major temples of Braj and their darshan times'}
        </AppText>
        <ViewSwitch isHindi={isHindi} colors={colors} onMap={() => navigation.navigate(ROUTES.MAP)} />
      </View>

      <SearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={isHindi ? 'मंदिर, देवता या शहर खोजें' : 'Search temple, deity or town'}
        style={styles.search}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={isHindi ? 'सभी' : 'All'} selected={town === 'All' && !openOnly} onPress={clearFilters} />
        <Chip
          label={isHindi ? 'अभी खुले' : 'Open now'}
          icon="open"
          selected={openOnly}
          onPress={() => setOpenOnly((v) => !v)}
        />
        {towns.map((t) => (
          <Chip key={t.id} label={isHindi ? t.hi : t.en} selected={town === t.id} onPress={() => setTown(t.id)} />
        ))}
      </ScrollView>

      <AppText variant="small" color={colors.muted} style={styles.count}>
        {countLine}
      </AppText>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        data={temples}
        keyExtractor={(t) => String(t.id)}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: bottomInset }}
        renderItem={({ item }) => (
          <View style={styles.rowWrap}>
            <TempleRow
              temple={item}
              isHindi={isHindi}
              colors={colors}
              onOpen={() => openTemple(item)}
              isFav={isFavorite(item.id)}
              onToggleFav={() => toggleFavorite(item)}
              now={now}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.rowWrap}>
            <InfoNote icon="search">
              {isHindi
                ? 'कोई मंदिर नहीं मिला। दूसरा नाम या शहर आज़माएँ।'
                : 'No temple found. Try another name or town.'}
            </InfoNote>
            {searchQuery || town !== 'All' || openOnly ? (
              <View style={styles.emptyActions}>
                <Chip
                  label={isHindi ? 'सभी फ़िल्टर हटाएँ' : 'Clear search and filters'}
                  icon="close"
                  onPress={() => {
                    setSearchQuery('');
                    clearFilters();
                  }}
                />
              </View>
            ) : null}
          </View>
        }
        ListFooterComponent={
          <AppText variant="small" color={colors.muted} style={styles.note}>
            {isHindi
              ? 'समय मंदिरों के नियमित समय पर आधारित है, लाइव नहीं। त्योहारों पर बदल सकता है — जाने से पहले स्थानीय पुष्टि करें।'
              : 'Based on regular temple timings, not live. They change on festivals — confirm locally before you go.'}
          </AppText>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingTop: 16,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GUTTER,
    marginTop: 4,
  },
  segTrack: { flexDirection: 'row', padding: 4, borderRadius: 999 },
  seg: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: { marginHorizontal: GUTTER, marginTop: 16 },
  chips: { paddingHorizontal: GUTTER, gap: 8, marginTop: 14 },
  count: { paddingHorizontal: GUTTER, marginTop: 14 },
  emptyActions: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowWrap: { paddingHorizontal: GUTTER, marginTop: 12 },
  row: { padding: 10 },
  rowInner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowText: { flex: 1, gap: 4 },
  thumb: { width: 96, height: 96, borderRadius: 12 },
  badgeWrap: { marginVertical: 2 },
  favBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: -2, marginRight: -2 },
  note: { paddingHorizontal: GUTTER, marginTop: 16 },
});
