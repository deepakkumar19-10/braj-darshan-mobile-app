import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
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
import parikramaData from '../../data/parikrama.json';

export default function ParikramaDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { id, parikrama: initialParikrama } = route.params || {};

  const parikrama =
    initialParikrama ||
    parikramaData.find((p) => p.id === id || String(p.id) === String(id)) ||
    parikramaData[0];

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${parikrama.title} ${parikrama.startPoint} Braj`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader
        title={parikrama.title}
        subtitle={`${parikrama.distance} • ${parikrama.duration?.split('(')[0]?.trim()}`}
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
            <Badge label={parikrama.distance} variant="gold" icon="📏" />
            <Badge label={parikrama.difficulty} variant="purple" />
          </View>

          <AppText variant="h1" color={colors.navy} style={styles.heroTitle}>
            {parikrama.title}
          </AppText>
          <AppText variant="caption" color={colors.muted} style={styles.titleEn}>
            {parikrama.titleEn}
          </AppText>

          <AppText variant="body" weight="600" color={colors.primary} style={styles.subtitle}>
            {parikrama.subtitle}
          </AppText>

          <AppText variant="body" color={colors.charcoal} style={styles.overview}>
            {parikrama.overview}
          </AppText>

          {/* Quick Info Meta */}
          <View style={styles.metaBox}>
            <View style={styles.metaRow}>
              <AppText variant="caption" color={colors.muted} style={styles.metaLabel}>
                🚩 आरंभ स्थल:
              </AppText>
              <AppText variant="caption" weight="700" color={colors.navy} style={styles.metaValue}>
                {parikrama.startPoint}
              </AppText>
            </View>

            <View style={styles.metaRow}>
              <AppText variant="caption" color={colors.muted} style={styles.metaLabel}>
                ⏰ सर्वोत्तम समय:
              </AppText>
              <AppText variant="caption" weight="700" color={colors.charcoal} style={styles.metaValue}>
                {parikrama.bestTime}
              </AppText>
            </View>

            <View style={styles.metaRow}>
              <AppText variant="caption" color={colors.muted} style={styles.metaLabel}>
                ⏱️ अनुमानित समय:
              </AppText>
              <AppText variant="caption" weight="700" color={colors.primary} style={styles.metaValue}>
                {parikrama.duration}
              </AppText>
            </View>
          </View>
        </View>

        {/* Route Sections & Stops */}
        {parikrama.sections?.map((section, sIdx) => (
          <View key={sIdx} style={[styles.card, shadows.sm]}>
            <SectionTag text={`चरण ${sIdx + 1} • परिक्रमा मार्ग`} />
            <AppText variant="h3" color={colors.navy} style={styles.sectionTitle}>
              {section.name}
            </AppText>

            <View style={styles.stopsList}>
              {section.stops?.map((stop, idx) => (
                <View key={idx} style={styles.stopItem}>
                  <View style={styles.stopBadge}>
                    <AppText variant="caption" weight="700" color={colors.surface}>
                      {idx + 1}
                    </AppText>
                  </View>
                  <View style={styles.stopContent}>
                    <AppText variant="body" weight="700" color={colors.navy}>
                      {stop.name}
                    </AppText>
                    <AppText variant="body" color={colors.charcoal} style={styles.stopDesc}>
                      {stop.desc}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sacred Rules & Discipline Card */}
        {parikrama.rules && parikrama.rules.length > 0 && (
          <View style={[styles.card, styles.rulesCard, shadows.sm]}>
            <SectionTag text="🕉️ आवश्यक परिक्रमा नियम" />
            <AppText variant="h3" color={colors.primary} style={styles.sectionTitle}>
              पावन परिक्रमा मर्यादा व नियम
            </AppText>

            <View style={styles.rulesList}>
              {parikrama.rules.map((rule, idx) => (
                <View key={idx} style={styles.ruleRow}>
                  <AppText variant="body" color={colors.primary} style={styles.ruleBullet}>
                    🪷
                  </AppText>
                  <AppText variant="body" color={colors.charcoal} style={styles.ruleText}>
                    {rule}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips Box */}
        {Boolean(parikrama.tips) && (
          <View style={[styles.card, styles.tipCard]}>
            <AppText variant="h3" color={colors.navy} style={styles.tipHeading}>
              💡 तीर्थयात्री विशेष सुझाव
            </AppText>
            <AppText variant="body" color={colors.charcoal} style={styles.tipText}>
              {parikrama.tips}
            </AppText>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <AppButton
            title="परिक्रमा प्रस्थान बिंदु का नक्शा देखें"
            variant="primary"
            size="lg"
            icon={<AppText variant="body">🗺️</AppText>}
            onPress={handleOpenMaps}
            style={styles.mapBtn}
          />

          <AppButton
            title="वापस यात्रा व परिक्रमा सूची पर जाएं"
            variant="outline"
            size="md"
            icon={<MorpankhIcon size={20} />}
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
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
  subtitle: {
    marginBottom: spacing.sm,
  },
  overview: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  metaBox: {
    backgroundColor: colors.surfaceGold,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaLabel: {
    width: 100,
  },
  metaValue: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  stopsList: {
    gap: spacing.md,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stopBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  stopContent: {
    flex: 1,
  },
  stopDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
    color: colors.muted,
  },
  rulesCard: {
    backgroundColor: '#FFFDF5',
    borderColor: colors.gold,
  },
  rulesList: {
    gap: spacing.sm,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ruleBullet: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: colors.surfaceGold,
    borderColor: colors.borderGold,
  },
  tipHeading: {
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
  actionButtons: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  mapBtn: {
    marginBottom: spacing.xxs,
  },
});
