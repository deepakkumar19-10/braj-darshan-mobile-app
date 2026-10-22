import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';

export default function SacredHighlightsGrid({ temple }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();

  const highlights = [
    {
      id: 'deity',
      icon: '🛕',
      label: isHindi ? 'परम ईष्ट विग्रह' : 'Presiding Deity',
      value: isHindi ? (temple.deityHindi || temple.deity) : temple.deity,
    },
    {
      id: 'arch',
      icon: '🏛️',
      label: isHindi ? 'स्थापत्य कला' : 'Architecture Style',
      value: isHindi
        ? (temple.architecture || 'पारंपरिक राजस्थानी संगमरमर व नागर शैली')
        : 'Nagara Style with Rajasthani Marble',
    },
    {
      id: 'window',
      icon: '🌅',
      label: isHindi ? 'उत्तम दर्शन समय' : 'Optimal Window',
      value: isHindi ? 'प्रातः मंगला व संध्या आरती' : 'Early Mangala Aarti (05:30 AM)',
    },
    {
      id: 'cloak',
      icon: '🛅',
      label: isHindi ? 'सामान व मोबाइल' : 'Baggage & Electronics',
      value: isHindi ? 'निःशुल्क क्लॉक रूम • मोबाइल प्रतिबंधित' : 'Free Cloakroom • Mobiles Strictly Prohibited',
    },
  ];

  return (
    <View style={styles.grid}>
      {highlights.map((item) => (
        <View
          key={item.id}
          style={[
            styles.tile,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.surface,
              borderColor: isDark ? colors.border : colors.border,
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: isDark ? colors.surface : colors.primaryLight }]}>
            <AppText variant="body">{item.icon}</AppText>
          </View>
          <AppText variant="small" weight="700" color={colors.primary} style={styles.label}>
            {item.label}
          </AppText>
          <AppText variant="caption" weight="600" color={colors.navy} numberOfLines={2}>
            {item.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  tile: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
  },
});
