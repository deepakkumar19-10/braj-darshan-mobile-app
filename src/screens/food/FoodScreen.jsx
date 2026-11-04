/**
 * Braj Darshan - Braj food
 * Layout from the Nov 2026 redesign (Food artboard): search, town pills, one
 * featured dish as a large photo card (type · town, description, where to find
 * it, a hand-off to Google Maps), the other dishes in a two-column grid, and the
 * ingredients note. Tapping a dish in the grid makes it the featured one.
 * Dishes and their bundled photos come from src/data/food.json.
 *
 * Home can open this screen with a { search } param; the search box is
 * pre-filled with it and a single match is featured straight away.
 *
 * Honesty rules: no ratings or reviews, no prices (the prices in food.json have
 * no source), no shop names or endorsements, and no "satvik" tag (the data does
 * not say so).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Linking, Pressable } from 'react-native';
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
  SearchField,
  normalizeSearch,
  matchesSearch,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { getFoodImage } from '../../utils/imageAssets';
import { searchTerms, searchFields } from '../../utils/searchText';
import foodData from '../../data/food.json';

const TOWN_FILTERS = [
  { id: 'all', hi: 'सभी', en: 'All' },
  { id: 'Mathura', hi: 'मथुरा', en: 'Mathura' },
  { id: 'Vrindavan', hi: 'वृंदावन', en: 'Vrindavan' },
  { id: 'Govardhan', hi: 'गोवर्धन', en: 'Govardhan' },
  { id: 'Gokul', hi: 'गोकुल', en: 'Gokul' },
  { id: 'Barsana', hi: 'बरसाना', en: 'Barsana' },
];

const PLACE_HI = {
  Mathura: 'मथुरा',
  Vrindavan: 'वृंदावन',
  Govardhan: 'गोवर्धन',
  Gokul: 'गोकुल',
  Barsana: 'बरसाना',
};

// food.json "Braj Region" = found across Braj, so it shows under every town.
const ACROSS_BRAJ = 'Braj Region';

const CATEGORY = {
  Sweets: { hi: 'मिठाई', en: 'Sweet' },
  Breakfast: { hi: 'नाश्ता', en: 'Breakfast' },
  Dessert: { hi: 'मिष्ठान', en: 'Dessert' },
  Beverage: { hi: 'पेय', en: 'Drink' },
  'Street Food': { hi: 'चाट', en: 'Street food' },
};

function placeLabel(place, isHindi) {
  if (place === ACROSS_BRAJ) return isHindi ? 'पूरे ब्रज में' : 'Across Braj';
  if (!isHindi) return place;
  return String(place)
    .split(' & ')
    .map((p) => PLACE_HI[p] || p)
    .join(' व ');
}

function categoryLabel(food, isHindi) {
  const c = CATEGORY[food.categoryEn];
  if (!c) return isHindi ? food.category : food.categoryEn;
  return isHindi ? c.hi : c.en;
}

function inTown(food, town) {
  if (town === 'all') return true;
  return food.place === ACROSS_BRAJ || String(food.place).includes(town);
}

// What a search looks at: names, descriptions, town and type in both languages.
// Shop names and prices are deliberately left out (see honesty rules above).
const SEARCH_FIELDS = new Map(
  foodData.map((f) => [
    f.id,
    searchFields(
      f.name,
      f.nameHindi,
      f.desc,
      f.descEn,
      f.place,
      placeLabel(f.place, true),
      placeLabel(f.place, false),
      f.category,
      f.categoryEn,
      categoryLabel(f, true),
      categoryLabel(f, false)
    ),
  ])
);

function matchesTerms(food, terms) {
  const fields = SEARCH_FIELDS.get(food.id) || [];
  return terms.every((t) => matchesSearch(t, ...fields));
}

// When a search (e.g. from Home) finds exactly one dish, feature it.
function singleMatchId(query) {
  const terms = searchTerms(normalizeSearch(query));
  if (!terms.length) return null;
  const hits = foodData.filter((f) => matchesTerms(f, terms));
  return hits.length === 1 ? hits[0].id : null;
}

function openOnMap(food) {
  const area = food.place === ACROSS_BRAJ ? 'Mathura Vrindavan' : String(food.place).replace(' & ', ' ');
  const query = encodeURIComponent(`${food.name} ${area}`);
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
}

// Two cards per row; an odd last card keeps its half width.
function pairs(list) {
  const rows = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
  return rows;
}

function FeaturedFood({ food, isHindi, colors }) {
  const openMap = usePressGuard(() => openOnMap(food));
  const title = isHindi ? food.nameHindi : food.name;
  const altTitle = isHindi ? food.name : food.nameHindi;
  const desc = isHindi ? food.desc : food.descEn;
  const where = placeLabel(food.place, isHindi);
  const acrossBraj = food.place === ACROSS_BRAJ;
  const image = getFoodImage(food);

  return (
    <Card padded={false} style={styles.featured}>
      <Photo
        source={image}
        fallbackIcon="food"
        representative={Boolean(image && food.imageIsRepresentative)}
        style={styles.featuredPhoto}
        accessibilityLabel={title}
      />
      <View style={styles.featuredBody}>
        <AppText variant="small" weight="600" color={colors.primary}>
          {`${categoryLabel(food, isHindi)} · ${where}`}
        </AppText>
        <View>
          <AppText variant="h2" weight="700" color={colors.navy} accessibilityRole="header">
            {title}
          </AppText>
          {altTitle && altTitle !== title ? (
            <AppText variant="caption" color={colors.muted}>
              {altTitle}
            </AppText>
          ) : null}
        </View>
        <AppText variant="body" color={colors.text}>
          {desc}
        </AppText>

        <AppText variant="caption" color={colors.textSecondary}>
          {isHindi
            ? `${acrossBraj ? 'ब्रज के' : `${where} के`} बाज़ारों और मंदिरों के आस-पास की पारंपरिक दुकानों में देखें। खरीदने से पहले ताज़गी, सामग्री और रखने के तरीके के बारे में स्थानीय लोगों से पूछ लें।`
            : `Look for traditional shops in the market streets and around temple areas ${acrossBraj ? 'across Braj' : `in ${where}`}. Ask locally about fresh batches, ingredients and storage before buying.`}
        </AppText>

        <Pressable
          onPress={openMap}
          accessibilityRole="link"
          accessibilityLabel={
            isHindi ? `${food.nameHindi} कहाँ मिलेगा — Google Maps में खोजें` : `Where to find ${food.name} — search Google Maps`
          }
          style={({ pressed }) => [
            styles.mapLink,
            { backgroundColor: pressed ? colors.primaryFixed : colors.primaryLight },
          ]}
        >
          <Icon name="map" size={20} color={colors.primary} />
          <AppText variant="bodyBold" color={colors.primary} style={styles.flexShrink}>
            {isHindi ? 'कहाँ मिलेगा — Google Maps में खोजें' : 'Where to find it — search Google Maps'}
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}

function FoodTile({ food, onSelect, isHindi, colors }) {
  const title = isHindi ? food.nameHindi : food.name;
  const town = placeLabel(food.place, isHindi);
  const kind = categoryLabel(food, isHindi);
  const image = getFoodImage(food);
  return (
    <Card
      padded={false}
      onPress={onSelect}
      accessibilityLabel={isHindi ? `${title}, ${kind}, ${town}। विवरण देखें` : `${title}, ${kind}, ${town}. Show details`}
      style={styles.tile}
    >
      <Photo
        source={image}
        fallbackIcon="food"
        representative={Boolean(image && food.imageIsRepresentative)}
        style={styles.tilePhoto}
      />
      <View style={styles.tileBody}>
        <AppText variant="small" weight="600" color={colors.primary} maxFontSizeMultiplier={1.3}>
          {kind}
        </AppText>
        <AppText variant="body" weight="700" color={colors.navy} maxFontSizeMultiplier={1.3}>
          {title}
        </AppText>
        <AppText variant="small" color={colors.muted} maxFontSizeMultiplier={1.3}>
          {town}
        </AppText>
      </View>
    </Card>
  );
}

export default function FoodScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const scrollRef = useRef(null);
  const contentY = useRef(0);
  const featuredY = useRef(0);

  const paramSearch = typeof route?.params?.search === 'string' ? route.params.search : undefined;

  const [query, setQuery] = useState(paramSearch || '');
  const [town, setTown] = useState('all');
  const [selectedId, setSelectedId] = useState(() => (paramSearch ? singleMatchId(paramSearch) : null));

  // A new search from Home reaches an already-open Food screen too. The town
  // filter goes back to "All" so the dish is not hidden behind another town.
  useEffect(() => {
    if (paramSearch === undefined) return;
    setQuery(paramSearch);
    setTown('all');
    setSelectedId(singleMatchId(paramSearch));
  }, [paramSearch]);

  // Only offer towns that actually have a dish in the data.
  const towns = useMemo(
    () =>
      TOWN_FILTERS.filter(
        (t) => t.id === 'all' || foodData.some((f) => String(f.place).includes(t.id))
      ),
    []
  );

  const terms = useMemo(() => searchTerms(normalizeSearch(query)), [query]);
  const isSearching = terms.length > 0;
  const { foods, allTownsCount } = useMemo(() => {
    const hits = foodData.filter((f) => matchesTerms(f, terms));
    return { foods: hits.filter((f) => inTown(f, town)), allTownsCount: hits.length };
  }, [terms, town]);

  // The featured dish: the one picked, if it is still in the list; otherwise the first.
  const featured = foods.find((f) => f.id === selectedId) || foods[0] || null;
  const others = featured ? foods.filter((f) => f.id !== featured.id) : [];

  const selectFood = (id) => {
    setSelectedId(id);
    // Bring the featured card (where the picked dish now shows) into view.
    scrollRef.current?.scrollTo({ y: Math.max(0, contentY.current + featuredY.current - 12), animated: true });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={isHindi ? 'ब्रज का स्वाद' : 'Flavours of Braj'}
          subtitle={isHindi ? 'सरल, स्थानीय परंपराएँ' : 'Simple, local traditions'}
          onBack={() => navigation.goBack()}
          right={<LanguageToggle />}
        />

        <View
          style={styles.content}
          onLayout={(e) => {
            contentY.current = e.nativeEvent.layout.y;
          }}
        >
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={isHindi ? 'व्यंजन या नगर खोजें' : 'Search a dish or town'}
          />

          <View style={styles.chips}>
            {towns.map((t) => (
              <Chip
                key={t.id}
                label={isHindi ? t.hi : t.en}
                selected={town === t.id}
                onPress={() => {
                  setTown(t.id);
                  setSelectedId(null);
                }}
              />
            ))}
          </View>

          {isSearching && foods.length > 0 ? (
            <AppText variant="small" color={colors.muted} accessibilityLiveRegion="polite">
              {isHindi ? `${foods.length} परिणाम` : `${foods.length} ${foods.length === 1 ? 'result' : 'results'}`}
            </AppText>
          ) : null}

          {featured ? (
            <View
              onLayout={(e) => {
                featuredY.current = e.nativeEvent.layout.y;
              }}
            >
              <FeaturedFood key={featured.id} food={featured} isHindi={isHindi} colors={colors} />
            </View>
          ) : null}

          {others.length ? (
            <View style={styles.grid}>
              {pairs(others).map((row) => (
                <View key={row[0].id} style={styles.gridRow}>
                  {row.map((food) => (
                    <FoodTile
                      key={food.id}
                      food={food}
                      onSelect={() => selectFood(food.id)}
                      isHindi={isHindi}
                      colors={colors}
                    />
                  ))}
                  {row.length === 1 ? <View style={styles.tileSpacer} /> : null}
                </View>
              ))}
            </View>
          ) : null}

          {foods.length === 0 && isSearching ? (
            <Card>
              <View style={styles.emptyHead}>
                <Icon name="search" size={22} color={colors.muted} />
                <AppText variant="h4" weight="700" color={colors.navy} style={styles.flex}>
                  {isHindi ? 'कुछ नहीं मिला' : 'No matches'}
                </AppText>
              </View>
              <AppText variant="body" color={colors.text} style={styles.emptyText}>
                {isHindi
                  ? `“${query.trim()}” से मेल खाता कोई व्यंजन नहीं मिला। दूसरा नाम या नगर लिखकर देखें।`
                  : `No dish matches “${query.trim()}”. Try another name or town.`}
              </AppText>
              <View style={styles.emptyActions}>
                <Button
                  variant="secondary"
                  icon="close"
                  title={isHindi ? 'खोज साफ़ करें' : 'Clear search'}
                  onPress={() => setQuery('')}
                />
                {town !== 'all' && allTownsCount > 0 ? (
                  <Button
                    variant="text"
                    title={isHindi ? `सभी नगरों में देखें (${allTownsCount})` : `Show all towns (${allTownsCount})`}
                    onPress={() => setTown('all')}
                  />
                ) : null}
              </View>
            </Card>
          ) : null}

          {foods.length === 0 && !isSearching ? (
            <InfoNote>
              {isHindi ? 'इस नगर के लिए अभी कोई व्यंजन नहीं जोड़ा गया है।' : 'No dishes added for this town yet.'}
            </InfoNote>
          ) : null}

          <InfoNote>
            {isHindi
              ? 'सामग्री, मेवे और बनाने का तरीका पूछ लें। दूध की मिठाइयाँ सात्विक आहार में आ सकती हैं, पर हर रसोई का तरीका अलग होता है। किसी एक दुकान की सूची या सिफ़ारिश नहीं दी गई है।'
              : 'Ask about ingredients, nuts and preparation. Milk sweets may suit a satvik diet; recipes and kitchen practices vary. No individual shop is listed or endorsed.'}
          </InfoNote>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featured: { borderRadius: 22 },
  featuredPhoto: { height: 180 },
  featuredBody: { padding: 16, gap: 8 },
  mapLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
    borderRadius: 14,
  },
  grid: { gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1 },
  tileSpacer: { flex: 1 },
  tilePhoto: { height: 112 },
  tileBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, gap: 2 },
  emptyHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emptyText: { marginTop: 8 },
  emptyActions: { marginTop: 14, gap: 4, alignItems: 'flex-start' },
});
