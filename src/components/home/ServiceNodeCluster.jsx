import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';
import { ROUTES } from '../../navigation/routes';

export default function ServiceNodeCluster() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();

  const services = [
    {
      id: 'temples',
      title: isHindi ? 'मंदिर दर्शन' : 'Temple Timings',
      icon: '🛕',
      bgLight: '#FFEDD5',
      bgDark: '#3D2516',
      route: ROUTES.TEMPLES,
    },
    {
      id: 'yatra',
      title: isHindi ? '१-६ दिनी यात्रा' : '1-6 Day Yatra',
      icon: '🧭',
      bgLight: '#FEF3C7',
      bgDark: '#382806',
      route: ROUTES.YATRA,
    },
    {
      id: 'parikrama',
      title: isHindi ? 'परिक्रमा गाइड' : 'Parikrama Guide',
      icon: '⛩️',
      bgLight: '#EDE9FE',
      bgDark: '#2C1B4D',
      route: ROUTES.PARIKRAMA_DETAIL,
      params: { id: 'govardhan-parikrama' },
    },
    {
      id: 'food',
      title: isHindi ? 'ब्रज भोग' : 'Braj Food Guide',
      icon: '🍴',
      bgLight: '#FEE2E2',
      bgDark: '#451A1A',
      route: ROUTES.FOOD,
    },
  ];

  return (
    <View style={styles.cluster}>
      {services.map((svc) => (
        <TouchableOpacity
          key={svc.id}
          style={styles.nodeItem}
          onPress={() => navigation.navigate(svc.route, svc.params)}
          activeOpacity={0.8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <View
            style={[
              styles.circleNode,
              {
                backgroundColor: isDark ? svc.bgDark : svc.bgLight,
                borderColor: isDark ? colors.border : 'rgba(0,0,0,0.04)',
              },
            ]}
          >
            <AppText variant="h2" style={styles.icon}>
              {svc.icon}
            </AppText>
          </View>

          <AppText
            variant="small"
            weight="600"
            color={colors.text}
            style={styles.label}
            numberOfLines={2}
          >
            {svc.title}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cluster: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  nodeItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 82,
  },
  circleNode: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
});
