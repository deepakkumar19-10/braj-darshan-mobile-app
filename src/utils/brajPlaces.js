/**
 * Braj Darshan - the website's Braj places for the app (data/brajPlaces.json, made by
 * scripts/sync-braj-places.mjs from divyabraj.com/api/v1/places): towns with their place
 * counts, kinds of place, photos, today's darshan windows and the website link.
 */

import data from '../data/brajPlaces.json';
import { getIndianStandardTime, formatMinutes } from './templeHours';

export const BRAJ_PLACES = data.places;

// Towns (regions) in the order a pilgrim usually thinks of them; each has a local photo where
// the app ships one (works offline), else the first own photo of a place in that town.
const TOWN_INFO = {
  vrindavan: { hi: 'वृंदावन', en: 'Vrindavan', image: require('../assets/images/places/vrindavan.jpg') },
  mathura: { hi: 'मथुरा', en: 'Mathura', image: require('../assets/images/places/mathura.jpg') },
  govardhan: { hi: 'गोवर्धन', en: 'Govardhan', image: require('../assets/images/places/govardhan.jpg') },
  barsana: { hi: 'बरसाना', en: 'Barsana', image: require('../assets/images/places/barsana.jpg') },
  'gokul-mahavan': { hi: 'गोकुल', en: 'Gokul', image: require('../assets/images/places/gokul.jpg') },
  nandgaon: { hi: 'नंदगाँव', en: 'Nandgaon' },
  kamyavan: { hi: 'कामवन', en: 'Kamyavan' },
  'chhata-shergarh': { hi: 'छाता', en: 'Chhata' },
  'kosi-kokilavan': { hi: 'कोकिलावन', en: 'Kokilavan' },
  mant: { hi: 'माँट', en: 'Mant' },
  baldev: { hi: 'दाऊजी', en: 'Dauji', image: require('../assets/images/places/dauji.jpg') },
};

const ownPhoto = (p) => (p.photo && !p.photo.representative ? p.photo : null);

export const BRAJ_TOWNS = Object.entries(TOWN_INFO)
  .map(([id, info]) => {
    const places = BRAJ_PLACES.filter((p) => p.region === id);
    const firstOwn = places.map(ownPhoto).find(Boolean);
    return { id, ...info, count: places.length, image: info.image || (firstOwn ? { uri: firstOwn.uri } : null) };
  })
  .filter((t) => t.count > 0);

/** Kinds of place, as the website names them. */
export const PLACE_KINDS = {
  'major-temple': { hi: 'मंदिर', en: 'Temple' },
  'ancient-temple': { hi: 'प्राचीन मंदिर', en: 'Ancient temple' },
  'leela-sthali': { hi: 'लीला स्थल', en: 'Leela sthal' },
  'kund-sarovar': { hi: 'कुंड-सरोवर', en: 'Kund' },
  ghat: { hi: 'घाट', en: 'Ghat' },
  'van-garden': { hi: 'वन', en: 'Van' },
  parikrama: { hi: 'परिक्रमा', en: 'Parikrama' },
  'historical-cultural': { hi: 'इतिहास', en: 'Heritage' },
  'ashram-institution': { hi: 'आश्रम', en: 'Ashram' },
  'peaceful-spot': { hi: 'शांत स्थल', en: 'Peaceful spot' },
};

export const kindLabel = (category, isHindi) => {
  const k = PLACE_KINDS[category];
  return k ? (isHindi ? k.hi : k.en) : '';
};

/** Places of a town: P1 first, then the rest, in the website's order. */
export function placesInTown(townId) {
  const list = BRAJ_PLACES.filter((p) => p.region === townId);
  return [...list.filter((p) => p.priority === 'P1'), ...list.filter((p) => p.priority !== 'P1')];
}

/** The kinds that occur in a list of places, in PLACE_KINDS order. */
export function kindsIn(list) {
  const present = new Set(list.map((p) => p.category));
  return Object.keys(PLACE_KINDS).filter((k) => present.has(k));
}

export const findBrajPlace = (id) => BRAJ_PLACES.find((p) => p.id === id) || null;

export const placeImage = (p) => (p?.photo?.uri ? { uri: p.photo.uri } : null);

/**
 * The place's page on divyabraj.com with the full details (sources, history, access): the path the
 * sync script found answering on the website (/temples/… or /places/…), or null when there is none.
 */
export const placeWebUrl = (p) => (p?.web ? `https://www.divyabraj.com${encodeURI(p.web)}` : null);

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};

// "MM-DD" ranges may wrap the year end (10-01 .. 03-31).
function seasonFor(timings, ist) {
  const md = `${String(ist.getMonth() + 1).padStart(2, '0')}-${String(ist.getDate()).padStart(2, '0')}`;
  return (timings?.seasons || []).find((s) => (s.from <= s.to ? md >= s.from && md <= s.to : md >= s.from || md <= s.to)) || null;
}

/**
 * Today's darshan windows and whether the place is open now (IST), from the website's timings.
 * null when the data has no timings for today. { isOpen, until, opensAt, windows: ['8:00 AM – 1:30 PM', …] }
 */
export function placeOpenStatus(p, now = new Date()) {
  const ist = getIndianStandardTime(now);
  const season = seasonFor(p?.timings, ist);
  if (!season || !season.windows?.length) return null;
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const windows = season.windows.map(([a, b]) => [toMinutes(a), toMinutes(b)]);
  const current = windows.find(([a, b]) => mins >= a && mins < b);
  const next = windows.find(([a]) => a > mins);
  return {
    isOpen: Boolean(current),
    until: current ? formatMinutes(current[1]) : null,
    opensAt: !current && next ? formatMinutes(next[0]) : null,
    windows: windows.map(([a, b]) => `${formatMinutes(a)} – ${formatMinutes(b)}`),
  };
}
