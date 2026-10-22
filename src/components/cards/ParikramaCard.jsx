import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';
import { AppText, Badge, MorpankhIcon } from '../common';

export default function ParikramaCard({ parikrama, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, shadows.sm]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <Badge label={parikrama.distance} variant="gold" icon="📏" />
        <Badge label={parikrama.difficulty} variant="purple" />
      </View>

      {/* Main Title & Subtitle */}
      <AppText variant="h3" color={colors.navy} style={styles.title}>
        {parikrama.title}
      </AppText>
      <AppText variant="caption" color={colors.primary} weight="600" style={styles.subtitle}>
        {parikrama.subtitle}
      </AppText>

      {/* Overview */}
      <AppText
        variant="body"
        color={colors.charcoal}
        numberOfLines={3}
        style={styles.overview}
      >
        {parikrama.overview}
      </AppText>

      {/* Quick Details Pills */}
      <View style={styles.detailsRow}>
        <View style={styles.detailPill}>
          <AppText variant="caption" color={colors.muted}>⏱️ अवधि:</AppText>
          <AppText variant="caption" weight="700" color={colors.charcoal}>
            {parikrama.duration?.split('(')[0]?.trim()}
          </AppText>
        </View>

        <View style={styles.detailPill}>
          <AppText variant="caption" color={colors.muted}>🚩 आरंभ स्थल:</AppText>
          <AppText variant="caption" weight="700" color={colors.navy} numberOfLines={1}>
            {parikrama.startPoint?.split('/')[0]?.trim()}
          </AppText>
        </View>
      </View>

      {/* Major Stops preview */}
      {parikrama.sections && parikrama.sections[0]?.stops && (
        <View style={styles.stopsBox}>
          <AppText variant="caption" weight="700" color={colors.primary} style={styles.stopsHeader}>
            🛕 प्रमुख पड़ाव:
          </AppText>
          <View style={styles.stopsWrap}>
            {parikrama.sections.flatMap(s => s.stops).slice(0, 4).map((stop, idx) => (
              <View key={idx} style={styles.stopChip}>
                <AppText variant="caption" color={colors.navy} weight="600">
                  {stop.name?.split('(')[0]?.trim()}
                </AppText>
              </View>
            ))}
            <View style={[styles.stopChip, styles.moreChip]}>
              <AppText variant="caption" color={colors.primary} weight="700">
                +नियम व दिशानिर्देश
              </AppText>
            </View>
          </View>
        </View>
      )}

      {/* Footer CTA */}
      <View style={styles.footerRow}>
        <View style={styles.ctaWrap}>
          <MorpankhIcon size={18} />
          <AppText variant="caption" weight="700" color={colors.primary}>
            संपूर्ण परिक्रमा नियम व पड़ाव देखें
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
  subtitle: {
    marginBottom: spacing.xs,
  },
  overview: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailPill: {
    flex: 1,
    backgroundColor: colors.surfaceGold,
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stopsBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: radii.md,
    padding: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  stopsHeader: {
    marginBottom: 4,
  },
  stopsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  stopChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  moreChip: {
    backgroundColor: '#FEF3C7',
    borderColor: colors.gold,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    marginTop: spacing.xxs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
