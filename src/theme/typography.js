/**
 * Braj Darshan - Typography System
 * Engineered for Bilingual (English + Hindi Devanagari) Readability & Apple HIG Compliance
 */

import { Platform } from 'react-native';

export const fontFamilies = {
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'sans-serif',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  regular: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
};

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const fontSizes = {
  hero: 32,
  h1: 26,
  h2: 22,
  h3: 18,
  h4: 16,
  bodyLarge: 15,
  body: 14,
  caption: 12,
  small: 11,
  badge: 10,
};

export const lineHeights = {
  hero: 40,
  h1: 34,
  h2: 28,
  h3: 24,
  h4: 22,
  bodyLarge: 22,
  body: 20,
  caption: 16,
  small: 14,
  badge: 13,
};

export const typography = {
  // Headings
  heroHindi: {
    fontSize: fontSizes.hero,
    lineHeight: lineHeights.hero,
    fontWeight: fontWeights.extraBold,
    fontFamily: fontFamilies.sans,
    letterSpacing: 0, // Keep 0 for Devanagari conjuncts
  },
  heroEnglish: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: fontWeights.extraBold,
    fontFamily: fontFamilies.sans,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: fontSizes.h1,
    lineHeight: lineHeights.h1,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.sans,
  },
  h2: {
    fontSize: fontSizes.h2,
    lineHeight: lineHeights.h2,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.sans,
  },
  h3: {
    fontSize: fontSizes.h3,
    lineHeight: lineHeights.h3,
    fontWeight: fontWeights.semiBold,
    fontFamily: fontFamilies.sans,
  },
  h4: {
    fontSize: fontSizes.h4,
    lineHeight: lineHeights.h4,
    fontWeight: fontWeights.semiBold,
    fontFamily: fontFamilies.sans,
  },

  // Body Content
  bodyLarge: {
    fontSize: fontSizes.bodyLarge,
    lineHeight: lineHeights.bodyLarge,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.sans,
  },
  body: {
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.sans,
  },
  bodyMedium: {
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.sans,
  },
  bodyBold: {
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.sans,
  },

  // Captions & Metadata
  caption: {
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.sans,
  },
  captionMedium: {
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.sans,
  },
  small: {
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.sans,
  },
  badge: {
    fontSize: fontSizes.badge,
    lineHeight: lineHeights.badge,
    fontWeight: fontWeights.extraBold,
    fontFamily: fontFamilies.sans,
    letterSpacing: 0.5,
  },
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
};

export default typography;
