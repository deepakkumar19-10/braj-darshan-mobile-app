import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, radii, shadows } from '../../theme';
import { AppText, Badge } from '../common';
import { useFavorites } from '../../context/FavoritesContext';
import { getPlaceImage } from '../../utils/imageAssets';

export default function PlaceCard({ place }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(place.id);
  const placeImg = getPlaceImage(place);

  const handleOpenMap = () => {
    if (place.latitude && place.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
      Linking.openURL(url);
    } else {
      const query = encodeURIComponent(`${place.nameHindi || place.name} Braj`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.border : colors.goldLight,
        },
        shadows.sm,
      ]}
    >
      {Boolean(placeImg) && (
        <View style={styles.imageContainer}>
          <Image source={placeImg} style={styles.cardImage} resizeMode="cover" />
        </View>
      )}

      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.badgeCluster}>
          <Badge label={place.city || (isHindi ? 'ब्रज' : 'Braj')} variant="gold" icon="📍" />
          <Badge label={place.category || (isHindi ? 'पावन धाम' : 'Sacred Place')} variant="purple" />
        </View>

        <TouchableOpacity
          onPress={() => toggleFavorite(place)}
          style={[
            styles.favBtn,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.borderLight,
              borderColor: colors.border,
            },
          ]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Wishlist"
        >
          <AppText variant="body">{fav ? '❤️' : '🤍'}</AppText>
        </TouchableOpacity>
      </View>

      {/* Place Title */}
      <AppText variant="h2" color={colors.navy} style={styles.title}>
        {isHindi ? place.nameHindi : place.name}
      </AppText>
      <AppText variant="caption" color={colors.muted} style={styles.subtitle}>
        {isHindi ? place.name : place.nameHindi}
      </AppText>

      {/* Description */}
      <AppText variant="body" color={colors.textSecondary} style={styles.description}>
        {place.shortDescription || place.description}
      </AppText>

      {/* Highlights Tags */}
      {place.highlights && place.highlights.length > 0 && (
        <View
          style={[
            styles.highlightsContainer,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.primaryLight,
              borderColor: isDark ? colors.border : colors.goldLight,
            },
          ]}
        >
          <AppText variant="caption" weight="700" color={colors.primary} style={styles.hlLabel}>
            {isHindi ? 'प्रमुख आकर्षण एवं महात्म्य:' : 'Highlights & Significance:'}
          </AppText>
          <View style={styles.hlPillsRow}>
            {place.highlights.map((hl, idx) => (
              <View
                key={idx}
                style={[
                  styles.hlChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <AppText variant="caption" color={colors.navy} weight="600">
                  ✨ {hl}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Travel Meta Info */}
      <View style={[styles.travelMeta, { borderColor: colors.border }]}>
        <View style={styles.metaItem}>
          <AppText variant="caption" color={colors.muted}>
            {isHindi ? '🗓️ उत्तम समय' : '🗓️ Best Time'}
          </AppText>
          <AppText variant="caption" weight="700" color={colors.text}>
            {place.bestTime || (isHindi ? 'वर्षभर' : 'All Year')}
          </AppText>
        </View>

        <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metaItem}>
          <AppText variant="caption" color={colors.muted}>
            {isHindi ? '⏱️ दर्शन अवधि' : '⏱️ Duration'}
          </AppText>
          <AppText variant="caption" weight="700" color={colors.primary}>
            {place.visitDuration || (isHindi ? '1 दिन' : '1 Day')}
          </AppText>
        </View>
      </View>

      {/* Footer Action */}
      <View style={styles.footerRow}>
        <View style={styles.experienceWrap}>
          <AppText variant="caption" color={colors.muted} numberOfLines={1}>
            🕉️ {place.experience || (isHindi ? 'धार्मिक दर्शन व आध्यात्मिक शांति' : 'Spiritual bliss & peace')}
          </AppText>
        </View>

        <TouchableOpacity
          style={[styles.directionsBtn, { backgroundColor: colors.primary }]}
          onPress={handleOpenMap}
          activeOpacity={0.8}
        >
          <AppText variant="caption" weight="700" color="#FFFFFF">
            {isHindi ? '🗺️ दिशा-निर्देश' : '🗺️ Directions'}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    marginTop: -spacing.base,
    marginHorizontal: -spacing.base,
    marginBottom: spacing.xs,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeCluster: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    marginTop: spacing.xxs,
    marginBottom: 2,
    lineHeight: 28,
  },
  subtitle: {
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  highlightsContainer: {
    borderRadius: radii.md,
    padding: spacing.xs,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  hlLabel: {
    marginBottom: 4,
  },
  hlPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  hlChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  travelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: spacing.xs,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaDivider: {
    width: 1,
    height: 24,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xxs,
  },
  experienceWrap: {
    flex: 1,
    marginRight: spacing.xs,
  },
  directionsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
});
