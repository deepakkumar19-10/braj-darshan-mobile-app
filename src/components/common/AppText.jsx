/**
 * Braj Darshan - AppText
 * Core Typography Component with Auto-Calibrated Devanagari Line Heights and Semantic Theme Reactivity
 */

import React from 'react';
import { Text } from 'react-native';
import { typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export function AppText({
  variant = 'body',
  color,
  align,
  weight,
  style,
  children,
  ...props
}) {
  let themeColors;
  try {
    const theme = useTheme();
    themeColors = theme.colors;
  } catch (e) {
    themeColors = null;
  }

  const baseStyle = typography[variant] || typography.body;

  const defaultTextColor = themeColors
    ? (variant.includes('heroHindi') || variant.includes('h1') || variant.includes('h2') || variant.includes('h3')
        ? themeColors.navy
        : themeColors.text)
    : undefined;

  const dynamicStyle = {
    color: color || defaultTextColor,
    ...(align && { textAlign: align }),
    ...(weight && { fontWeight: weight }),
  };

  return (
    <Text style={[baseStyle, dynamicStyle, style]} {...props}>
      {children}
    </Text>
  );
}

export default AppText;
