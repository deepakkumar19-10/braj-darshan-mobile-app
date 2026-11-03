/**
 * Braj Darshan - AppText
 * Core Typography Component with Auto-Calibrated Devanagari Line Heights and Semantic Theme Reactivity
 */

import React from 'react';
import { Platform, Text } from 'react-native';
import { typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

const DEVANAGARI = /[ऀ-ॿ]/;
const HAIR_SPACE = ' ';

// Android measures Devanagari a hair narrower than it draws it, so a Hindi line that
// just fits pushes its last word onto a second line that the measured box cuts off
// ("आज का पंचांग" showed as "आज का"). A trailing hair space adds that hair to the
// measured width; at the end of a line it never causes a wrap itself.
function padDevanagari(children) {
  if (Platform.OS !== 'android') return children;
  if (typeof children === 'string') {
    return DEVANAGARI.test(children) ? children + HAIR_SPACE : children;
  }
  if (Array.isArray(children) && children.length > 0) {
    const last = children[children.length - 1];
    const hasHindi = children.some((c) => typeof c === 'string' && DEVANAGARI.test(c));
    if (hasHindi && (typeof last === 'string' || typeof last === 'number')) {
      return [...children.slice(0, -1), `${last}${HAIR_SPACE}`];
    }
  }
  return children;
}

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

  // Respect the phone's large-text setting, but cap it so layouts never clip.
  return (
    <Text style={[baseStyle, dynamicStyle, style]} maxFontSizeMultiplier={1.5} {...props}>
      {padDevanagari(children)}
    </Text>
  );
}

export default AppText;
