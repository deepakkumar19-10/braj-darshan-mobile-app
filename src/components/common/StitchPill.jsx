import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from './AppText';

export default function StitchPill({
  label,
  icon,
  active = false,
  count,
  onPress,
  variant = 'default',
  size = 'md',
  style,
}) {
  const { colors, isDark } = useTheme();

  const isSmall = size === 'sm';

  const getStyle = () => {
    if (active) {
      return {
        bg: colors.primary,
        border: colors.primary,
        text: '#FFFFFF',
        countBg: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.3)',
        countText: '#FFFFFF',
      };
    }

    if (variant === 'gold') {
      return {
        bg: isDark ? colors.cardAlt : colors.goldLight,
        border: isDark ? colors.border : 'rgba(245,158,11,0.3)',
        text: isDark ? colors.gold : colors.goldDark,
        countBg: 'rgba(245,158,11,0.15)',
        countText: isDark ? colors.gold : colors.goldDark,
      };
    }

    if (variant === 'statusOpen') {
      return {
        bg: isDark ? '#14532D' : '#DCFCE7',
        border: isDark ? '#166534' : '#BBF7D0',
        text: isDark ? '#86EFAC' : '#166534',
      };
    }

    if (variant === 'statusClosed') {
      return {
        bg: isDark ? '#451A1A' : '#FEE2E2',
        border: isDark ? '#7F1D1D' : '#FECACA',
        text: isDark ? '#FCA5A5' : '#991B1B',
      };
    }

    return {
      bg: isDark ? colors.surface : colors.surface,
      border: isDark ? colors.border : colors.border,
      text: colors.textSecondary,
      countBg: isDark ? colors.cardAlt : colors.borderLight,
      countText: colors.muted,
    };
  };

  const current = getStyle();

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        isSmall ? styles.pillSm : styles.pillMd,
        {
          backgroundColor: current.bg,
          borderColor: current.border,
        },
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
    >
      {Boolean(icon) && (
        <AppText variant="caption" style={[styles.icon, isSmall && styles.iconSm]}>
          {icon}
        </AppText>
      )}

      <AppText
        variant={isSmall ? 'small' : 'caption'}
        weight={active ? '700' : '600'}
        color={current.text}
      >
        {label}
      </AppText>

      {count !== undefined && (
        <View style={[styles.countBadge, { backgroundColor: current.countBg }]}>
          <AppText
            variant="small"
            weight="700"
            color={current.countText}
            style={styles.countText}
          >
            {count}
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1,
  },
  pillMd: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    minHeight: 38,
  },
  pillSm: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    minHeight: 28,
  },
  icon: {
    marginRight: 6,
    fontSize: 13,
  },
  iconSm: {
    marginRight: 4,
    fontSize: 11,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  countText: {
    fontSize: 10,
  },
});
