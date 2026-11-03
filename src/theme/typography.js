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

// Elder-friendly scale: body never below 16. Line heights leave room for Devanagari matras.
export const fontSizes = {
  hero: 30,
  h1: 26,
  h2: 22,
  h3: 19,
  h4: 17,
  bodyLarge: 17,
  body: 16,
  caption: 14,
  small: 13,
  badge: 12,
};

export const lineHeights = {
  hero: 40,
  h1: 34,
  h2: 30,
  h3: 27,
  h4: 24,
  bodyLarge: 26,
  body: 24,
  caption: 20,
  small: 18,
  badge: 16,
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
