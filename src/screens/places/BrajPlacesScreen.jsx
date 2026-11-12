/**
 * Braj Darshan - Places of Braj (Nov 2026 redesign, "Blinkit" style category page)
 * Left: the towns of Braj with a photo and their number of places. Right: the chosen town's
 * places as a two-column photo grid, with kind chips (temple, kund, ghat…) and today's darshan
 * status where the data has timings. Search looks across every town.
 * Data: data/brajPlaces.json, the same 188 places as divyabraj.com/places. Route params:
 * { town } to open a town directly (Home's "Dhams of Braj" row).
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, FlatList, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import { TopBar, IconButton, Photo, SearchField, normalizeSearch, matchesSearch } from '../../components/ui';
import { useNow } from '../../hooks/useNow';
import { ROUTES } from '../../navigation/routes';
import { searchTerms } from '../../utils/searchText';
import { BRAJ_PLACES, BRAJ_TOWNS, placesInTown, kindsIn, kindLabel, placeImage, placeOpenStatus } from '../../utils/brajPlaces';

const RAIL = 88;

function TownRailItem({ town, active, onPress, isHindi, colors }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${isHindi ? town.hi : town.en}, ${town.count}`}
      style={[styles.railItem, active ? { borderLeftColor: colors.primary, backgroundColor: colors.surface } : styles.railIdle]}
    >
      <View style={[styles.railPhoto, { borderColor: active ? colors.primary : colors.border, backgroundColor: colors.primaryLight }]}>
        {town.image ? (
          <Image source={town.image} style={styles.railImage} resizeMode="cover" fadeDuration={0} />
        ) : (
          <Icon name="temple" size={24} color={colors.primaryContainer} />
        )}
      </View>
      <AppText variant="small" weight="700" color={active ? colors.primary : colors.navy} align="center" numberOfLines={1}>
        {isHindi ? town.hi : town.en}
      </AppText>
      <AppText variant="badge" color={colors.muted} align="center">
        {town.count}
      </AppText>
    </Pressable>
  );
}

function PlaceCard({ place, now, onPress, isHindi, colors }) {
  const status = placeOpenStatus(place, now);
  const name = isHindi ? place.nameHi : place.nameEn;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
    >
      <Photo
        source={placeImage(place)}
        representative={place.photo?.representative}
        style={styles.cardPhoto}
        fallbackIcon={place.category === 'ghat' ? 'ghat' : place.category === 'kund-sarovar' ? 'water' : 'temple'}
      />
      <View style={styles.cardBody}>
        <AppText variant="caption" weight="700" color={colors.navy} numberOfLines={2} style={styles.cardName}>
          {name}
        </AppText>
        <View style={styles.cardMeta}>
          <View style={[styles.kind, { backgroundColor: colors.primaryLight }]}>
            <AppText variant="badge" weight="600" color={colors.primary}>
              {kindLabel(place.category, isHindi)}
            </AppText>
          </View>
          {status ? (
            <AppText variant="badge" weight="700" color={status.isOpen ? colors.success : colors.muted} numberOfLines={1} style={styles.flex}>
              {status.isOpen ? (isHindi ? '● खुला' : '● Open') : isHindi ? 'बंद' : 'Closed'}
            </AppText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function BrajPlacesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const now = useNow();
  const startTown = BRAJ_TOWNS.find((t) => t.id === route?.params?.town)?.id || BRAJ_TOWNS[0]?.id;
  const [town, setTown] = useState(startTown);
  const [kind, setKind] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const terms = searchTerms(normalizeSearch(query));
  const searching = terms.length > 0;
  const townPlaces = useMemo(() => placesInTown(town), [town]);
  const kinds = useMemo(() => kindsIn(townPlaces), [townPlaces]);
  const list = useMemo(() => {
    if (searching) {
      return BRAJ_PLACES.filter((p) => terms.every((t) => matchesSearch(t, p.nameHi, p.nameEn, p.summaryHi, p.summaryEn)));
    }
    return kind === 'all' ? townPlaces : townPlaces.filter((p) => p.category === kind);
  }, [searching, terms, kind, townPlaces]);

  const current = BRAJ_TOWNS.find((t) => t.id === town);
  const chooseTown = (id) => {
    setTown(id);
    setKind('all');
  };
  const open = (p) =>
    p.templeId ? navigation.navigate(ROUTES.TEMPLE_DETAIL, { id: p.templeId }) : navigation.navigate(ROUTES.BRAJ_PLACE, { id: p.id });

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <TopBar
        title={isHindi ? 'ब्रज के स्थल' : 'Places of Braj'}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        right={
          <IconButton
            icon={searchOpen ? 'close' : 'search'}
            color={colors.primary}
            accessibilityLabel={isHindi ? 'स्थल खोजें' : 'Search places'}
            onPress={() => {
              if (searchOpen) setQuery('');
              setSearchOpen(!searchOpen);
            }}
          />
        }
      />
      {searchOpen ? (
        <View style={styles.searchWrap}>
          <SearchField value={query} onChangeText={setQuery} autoFocus placeholder={isHindi ? 'सब धामों में खोजें' : 'Search every town'} />
        </View>
      ) : null}

      <View style={[styles.body, { borderTopColor: colors.border }]}>
        <ScrollView style={[styles.rail, { backgroundColor: colors.surfaceAlt }]} showsVerticalScrollIndicator={false} accessibilityRole="tablist">
          {BRAJ_TOWNS.map((t) => (
            <TownRailItem key={t.id} town={t} active={!searching && t.id === town} onPress={() => chooseTown(t.id)} isHindi={isHindi} colors={colors} />
          ))}
        </ScrollView>

        <FlatList
          style={styles.flex}
          // An odd count gets an empty cell, so the last card keeps the width of the others.
          data={list.length % 2 ? [...list, { id: '__pad', pad: true }] : list}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 24 }]}
          ListHeaderComponent={
            <View style={styles.listHead}>
              <AppText variant="h3" weight="700" color={colors.navy}>
                {searching
                  ? isHindi
                    ? `${list.length} स्थल मिले`
                    : `${list.length} places found`
                  : `${isHindi ? current?.hi : current?.en} · ${current?.count}`}
              </AppText>
              {!searching ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                  {['all', ...kinds].map((k) => {
                    const on = k === kind;
                    return (
                      <Pressable
                        key={k}
                        onPress={() => setKind(k)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        style={[styles.chip, { backgroundColor: on ? colors.navy : colors.surface, borderColor: on ? colors.navy : colors.border }]}
                      >
                        <AppText variant="small" weight="700" color={on ? '#FFFFFF' : colors.navy}>
                          {k === 'all' ? (isHindi ? 'सभी' : 'All') : kindLabel(k, isHindi)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <AppText variant="body" color={colors.muted} style={styles.empty}>
              {isHindi ? 'कोई स्थल नहीं मिला। दूसरा नाम आज़माएँ।' : 'No place found. Try another name.'}
            </AppText>
          }
          renderItem={({ item }) =>
            item.pad ? <View style={styles.flex} /> : <PlaceCard place={item} now={now} isHindi={isHindi} colors={colors} onPress={() => open(item)} />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  body: { flex: 1, flexDirection: 'row', borderTopWidth: 1 },
  rail: { width: RAIL, flexGrow: 0 },
  railItem: { alignItems: 'center', gap: 2, paddingVertical: 10, paddingHorizontal: 4, borderLeftWidth: 4 },
  railIdle: { borderLeftColor: 'transparent', backgroundColor: 'transparent' },
  railPhoto: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  railImage: { width: '100%', height: '100%' },
  grid: { paddingHorizontal: 10, paddingTop: 4 },
  gridRow: { gap: 10 },
  listHead: { paddingTop: 8, paddingBottom: 8, gap: 8 },
  chips: { gap: 6, paddingRight: 6 },
  chip: { minHeight: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  card: { flex: 1, borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 10 },
  cardPhoto: { height: 96 },
  cardBody: { padding: 8, gap: 6 },
  cardName: { minHeight: 36 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kind: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  empty: { padding: 16 },
});
