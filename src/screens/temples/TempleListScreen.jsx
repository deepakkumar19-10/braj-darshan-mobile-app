/**
 * Braj Darshan - Temples
 * Design: design-input/figma "Light · Temples". Search, List/Map switch, town
 * chips built from the data (no empty filters), an "Open now" filter, and
 * compact rows showing each temple's own status and today's hours.
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
  TopBar,
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

const TempleRow = React.memo(function TempleRow({ temple, isHindi, colors, onOpen, isFav, onToggleFav, now }) {
  const status = getTempleStatus(temple, now);
  const hours = todayHours(temple);
  const favGuard = usePressGuard(onToggleFav, 300);
  return (
    <Card onPress={onOpen} style={styles.row} accessibilityLabel={temple.name}>
      <View style={styles.rowInner}>
        <Photo
          source={getTempleImage(temple)}
          style={styles.thumb}
          accessibilityLabel={temple.name}
        />
        <View style={styles.flex}>
          <AppText variant="body" weight="700" color={colors.navy} numberOfLines={2}>
            {isHindi ? temple.nameHindi : temple.name}
          </AppText>
          <AppText variant="small" color={colors.muted} numberOfLines={1}>
            {isHindi ? `${temple.name} · ${temple.cityHindi}` : `${temple.nameHindi} · ${temple.city}`}
          </AppText>
          <View style={styles.badgeWrap}>
            <StatusBadge status={status} size="sm" />
          </View>
          {hours ? (
            <AppText variant="small" color={colors.textSecondary}>
              {isHindi ? `आज: ${hours}` : `Today: ${hours}`}
            </AppText>
          ) : null}
        </View>
        <Pressable
          onPress={favGuard}
          hitSlop={8}
          style={styles.favBtn}
          accessibilityRole="button"
          accessibilityLabel={isFav ? (isHindi ? 'सहेजे से हटाएँ' : 'Remove from saved') : isHindi ? 'सहेजें' : 'Save'}
          accessibilityState={{ selected: isFav }}
        >
          <Icon name="heart" filled={isFav} size={24} color={isFav ? colors.warning : colors.muted} />
        </Pressable>
      </View>
      {isTempleImageRepresentative(temple) ? (
        <AppText variant="badge" color={colors.muted} style={styles.repNote}>
          {isHindi ? 'प्रतीकात्मक चित्र' : 'Representative photo'}
        </AppText>
      ) : null}
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

  const header = (
    <View>
      <TopBar
        title={isHindi ? 'मंदिर' : 'Temples'}
        subtitle={
          isHindi
            ? `${templesData.length} मंदिर · त्योहारों पर समय बदल सकता है`
            : `${templesData.length} temples · timings may change on festivals`
        }
        right={<LanguageToggle />}
      />

      <SearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={isHindi ? 'मंदिर, देवता या शहर खोजें' : 'Search temple, deity or town'}
        style={styles.search}
      />

      <View style={styles.segment}>
        <Chip label={isHindi ? 'सूची' : 'List'} icon="list" selected onPress={() => {}} />
        <Chip label={isHindi ? 'नक्शा' : 'Map'} icon="map" selected={false} onPress={() => navigation.navigate(ROUTES.MAP)} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={isHindi ? 'सभी' : 'All'} selected={town === 'All'} onPress={() => setTown('All')} />
        {towns.map((t) => (
          <Chip key={t.id} label={isHindi ? t.hi : t.en} selected={town === t.id} onPress={() => setTown(t.id)} />
        ))}
      </ScrollView>

      <View style={styles.segment}>
        <Chip
          label={isHindi ? 'अभी खुले' : 'Open now'}
          icon="open"
          selected={openOnly}
          onPress={() => setOpenOnly((v) => !v)}
        />
        <AppText variant="small" color={colors.muted} style={styles.count}>
          {isHindi ? `${temples.length} परिणाम` : `${temples.length} results`}
        </AppText>
      </View>
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
                    setTown('All');
                    setOpenOnly(false);
                  }}
                />
              </View>
            ) : null}
          </View>
        }
        ListFooterComponent={
          <View style={styles.rowWrap}>
            <InfoNote>
              {isHindi
                ? 'समय मंदिरों के नियमित समय पर आधारित है, लाइव नहीं। त्योहारों पर बदल सकता है — जाने से पहले स्थानीय पुष्टि करें।'
                : 'Based on regular temple timings, not live. They change on festivals — confirm locally before you go.'}
            </InfoNote>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  search: { marginHorizontal: GUTTER },
  emptyActions: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: GUTTER,
    marginTop: 12,
  },
  chips: { paddingHorizontal: GUTTER, gap: 8, marginTop: 12 },
  count: { marginLeft: 'auto' },
  rowWrap: { paddingHorizontal: GUTTER, marginTop: 12 },
  row: { padding: 12 },
  rowInner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  thumb: { width: 88, height: 88, borderRadius: 14 },
  badgeWrap: { marginVertical: 6 },
  favBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: -8, marginRight: -8 },
  repNote: { marginTop: 6 },
});
