import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';
import { AppText, SectionTag, Badge } from '../common';
import { calculatePanchang } from '../../services/panchangService';

export default function PanchangWidget({ onOpenPanchang }) {
  const panchang = useMemo(() => {
    return calculatePanchang(new Date());
  }, []);

  const formattedDate = useMemo(() => {
    const today = new Date();
    const monthsHi = [
      'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    return `${today.getDate()} ${monthsHi[today.getMonth()]} ${today.getFullYear()}`;
  }, []);

  return (
    <TouchableOpacity
      style={[styles.container, shadows.sm]}
      activeOpacity={0.85}
      onPress={onOpenPanchang}
    >
      <View style={styles.headerRow}>
        <SectionTag text="🕉️ आज का वैदिक पंचांग" />
        <Badge
          label={panchang.pakshaHi}
          variant={panchang.pakshaHi.includes('शुक्ल') ? 'gold' : 'purple'}
        />
      </View>

      <AppText variant="h3" color={colors.navy} style={styles.dateText}>
        {formattedDate} • संवत {panchang.samvat}
      </AppText>
      <AppText variant="caption" color={colors.primary} weight="600" style={styles.tithiText}>
        तिथि: {panchang.tithiHi} • {panchang.nakshatraHi} नक्षत्र
      </AppText>

      {panchang.festival && (
        <View style={styles.festivalBanner}>
          <AppText variant="caption" color={colors.primaryDark} weight="700">
            {panchang.festival.badge} {panchang.festival.shortHi}
          </AppText>
        </View>
      )}

      <View style={styles.grid}>
        <View style={styles.cell}>
          <AppText variant="caption" color={colors.muted}>अभिजीत मुहूर्त (शुभ)</AppText>
          <AppText variant="body" weight="700" color={colors.success}>
            {panchang.abhijitMuhurat}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.cell}>
          <AppText variant="caption" color={colors.muted}>राहुकाल (वर्जित)</AppText>
          <AppText variant="body" weight="700" color={colors.error}>
            {panchang.rahukaal}
          </AppText>
        </View>
      </View>

      <View style={styles.footerRow}>
        <AppText variant="caption" color={colors.muted}>
          🌅 {panchang.sunrise}  •  🌇 {panchang.sunset}
        </AppText>
        <AppText variant="caption" weight="700" color={colors.primary}>
          दैनिक पंचांग व चौघड़िया खोलें ›
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateText: {
    marginTop: spacing.xxs,
  },
  tithiText: {
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  festivalBanner: {
    backgroundColor: colors.surfaceGold,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceGold,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.xs,
  },
  cell: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderGold,
    marginHorizontal: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
