import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';

export default function AartiScheduleTable({ temple }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();

  const aartis = [
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
          label: isHindi ? 'सक्रिय (Active)' : 'Now Active',
          bg: colors.primary,
          color: '#FFFFFF',
        };
      case 'completed':
        return {
          label: isHindi ? 'सम्पन्न' : 'Completed',
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
          borderColor: isDark ? colors.border : colors.border,
        },
      ]}
    >
      <View style={styles.tableHeader}>
        <AppText variant="h3" weight="700" color={colors.navy}>
          {isHindi ? 'दैनिक आरती समय सारणी' : 'Daily Aarti Schedule'}
        </AppText>
        <AppText variant="small" color={colors.muted}>
          {isHindi ? 'ऋतु अनुसार परिवर्तनशील' : 'Timings adapt seasonally'}
        </AppText>
      </View>

      {/* Column Headers */}
      <View style={[styles.row, styles.headerRow, { borderBottomColor: colors.borderLight }]}>
        <AppText variant="small" weight="700" color={colors.muted} style={styles.colAarti}>
          {isHindi ? 'आरती नाम' : 'Aarti Name'}
        </AppText>
        <AppText variant="small" weight="700" color={colors.muted} style={styles.colTime}>
          {isHindi ? 'ग्रीष्म' : 'Summer'}
        </AppText>
        <AppText variant="small" weight="700" color={colors.muted} style={styles.colTime}>
          {isHindi ? 'शीत' : 'Winter'}
        </AppText>
        <AppText variant="small" weight="700" color={colors.muted} style={styles.colStatus}>
          {isHindi ? 'स्थिति' : 'Status'}
        </AppText>
      </View>

      {/* Rows */}
      {aartis.map((row, idx) => {
        const badge = getStatusBadge(row.status);
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
              <AppText variant="small" color={colors.muted} numberOfLines={1}>
                {row.sub}
              </AppText>
            </View>

            <AppText variant="caption" color={colors.text} style={styles.colTime}>
              {row.summer}
            </AppText>

            <AppText variant="caption" color={colors.text} style={styles.colTime}>
              {row.winter}
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
  tableHeader: {
    marginBottom: 10,
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
    flex: 2,
  },
  colTime: {
    flex: 1,
    textAlign: 'center',
  },
  colStatus: {
    flex: 1.2,
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
});
