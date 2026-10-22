import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, radii, shadows } from '../../theme';
import { AppText, Badge, AppButton, MorpankhIcon } from '../common';
import { getTempleImage } from '../../utils/imageAssets';

export default function FeaturedTempleCard({ temple, onPress }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const templeImg = getTempleImage(temple);

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

      {/* Top Meta */}
      <View style={styles.topRow}>
        <Badge
          label={isHindi ? temple.cityHindi : temple.city}
          variant="gold"
          icon="📍"
        />
        <Badge label={isHindi ? 'प्रमुख' : 'Featured'} variant="purple" />
      </View>

      {/* Temple Name */}
      <AppText variant="h3" color={colors.navy} numberOfLines={1} style={styles.name}>
        {isHindi ? temple.nameHindi : temple.name}
      </AppText>
      <AppText variant="caption" color={colors.muted} numberOfLines={1} style={styles.deity}>
        {isHindi ? (temple.deityHindi || temple.deity) : temple.deity}
      </AppText>

      {/* Description */}
      <AppText
        variant="body"
        color={colors.textSecondary}
        numberOfLines={2}
        style={styles.desc}
      >
        {temple.shortDescription}
      </AppText>

      {/* Timings */}
      <View
        style={[
          styles.timingBox,
          { backgroundColor: isDark ? colors.cardAlt : colors.primaryLight },
        ]}
      >
        <AppText variant="caption" color={colors.primary} weight="600" numberOfLines={1}>
          ⏰ {temple.timings?.summer || (isHindi ? 'समय सारणी देखें' : 'View Timings')}
        </AppText>
      </View>

      {/* Action Button */}
      <AppButton
        title={isHindi ? 'दर्शन विवरण देखें' : 'View Darshan'}
        variant="primary"
        size="sm"
        icon={<MorpankhIcon size={16} />}
        onPress={onPress}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: radii.xl,
    padding: spacing.base,
    borderWidth: 1,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
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
    marginBottom: spacing.xs,
  },
  name: {
    marginTop: spacing.xxs,
  },
  deity: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  timingBox: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
});
