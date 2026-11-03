/**
 * Braj Darshan - Places & ghats
 * Sacred towns and places from src/data/places.json and the main Yamuna ghats
 * and Govardhan kunds from src/data/ghats.js (shaped alike in utils/placeItems).
 *
 * Cards: each place or ghat shows its own photo with the name over a bottom
 * gradient; an item without a photo gets an icon tile in the same layout,
 * never a borrowed picture. Tapping a card opens its PlaceDetail screen.
 *
 * Search matches Hindi and English names, towns and descriptions and works
 * together with the All / Sacred places / Ghats chips. Home can open this
 * screen with { search, filter } params.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
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
  SectionHeader,
  ListRow,
  SearchField,
  normalizeSearch,
  matchesSearch,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';
import { searchTerms } from '../../utils/searchText';
import { PLACE_ITEMS, GHAT_ITEMS, openPlaceDirections } from '../../utils/placeItems';

const FILTERS = [
  { id: 'all', icon: 'location', hi: 'सभी', en: 'All' },
  { id: 'places', icon: 'temple', hi: 'पावन स्थल', en: 'Sacred places' },
  { id: 'ghats', icon: 'ghat', hi: 'घाट व कुंड', en: 'Ghats & kunds' },
];

function isFilter(value) {
  return FILTERS.some((f) => f.id === value);
}

function matchesTerms(item, terms) {
  return terms.every((t) => matchesSearch(t, ...item.searchFields));
}

function PlaceCard({ item, onOpen, isHindi, colors }) {
  const open = usePressGuard(onOpen);
  const title = isHindi ? item.nameHi : item.nameEn;
  const altTitle = isHindi ? item.nameEn : item.nameHi;
  const town = isHindi ? item.townHi : item.townEn;
  const desc = isHindi ? item.descHi : item.descEn;
  const subLine = town && town !== title ? `${town} · ${altTitle}` : altTitle;
  const hasPhoto = Boolean(item.image);
  // White on the photo's gradient; theme colours on the icon tile (no gradient there).
  const titleColor = hasPhoto ? '#FFFFFF' : colors.navy;
  const subColor = hasPhoto ? '#F5EBDD' : colors.textSecondary;

  return (
    <Card padded={false}>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={isHindi ? `${title}, ${town}। विवरण देखें` : `${title}, ${town}. Open details`}
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      >
        <Photo
          source={item.image}
          fallbackIcon={item.icon}
          scrim={hasPhoto}
          representative={item.representative}
          style={styles.cover}
        >
          <View style={[styles.coverText, item.representative && styles.coverTextAboveTag]}>
            <AppText
              variant="h3"
              weight="700"
              color={titleColor}
              numberOfLines={hasPhoto ? 2 : 1}
              maxFontSizeMultiplier={1.2}
            >
              {title}
            </AppText>
            <View style={styles.coverMeta}>
              <Icon name="location" size={16} color={subColor} />
              <AppText
                variant="caption"
                weight="500"
                color={subColor}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                style={styles.flex}
              >
                {subLine}
              </AppText>
            </View>
          </View>
        </Photo>
        <View style={styles.summary}>
          <AppText variant="body" color={colors.text} numberOfLines={2}>
            {desc}
          </AppText>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Button
          variant="secondary"
          icon="directions"
          title={isHindi ? 'रास्ता देखें' : 'Directions'}
          onPress={() => openPlaceDirections(item)}
          accessibilityLabel={isHindi ? `${title} का रास्ता देखें` : `Directions to ${title}`}
          style={styles.flex}
        />
        <Button
          variant="text"
          icon="chevronRight"
          title={isHindi ? 'विवरण' : 'Details'}
          onPress={onOpen}
          accessibilityLabel={isHindi ? `${title} का विवरण देखें` : `Show details for ${title}`}
        />
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

  const terms = useMemo(() => searchTerms(normalizeSearch(query)), [query]);
  const isSearching = terms.length > 0;

  const { places, ghats, allCount } = useMemo(() => {
    const placeHits = PLACE_ITEMS.filter((item) => matchesTerms(item, terms));
    const ghatHits = GHAT_ITEMS.filter((item) => matchesTerms(item, terms));
    return {
      places: filter === 'ghats' ? [] : placeHits,
      ghats: filter === 'places' ? [] : ghatHits,
      allCount: placeHits.length + ghatHits.length,
    };
  }, [terms, filter]);

  const shownCount = places.length + ghats.length;
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

        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={isHindi ? 'स्थल, घाट या नगर खोजें' : 'Search places, ghats or towns'}
          style={styles.search}
        />

        <ScrollView
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              label={isHindi ? f.hi : f.en}
              icon={f.icon}
              selected={filter === f.id}
              onPress={() => setFilter(f.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.content}>
          {isSearching && shownCount > 0 ? (
            <AppText variant="small" color={colors.muted}>
              {isHindi ? `${shownCount} परिणाम` : `${shownCount} ${shownCount === 1 ? 'result' : 'results'}`}
            </AppText>
          ) : null}

          {places.length ? (
            <View style={styles.section}>
              <SectionHeader
                title={isHindi ? `पावन स्थल (${places.length})` : `Sacred places (${places.length})`}
                style={styles.sectionHeader}
              />
              {places.map((item) => (
                <PlaceCard
                  key={item.key}
                  item={item}
                  onOpen={() => openItem(item)}
                  isHindi={isHindi}
                  colors={colors}
                />
              ))}
            </View>
          ) : null}

          {ghats.length ? (
            <View style={styles.section}>
              <SectionHeader
                title={isHindi ? `यमुना घाट व कुंड (${ghats.length})` : `Yamuna ghats & kunds (${ghats.length})`}
                style={styles.sectionHeader}
              />
              <InfoNote icon="safety">
                {isHindi
                  ? 'यमुना की धारा और गहराई बदलती रहती है। वहीं स्नान करें जहाँ स्थानीय लोग स्नान करते हैं, सीढ़ियों के पास रहें और बच्चों को साथ रखें। जल में साबुन या प्लास्टिक न डालें।'
                  : 'The Yamuna’s current and depth can change. Bathe only where local people bathe, stay near the steps and keep children close. Keep soap and plastic out of the water.'}
              </InfoNote>
              {ghats.map((item) => (
                <PlaceCard
                  key={item.key}
                  item={item}
                  onOpen={() => openItem(item)}
                  isHindi={isHindi}
                  colors={colors}
                />
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

          <Card>
            <ListRow
              icon="map"
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
  search: { marginHorizontal: GUTTER, marginBottom: 12 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: GUTTER, paddingBottom: 4 },
  content: { paddingHorizontal: GUTTER, paddingTop: 16, gap: 24 },
  section: { gap: 16 },
  sectionHeader: { marginBottom: 0 },
  cover: { height: 184 },
  coverText: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 2 },
  // Leaves room for the "Representative photo" tag Photo draws at the bottom left.
  coverTextAboveTag: { bottom: 44 },
  coverMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summary: { paddingHorizontal: 16, paddingTop: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingTop: 12 },
  emptyHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emptyText: { marginTop: 8 },
  emptyActions: { marginTop: 14, gap: 4, alignItems: 'flex-start' },
});
