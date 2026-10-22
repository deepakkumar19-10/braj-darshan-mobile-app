import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radii, shadows } from '../../theme';
import {
  AppText,
  AppHeader,
  Badge,
  AppButton,
  SectionTag,
  MorpankhIcon,
} from '../../components/common';
import YatraPlannerModal from '../../components/yatra/YatraPlannerModal';
import yatraData from '../../data/yatra.json';

export default function YatraDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { id, yatra: initialYatra } = route.params || {};
  const [plannerVisible, setPlannerVisible] = useState(false);

  const yatra =
    initialYatra ||
    yatraData.find((y) => y.id === id || String(y.id) === String(id)) ||
    yatraData[0];

  const handleOpenMaps = () => {
    const firstPlace = yatra.places?.[0] || yatra.title;
    const query = encodeURIComponent(`${firstPlace} Braj`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader
        title={yatra.title}
        subtitle={`${yatra.day} • ${yatra.duration}`}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={[styles.heroCard, shadows.md]}>
          <View style={styles.badgeRow}>
            <Badge label={yatra.day} variant="gold" icon="🚩" />
            <Badge label={yatra.duration} variant="purple" icon="🕐" />
          </View>

          <AppText variant="h1" color={colors.navy} style={styles.heroTitle}>
            {yatra.title}
          </AppText>
          {Boolean(yatra.titleEn) && (
            <AppText variant="caption" color={colors.muted} style={styles.titleEn}>
              {yatra.titleEn}
            </AppText>
          )}

          <AppText variant="body" color={colors.charcoal} style={styles.tagline}>
            {yatra.tagline}
          </AppText>

          {/* Quick Info Grid */}
          <View style={styles.quickInfoGrid}>
            <View style={styles.infoPill}>
              <AppText variant="caption" color={colors.muted}>🚗 सुलभ वाहन</AppText>
              <AppText variant="caption" weight="700" color={colors.navy}>
                {yatra.transport}
              </AppText>
            </View>

            <View style={styles.infoPill}>
              <AppText variant="caption" color={colors.muted}>💰 अनुमानित व्यय</AppText>
              <AppText variant="caption" weight="700" color={colors.primary}>
                {yatra.estimatedBudget}
              </AppText>
            </View>

            <View style={styles.infoPill}>
              <AppText variant="caption" color={colors.muted}>⏰ उत्तम समय</AppText>
              <AppText variant="caption" weight="700" color={colors.charcoal}>
                {yatra.bestTime}
              </AppText>
            </View>
          </View>
        </View>

        {/* Major Sites Included */}
        {yatra.places && yatra.places.length > 0 && (
          <View style={[styles.card, shadows.sm]}>
            <SectionTag text="📍 यात्रा में सम्मिलित पवित्र स्थल" />
            <AppText variant="h3" color={colors.navy} style={styles.cardHeading}>
              प्रमुख दर्शनीय स्थल ({yatra.places.length})
            </AppText>
            <View style={styles.placesList}>
              {yatra.places.map((place, idx) => (
                <View key={idx} style={styles.placeBadgeWrap}>
                  <View style={styles.placeNumCircle}>
                    <AppText variant="caption" weight="700" color={colors.surface}>
                      {idx + 1}
                    </AppText>
                  </View>
                  <AppText variant="caption" weight="700" color={colors.navy}>
                    {place}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Step-by-Step Stops / Timeline Schedule */}
        <View style={[styles.card, shadows.sm]}>
          <SectionTag text="⏰ दैनिक दर्शन समय सारणी" />
          <AppText variant="h3" color={colors.navy} style={styles.cardHeading}>
            चरणबद्ध दर्शन कार्यक्रम (Step-by-Step Schedule)
          </AppText>

          {yatra.stops?.map((stop, index) => {
            // Split by " - " to separate time and description if available
            const parts = stop.split(' - ');
            const timePart = parts.length > 1 ? parts[0] : null;
            const descPart = parts.length > 1 ? parts.slice(1).join(' - ') : stop;

            return (
              <View key={index} style={styles.stopRow}>
                <View style={styles.timelinePoint}>
                  <View style={styles.dot} />
                  {index < yatra.stops.length - 1 && <View style={styles.line} />}
                </View>

                <View style={styles.stopContentWrap}>
                  {timePart && (
                    <View style={styles.timeTag}>
                      <AppText variant="caption" weight="700" color={colors.primary}>
                        ⏱️ {timePart}
                      </AppText>
                    </View>
                  )}
                  <AppText variant="body" color={colors.charcoal} style={styles.stopText}>
                    {descPart}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>

        {/* Travel Tips */}
        {Boolean(yatra.tips) && (
          <View style={[styles.card, styles.tipCard, shadows.sm]}>
            <SectionTag text="💡 तीर्थयात्री विशेष निर्देश" />
            <AppText variant="h3" color={colors.primary} style={styles.cardHeading}>
              महत्वपूर्ण यात्रा सुझाव
            </AppText>
            <AppText variant="body" color={colors.charcoal} style={styles.tipText}>
              {yatra.tips}
            </AppText>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsBox}>
          <AppButton
            title="Google Maps पर प्रथम स्थल देखें"
            variant="primary"
            size="lg"
            icon={<AppText variant="body">🗺️</AppText>}
            onPress={handleOpenMaps}
          />

          <AppButton
            title="✨ अपनी पसंद से अनुकूलित प्लान बनाएं"
            variant="secondary"
            size="md"
            onPress={() => setPlannerVisible(true)}
          />

          <AppButton
            title="वापस यात्रा सूची पर जाएं"
            variant="outline"
            size="md"
            icon={<MorpankhIcon size={20} />}
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>

      {/* Yatra Planner Modal */}
      <YatraPlannerModal
        visible={plannerVisible}
        onClose={() => setPlannerVisible(false)}
        onSelectDay={(newPlan) => {
          navigation.setParams({ id: newPlan.id, yatra: newPlan });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    marginTop: spacing.xxs,
    marginBottom: 2,
    lineHeight: 28,
  },
  titleEn: {
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.charcoal,
    marginTop: spacing.xxs,
    marginBottom: spacing.sm,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoPill: {
    flex: 1,
    backgroundColor: colors.surfaceGold,
    padding: spacing.xs,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeading: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  placesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  placeBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceGold,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
    gap: 6,
  },
  placeNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  timelinePoint: {
    width: 24,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borderGold,
    marginTop: 2,
  },
  stopContentWrap: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  timeTag: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginBottom: 4,
  },
  stopText: {
    fontSize: 13,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderColor: colors.borderGold,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
  actionsBox: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
