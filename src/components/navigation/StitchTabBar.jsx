/**
 * Braj Darshan - Bottom tab bar
 * Five destinations with a vector icon and a label always visible:
 * Home · Temples · Map · Panchang · More. The active tab gets a saffron pill.
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDrawer } from '../../context/DrawerContext';
import { AppText } from '../common/AppText';
import { Icon } from '../common/Icon';
import { ROUTES } from '../../navigation/routes';
import { usePressGuard } from '../../hooks/usePressGuard';

export const TAB_BAR_HEIGHT = 64;

const TABS = [
  { route: ROUTES.HOME, icon: 'home', hi: 'होम', en: 'Home' },
  { route: ROUTES.TEMPLES, icon: 'temple', hi: 'मंदिर', en: 'Temples' },
  { route: ROUTES.MAP, icon: 'map', hi: 'नक्शा', en: 'Map' },
  { route: ROUTES.PANCHANG, icon: 'panchang', hi: 'पंचांग', en: 'Panchang' },
  { route: ROUTES.MORE, icon: 'more', hi: 'और', en: 'More' },
];

function TabItem({ tab, isActive, onPress, colors, label }) {
  const guarded = usePressGuard(onPress, 400);
  return (
    <Pressable
      style={styles.tabItem}
      onPress={guarded}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
    >
      {/* Always give the pill a colour: on Android, adding a background later drops the rounded corners. */}
      <View style={[styles.pill, { backgroundColor: isActive ? colors.primaryLight : colors.tabBarBg }]}>
        <Icon
          name={tab.icon}
          size={24}
          color={isActive ? colors.primary : colors.tabBarInactive}
        />
      </View>
      <AppText
        variant="badge"
        weight={isActive ? '700' : '500'}
        color={isActive ? colors.primary : colors.tabBarInactive}
        numberOfLines={1}
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export default function StitchTabBar({ navigation, currentRouteName }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const { currentRoute, setCurrentRoute } = useDrawer();

  const active = currentRouteName || currentRoute;

  const go = (route) => {
    if (route === active) return;
    setCurrentRoute(route);
    navigation?.navigate(route);
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
      accessibilityRole="tablist"
    >
      {TABS.map((tab) => (
        <TabItem
          key={tab.route}
          tab={tab}
          isActive={active === tab.route}
          onPress={() => go(tab.route)}
          colors={colors}
          label={isHindi ? tab.hi : tab.en}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pill: {
    width: 60,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
