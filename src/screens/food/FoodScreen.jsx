/**
 * Braj Darshan - Braj food
 * Layout from the redesign (design-input/figma "Light · Braj food" and
 * "Light · Food detail"): search, town filter, an ingredients note, and one
 * photo card per dish from src/data/food.json (its own bundled photo, name over
 * a bottom gradient). Tapping a card or "Explore this food" opens the dish's
 * details inside its card, with a hand-off to Google Maps.
 *
 * Home can open this screen with a { search } param; the search box is
 * pre-filled with it and a single match opens straight away.
 *
 * Honesty rules: no ratings or reviews, no prices (the prices in food.json have
 * no source), no shop names or endorsements, and no "satvik" tag (the data does
 * not say so).
 */

import React, { useEffect, useMemo, useState } from 'react';
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

// When a search (e.g. from Home) finds exactly one dish, open its details.
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

function FoodDetails({ food, isHindi, colors }) {
  const where = placeLabel(food.place, isHindi);
  const acrossBraj = food.place === ACROSS_BRAJ;
  return (
    <View style={styles.details}>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <AppText variant="h4" weight="700" color={colors.navy}>
        {isHindi ? 'कहाँ मिलेगा' : 'Where to find it'}
      </AppText>
      <AppText variant="body" color={colors.text}>
        {isHindi
          ? `${acrossBraj ? 'ब्रज के' : `${where} के`} बाज़ारों और मंदिरों के आस-पास की पारंपरिक दुकानों में देखें। खरीदने से पहले ताज़गी, सामग्री और रखने के तरीके के बारे में स्थानीय लोगों से पूछ लें।`
          : `Look for traditional shops in the market streets and around temple areas ${acrossBraj ? 'across Braj' : `in ${where}`}. Ask locally about fresh batches, ingredients and storage before buying.`}
      </AppText>
      <AppText variant="small" color={colors.muted}>
        {isHindi
          ? 'किसी एक दुकान की सूची या सिफ़ारिश नहीं दी गई है।'
          : 'No individual shop is listed or endorsed.'}
      </AppText>

      <InfoNote>
        {isHindi
          ? 'सामग्री, मेवे और बनाने के तरीके के बारे में पूछ लें। हर रसोई की विधि अलग होती है।'
          : 'Ask about ingredients, nuts and how it is prepared. Recipes vary from kitchen to kitchen.'}
      </InfoNote>

      <Button
        title={isHindi ? 'Google Maps में खोजें' : 'Find on Google Maps'}
        icon="map"
        onPress={() => openOnMap(food)}
        accessibilityLabel={
          isHindi
            ? `${food.nameHindi} को Google Maps में खोजें`
            : `Find ${food.name} on Google Maps`
        }
      />
    </View>
  );
}

