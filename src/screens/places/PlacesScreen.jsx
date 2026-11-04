/**
 * Braj Darshan - Places & ghats
 * Sacred towns and places from src/data/places.json and the main Yamuna ghats
 * and Govardhan kunds from src/data/ghats.js (shaped alike in utils/placeItems).
 *
 * Layout from the Nov 2026 redesign (Places artboard): search, pill filters, the
 * Yamuna safety note, then a two-column grid of photo cards (kind, name, town).
 * An item without a photo gets an icon tile in the same frame, never a borrowed
 * picture. Tapping a card opens its PlaceDetail screen (description, directions).
 *
 * Search matches Hindi and English names, towns and descriptions and works
 * together with the All / Sacred places / Ghats chips. Home can open this
 * screen with { search, filter } params.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  TopBar,
  LanguageToggle,
  Chip,
  Card,
  Photo,
  Button,
  InfoNote,
  ListRow,
  SearchField,
  normalizeSearch,
  matchesSearch,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { ROUTES } from '../../navigation/routes';
import { searchTerms } from '../../utils/searchText';
import { getPlaceItems, GHAT_ITEMS } from '../../utils/placeItems';
import { usePlaces } from '../../services/contentService';

const FILTERS = [
  { id: 'all', hi: 'सभी', en: 'All' },
  { id: 'places', hi: 'पावन स्थल', en: 'Sacred places' },
  { id: 'ghats', hi: 'घाट व कुंड', en: 'Ghats & kunds' },
];

function isFilter(value) {
  return FILTERS.some((f) => f.id === value);
}

function matchesTerms(item, terms) {
  return terms.every((t) => matchesSearch(t, ...item.searchFields));
}

// Two cards per row; an odd last card keeps its half width.
function pairs(list) {
  const rows = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
  return rows;
}

function PlaceTile({ item, onOpen, isHindi, colors }) {
  const title = isHindi ? item.nameHi : item.nameEn;
  const town = isHindi ? item.townHi : item.townEn;
  const isGhat = item.kind === 'ghat';
  const kind = isGhat ? (isHindi ? 'घाट व कुंड' : 'Ghat & kund') : isHindi ? 'पावन स्थल' : 'Sacred place';

  return (
    <Card
      padded={false}
      onPress={onOpen}
      accessibilityLabel={isHindi ? `${title}, ${town}। विवरण देखें` : `${title}, ${town}. Open details`}
      style={styles.tile}
    >
      <Photo
        source={item.image}
        fallbackIcon={item.icon}
        representative={item.representative}
        style={styles.tilePhoto}
      />
      <View style={styles.tileBody}>
        <AppText variant="small" weight="600" color={isGhat ? colors.purnima : colors.primary} maxFontSizeMultiplier={1.3}>
          {kind}
        </AppText>
        <AppText variant="body" weight="700" color={colors.navy} maxFontSizeMultiplier={1.3}>
          {title}
        </AppText>
        {/* A town's own card has no separate town, so its short description takes that line. */}
        {town && town !== title ? (
          <AppText variant="small" color={colors.muted} maxFontSizeMultiplier={1.3}>
            {town}
          </AppText>
        ) : (
          <AppText variant="small" color={colors.muted} numberOfLines={2} maxFontSizeMultiplier={1.3}>
            {isHindi ? item.descHi : item.descEn}
          </AppText>
        )}
      </View>
    </Card>
  );
}

