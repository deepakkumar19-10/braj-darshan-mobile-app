import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';
import { AppText, SectionTag, Badge, AppButton, MorpankhIcon } from '../common';

export const UPCOMING_FESTIVALS = [
  {
    id: 'sharad-purnima-2026',
    nameHi: 'शरद पूर्णिमा (महारास महोत्सव)',
    nameEn: 'Sharad Purnima (Maharaas Mahotsav)',
    targetIso: '2026-10-25T00:00:00+05:30',
    locationHi: 'वृंदावन एवं चंद्र सरोवर',
    taglineHi: 'अमृतमयी चंद्र किरणों में भगवान का अलौकिक महारास',
  },
  {
    id: 'govardhan-puja-2026',
    nameHi: 'गोवर्धन पूजा एवं अन्नकूट महोत्सव',
    nameEn: 'Govardhan Puja & Annakoot Festival',
    targetIso: '2026-11-09T00:00:00+05:30',
    locationHi: 'गोवर्धन पर्वत (गिरिराज धाम)',
    taglineHi: '56 भोग दर्शन एवं 21 किमी सप्तकोसीय गिरिराज परिक्रमा',
  },
  {
    id: 'devutthana-2026',
    nameHi: 'देवउठनी एकादशी (तुलसी विवाह)',
    nameEn: 'Devutthana Ekadashi (Tulsi Vivah)',
    targetIso: '2026-11-20T00:00:00+05:30',
    locationHi: 'समस्त ब्रज मंडल',
    taglineHi: 'चातुर्मास समाप्ति व समस्त मांगलिक कार्यों का शुभारंभ',
  },
  {
    id: 'lathmar-holi-2027',
    nameHi: 'बरसाना लट्ठमार होली महोत्सव',
    nameEn: 'Barsana Lathmar Holi Celebration',
    targetIso: '2027-02-16T00:00:00+05:30',
    locationHi: 'बरसाना धाम',
    taglineHi: 'विश्वप्रसिद्ध रंग-गुलाल एवं प्रेममयी लट्ठमार होली',
  },
  {
    id: 'janmashtami-2027',
    nameHi: 'श्री कृष्ण जन्माष्टमी 2027',
    nameEn: 'Shri Krishna Janmashtami 2027',
    targetIso: '2027-08-25T00:00:00+05:30',
    locationHi: 'मथुरा एवं वृंदावन',
    taglineHi: 'भगवान श्री कृष्ण का 5254वाँ पावन प्राकट्योत्सव',
  },
];

export function getActiveUpcomingFestival(now = new Date()) {
  const currentTime = now.getTime();
  const future = UPCOMING_FESTIVALS.filter(
    (f) => new Date(f.targetIso).getTime() > currentTime
  );
  return future.length > 0 ? future[0] : UPCOMING_FESTIVALS[0];
}

export default function FestivalCountdown({ onDetailsPress }) {
  const [activeFestival] = useState(() => getActiveUpcomingFestival());
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(activeFestival.targetIso));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(activeFestival.targetIso));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeFestival.targetIso]);

  function calculateTimeLeft(targetIso) {
    const diff = new Date(targetIso).getTime() - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, isPast: false };
  }

  const formatDigit = (n) => String(n).padStart(2, '0');

  return (
    <View style={[styles.container, shadows.md]}>
      {/* Header Badge */}
      <View style={styles.topRow}>
        <SectionTag text="🎉 आगामी पावन पर्व" />
        <Badge label="लाइव काउंटडाउन" variant="gold" icon="⏰" />
      </View>

      {/* Festival Title */}
      <AppText variant="h2" color={colors.navy} style={styles.title}>
        {activeFestival.nameHi}
      </AppText>
      <AppText variant="caption" color={colors.muted} style={styles.subTitle}>
        {activeFestival.locationHi}
      </AppText>
      <AppText variant="body" color={colors.charcoal} style={styles.tagline}>
        "{activeFestival.taglineHi}"
      </AppText>

      {/* 4 Time Digit Boxes */}
      <View style={styles.digitsGrid}>
        <View style={styles.digitCard}>
          <AppText variant="h1" color={colors.primary} style={styles.digitText}>
            {formatDigit(timeLeft.days)}
          </AppText>
          <AppText variant="caption" weight="600" color={colors.muted} style={styles.unitLabel}>
            दिन (Days)
          </AppText>
        </View>

        <View style={styles.separator}>
          <AppText variant="h2" color={colors.borderGold}>:</AppText>
        </View>

        <View style={styles.digitCard}>
          <AppText variant="h1" color={colors.primary} style={styles.digitText}>
            {formatDigit(timeLeft.hours)}
          </AppText>
          <AppText variant="caption" weight="600" color={colors.muted} style={styles.unitLabel}>
            घंटे (Hours)
          </AppText>
        </View>

        <View style={styles.separator}>
          <AppText variant="h2" color={colors.borderGold}>:</AppText>
        </View>

        <View style={styles.digitCard}>
          <AppText variant="h1" color={colors.primary} style={styles.digitText}>
            {formatDigit(timeLeft.minutes)}
          </AppText>
          <AppText variant="caption" weight="600" color={colors.muted} style={styles.unitLabel}>
            मिनट (Min)
          </AppText>
        </View>

        <View style={styles.separator}>
          <AppText variant="h2" color={colors.borderGold}>:</AppText>
        </View>

        <View style={styles.digitCard}>
          <AppText variant="h1" color={colors.accentGold} style={styles.digitText}>
            {formatDigit(timeLeft.seconds)}
          </AppText>
          <AppText variant="caption" weight="600" color={colors.muted} style={styles.unitLabel}>
            सेकंड (Sec)
          </AppText>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionRow}>
        <AppButton
          title="उत्सव व मेला सूची देखें"
          variant="primary"
          size="sm"
          icon={<MorpankhIcon size={18} />}
          onPress={onDetailsPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    marginBottom: spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  digitsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceGold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.md,
  },
  digitCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  separator: {
    paddingBottom: 14,
  },
  actionRow: {
    alignItems: 'flex-start',
  },
});
