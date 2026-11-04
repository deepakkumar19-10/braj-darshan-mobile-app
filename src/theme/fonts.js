/**
 * Braj Darshan - app font (Mukta: one family for Devanagari and Latin, from Google Fonts).
 *
 * A custom font on Android needs one family per weight; asking a family for a weight it
 * does not have makes Android fake it (or fall back to the system font). So text picks the
 * Mukta family that matches its weight and drops fontWeight. Until the fonts are loaded
 * (or if loading fails) text keeps the system font with its normal weights.
 */
import {
  Mukta_400Regular,
  Mukta_500Medium,
  Mukta_600SemiBold,
  Mukta_700Bold,
  Mukta_800ExtraBold,
} from '@expo-google-fonts/mukta';

export const FONT = {
  regular: 'Mukta_400Regular',
  medium: 'Mukta_500Medium',
  semiBold: 'Mukta_600SemiBold',
  bold: 'Mukta_700Bold',
  extraBold: 'Mukta_800ExtraBold',
};

// The map handed to useFonts() in App.tsx.
export const FONT_FILES = {
  [FONT.regular]: Mukta_400Regular,
  [FONT.medium]: Mukta_500Medium,
  [FONT.semiBold]: Mukta_600SemiBold,
  [FONT.bold]: Mukta_700Bold,
  [FONT.extraBold]: Mukta_800ExtraBold,
};

// Set once by App.tsx when the fonts are ready; App renders nothing that uses them before that.
export const fontState = { loaded: false };

export function familyForWeight(weight) {
  const w = String(weight || '400');
  if (w === 'bold' || w === '700') return FONT.bold;
  if (w === '800' || w === '900') return FONT.extraBold;
  if (w === '600') return FONT.semiBold;
  if (w === '500') return FONT.medium;
  return FONT.regular;
}

/**
 * Style patch for a Text/TextInput style: the Mukta family for its weight, without fontWeight.
 * Returns {} while the fonts are not loaded, so the system font is used as before.
 */
export function fontFor(weight) {
  if (!fontState.loaded) return {};
  return { fontFamily: familyForWeight(weight), fontWeight: undefined };
}
