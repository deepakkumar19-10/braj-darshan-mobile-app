/**
 * Braj Darshan - Plan length sheet
 * Bottom sheet opened from a day plan: choose how many days (1–6) and a pace,
 * see which day plans from src/data/yatra.json that covers, and jump to a day.
 *
 * onSelectDay(day, dayIds) — the chosen day and the ids of every day in the plan.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';
import { Button, Card, Chip, IconButton, InfoNote, ListRow, GUTTER } from '../ui';
import yatraPlans from '../../data/yatra.json';

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6];

const PACES = [
  {
    id: 'relaxed',
    hi: 'आरामदायक',
    en: 'Relaxed',
    noteHi: 'हर दिन 2–3 मुख्य स्थान चुनें और दोपहर में विश्राम करें।',
    noteEn: 'Pick 2–3 main places each day and rest in the afternoon.',
  },
  {
    id: 'moderate',
    hi: 'संतुलित',
    en: 'Balanced',
    noteHi: 'मुख्य दर्शन, आरती और मंदिर बंद रहने के समय विश्राम।',
    noteEn: 'Main darshans and aartis, with rest while temples are closed.',
  },
  {
    id: 'fast',
    hi: 'तेज़',
    en: 'Faster',
    noteHi: 'जल्दी शुरू करें; अधिक स्थान, पर लंबे दिन। अपने समूह की थकान का ध्यान रखें।',
    noteEn: 'Start early; more places but longer days. Watch for tiredness in your group.',
  },
];

export default function YatraPlannerModal({ visible, onClose, onSelectDay, initialDays }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const [selectedDays, setSelectedDays] = useState(
    DAY_OPTIONS.includes(initialDays) ? initialDays : 3
  );
  const [pace, setPace] = useState('moderate');

  // Start from the current plan length each time the sheet opens.
  useEffect(() => {
    if (visible && DAY_OPTIONS.includes(initialDays)) setSelectedDays(initialDays);
  }, [visible, initialDays]);

  const planDays = yatraPlans.slice(0, selectedDays);
  const dayIds = planDays.map((d) => d.id);
  const paceInfo = PACES.find((p) => p.id === pace) || PACES[1];

  const choose = (day) => {
    if (!day) return;
    onClose();
    if (onSelectDay) onSelectDay(day, dayIds);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.overlay, { backgroundColor: colors.overlayDark }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.flex}>
              <AppText variant="h3" weight="700" color={colors.navy}>
                {isHindi ? 'योजना के दिन चुनें' : 'Choose plan length'}
              </AppText>
              <AppText variant="caption" color={colors.muted}>
                {isHindi ? 'सुझाई गई दिन-योजनाएं, बुकिंग नहीं' : 'Suggested day plans, not bookings'}
              </AppText>
            </View>
            <IconButton icon="close" onPress={onClose} accessibilityLabel={isHindi ? 'बंद करें' : 'Close'} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View>
              <AppText variant="bodyBold" color={colors.navy} style={styles.label}>
                {isHindi ? 'कितने दिन?' : 'How many days?'}
              </AppText>
              <View style={styles.chipRow}>
                {DAY_OPTIONS.map((n) => (
                  <Chip
                    key={n}
                    label={isHindi ? `${n} दिन` : `${n} ${n === 1 ? 'day' : 'days'}`}
                    selected={selectedDays === n}
                    onPress={() => setSelectedDays(n)}
                  />
                ))}
              </View>
            </View>

            <View>
              <AppText variant="bodyBold" color={colors.navy} style={styles.label}>
                {isHindi ? 'गति' : 'Pace'}
              </AppText>
              <View style={styles.chipRow}>
                {PACES.map((p) => (
                  <Chip
                    key={p.id}
                    label={isHindi ? p.hi : p.en}
                    selected={pace === p.id}
                    onPress={() => setPace(p.id)}
                  />
                ))}
              </View>
              <AppText variant="caption" color={colors.textSecondary} style={styles.gapSmall}>
                {isHindi ? paceInfo.noteHi : paceInfo.noteEn}
              </AppText>
            </View>

            <View>
              <AppText variant="bodyBold" color={colors.navy} style={styles.label}>
                {isHindi ? `इस योजना के दिन (${selectedDays})` : `Days in this plan (${selectedDays})`}
              </AppText>
              <Card style={styles.listCard}>
                {planDays.map((day, i) => (
                  <View key={day.id}>
                    {i > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                    <ListRow
                      icon="calendar"
                      title={isHindi ? `दिन ${i + 1} · ${day.title}` : `Day ${i + 1} · ${day.titleEn}`}
                      subtitle={isHindi ? day.tagline : day.taglineEn}
                      onPress={() => choose(day)}
                    />
                  </View>
                ))}
              </Card>
            </View>

            <InfoNote>
              {isHindi
                ? 'समय केवल सुझाव हैं। त्योहारों पर बदल सकते हैं — कृपया स्थानीय पुष्टि करें।'
                : 'Times are suggestions. They may change on festivals — confirm locally.'}
            </InfoNote>
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { borderTopColor: colors.border, backgroundColor: colors.surface, paddingBottom: insets.bottom + 12 },
            ]}
          >
            <Button
              title={isHindi ? 'दिन 1 से शुरू करें' : 'Start with Day 1'}
              icon="route"
              onPress={() => choose(planDays[0])}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  scroll: { flexGrow: 0, flexShrink: 1 },
  scrollContent: { paddingHorizontal: GUTTER, paddingVertical: 16, gap: 20 },
  label: { marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gapSmall: { marginTop: 8 },
  listCard: { paddingVertical: 4 },
  divider: { height: 1 },
  footer: {
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
