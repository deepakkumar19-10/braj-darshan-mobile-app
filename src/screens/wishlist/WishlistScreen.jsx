/**
 * Braj Darshan - Saved (route ROUTES.FAVORITES)
 * Layout from the Nov 2026 redesign (Claude Design "Saved"): segmented tabs per kind
 * (temples, places, Braj food) with counts; each saved item is a row with its photo,
 * name, town and live darshan status, and a filled heart that removes it (with
 * "Undo" for a few seconds); a friendly empty state otherwise. Saved items live only
 * on this phone.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Button,
  Card,
  IconButton,
  InfoNote,
  LanguageToggle,
  Photo,
  StatusBadge,
  TopBar,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';
import { getTempleStatus } from '../../utils/templeHours';
import {
  getTempleImage,
  getPlaceImage,
  getFoodImage,
  isTempleImageRepresentative,
  isPlaceImageRepresentative,
} from '../../utils/imageAssets';
import { getPlaces, getTemples, usePlaces, useTemples } from '../../services/contentService';
import foodData from '../../data/food.json';

const KIND_LABEL = {
  temple: { hi: 'मंदिर', en: 'Temple' },
  place: { hi: 'स्थल', en: 'Place' },
  food: { hi: 'ब्रज भोग', en: 'Braj food' },
};

function sameItem(a, b) {
  return (
    String(a.id) === String(b.id) &&
    ((a.name && a.name === b.name) || (a.nameHindi && a.nameHindi === b.nameHindi))
  );
}

/**
 * Turns the stored favourites into displayable items, using the app's current data
 * where possible (so names, photos and timings are never out of date). Entries that
 * were stored as a bare id, with no name, cannot be shown and are skipped.
 */
export function getSavedItems(favorites, templesData = getTemples(), placesData = getPlaces()) {
  const items = [];
  (favorites || []).forEach((fav, index) => {
    if (!fav || typeof fav !== 'object' || fav.id === undefined || fav.id === null) return;
    const temple = templesData.find((t) => sameItem(t, fav));
    if (temple) {
      items.push({ key: `temple-${temple.id}-${index}`, kind: 'temple', data: temple, saved: fav });
      return;
    }
    const place = placesData.find((p) => sameItem(p, fav));
    if (place) {
      items.push({ key: `place-${place.id}-${index}`, kind: 'place', data: place, saved: fav });
      return;
    }
    const food = foodData.find((f) => String(f.id) === String(fav.id));
    if (food) {
      items.push({ key: `food-${food.id}-${index}`, kind: 'food', data: food, saved: fav });
      return;
    }
    // An older saved copy that no longer matches the app's data.
    if (fav.name || fav.nameHindi) {
      const kind = fav.timings || fav.deity ? 'temple' : 'place';
      items.push({ key: `${kind}-${fav.id}-${index}`, kind, data: fav, saved: fav });
    }
  });
  return items;
}

function imageFor(item) {
  if (item.kind === 'temple') return getTempleImage(item.data);
  if (item.kind === 'food') return getFoodImage(item.data);
  return getPlaceImage(item.data);
}

const KINDS = ['temple', 'place', 'food'];

const EMPTY_TITLE = {
  temple: { hi: 'अभी कोई मंदिर सहेजा नहीं है', en: 'No saved temples yet' },
  place: { hi: 'अभी कोई स्थल सहेजा नहीं है', en: 'No saved places yet' },
  food: { hi: 'अभी कोई ब्रज भोग सहेजा नहीं है', en: 'No saved Braj food yet' },
};

function isRepresentative(item) {
  const { kind, data } = item;
  if (kind === 'temple') return isTempleImageRepresentative(data);
  if (kind === 'place') return isPlaceImageRepresentative(data);
  return Boolean(data.imageIsRepresentative);
}

