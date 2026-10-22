/**
 * Braj Darshan - Badge
 * Compact Status and Categorization Pill Badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radii, spacing } from '../../theme';

export function Badge({
  label,
  variant = 'gold', // 'gold' | 'success' | 'warning' | 'info' | 'purple'
  icon,
  style,
  textStyle,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'warning':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'info':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'purple':
        return { bg: '#F3E8FF', text: '#7E22CE' };
      case 'gold':
      default:
        return { bg: '#FEF3C7', text: '#B45309' };
    }
  };

  const { bg, text } = getVariantStyles();

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.text, { color: text }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radii.xs,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 10,
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default Badge;
