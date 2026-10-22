import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';
import { AppText, Badge, MorpankhIcon } from '../common';

export default function YatraCard({ yatra, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, shadows.sm]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Top Header Badges */}
      <View style={styles.headerRow}>
        <Badge label={yatra.day} variant="gold" icon="🚩" />
        <Badge label={yatra.duration} variant="purple" icon="🕐" />
      </View>

      {/* Title & Subtitle */}
      <AppText variant="h3" color={colors.navy} style={styles.title}>
        {yatra.title}
      </AppText>
      {Boolean(yatra.titleEn) && (
        <AppText variant="caption" color={colors.muted} style={styles.titleEn}>
          {yatra.titleEn}
        </AppText>
      )}

      {/* Devotional Tagline */}
      <AppText variant="body" color={colors.charcoal} style={styles.tagline}>
        {yatra.tagline}
      </AppText>

      {/* Included Places Tags */}
      {yatra.places && yatra.places.length > 0 && (
        <View style={styles.placesContainer}>
          <AppText variant="caption" weight="700" color={colors.primary} style={styles.placesLabel}>
            📍 प्रमुख दर्शनीय स्थल:
          </AppText>
          <View style={styles.placeTagsWrap}>
            {yatra.places.slice(0, 4).map((place, idx) => (
              <View key={idx} style={styles.placeTag}>
                <AppText variant="caption" color={colors.navy} weight="600">
                  {place}
                </AppText>
              </View>
            ))}
            {yatra.places.length > 4 && (
              <View style={[styles.placeTag, styles.moreTag]}>
                <AppText variant="caption" color={colors.primary} weight="700">
                  +{yatra.places.length - 4} और
                </AppText>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Meta Bar */}
      <View style={styles.metaBar}>
        <View style={styles.metaItem}>
          <AppText variant="caption" color={colors.muted}>🚗 सुलभ वाहन</AppText>
          <AppText variant="caption" weight="700" color={colors.charcoal}>
            {yatra.transport}
          </AppText>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaItem}>
          <AppText variant="caption" color={colors.muted}>💰 अनुमानित खर्च</AppText>
          <AppText variant="caption" weight="700" color={colors.primary}>
            {yatra.estimatedBudget?.split(' ')[0] || yatra.estimatedBudget}
          </AppText>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaItem}>
          <AppText variant="caption" color={colors.muted}>⏰ उत्तम समय</AppText>
          <AppText variant="caption" weight="700" color={colors.charcoal}>
            {yatra.bestTime}
          </AppText>
        </View>
      </View>

      {/* Bottom CTA Bar */}
      <View style={styles.footerRow}>
        <View style={styles.ctaWrap}>
          <MorpankhIcon size={18} />
          <AppText variant="caption" weight="700" color={colors.primary}>
            विस्तृत समय सारणी व गाइड देखें
          </AppText>
        </View>
        <AppText variant="body" weight="700" color={colors.primary}>
          ›
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    marginTop: spacing.xxs,
    marginBottom: 2,
    lineHeight: 24,
  },
  titleEn: {
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  placesContainer: {
    backgroundColor: colors.surfaceGold,
    borderRadius: radii.md,
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  placesLabel: {
    marginBottom: 4,
  },
  placeTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  placeTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  moreTag: {
    backgroundColor: '#FEF3C7',
    borderColor: colors.gold,
  },
  metaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  ctaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
