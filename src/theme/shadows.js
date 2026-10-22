/**
 * Braj Darshan - Cross-Platform Elevation & Shadows
 * Tailored for warm sandstone physical lighting on iOS and Android
 */

import { Platform } from 'react-native';
import { colors } from './colors';

export const shadows = {
  none: {
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  sm: {
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  md: {
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.09,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  lg: {
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  saffronGlow: {
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 14,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  goldGlow: {
    ...Platform.select({
      ios: {
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
};

export default shadows;
