/**
 * Braj Darshan - Spacing & Metrics System
 * Adheres to 8-Point Grid and Apple HIG Touch Target Guidelines
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const touchTargets = {
  min: 44,             // Apple HIG minimum touch target size
  buttonHeight: 48,    // Standard primary button height
  buttonHeightSm: 36,  // Compact pill button height
  inputHeight: 46,     // Search bar and form input height
  iconButtonSize: 44,  // Circular icon tap size
};

export default { spacing, radii, touchTargets };