/** One saved item: photo, name, town and (temples) darshan status; the filled heart removes it. */
function SavedCard({ item, isHindi, colors, onOpen, onRemove }) {
  const { kind, data } = item;
  const open = usePressGuard(onOpen);
  const name = isHindi ? data.nameHindi || data.name : data.name || data.nameHindi;
  const town = isHindi ? data.cityHindi || data.city : data.city;
  const status = kind === 'temple' && data.timings ? getTempleStatus(data) : null;
  const representative = isRepresentative(item);

  return (
    <Card padded={false} style={styles.savedCard}>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={name}
        style={({ pressed }) => [styles.savedMain, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Photo
          source={imageFor(item)}
          style={styles.thumb}
          fallbackIcon={kind === 'food' ? 'food' : kind === 'place' ? 'location' : 'temple'}
        />
        <View style={styles.savedText}>
          <AppText variant="h4" weight="700" color={colors.navy}>
            {name}
          </AppText>
          {town ? (
            <AppText variant="small" color={colors.muted}>
              {town}
            </AppText>
          ) : null}
          {status ? <StatusBadge status={status} size="sm" /> : null}
          {/* Too small a photo for the usual tag on it, so the honesty note sits with the text. */}
          {representative ? (
            <AppText variant="small" color={colors.muted}>
              {isHindi ? 'प्रतीकात्मक चित्र' : 'Representative photo'}
            </AppText>
          ) : null}
        </View>
      </Pressable>
      <IconButton
        icon="heartFilled"
        onPress={onRemove}
        color={colors.primary}
        style={styles.heartButton}
        accessibilityLabel={isHindi ? `${name} को सहेजे गए से हटाएँ` : `Remove ${name} from saved`}
      />
    </Card>
  );
}

/** Segmented tabs: one per kind, each with its count. */
function KindTabs({ value, counts, onChange, isHindi, colors }) {
  return (
    <View style={[styles.tabs, { backgroundColor: colors.infoBg }]} accessibilityRole="tablist">
      {KINDS.map((kind) => {
        const selected = value === kind;
        const label = `${isHindi ? KIND_LABEL[kind].hi : KIND_LABEL[kind].en} (${counts[kind]})`;
        return (
          <Pressable
            key={kind}
            onPress={() => onChange(kind)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            style={[
              styles.tab,
              // Background set in both states (Android drops the radius of conditional backgrounds).
              { backgroundColor: selected ? colors.surface : colors.infoBg },
            ]}
          >
            <AppText
              variant="body"
              weight={selected ? '700' : '600'}
              color={selected ? colors.navy : colors.muted}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function EmptyState({ kind, isHindi, colors }) {
  // Only temples have a heart today, so only that state says how to save one.
  const isTemple = kind === 'temple';
  return (
    <View style={[styles.empty, { borderColor: colors.borderGold }]}>
      <View style={[styles.emptyCircle, { backgroundColor: colors.primaryLight }]}>
        <Icon name="heart" size={26} color={colors.primary} />
      </View>
      <AppText variant="h4" weight="700" color={colors.navy} align="center">
        {isHindi ? EMPTY_TITLE[kind].hi : EMPTY_TITLE[kind].en}
      </AppText>
      {isTemple ? (
        <AppText variant="caption" color={colors.text} align="center">
          {isHindi
            ? 'किसी भी मंदिर पर दिल का निशान दबाएँ, वह यहाँ सहेज लिया जाएगा।'
            : 'Tap the heart on any temple to save it here.'}
        </AppText>
      ) : null}
    </View>
  );
}

export default function WishlistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const { favorites, toggleFavorite, isLoaded } = useFavorites();
  const [lastRemoved, setLastRemoved] = useState(null);
  const [tab, setTab] = useState(null);

  const templesData = useTemples();
  const placesData = usePlaces();
  const items = useMemo(
    () => getSavedItems(favorites, templesData, placesData),
    [favorites, templesData, placesData]
  );
  const counts = useMemo(() => {
    const c = { temple: 0, place: 0, food: 0 };
    items.forEach((i) => {
      c[i.kind] += 1;
    });
    return c;
  }, [items]);
  // Until a tab is picked, show the first kind that has something saved.
  const activeKind = tab || KINDS.find((k) => counts[k] > 0) || 'temple';
  const shown = items.filter((i) => i.kind === activeKind);
  const hasTemples = shown.some((i) => i.kind === 'temple');

  // The "Undo" offer disappears after a few seconds.
  useEffect(() => {
    if (!lastRemoved) return undefined;
    const timer = setTimeout(() => setLastRemoved(null), 8000);
    return () => clearTimeout(timer);
  }, [lastRemoved]);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate(ROUTES.MORE);
  };

  const openItem = (item) => {
    if (item.kind === 'temple') {
      navigation.navigate(ROUTES.TEMPLE_DETAIL, { id: item.data.id, temple: item.data });
    } else if (item.kind === 'food') {
      navigation.navigate(ROUTES.FOOD);
    } else {
      navigation.navigate(ROUTES.PLACES);
    }
  };

  const removeItem = (item) => {
    toggleFavorite(item.saved);
    setLastRemoved(item);
  };

  const undoRemove = () => {
    if (lastRemoved) toggleFavorite(lastRemoved.saved);
    setLastRemoved(null);
  };

  const removedName = lastRemoved
    ? isHindi
      ? lastRemoved.data.nameHindi || lastRemoved.data.name
      : lastRemoved.data.name || lastRemoved.data.nameHindi
    : '';

  let subtitle;
  if (!isLoaded) {
    subtitle = isHindi ? 'आपकी सूची लोड हो रही है' : 'Loading your list';
  } else if (items.length > 0) {
    subtitle = isHindi ? `इस फ़ोन पर ${items.length} सहेजे गए` : `${items.length} saved on this phone`;
  } else {
    subtitle = isHindi ? 'अभी कुछ सहेजा नहीं गया' : 'Nothing saved yet';
  }

  const browseTemples = (
    <Button
      variant="secondary"
      icon="temple"
      title={
        items.length === 0
          ? isHindi ? 'मंदिर देखें' : 'Browse temples'
          : isHindi ? 'और मंदिर देखें' : 'Browse more temples'
      }
      onPress={() => navigation.navigate(ROUTES.TEMPLES)}
      style={styles.browseButton}
    />
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={isHindi ? 'सहेजे गए' : 'Saved'}
          subtitle={subtitle}
          onBack={goBack}
          right={<LanguageToggle />}
        />

        <View style={styles.body}>
          {lastRemoved ? (
            <Card style={styles.undoCard}>
              <Icon name="heart" size={20} color={colors.muted} />
              <AppText variant="body" color={colors.text} style={styles.flex}>
                {isHindi ? `${removedName} हटाया गया` : `Removed ${removedName}`}
              </AppText>
              <Button variant="text" title={isHindi ? 'वापस लाएँ' : 'Undo'} onPress={undoRemove} />
            </Card>
          ) : null}

          {!isLoaded ? null : items.length === 0 ? (
            <>
              <EmptyState kind="temple" isHindi={isHindi} colors={colors} />
              {browseTemples}
              <AppText variant="caption" color={colors.muted} align="center">
                {isHindi
                  ? 'सहेजे मंदिर इसी फ़ोन पर रहते हैं · कोई खाता नहीं चाहिए'
                  : 'Saved temples stay on this phone · no account needed'}
              </AppText>
            </>
          ) : (
            <>
              <KindTabs value={activeKind} counts={counts} onChange={setTab} isHindi={isHindi} colors={colors} />

              {shown.length === 0 ? (
                <EmptyState kind={activeKind} isHindi={isHindi} colors={colors} />
              ) : (
                <View style={styles.list}>
                  {shown.map((item) => (
                    <SavedCard
                      key={item.key}
                      item={item}
                      isHindi={isHindi}
                      colors={colors}
                      onOpen={() => openItem(item)}
                      onRemove={() => removeItem(item)}
                    />
                  ))}
                </View>
              )}

              {browseTemples}

              <InfoNote tone={hasTemples ? 'warning' : 'info'}>
                {hasTemples
                  ? isHindi
                    ? 'समय मंदिरों के नियमित समय पर आधारित है और त्योहारों पर बदल सकता है — कृपया स्थानीय पुष्टि करें। सहेजी गई सूची केवल इसी फ़ोन पर रहती है।'
                    : 'Status is based on regular temple timings and may change on festivals — please confirm locally. Your saved list stays on this phone only.'
                  : isHindi
                    ? 'सहेजी गई सूची केवल इसी फ़ोन पर रहती है। कोई खाता नहीं चाहिए।'
                    : 'Your saved list stays on this phone only. No account needed.'}
              </InfoNote>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  body: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 18 },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 999 },
  tab: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: 12 },
  savedCard: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 10 },
  savedMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 88, height: 88, borderRadius: 12 },
  savedText: { flex: 1, gap: 4, alignItems: 'flex-start' },
  heartButton: { borderWidth: 0, backgroundColor: 'transparent' },
  undoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  browseButton: { alignSelf: 'center', minHeight: 48, borderRadius: 14 },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
