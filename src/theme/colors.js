/**
 * Braj Darshan - Global Semantic Theme Palette
 * Source of truth: the divyabraj.com website tokens (App.css) as refined in the
 * Figma + Stitch redesign (design-input/). Same brand on web and app.
 *
 * Light: cream #FFF9ED ground, saffron #D97706 brand, navy #17324D headings,
 *        brown #493225 body text, #EEE2D4 borders, gold #F4C542 accents.
 * Text-on-cream and white-on-button colours use the deeper saffron #A85A06 so
 * small text stays at 4.5:1 contrast (#D97706 is kept for large fills).
 * Dark:  #121212 ground, #1E1E1E surfaces, amber #F59E0B brand, #F5EBDD text.
 *
 * Every key below is used somewhere in the app; keep the names when retuning.
 */

export const lightColors = {
  // Brand
  primary: '#A85A06',          // Deep saffron: links, icons, filled buttons (white text 5:1)
  primaryContainer: '#D97706', // Website saffron: large fills, active pills
  primaryDark: '#8A4A05',      // Pressed state
  primaryLight: '#FDF0DC',     // Saffron tint backgrounds
  primaryFixed: '#FBE3C2',
  saffron: '#D97706',
  terracotta: '#A85A06',
  terracottaDark: '#8A4A05',
  terracottaLight: '#FBE3C2',

  // Gold accents (decor only, never small text)
  gold: '#F4C542',
  goldDark: '#B7862C',
  goldLight: '#FEF6D8',
  accentGold: '#F4C542',
  secondary: '#F4C542',
  secondaryContainer: '#E5B32F',

  // Surfaces
  background: '#FFF9ED',       // Website cream
  canvas: '#FFF9ED',
  surface: '#FFFFFF',
  surfaceAlt: '#F6EEE2',
  surfaceContainerLow: '#F9F3E7',
  surfaceContainer: '#F3EDE1',
  surfaceContainerHigh: '#EDE8DC',
  surfaceGold: '#FEF6D8',
  peach: '#FDF0DC',
  card: '#FFFFFF',
  cardAlt: '#F9F3E7',
  cardHighlighted: '#FEF6D8',

  // Text
  navy: '#17324D',             // Headings
  primaryNavy: '#17324D',
  charcoal: '#2B211B',
  text: '#493225',             // Body
  textSecondary: '#5E4B3E',
  muted: '#786A5D',            // Secondary text (5:1 on cream)
  subtle: '#7E7064',

  // Borders
  border: '#EEE2D4',
  borderLight: '#F4ECE0',
  borderGold: '#EAD9B0',
  divider: '#EEE2D4',

  // Tab bar
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#EEE2D4',
  tabBarActive: '#A85A06',
  tabBarInactive: '#786A5D',

  // Drawer
  drawerBg: '#FFF9ED',
  drawerHeaderBg: '#FFFFFF',
  drawerActiveBg: '#FDF0DC',
  drawerActiveText: '#A85A06',
  drawerInactiveText: '#5E4B3E',
  drawerBorder: '#EEE2D4',

  // Status (always paired with an icon and a word)
  success: '#1F7A4D',          // Open
  successLight: '#E6F3EC',
  warning: '#B42318',          // Closed
  warningBg: '#FBE9E7',
  error: '#B42318',
  info: '#786A5D',
  infoBg: '#F6EEE2',
  ekadashi: '#6D28D9',
  ekadashiLight: '#F1EAFE',
  purnima: '#0F5E66',
  purnimaLight: '#E3F0EF',

  // Overlays
  overlayDark: 'rgba(23, 18, 14, 0.62)',
  overlayLight: 'rgba(255, 255, 255, 0.94)',
  shadow: '#2D2018',
  isDark: false,
};

export const darkColors = {
  // Brand
  primary: '#F59E0B',
  primaryContainer: '#D97706',
  primaryDark: '#D97706',
  primaryLight: '#3A2610',
  primaryFixed: '#4A3015',
  saffron: '#F59E0B',
  terracotta: '#F59E0B',
  terracottaDark: '#D97706',
  terracottaLight: '#3A2610',

  // Gold accents
  gold: '#F4C542',
  goldDark: '#E5B32F',
  goldLight: '#3A3014',
  accentGold: '#F4C542',
  secondary: '#F4C542',
  secondaryContainer: '#D97706',

  // Surfaces
  background: '#121212',
  canvas: '#121212',
  surface: '#1E1E1E',
  surfaceAlt: '#262320',
  surfaceContainerLow: '#1B1917',
  surfaceContainer: '#23201D',
  surfaceContainerHigh: '#2B2724',
  surfaceGold: '#2D2416',
  peach: '#2A2016',
  card: '#1E1E1E',
  cardAlt: '#252220',
  cardHighlighted: '#2D2416',

  // Text
  navy: '#F5EBDD',
  primaryNavy: '#F5EBDD',
  charcoal: '#F5EBDD',
  text: '#EADFD2',
  textSecondary: '#D3C6B8',
  muted: '#B8A99A',
  subtle: '#9A8C7F',

  // Borders
  border: '#2E2A26',
  borderLight: '#26231F',
  borderGold: '#4A3B1E',
  divider: '#2E2A26',

  // Tab bar
  tabBarBg: '#181614',
  tabBarBorder: '#2E2A26',
  tabBarActive: '#F59E0B',
  tabBarInactive: '#B8A99A',

  // Drawer
  drawerBg: '#161412',
  drawerHeaderBg: '#1E1E1E',
  drawerActiveBg: '#3A2610',
  drawerActiveText: '#F59E0B',
  drawerInactiveText: '#D3C6B8',
  drawerBorder: '#2E2A26',

  // Status
  success: '#4ADE80',
  successLight: '#14301F',
  warning: '#F87171',
  warningBg: '#3A1714',
  error: '#F87171',
  info: '#B8A99A',
  infoBg: '#2A2520',
  ekadashi: '#C4B5FD',
  ekadashiLight: '#2E2350',
  purnima: '#5EC4CC',
  purnimaLight: '#123A3E',

  // Overlays
  overlayDark: 'rgba(0, 0, 0, 0.75)',
  overlayLight: 'rgba(30, 30, 30, 0.94)',
  shadow: '#000000',
  isDark: true,
};

// Default export is lightColors for non-context consumers
export const colors = lightColors;
export default colors;