function FoodItem({ food, expanded, onToggle, isHindi, colors }) {
  const toggle = usePressGuard(onToggle, 300);
  const title = isHindi ? food.nameHindi : food.name;
  const altTitle = isHindi ? food.name : food.nameHindi;
  const desc = isHindi ? food.desc : food.descEn;
  const meta = `${placeLabel(food.place, isHindi)} · ${categoryLabel(food, isHindi)}`;
  const image = getFoodImage(food);
  // White on the photo's gradient; theme colours if a dish ever has no photo.
  const titleColor = image ? '#FFFFFF' : colors.navy;
  const subColor = image ? '#F5EBDD' : colors.textSecondary;

  return (
    <Card padded={false}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={
          isHindi
            ? `${title}। ${expanded ? 'विवरण बंद करें' : 'विवरण देखें'}`
            : `${title}. ${expanded ? 'Hide details' : 'Show details'}`
        }
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      >
        <Photo
          source={image}
          fallbackIcon="food"
          scrim={Boolean(image)}
          representative={Boolean(image && food.imageIsRepresentative)}
          style={styles.cover}
        >
          <View style={[styles.coverText, image && food.imageIsRepresentative && styles.coverTextAboveTag]}>
            <AppText
              variant="h3"
              weight="700"
              color={titleColor}
              numberOfLines={image ? 2 : 1}
              maxFontSizeMultiplier={1.2}
            >
              {title}
            </AppText>
            <AppText
              variant="caption"
              weight="500"
              color={subColor}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              {altTitle}
            </AppText>
          </View>
        </Photo>
        <View style={styles.summary}>
          <View style={styles.metaRow}>
            <Icon name="location" size={18} color={colors.primary} />
            <AppText variant="caption" color={colors.textSecondary} style={styles.flex}>
              {meta}
            </AppText>
          </View>
          <AppText variant="body" color={colors.text} numberOfLines={expanded ? undefined : 2}>
            {desc}
          </AppText>
        </View>
      </Pressable>

      <View style={styles.body}>
        {expanded ? <FoodDetails food={food} isHindi={isHindi} colors={colors} /> : null}

        <Button
          variant="secondary"
          icon={expanded ? 'close' : 'chevronRight'}
          title={
            expanded
              ? isHindi ? 'कम दिखाएँ' : 'Show less'
              : isHindi ? 'इस व्यंजन के बारे में' : 'Explore this food'
          }
          onPress={onToggle}
          accessibilityLabel={
            expanded
              ? isHindi ? `${title} का विवरण बंद करें` : `Close details for ${title}`
              : isHindi ? `${title} के बारे में और जानें` : `Explore ${title}`
          }
        />
      </View>
    </Card>
  );
}

export default function FoodScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  const paramSearch = typeof route?.params?.search === 'string' ? route.params.search : undefined;

  const [query, setQuery] = useState(paramSearch || '');
  const [town, setTown] = useState('all');
  const [expandedId, setExpandedId] = useState(() => (paramSearch ? singleMatchId(paramSearch) : null));

  // A new search from Home reaches an already-open Food screen too. The town
  // filter goes back to "All" so the dish is not hidden behind another town.
  useEffect(() => {
    if (paramSearch === undefined) return;
    setQuery(paramSearch);
    setTown('all');
    setExpandedId(singleMatchId(paramSearch));
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

  const toggleFood = (id) => setExpandedId((current) => (current === id ? null : id));

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
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

        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={isHindi ? 'व्यंजन या नगर खोजें' : 'Search a dish or town'}
          style={styles.search}
        />

        <ScrollView
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {towns.map((t) => (
            <Chip
              key={t.id}
              label={isHindi ? t.hi : t.en}
              selected={town === t.id}
              onPress={() => {
                setTown(t.id);
                setExpandedId(null);
              }}
            />
          ))}
        </ScrollView>

        <View style={styles.content}>
          <InfoNote>
            {isHindi
              ? 'सामग्री और बनाने का तरीका पूछ लें। दूध की मिठाइयाँ सात्विक आहार में आ सकती हैं, पर हर रसोई का तरीका अलग होता है।'
              : 'Ask about ingredients and preparation. Milk sweets may suit a satvik diet; recipes and kitchen practices vary.'}
          </InfoNote>

          {isSearching && foods.length > 0 ? (
            <AppText variant="small" color={colors.muted}>
              {isHindi ? `${foods.length} परिणाम` : `${foods.length} ${foods.length === 1 ? 'result' : 'results'}`}
            </AppText>
          ) : null}

          {foods.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              expanded={expandedId === food.id}
              onToggle={() => toggleFood(food.id)}
              isHindi={isHindi}
              colors={colors}
            />
          ))}

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
  content: { paddingHorizontal: GUTTER, paddingTop: 16, gap: 16 },
  cover: { height: 184 },
  coverText: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 2 },
  // Leaves room for the "Representative photo" tag Photo draws at the bottom left.
  coverTextAboveTag: { bottom: 44 },
  summary: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  body: { padding: 16, paddingTop: 12, gap: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  details: { gap: 10 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  emptyHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emptyText: { marginTop: 8 },
  emptyActions: { marginTop: 14, gap: 4, alignItems: 'flex-start' },
});
