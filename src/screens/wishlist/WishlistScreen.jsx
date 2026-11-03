/**
 * Braj Darshan - Saved (route ROUTES.FAVORITES)
 * Layout from the redesign (design-input/figma "Light · Saved temples"): the temples
 * and places saved with the heart, each with its photo, name, town and live darshan
 * status; a friendly empty state otherwise. Saved items live only on this phone.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
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
import { ROUTES } from '../../navigation/routes';
import { getTempleStatus } from '../../utils/templeHours';
import {
  getTempleImage,
  getPlaceImage,
  getFoodImage,
  isTempleImageRepresentative,
  isPlaceImageRepresentative,
} from '../../utils/imageAssets';
import templesData from '../../data/temples.json';
import placesData from '../../data/places.json';
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
export function getSavedItems(favorites) {
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

function SavedCard({ item, isHindi, colors, onOpen, onRemove }) {
  const { kind, data } = item;
  const name = isHindi ? data.nameHindi || data.name : data.name || data.nameHindi;
  const otherName = isHindi ? data.name : data.nameHindi;
  const town = isHindi ? data.cityHindi || data.city : data.city;
  const kindLabel = isHindi ? KIND_LABEL[kind].hi : KIND_LABEL[kind].en;
  const meta = [kindLabel, town].filter(Boolean).join(' · ');
  const status = kind === 'temple' && data.timings ? getTempleStatus(data) : null;

  return (
    <Card onPress={onOpen} padded={false} accessibilityLabel={name}>
      <Photo
        source={imageFor(item)}
        representative={kind === 'temple' ? isTempleImageRepresentative(data) : kind === 'place' ? isPlaceImageRepresentative(data) : Boolean(data.imageIsRepresentative)}
        style={styles.photo}
        accessibilityLabel={name}
      />
      <View style={styles.cardBody}>
        <View style={styles.flex}>
          <AppText variant="h4" weight="700" color={colors.navy}>
            {name}
          </AppText>
          {otherName && otherName !== name ? (
            <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
              {otherName}
            </AppText>
          ) : null}
          <AppText variant="caption" color={colors.muted}>
            {meta}
          </AppText>
          {status ? (
            <View style={styles.badgeRow}>
              <StatusBadge status={status} size="sm" />
            </View>
          ) : null}
        </View>
        <IconButton
          icon="trash"
          onPress={onRemove}
          color={colors.muted}
          accessibilityLabel={isHindi ? `${name} को सहेजे गए से हटाएँ` : `Remove ${name} from saved`}
        />
      </View>
    </Card>
  );
}

export default function WishlistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const { favorites, toggleFavorite, isLoaded } = useFavorites();
  const [lastRemoved, setLastRemoved] = useState(null);

  const items = useMemo(() => getSavedItems(favorites), [favorites]);
  const hasTemples = items.some((i) => i.kind === 'temple');

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

        {lastRemoved ? (
          <View style={styles.section}>
            <Card style={styles.undoCard}>
              <Icon name="trash" size={20} color={colors.muted} />
              <AppText variant="body" color={colors.text} style={styles.flex}>
                {isHindi ? `${removedName} हटाया गया` : `Removed ${removedName}`}
              </AppText>
              <Button variant="text" title={isHindi ? 'वापस लाएँ' : 'Undo'} onPress={undoRemove} />
            </Card>
          </View>
        ) : null}

        {!isLoaded ? null : items.length === 0 ? (
          <View style={styles.empty}>
            <Card style={styles.emptyCard}>
              <View style={[styles.emptyCircle, { backgroundColor: colors.primaryLight }]}>
                <Icon name="heart" size={44} color={colors.primary} />
              </View>
              <AppText variant="h2" weight="700" color={colors.navy} align="center">
                {isHindi ? 'अभी कोई मंदिर सहेजा नहीं है' : 'No saved temples yet'}
              </AppText>
              <AppText variant="body" color={colors.text} align="center">
                {isHindi
                  ? 'किसी भी मंदिर पर दिल का निशान दबाएँ, वह यहाँ सहेज लिया जाएगा।'
                  : 'Tap the heart on any temple to save it here.'}
              </AppText>
              <Button
                title={isHindi ? 'मंदिर देखें' : 'Browse temples'}
                icon="temple"
                onPress={() => navigation.navigate(ROUTES.TEMPLES)}
                style={styles.emptyButton}
              />
            </Card>
            <AppText variant="caption" color={colors.muted} align="center">
              {isHindi
                ? 'सहेजे मंदिर इसी फ़ोन पर रहते हैं · कोई खाता नहीं चाहिए'
                : 'Saved temples stay on this phone · no account needed'}
            </AppText>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.list}>
              {items.map((item) => (
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

            <InfoNote style={styles.note}>
              {hasTemples
                ? isHindi
                  ? 'समय मंदिरों के नियमित समय पर आधारित है और त्योहारों पर बदल सकता है — कृपया स्थानीय पुष्टि करें। सहेजी गई सूची केवल इसी फ़ोन पर रहती है।'
                  : 'Status is based on regular temple timings and may change on festivals — please confirm locally. Your saved list stays on this phone only.'
                : isHindi
                  ? 'सहेजी गई सूची केवल इसी फ़ोन पर रहती है। कोई खाता नहीं चाहिए।'
                  : 'Your saved list stays on this phone only. No account needed.'}
            </InfoNote>

            <Button
              variant="secondary"
              icon="temple"
              title={isHindi ? 'और मंदिर देखें' : 'Browse more temples'}
              onPress={() => navigation.navigate(ROUTES.TEMPLES)}
              style={styles.browseButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  section: { paddingHorizontal: GUTTER, marginTop: 8 },
  list: { gap: 16 },
  photo: { height: 150 },
  cardBody: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16 },
  badgeRow: { marginTop: 8 },
  undoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  note: { marginTop: 20 },
  browseButton: { marginTop: 16 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: GUTTER,
    paddingVertical: 24,
  },
  emptyCard: { alignItems: 'center', gap: 12, paddingVertical: 28 },
  emptyCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyButton: { alignSelf: 'stretch', marginTop: 8 },
});
