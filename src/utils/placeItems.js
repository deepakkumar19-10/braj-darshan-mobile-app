/**
 * Braj Darshan - Places and ghats in one shape
 * Sacred towns from data/places.json and the Yamuna ghats / Govardhan kunds from
 * data/ghats.js, turned into the same item shape so the Places list, the place
 * detail screen and Home search all treat them alike. Each item's `key`
 * ("place-<id>" / "ghat-<id>") is unique and is what navigation passes around.
 */

import { Linking } from 'react-native';
import { getPlaceImage, isPlaceImageRepresentative, placePhotoKey } from './imageAssets';
import { searchFields } from './searchText';
import placesData from '../data/places.json';
import { GHATS } from '../data/ghats';

export const CITY_HI = {
  Mathura: 'मथुरा',
  Vrindavan: 'वृंदावन',
  Gokul: 'गोकुल',
  Govardhan: 'गोवर्धन',
  Barsana: 'बरसाना',
  Baldev: 'बलदेव',
};

// places.json has best time / visit length in Hindi only; these are the values it uses.
const BEST_TIME_EN = {
  'अक्टूबर से मार्च': 'October to March',
  'सावन एवं महाशिवरात्रि': 'Sawan and Mahashivratri',
  'सर्दियों और त्योहारों के समय': 'Winter and festival time',
  'बलराम जयंती एवं होली': 'Balaram Jayanti and Holi',
  'नवरात्रि एवं धार्मिक पर्व': 'Navratri and religious festivals',
};

export function bestTimeEn(text) {
  return BEST_TIME_EN[text] || null;
}

// "1–2 दिन" -> "1–2 days", "4–6 घंटे" -> "4–6 hours". Anything else: no English line.
export function visitLengthEn(text) {
  const m = String(text || '').match(/^([\d–-]+)\s*(दिन|घंटे)$/);
  if (!m) return null;
  const one = m[1] === '1';
  if (m[2] === 'दिन') return `${m[1]} ${one ? 'day' : 'days'}`;
  return `${m[1]} ${one ? 'hour' : 'hours'}`;
}

export const PLACE_ITEMS = placesData.map((p) => ({
  key: `place-${p.id}`,
  kind: 'place',
  icon: 'location',
  nameHi: p.nameHindi,
  nameEn: p.name,
  townHi: CITY_HI[p.city] || p.city,
  townEn: p.city,
  descHi: p.shortDescription,
  descEn: p.shortDescriptionEn,
  image: getPlaceImage(p),
  representative: isPlaceImageRepresentative(p),
  photoKey: placePhotoKey(p),
  place: p,
  searchFields: searchFields(
    p.name,
    p.nameHindi,
    p.city,
    CITY_HI[p.city],
    p.category,
    p.shortDescription,
    p.shortDescriptionEn,
    p.description,
    p.highlights || []
  ),
}));

export const GHAT_ITEMS = GHATS.map((g) => ({
  key: `ghat-${g.id}`,
  kind: 'ghat',
  icon: g.icon || 'ghat',
  nameHi: g.nameHi,
  nameEn: g.nameEn,
  townHi: g.townHi,
  townEn: g.townEn,
  descHi: g.descHi,
  descEn: g.descEn,
  // A real photo of this ghat when we have one; otherwise an icon tile, never a borrowed photo.
  image: g.photo || null,
  representative: false,
  photoKey: g.photoKey || null,
  ghat: g,
  searchFields: searchFields(g.nameEn, g.nameHi, g.townEn, g.townHi, g.descEn, g.descHi, g.query),
}));

export const ALL_PLACE_ITEMS = [...PLACE_ITEMS, ...GHAT_ITEMS];

export function findPlaceItem(key) {
  return ALL_PLACE_ITEMS.find((item) => item.key === key) || null;
}

/** Google Maps directions: exact point for towns with coordinates, a name search for the rest. */
export function openPlaceDirections(item) {
  let destination;
  if (item.kind === 'place' && typeof item.place.latitude === 'number' && typeof item.place.longitude === 'number') {
    destination = `${item.place.latitude},${item.place.longitude}`;
  } else {
    destination = encodeURIComponent(item.kind === 'ghat' ? item.ghat.query : `${item.nameEn}, ${item.townEn}`);
  }
  Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`).catch(() => {});
}
