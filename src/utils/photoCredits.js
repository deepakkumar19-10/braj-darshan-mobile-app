/**
 * Credits for photos taken from Wikimedia Commons (author, licence, source page),
 * as their licences require. Keys match the image paths under assets/images.
 */

import credits from '../data/photoCredits.json';

export const PHOTO_CREDITS = credits;

export function getPhotoCredit(key) {
  return key ? credits.find((c) => c.key === key) || null : null;
}

/** One short line, e.g. "Photo: Umang108 · CC BY-SA 4.0 · Wikimedia Commons". */
export function creditLine(credit, isHindi) {
  if (!credit) return '';
  const label = isHindi ? 'फ़ोटो' : 'Photo';
  return `${label}: ${credit.author} · ${credit.licence} · Wikimedia Commons`;
}
