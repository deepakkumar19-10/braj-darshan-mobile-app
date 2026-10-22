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
import { AppText, Badge, AppButton, MorpankhIcon } from '../common';
import { useFavorites } from '../../context/FavoritesContext';
import { getTempleStatus } from '../../utils/templeHours';
import { getTempleImage } from '../../utils/imageAssets';

export default function TempleCard({ temple, onPress }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(temple.id);
  const status = getTempleStatus(temple);
  const templeImg = getTempleImage(temple);

  const handleOpenMaps = (e) => {
    e.stopPropagation?.();
    if (temple.latitude && temple.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${temple.latitude},${temple.longitude}`;
      Linking.openURL(url);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.border : colors.borderLight,
        },
        shadows.sm,
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {Boolean(templeImg) && (
        <View style={styles.imageContainer}>
          <Image source={templeImg} style={styles.cardImage} resizeMode="cover" />
        </View>
      )}

      {/* Top Meta Bar */}
      <View style={styles.topBar}>
        <View style={styles.badgeCluster}>
          <Badge
            label={isHindi ? temple.cityHindi : temple.city}
            variant="gold"
            icon="📍"
          />
          <Badge label={status.label} variant={status.variant} />
        </View>

        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={[styles.favBtn, { backgroundColor: isDark ? colors.cardAlt : colors.borderLight }]}
          activeOpacity={0.7}
          onPress={() => toggleFavorite(temple)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppText variant="h3">{fav ? '❤️' : '🤍'}</AppText>
        </TouchableOpacity>
      </View>

      {/* Title & Deity */}
      <AppText variant="h2" color={colors.navy} style={styles.title}>
        {isHindi ? temple.nameHindi : temple.name}
      </AppText>
      <AppText variant="caption" color={colors.muted} style={styles.subTitle}>
        {isHindi ? temple.name : temple.nameHindi}
      </AppText>

      <View style={styles.deityRow}>
        <AppText variant="caption" weight="700" color={colors.primary}>
          {isHindi ? 'ईष्ट देव: ' : 'Deity: '}
        </AppText>
        <AppText variant="caption" weight="600" color={colors.text}>
          {isHindi ? (temple.deityHindi || temple.deity) : temple.deity}
        </AppText>
      </View>

      {/* Description */}
      <AppText
        variant="body"
        color={colors.textSecondary}
        numberOfLines={2}
        style={styles.desc}
      >
        {temple.shortDescription}
      </AppText>

      {/* Timings Snippet */}
      <View
        style={[
          styles.timingsBox,
          {
            backgroundColor: isDark ? colors.cardAlt : colors.primaryLight,
          },
        ]}
      >
        <AppText variant="caption" color={colors.primary} weight="600" numberOfLines={1}>
          ⏰ {temple.timings?.summer || (isHindi ? 'समय सारणी देखें' : 'View Timings')}
        </AppText>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <View style={styles.btnFlex}>
          <AppButton
            title={isHindi ? 'दर्शन विवरण देखें' : 'View Darshan Details'}
            variant="primary"
            size="sm"
            icon={<MorpankhIcon size={18} />}
            onPress={onPress}
          />
        </View>

        {Boolean(temple.latitude && temple.longitude) && (
          <TouchableOpacity
            style={[
              styles.mapBtn,
              {
                backgroundColor: isDark ? colors.cardAlt : colors.borderLight,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.75}
            onPress={handleOpenMaps}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <AppText variant="body">{isHindi ? '🗺️ मार्ग' : '🗺️ Map'}</AppText>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.base,
    borderWidth: 1,
    marginBottom: spacing.sm,
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeCluster: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    flex: 1,
  },
  favBtn: {
    width: 44, // 44pt touch target
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  title: {
    marginTop: spacing.xxs,
  },
  subTitle: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  deityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  timingsBox: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btnFlex: {
    flex: 1,
  },
  mapBtn: {
    minHeight: 44, // 44pt touch target
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
