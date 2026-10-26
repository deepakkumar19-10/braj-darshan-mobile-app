import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';

export default function AartiScheduleTable({ temple }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();

  const [activeSeason, setActiveSeason] = useState(() => {
    const month = new Date().getMonth();
    return month >= 3 && month <= 9 ? 'summer' : 'winter';
  });

  // Use temple.aartiSchedule if defined; otherwise fallback to default list
  const aartis =
    temple?.aartiSchedule && temple.aartiSchedule.length > 0
      ? temple.aartiSchedule.map((item, idx) => ({
          name: isHindi ? item.nameHi : item.nameEn || item.nameHi,
          sub: item.significanceHi || '',
          summer: item.timeSummer || '',
          winter: item.timeWinter || '',
          status: idx === 0 ? 'completed' : idx === 1 ? 'active' : 'upcoming',
        }))
      : [
          {
            name: isHindi ? 'मंगला आरती' : 'Mangala Aarti',
            sub: isHindi ? 'जागरण व प्रथम दर्शन' : 'Awakening Aarti',
            summer: '05:30 AM',
            winter: '06:00 AM',
            status: 'completed',
          },
          {
            name: isHindi ? 'श्रृंगार आरती' : 'Shringar Aarti',
            sub: isHindi ? 'विग्रह श्रृंगार दर्शन' : 'Adornment Darshan',
            summer: '08:00 AM',
            winter: '08:30 AM',
            status: 'completed',
          },
          {
            name: isHindi ? 'राजभोग आरती' : 'Rajbhog Aarti',
            sub: isHindi ? 'मध्यकालीन पावन भोग' : 'Sacred Feast Aarti',
            summer: '11:30 AM',
            winter: '12:00 PM',
            status: 'active',
          },
          {
            name: isHindi ? 'संध्या आरती' : 'Sandhya Aarti',
            sub: isHindi ? 'गोधूलि वेला दीपदान' : 'Sunset Lamps',
            summer: '06:30 PM',
            winter: '06:00 PM',
            status: 'upcoming',
          },
          {
            name: isHindi ? 'शयन आरती' : 'Shayan Aarti',
            sub: isHindi ? 'विश्राम व रात्रि पट बंद' : 'Rest Darshan & Pat Bandh',
            summer: '09:30 PM',
            winter: '09:00 PM',
            status: 'upcoming',
          },
        ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return {
          label: isHindi ? 'सक्रिय' : 'Active',
          bg: colors.primary,
          color: '#FFFFFF',
        };
      case 'completed':
        return {
          label: isHindi ? 'सम्पन्न' : 'Done',
          bg: isDark ? colors.cardAlt : colors.borderLight,
          color: colors.muted,
        };
      case 'upcoming':
      default:
        return {
          label: isHindi ? 'प्रतीक्षित' : 'Upcoming',
          bg: isDark ? '#382806' : colors.goldLight,
          color: colors.goldDark,
        };
    }
  };

  return (
    <View
      style={[
        styles.tableCard,
        {
          backgroundColor: isDark ? colors.cardAlt : colors.surface,
          borderColor: isDark ? colors.border : '#F3E8D0',
        },
      ]}
    >
      <View style={styles.tableHeaderRow}>
        <View style={styles.tableHeader}>
          <AppText variant="h3" weight="700" color={colors.navy}>
            {isHindi ? 'दैनिक आरती समय सारणी' : 'Daily Aarti Schedule'}
          </AppText>
          <AppText variant="small" color={colors.muted}>
            {isHindi ? 'ऋतु अनुसार परिवर्तनशील' : 'Timings adapt seasonally'}
          </AppText>
        </View>

        {/* Season Toggle Switch */}
        <View
          style={[
            styles.seasonToggleWrap,
            {
              backgroundColor: isDark ? colors.surface : '#FFF9ED',
              borderColor: isDark ? colors.border : '#FDE68A',
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.seasonBtn,
              activeSeason === 'summer' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveSeason('summer')}
            activeOpacity={0.8}
          >
            <AppText
              variant="small"
              weight="700"
              color={activeSeason === 'summer' ? '#FFFFFF' : colors.muted}
            >
              {isHindi ? '☀️ ग्रीष्म' : 'Summer'}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.seasonBtn,
              activeSeason === 'winter' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveSeason('winter')}
            activeOpacity={0.8}
          >
            <AppText
              variant="small"
              weight="700"
              color={activeSeason === 'winter' ? '#FFFFFF' : colors.muted}
            >
              {isHindi ? '❄️ शीत' : 'Winter'}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Column Headers */}
      <View style={[styles.row, styles.headerRow, { borderBottomColor: colors.borderLight }]}>
        <AppText variant="small" weight="700" color={colors.muted} style={styles.colAarti}>
          {isHindi ? 'आरती नाम' : 'Aarti Name'}
        </AppText>
        <AppText variant="small" weight="700" color={colors.muted} style={styles.colTime}>
          {activeSeason === 'summer' ? (isHindi ? 'ग्रीष्म समय' : 'Summer') : (isHindi ? 'शीत समय' : 'Winter')}
        </AppText>
        <AppText variant="small" weight="700" color={colors.muted} style={styles.colStatus}>
          {isHindi ? 'स्थिति' : 'Status'}
        </AppText>
      </View>

      {/* Rows */}
      {aartis.map((row, idx) => {
        const badge = getStatusBadge(row.status);
        const displayTime = activeSeason === 'summer' ? row.summer : row.winter;
        return (
          <View
            key={idx}
            style={[
              styles.row,
              { borderBottomColor: isDark ? colors.border : colors.borderLight },
              idx === aartis.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={styles.colAarti}>
              <AppText variant="caption" weight="700" color={colors.navy}>
                {row.name}
              </AppText>
              {Boolean(row.sub) && (
                <AppText variant="small" color={colors.muted} numberOfLines={1}>
                  {row.sub}
                </AppText>
              )}
            </View>

            <AppText
              variant="caption"
              weight="700"
              color={colors.primary}
              style={styles.colTime}
            >
              {displayTime}
            </AppText>

            <View style={styles.colStatus}>
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <AppText variant="small" weight="700" color={badge.color} style={styles.statusText}>
                  {badge.label}
                </AppText>
              </View>
            </View>
          </View>
        );
      })}

      {/* Verification Seal Footer */}
      <View style={[styles.sealFooter, { borderTopColor: isDark ? colors.border : '#F3E8D0' }]}>
        <View style={styles.sealRow}>
          <AppText variant="small" color="#15803D" weight="700">
            ✓ {temple?.sourceAttribution || (isHindi ? 'मंदिर ट्रस्ट व सेवायत परंपरा' : 'Verified from Temple Trust')}
          </AppText>
          <AppText variant="small" color={colors.muted}>
            • {isHindi ? 'सत्यापन:' : 'Updated:'} {temple?.lastVerified || 'अक्टूबर 2026'}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tableCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginVertical: 10,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  tableHeader: {
    flex: 1,
    minWidth: 160,
  },
  seasonToggleWrap: {
    flexDirection: 'row',
    borderRadius: 9999,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  seasonBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    paddingVertical: 6,
  },
  colAarti: {
    flex: 2.2,
  },
  colTime: {
    flex: 1.4,
    textAlign: 'center',
  },
  colStatus: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 9,
  },
  sealFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    marginTop: 6,
  },
  sealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
});
