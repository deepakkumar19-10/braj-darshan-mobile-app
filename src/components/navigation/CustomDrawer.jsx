/**
 * Braj Darshan - Side drawer
 * A full directory of the app: the four main tabs, then the same groups and
 * sections as the More tab (MORE_GROUPS + MORE_SECTIONS), so both lists always
 * match. Vector icons only. There is no sign-in: accounts are not available in
 * this app. "About" lives in Settings, not as a separate entry.
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Animated, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDrawer } from '../../context/DrawerContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';
import { Icon } from '../common/Icon';
import { IconButton, LanguageToggle, ListRow } from '../ui';
import { ROUTES } from '../../navigation/routes';
import { MORE_GROUPS, openSection, sectionsInGroup } from '../../screens/more/MoreScreen';
import { getAppVersion } from '../../utils/appVersion';

// From the build (app.json through expo-constants), e.g. "1.0.0 (2)".
const APP_VERSION = getAppVersion();

const MAIN_SECTIONS = [
  { id: 'home', icon: 'home', route: ROUTES.HOME, hi: 'होम', en: 'Home' },
  { id: 'temples', icon: 'temple', route: ROUTES.TEMPLES, hi: 'मंदिर', en: 'Temples' },
  { id: 'map', icon: 'map', route: ROUTES.MAP, hi: 'नक्शा', en: 'Map' },
  { id: 'panchang', icon: 'panchang', route: ROUTES.PANCHANG, hi: 'पंचांग', en: 'Panchang' },
];

function DrawerRow({ item, active, isHindi, colors, onPress }) {
  return (
    // A background in both states keeps the rounded corners on Android.
    <View style={[styles.rowWrap, { backgroundColor: active ? colors.drawerActiveBg : colors.drawerBg }]}>
      {active ? <View style={[styles.activeBar, { backgroundColor: colors.primary }]} /> : null}
      <ListRow
        icon={item.icon}
        title={isHindi ? item.hi : item.en}
        onPress={onPress}
        right={item.url ? <Icon name="externalLink" size={18} color={colors.muted} /> : undefined}
      />
    </View>
  );
}

function GroupLabel({ children, isHindi, colors }) {
  return (
    <AppText
      variant="small"
      weight="700"
      color={colors.muted}
      // Capitals and letter spacing only for English: spacing breaks Devanagari conjuncts.
      style={[styles.groupLabel, !isHindi && styles.groupLabelEn]}
      accessibilityRole="header"
    >
      {children}
    </AppText>
  );
}

export default function CustomDrawer({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isOpen, closeDrawer, animValue, drawerWidth, currentRoute, setCurrentRoute } = useDrawer();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  if (!isOpen || !animValue) return null;

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  let activeRoute = currentRoute;
  try {
    activeRoute = navigation?.getCurrentRoute?.()?.name || currentRoute;
  } catch (e) {
    activeRoute = currentRoute;
  }

  const handlePress = (item) => {
    closeDrawer();
    if (!item.url) setCurrentRoute(item.route);
    openSection((route, params) => navigation.navigate(route, params), item);
  };

  const renderRow = (item) => (
    <DrawerRow
      key={item.id}
      item={item}
      active={!item.url && !item.params && item.route === activeRoute}
      isHindi={isHindi}
      colors={colors}
      onPress={() => handlePress(item)}
    />
  );

  return (
    <View style={styles.absolute} pointerEvents="box-none">
      <TouchableWithoutFeedback
        onPress={closeDrawer}
        accessibilityRole="button"
        accessibilityLabel={isHindi ? 'मेनू बंद करें' : 'Close menu'}
      >
        <Animated.View
          style={[styles.backdrop, { backgroundColor: colors.overlayDark, opacity: animValue }]}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.panel,
          {
            width: drawerWidth,
            backgroundColor: colors.drawerBg,
            borderRightColor: colors.border,
            shadowColor: colors.shadow,
            transform: [{ translateX }],
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        {/* Brand */}
        <View style={styles.header}>
          <View style={[styles.brandTile, { backgroundColor: colors.primaryLight }]}>
            <Icon name="temple" size={26} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="h3" weight="700" color={colors.navy} numberOfLines={2}>
              श्री ब्रज दर्शन
            </AppText>
            <AppText variant="small" weight="600" color={colors.muted}>
              DIVYABRAJ
            </AppText>
          </View>
          <IconButton
            icon="close"
            onPress={closeDrawer}
            accessibilityLabel={isHindi ? 'मेनू बंद करें' : 'Close menu'}
          />
        </View>

        <View style={styles.controls}>
          <LanguageToggle />
          <AppText variant="caption" color={colors.textSecondary} style={styles.flex}>
            {isHindi ? 'भाषा: हिन्दी' : 'Language: English'}
          </AppText>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.menu}
          showsVerticalScrollIndicator={false}
        >
          <GroupLabel isHindi={isHindi} colors={colors}>
            {isHindi ? 'मुख्य' : 'Main'}
          </GroupLabel>
          {MAIN_SECTIONS.map(renderRow)}

          {MORE_GROUPS.map((group) => (
            <View key={group.id}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <GroupLabel isHindi={isHindi} colors={colors}>
                {isHindi ? group.hi : group.en}
              </GroupLabel>
              {sectionsInGroup(group.id).map(renderRow)}
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <AppText variant="small" color={colors.muted} align="center">
            {isHindi
              ? `कोई खाता नहीं चाहिए${APP_VERSION ? ` · संस्करण ${APP_VERSION}` : ''}`
              : `No account needed${APP_VERSION ? ` · Version ${APP_VERSION}` : ''}`}
          </AppText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  absolute: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: { ...StyleSheet.absoluteFill },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRightWidth: 1,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  brandTile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  menu: { paddingHorizontal: 8, paddingBottom: 12 },
  groupLabel: { paddingHorizontal: 12, marginTop: 6, marginBottom: 2 },
  groupLabelEn: { textTransform: 'uppercase', letterSpacing: 0.5 },
  rowWrap: { borderRadius: 14, paddingHorizontal: 12, overflow: 'hidden' },
  activeBar: { position: 'absolute', left: 0, top: 12, bottom: 12, width: 4, borderRadius: 2 },
  divider: { height: 1, marginVertical: 10, marginHorizontal: 12 },
  footer: { borderTopWidth: 1, paddingTop: 12, paddingHorizontal: 16 },
});
