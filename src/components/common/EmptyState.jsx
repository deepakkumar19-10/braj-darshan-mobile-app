/**
 * Braj Darshan - EmptyState
 * Devotional Empty Result / Zero State Component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import AppText from './AppText';
import AppButton from './AppButton';
import LotusIcon from './LotusIcon';

export function EmptyState({
  icon,
  title = 'कोई परिणाम नहीं मिला',
  description = 'कृपया दूसरा नाम खोजें या फ़िल्टर हटाएँ।',
  actionTitle,
  onAction,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        {icon ? icon : <LotusIcon size={56} />}
      </View>

      <AppText variant="h3" color={colors.navy} align="center" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="body" color={colors.muted} align="center" style={styles.description}>
        {description}
      </AppText>

      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    lineHeight: 20,
    marginBottom: spacing.base,
    maxWidth: 280,
  },
  button: {
    minWidth: 140,
  },
});

export default EmptyState;
