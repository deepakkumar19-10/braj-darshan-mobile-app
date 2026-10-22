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
import { getFoodImage } from '../../utils/imageAssets';

export default function FoodCard({ food }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(food.id);
  const foodImg = getFoodImage(food);

  const handleOpenMap = () => {
    if (food.latitude && food.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${food.latitude},${food.longitude}`;
      Linking.openURL(url);
    } else {
      const query = encodeURIComponent(`${food.nameHindi || food.name} ${food.place} Braj`);
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
      {Boolean(foodImg) && (
        <View style={styles.imageContainer}>
          <Image source={foodImg} style={styles.cardImage} resizeMode="cover" />
        </View>
      )}

      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.badgeCluster}>
          <Badge label={food.category || (isHindi ? 'प्रसाद' : 'Prasad')} variant="gold" icon="🍯" />
          <Badge label={food.place} variant="purple" icon="📍" />
        </View>

        <TouchableOpacity
          onPress={() => toggleFavorite(food)}
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

      {/* Food Title */}
      <AppText variant="h2" color={colors.navy} style={styles.title}>
        {isHindi ? food.nameHindi : food.name}
      </AppText>
      <AppText variant="caption" color={colors.muted} style={styles.subtitle}>
        {isHindi ? food.name : food.nameHindi}
      </AppText>

      {/* Description */}
      <AppText variant="body" color={colors.textSecondary} style={styles.desc}>
        {food.desc}
      </AppText>

      {/* Price & Famous Shops Box */}
      <View
        style={[
          styles.shopsBox,
          {
            backgroundColor: isDark ? colors.cardAlt : colors.primaryLight,
            borderColor: isDark ? colors.border : colors.goldLight,
          },
        ]}
      >
        <View style={[styles.priceRow, { borderBottomColor: colors.border }]}>
          <AppText variant="caption" weight="700" color={colors.primary}>
            {isHindi ? '💰 अनुमानित मूल्य:' : '💰 Price Range:'}
          </AppText>
          <AppText variant="caption" weight="700" color={colors.text}>
            {food.priceRange}
          </AppText>
        </View>

        <View style={styles.shopsRow}>
          <AppText variant="caption" weight="700" color={colors.primary}>
            {isHindi ? '🏪 प्रसिद्ध प्रतिष्ठान:' : '🏪 Famous Outlets:'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.shopsText}>
            {food.famousShops}
          </AppText>
        </View>
      </View>

      {/* Footer Action */}
      <View style={styles.footerRow}>
        <AppText variant="caption" color={colors.muted}>
          {isHindi ? 'शुद्ध देशी घी व पारंपरिक विधि' : 'Traditional Braj preparation'}
        </AppText>

        <TouchableOpacity
          style={[styles.directionsBtn, { backgroundColor: colors.primary }]}
          onPress={handleOpenMap}
          activeOpacity={0.8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <AppText variant="caption" weight="700" color="#FFFFFF">
            {isHindi ? '🗺️ दुकान का स्थान देखें' : '🗺️ View on Map'}
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
    width: 44, // 44pt touch target
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
  desc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  shopsBox: {
    borderRadius: radii.md,
    padding: spacing.xs,
    marginBottom: spacing.sm,
    borderWidth: 1,
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  shopsRow: {
    paddingTop: 2,
  },
  shopsText: {
    lineHeight: 18,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xxs,
  },
  directionsBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
