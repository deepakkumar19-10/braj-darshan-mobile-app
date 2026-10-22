/**
 * Braj Darshan - SectionTag
 * Signature Sacred Section Identifier Badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../../theme';

export function SectionTag({ text, icon, style, textStyle }) {
  return (
    <View style={[styles.container, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 119, 6, 0.28)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

export default SectionTag;