export default function PlacesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  const paramSearch = typeof route?.params?.search === 'string' ? route.params.search : undefined;
  const paramFilter = isFilter(route?.params?.filter) ? route.params.filter : undefined;

  const [query, setQuery] = useState(paramSearch || '');
  const [filter, setFilter] = useState(paramFilter || 'all');

  // A new search from Home reaches an already-open Places screen too.
  useEffect(() => {
    if (paramSearch === undefined && paramFilter === undefined) return;
    const nextFilter = paramFilter || 'all';
    setFilter(nextFilter);
    if (paramSearch !== undefined) setQuery(paramSearch);
  }, [paramSearch, paramFilter]);

  const placeData = usePlaces(); // re-render when newer place data arrives
  const terms = useMemo(() => searchTerms(normalizeSearch(query)), [query]);
  const isSearching = terms.length > 0;

  const { places, ghats, allCount } = useMemo(() => {
    const placeHits = getPlaceItems(placeData).filter((item) => matchesTerms(item, terms));
    const ghatHits = GHAT_ITEMS.filter((item) => matchesTerms(item, terms));
    return {
      places: filter === 'ghats' ? [] : placeHits,
      ghats: filter === 'places' ? [] : ghatHits,
      allCount: placeHits.length + ghatHits.length,
    };
  }, [terms, filter, placeData]);

  // Ghats first, right under the Yamuna note that is about them; then the sacred places.
  const shown = useMemo(() => [...ghats, ...places], [ghats, places]);
  const shownCount = shown.length;
  const openItem = (item) => navigation.navigate(ROUTES.PLACE_DETAIL, { key: item.key });
  const clearSearch = () => setQuery('');

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={isHindi ? 'घाट व पावन स्थल' : 'Places & ghats'}
          subtitle={isHindi ? 'ब्रज के नगर, घाट और कुंड' : 'Towns, ghats and kunds of Braj'}
          onBack={() => navigation.goBack()}
          right={<LanguageToggle />}
        />

        <View style={styles.content}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={isHindi ? 'स्थल, घाट या नगर खोजें' : 'Search places, ghats or towns'}
          />

          <View style={styles.chips}>
            {FILTERS.map((f) => (
              <Chip
                key={f.id}
                label={isHindi ? f.hi : f.en}
                selected={filter === f.id}
                onPress={() => setFilter(f.id)}
              />
            ))}
          </View>

          {ghats.length ? (
            <InfoNote tone="water" icon="ghat">
              {isHindi
                ? 'यमुना की धारा और गहराई बदलती रहती है। वहीं स्नान करें जहाँ स्थानीय लोग स्नान करते हैं, सीढ़ियों के पास रहें और बच्चों को साथ रखें। जल में साबुन या प्लास्टिक न डालें।'
                : 'The Yamuna’s current and depth can change. Bathe only where local people bathe, stay near the steps and keep children close. Keep soap and plastic out of the water.'}
            </InfoNote>
          ) : null}

          {isSearching && shownCount > 0 ? (
            <AppText variant="small" color={colors.muted} accessibilityLiveRegion="polite">
              {isHindi ? `${shownCount} परिणाम` : `${shownCount} ${shownCount === 1 ? 'result' : 'results'}`}
            </AppText>
          ) : null}

          {shownCount ? (
            <View style={styles.grid}>
              {pairs(shown).map((row) => (
                <View key={row[0].key} style={styles.gridRow}>
                  {row.map((item) => (
                    <PlaceTile
                      key={item.key}
                      item={item}
                      onOpen={() => openItem(item)}
                      isHindi={isHindi}
                      colors={colors}
                    />
                  ))}
                  {row.length === 1 ? <View style={styles.tileSpacer} /> : null}
                </View>
              ))}
            </View>
          ) : null}

          {shownCount === 0 ? (
            <Card>
              <View style={styles.emptyHead}>
                <Icon name="search" size={22} color={colors.muted} />
                <AppText variant="h4" weight="700" color={colors.navy} style={styles.flex}>
                  {isHindi ? 'कुछ नहीं मिला' : 'No matches'}
                </AppText>
              </View>
              <AppText variant="body" color={colors.text} style={styles.emptyText}>
                {isHindi
                  ? `“${query.trim()}” से मेल खाता कोई स्थल या घाट नहीं मिला। दूसरा नाम या नगर लिखकर देखें।`
                  : `No place or ghat matches “${query.trim()}”. Try another name or town.`}
              </AppText>
              <View style={styles.emptyActions}>
                <Button
                  variant="secondary"
                  icon="close"
                  title={isHindi ? 'खोज साफ़ करें' : 'Clear search'}
                  onPress={clearSearch}
                />
                {filter !== 'all' && allCount > 0 ? (
                  <Button
                    variant="text"
                    title={isHindi ? `सभी में देखें (${allCount})` : `Show all matches (${allCount})`}
                    onPress={() => setFilter('all')}
                  />
                ) : null}
              </View>
            </Card>
          ) : null}

          <Card style={styles.mapCard}>
            <ListRow
              icon="location"
              title={isHindi ? 'ब्रज के नक्शे पर मंदिर देखें' : 'See temples on the Braj map'}
              subtitle={isHindi ? 'ऑफ़लाइन चित्रात्मक नक्शा' : 'Offline illustrative map'}
              onPress={() => navigation.navigate(ROUTES.MAP)}
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
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1 },
  tileSpacer: { flex: 1 },
  tilePhoto: { height: 120 },
  tileBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, gap: 2 },
  mapCard: { paddingVertical: 4 },
  emptyHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emptyText: { marginTop: 8 },
  emptyActions: { marginTop: 14, gap: 4, alignItems: 'flex-start' },
});
