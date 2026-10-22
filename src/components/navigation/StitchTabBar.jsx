import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDrawer } from '../../context/DrawerContext';
import { AppText } from '../common/AppText';
import { ROUTES } from '../../navigation/routes';

export default function StitchTabBar({ navigation, currentRouteName }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { openDrawer, currentRoute, setCurrentRoute } = useDrawer();

  const active = currentRouteName || currentRoute;

  const tabs = [
    {
      route: ROUTES.HOME,
      icon: '🏠',
      label: isHindi ? 'श्री धाम' : 'Home',
    },
    {
      route: ROUTES.TEMPLES,
      icon: '🛕',
      label: isHindi ? 'मंदिर' : 'Temples',
    },
    {
      route: ROUTES.YATRA,
      icon: '🧭',
      label: isHindi ? 'यात्रा' : 'Yatra',
    },
    {
      route: ROUTES.PANCHANG,
      icon: '🪷',
      label: isHindi ? 'पंचांग' : 'Panchang',
    },
    {
      route: 'MORE_DRAWER',
      icon: '⊞',
      label: isHindi ? 'सेवाएं' : 'More',
      isMore: true,
    },
  ];

  const handleTabPress = (tab) => {
    if (tab.isMore) {
      openDrawer();
    } else {
      setCurrentRoute(tab.route);
      navigation?.navigate(tab.route);
    }
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          borderTopColor: isDark ? colors.border : colors.borderLight,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            {/* Top Indicator line on active */}
            {isActive && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
            )}

            <AppText
              variant="caption"
              style={[
                styles.icon,
                isActive && styles.iconActive,
              ]}
            >
              {tab.icon}
            </AppText>

            <AppText
              variant="small"
              weight={isActive ? '700' : '500'}
              color={isActive ? colors.primary : colors.muted}
              style={styles.label}
              numberOfLines={1}
            >
              {tab.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: Platform.OS === 'ios' ? 84 : 64,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    position: 'relative',
    height: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 1.5,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.65,
  },
  iconActive: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  label: {
    fontSize: 10,
    lineHeight: 12,
  },
});
