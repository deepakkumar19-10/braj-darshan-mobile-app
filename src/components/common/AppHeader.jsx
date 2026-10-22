/**
 * Braj Darshan - AppHeader
 * Standard Navigation Screen Header with Hamburger Menu, Back Navigation, and Action Slots
 * Apple HIG Compliant (44pt+ touch targets, semantic theme reactive)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDrawer } from '../../context/DrawerContext';
import { spacing, touchTargets } from '../../theme';
import AppText from './AppText';

export function AppHeader({
  title,
  subtitle,
  onBack,
  showBack = false,
  showMenu = false,
  leftAction,
  rightAction,
  style,
}) {
  const { colors } = useTheme();
  let drawer;
  try {
    drawer = useDrawer();
  } catch (e) {
    drawer = null;
  }

  const shouldShowMenu = showMenu || (!showBack && !leftAction);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {leftAction ? (
          leftAction
        ) : showBack ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backArrow, { color: colors.navy }]}>←</Text>
          </TouchableOpacity>
        ) : shouldShowMenu && drawer ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={drawer.openDrawer}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.menuIcon, { color: colors.navy }]}>☰</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleWrap}>
          <AppText variant="h3" color={colors.navy} numberOfLines={1}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" color={colors.muted} numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>

      {rightAction && (
        <View style={styles.rightActionContainer}>{rightAction}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54, // Apple HIG standard navigation bar
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    width: 44, // 44pt touch target
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '700',
  },
  menuIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AppHeader;
