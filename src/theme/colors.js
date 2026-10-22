/**
 * Braj Darshan - Global Semantic Theme Palette
 * Visual Source of Truth: Google Stitch Design System ("Sacred Serenity")
 *
 * Light Mode:
 *   Canvas: Warm Limestone Marble (#FAF9F6)
 *   Primary / Terracotta: Sacred Saffron (#A43700 / #CD4700)
 *   Secondary / Amber: Temple Gold (#F59E0B / #FEF3C7)
 *   Tertiary: Ekadashi Purple (#7C3AED / #EADDFF)
 *   Containers: Pure White (#FFFFFF), Sky Tint (#EFF4FF / #DEE9FC), Peach (#FFF7ED)
 *   Typography: Midnight Charcoal (#121C2A / #1F2937), Subtle Ink (#4B5563)
 *   Borders: Hairline (#E5E7EB / #F3F4F6)
 *
 * Dark Mode:
 *   Deep Devotional Slate/Charcoal (#121212 / #1E1E1E),
 *   Warm Amber/Saffron glows (#FF8A50), Muted borders, Off-white text (#F3F4F6)
 */

export const lightColors = {
  // Brand & Sacred Stitch Accents
  primary: '#A43700',          // Sacred Terracotta / Saffron from Stitch
  primaryContainer: '#CD4700', // Saffron Container Action
  primaryDark: '#802A00',      // Deep Burnished Terracotta
  primaryLight: '#FFF3E0',     // Warm Saffron Tint
  primaryFixed: '#FFDBCF',     // Soft Peach Pill Fill
  saffron: '#E65100',          // Classic Saffron
  terracotta: '#A43700',       // Stitch Primary
  terracottaDark: '#802A00',
  terracottaLight: '#FFDBCF',

  // Amber & Temple Gold
  gold: '#F59E0B',             // Temple Amber Gold
  goldDark: '#D97706',         // Burnished Gold
  goldLight: '#FEF3C7',        // Soft Glowing Amber Backdrop
  secondary: '#F59E0B',
  secondaryContainer: '#FEA619',

  // Surfaces & Backgrounds
  background: '#FAF9F6',       // Warm Limestone Marble (Stitch base canvas)
  canvas: '#FAF9F6',
  surface: '#FFFFFF',          // Pure Crisp White Card
  surfaceAlt: '#F5F5F4',       // Soft Stone
  surfaceContainerLow: '#EFF4FF', // Soft Sky Container
  surfaceContainer: '#E6EEFF',
  surfaceContainerHigh: '#DEE9FC',
  peach: '#FFF7ED',            // Soft Warm Peach Card Fill
  card: '#FFFFFF',
  cardAlt: '#F8F9FA',
  cardHighlighted: '#FFFBEB',

  // Devotional Typography & Contrast
  navy: '#121C2A',             // Midnight Charcoal Headings (Stitch on-surface)
  text: '#1F2937',             // Charcoal Body Text
  textSecondary: '#4B5563',    // Subtle Ink Subtext
  muted: '#8F7066',            // Earthy Muted Metadata (Stitch outline)
  subtle: '#9CA3AF',           // Subtle captions

  // Borders & Dividers
  border: '#E5E7EB',           // Hairline Outline
  borderLight: '#F3F4F6',      // Very Light Divider
  divider: '#E5E7EB',

  // Tab Bar & Navigation
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#F3F4F6',
  tabBarActive: '#A43700',
  tabBarInactive: '#8F7066',

  // Drawer Specific Tokens
  drawerBg: '#FAF9F6',
  drawerHeaderBg: '#FFFFFF',
  drawerActiveBg: '#FFF3E0',
  drawerActiveText: '#A43700',
  drawerInactiveText: '#4B5563',
  drawerBorder: '#E5E7EB',

  // Status & Badges
  success: '#16A34A',          // Auspicious Green / Open Darshan
  successLight: '#DCFCE7',
  warning: '#DC2626',          // Closed / Alert Red
  warningBg: '#FEF2F2',
  ekadashi: '#7C3AED',         // Ekadashi Purple
  ekadashiLight: '#EADDFF',
  purnima: '#0284C7',          // Purnima Blue
  purnimaLight: '#E0F2FE',

  // Overlays & Scrims
  overlayDark: 'rgba(18, 28, 42, 0.65)',
  overlayLight: 'rgba(255, 255, 255, 0.94)',
  shadow: '#1F2937',
  isDark: false,
};

export const darkColors = {
  // Brand & Sacred Accents
  primary: '#FF8A50',          // Radiant Saffron Glow
  primaryContainer: '#CD4700',
  primaryDark: '#E65100',
  primaryLight: '#3D1E0B',     // Deep Saffron Ember
  primaryFixed: '#3D2010',
  saffron: '#FF8A50',
  terracotta: '#FF8A50',
  terracottaDark: '#E65100',
  terracottaLight: '#3D2010',

  // Amber & Temple Gold
  gold: '#FBBF24',             // Glowing Temple Gold
  goldDark: '#F59E0B',
  goldLight: '#382806',
  secondary: '#FBBF24',
  secondaryContainer: '#D97706',

  // Surfaces & Backgrounds
  background: '#121212',       // Deep Devotional Slate/Charcoal
  canvas: '#121212',
  surface: '#1E1E1E',          // Elevated Dark Surface
  surfaceAlt: '#282828',       // Slightly lighter charcoal
  surfaceContainerLow: '#1A2230',
  surfaceContainer: '#222D3D',
  surfaceContainerHigh: '#273447',
  peach: '#2A1E14',
  card: '#1E1E1E',
  cardAlt: '#252525',
  cardHighlighted: '#2D2316',

  // Devotional Typography & Contrast
  navy: '#F9FAFB',             // Pure Off-White Headings
  text: '#F3F4F6',             // Crisp Off-White Body
  textSecondary: '#D1D5DB',    // Soft Slate Subtext
  muted: '#9CA3AF',            // Muted Gray
  subtle: '#6B7280',

  // Borders & Dividers
  border: '#2E2E2E',           // Subtle Dark Border
  borderLight: '#252525',      // Very Subtle Dark Divider
  divider: '#2A2A2A',

  // Tab Bar & Navigation
  tabBarBg: '#181818',
  tabBarBorder: '#2E2E2E',
  tabBarActive: '#FF8A50',
  tabBarInactive: '#9CA3AF',

  // Drawer Specific Tokens
  drawerBg: '#181818',
  drawerHeaderBg: '#1E1E1E',
  drawerActiveBg: '#3D2010',
  drawerActiveText: '#FF8A50',
  drawerInactiveText: '#D1D5DB',
  drawerBorder: '#2E2E2E',

  // Status & Badges
  success: '#22C55E',
  successLight: '#14532D',
  warning: '#EF4444',
  warningBg: '#451A1A',
  ekadashi: '#A78BFA',
  ekadashiLight: '#3B1D70',
  purnima: '#38BDF8',
  purnimaLight: '#075985',

  // Overlays & Scrims
  overlayDark: 'rgba(0, 0, 0, 0.85)',
  overlayLight: 'rgba(30, 30, 30, 0.94)',
  shadow: '#000000',
  isDark: true,
};

// Default export is lightColors for non-context consumers
export const colors = lightColors;
export default colors;
