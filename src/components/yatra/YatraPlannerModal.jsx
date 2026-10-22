import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';
import { AppText, Badge, AppButton, MorpankhIcon } from '../common';
import yatraPlans from '../../data/yatra.json';

export default function YatraPlannerModal({ visible, onClose, onSelectDay }) {
  const [selectedDays, setSelectedDays] = useState(3);
  const [pace, setPace] = useState('moderate'); // 'relaxed' | 'moderate' | 'fast'

  const filteredPlans = yatraPlans.slice(0, selectedDays);

  // Dynamic budget calculation based on selected days and pace
  const paceMultiplier = pace === 'relaxed' ? 0.9 : pace === 'fast' ? 1.2 : 1.0;
  const baseMinBudget = selectedDays * 700 * paceMultiplier;
  const baseMaxBudget = selectedDays * 1200 * paceMultiplier;

  const totalPlaces = filteredPlans.reduce(
    (acc, plan) => acc + (plan.places ? plan.places.length : 0),
    0
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.iconCircle}>
                <AppText variant="h3">✨</AppText>
              </View>
              <View>
                <AppText variant="h3" color={colors.navy}>
                  स्मार्ट ब्रज यात्रा प्लानर
                </AppText>
                <AppText variant="caption" color={colors.muted}>
                  अपनी पसंद के अनुसार अनुकूलित कार्यक्रम बनाएं
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <AppText variant="body" weight="700" color={colors.muted}>
                ✕
              </AppText>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Step 1: Duration Selector */}
            <View style={styles.section}>
              <AppText variant="caption" weight="700" color={colors.primary} style={styles.stepTag}>
                चरण 1 • यात्रा की अवधि
              </AppText>
              <AppText variant="h3" color={colors.navy} style={styles.sectionHeading}>
                कितने दिनों की यात्रा प्लान करना चाहते हैं?
              </AppText>

              <View style={styles.daysRow}>
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const isActive = selectedDays === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.dayPill,
                        isActive && styles.dayPillActive,
                      ]}
                      onPress={() => setSelectedDays(num)}
                      activeOpacity={0.8}
                    >
                      <AppText
                        variant="caption"
                        weight="700"
                        color={isActive ? colors.surface : colors.charcoal}
                      >
                        {num} दिन
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Step 2: Pace Selector */}
            <View style={styles.section}>
              <AppText variant="caption" weight="700" color={colors.primary} style={styles.stepTag}>
                चरण 2 • दर्शन की गति (Travel Pace)
              </AppText>
              <AppText variant="h3" color={colors.navy} style={styles.sectionHeading}>
                आपकी यात्रा की शैली कैसी हो?
              </AppText>

              <View style={styles.paceCardsWrap}>
                {/* Relaxed */}
                <TouchableOpacity
                  style={[
                    styles.paceCard,
                    pace === 'relaxed' && styles.paceCardActive,
                  ]}
                  onPress={() => setPace('relaxed')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paceHeader}>
                    <AppText variant="body">🌿</AppText>
                    <AppText
                      variant="body"
                      weight="700"
                      color={pace === 'relaxed' ? colors.primary : colors.navy}
                    >
                      आरामदायक (Relaxed)
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.muted}>
                    प्रतिदिन 2-3 प्रमुख मंदिर, वरिष्ठ जनों व परिवार के लिए सर्वोत्तम
                  </AppText>
                </TouchableOpacity>

                {/* Moderate */}
                <TouchableOpacity
                  style={[
                    styles.paceCard,
                    pace === 'moderate' && styles.paceCardActive,
                  ]}
                  onPress={() => setPace('moderate')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paceHeader}>
                    <AppText variant="body">⚖️</AppText>
                    <AppText
                      variant="body"
                      weight="700"
                      color={pace === 'moderate' ? colors.primary : colors.navy}
                    >
                      संतुलित (Balanced)
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.muted}>
                    मंदिर दर्शन + विश्राम + स्थानीय ब्रज खान-पान व यमुना आरती
                  </AppText>
                </TouchableOpacity>

                {/* Fast */}
                <TouchableOpacity
                  style={[
                    styles.paceCard,
                    pace === 'fast' && styles.paceCardActive,
                  ]}
                  onPress={() => setPace('fast')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paceHeader}>
                    <AppText variant="body">⚡</AppText>
                    <AppText
                      variant="body"
                      weight="700"
                      color={pace === 'fast' ? colors.primary : colors.navy}
                    >
                      तीव्र दर्शन (Fast-track)
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.muted}>
                    अधिकतम स्थल एवं परिक्रमा कम समय में पूर्ण करने हेतु
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Generated Summary Card */}
            <View style={[styles.summaryCard, shadows.sm]}>
              <View style={styles.summaryTop}>
                <AppText variant="h3" color={colors.navy}>
                  📊 यात्रा का अनुमानित विवरण
                </AppText>
                <Badge label={`${selectedDays} दिन की यात्रा`} variant="gold" />
              </View>

              <View style={styles.summaryMetricsRow}>
                <View style={styles.metricItem}>
                  <AppText variant="caption" color={colors.muted}>💰 कुल अनुमानित खर्च</AppText>
                  <AppText variant="body" weight="700" color={colors.primary}>
                    ₹{Math.round(baseMinBudget)} - ₹{Math.round(baseMaxBudget)}
                  </AppText>
                  <AppText variant="caption" color={colors.muted}>(प्रति व्यक्ति)</AppText>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <AppText variant="caption" color={colors.muted}>🛕 दर्शनीय स्थल</AppText>
                  <AppText variant="body" weight="700" color={colors.navy}>
                    {totalPlaces}+ पवित्र स्थल
                  </AppText>
                  <AppText variant="caption" color={colors.muted}>संपूर्ण ब्रज मण्डल</AppText>
                </View>
              </View>
            </View>

            {/* Itinerary Preview Breakdown */}
            <View style={styles.section}>
              <AppText variant="h3" color={colors.navy} style={styles.sectionHeading}>
                📋 प्रस्तावित दैनिक कार्यक्रम ({selectedDays} दिन):
              </AppText>

              {filteredPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.dayRow}
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    onSelectDay?.(plan);
                  }}
                >
                  <View style={styles.dayBadgeCol}>
                    <Badge label={plan.day} variant="gold" />
                  </View>

                  <View style={styles.dayDetailsCol}>
                    <AppText variant="body" weight="700" color={colors.navy}>
                      {plan.title}
                    </AppText>
                    <AppText
                      variant="caption"
                      color={colors.muted}
                      numberOfLines={1}
                      style={styles.placesPreview}
                    >
                      📍 {plan.places?.slice(0, 3).join(' • ')}...
                    </AppText>
                    <View style={styles.dayMeta}>
                      <AppText variant="caption" color={colors.primary} weight="600">
                        💰 {plan.estimatedBudget}
                      </AppText>
                      <AppText variant="caption" color={colors.charcoal}>
                        🚗 {plan.transport}
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="body" color={colors.primary} weight="700">
                    ›
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <AppButton
              title="चयनित यात्रा कार्यक्रम पर जाएं"
              variant="primary"
              size="lg"
              icon={<MorpankhIcon size={20} />}
              onPress={() => {
                onClose();
                onSelectDay?.(filteredPlans[0]);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollArea: {
    paddingHorizontal: spacing.base,
  },
  scrollContent: {
    paddingVertical: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  stepTag: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sectionHeading: {
    marginBottom: spacing.xs,
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  dayPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  dayPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paceCardsWrap: {
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  paceCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paceCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFBEB',
  },
  paceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.md,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayBadgeCol: {
    marginRight: spacing.xs,
  },
  dayDetailsCol: {
    flex: 1,
    marginRight: spacing.xs,
  },
  placesPreview: {
    marginVertical: 2,
  },
  dayMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
