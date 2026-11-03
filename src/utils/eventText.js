/**
 * Braj Darshan - text for the celebrations in data/events.json
 * The data writes places in English and lunar dates in Hindi
 * ("भाद्रपद कृष्ण अष्टमी (Midnight)"). These helpers give each language its own
 * words, so EventCard shows no Hindi in English mode and no English in Hindi mode,
 * and the Festivals search can match what a reader sees in either language.
 * Words are only translated, never made up: anything the tables below do not know
 * is left out of the English text rather than guessed.
 */

import { HINDU_MONTHS, TITHIS_SHUKLA, TITHIS_KRISHNA } from '../services/panchangService';

export const PLACE_HI = {
  Mathura: 'मथुरा',
  Vrindavan: 'वृंदावन',
  Barsana: 'बरसाना',
  Gokul: 'गोकुल',
  Govardhan: 'गोवर्धन',
  Nandgaon: 'नंदगांव',
  'Barsana & Nandgaon': 'बरसाना व नंदगांव',
  'Govardhan & Vrindavan': 'गोवर्धन व वृंदावन',
  'Entire Braj Region': 'सम्पूर्ण ब्रज क्षेत्र',
};

export const CATEGORY_LABELS = {
  'Spiritual Festival': { hi: 'आध्यात्मिक पर्व', en: 'Festival' },
  'Holi Celebration': { hi: 'होली उत्सव', en: 'Holi' },
  'Aarti & Raslila': { hi: 'आरती व रासलीला', en: 'Aarti & Raslila' },
  Parikrama: { hi: 'परिक्रमा', en: 'Parikrama' },
};

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

const DEVANAGARI = /[ऀ-ॿ]/;

// Single Hindi words in the lunar dates -> English. Month and tithi names come from
// the Panchang tables so both screens spell them the same way.
const WORD_EN = {
  ...Object.fromEntries(HINDU_MONTHS.map((m) => [m.hi, m.en])),
  ...Object.fromEntries([...TITHIS_SHUKLA, ...TITHIS_KRISHNA].map((t) => [t.shortHi, t.shortEn])),
  शुक्ल: 'Shukla',
  कृष्ण: 'Krishna',
  से: 'to',
  मास: 'month',
  पुरुषोत्तम: 'Purushottam',
  रंगभरी: 'Rangbhari',
};

// Whole phrases that are not word-for-word.
const PHRASE_EN = {
  'दीपावली के अगले दिन': 'the day after Diwali',
  'वर्षभर / विशेष पर्व': 'Year-round / special festivals',
};
const PHRASE_HI = {
  Midnight: 'मध्यरात्रि',
};

const DAY_PART_BEFORE_CLOCK = /(?:प्रातः|सुबह|दोपहर|सायं|शाम|रात्रि|रात)\s+(?=\d{1,2}:\d{2}\s*[AP]M\b)/g;

// English text for a Hindi phrase, or '' when a word is not in the tables.
function toEnglish(text) {
  const t = String(text || '').trim();
  if (!t) return '';
  if (PHRASE_EN[t]) return PHRASE_EN[t];
  // "प्रातः 04:00 AM" -> "04:00 AM": AM/PM already says the part of the day.
  const words = t
    .replace(DAY_PART_BEFORE_CLOCK, '')
    .split(/\s+/)
    .map((w) => WORD_EN[w] || w);
  return words.some((w) => DEVANAGARI.test(w)) ? '' : words.join(' ');
}

// Hindi text for a phrase from the data, without stray English.
function toHindi(text) {
  const t = String(text || '').trim();
  if (PHRASE_HI[t]) return PHRASE_HI[t];
  // "प्रातः 04:00 AM" -> "प्रातः 04:00": the Hindi word already says the part of the day.
  return t.replace(/([ऀ-ॿ]+)\s+(\d{1,2}:\d{2})\s*[AP]M\b/g, '$1 $2');
}

export function eventTitle(event, isHindi) {
  if (!event) return '';
  return isHindi ? event.title || event.titleEn || '' : event.titleEn || event.title || '';
}

export function eventPlace(event, isHindi) {
  const placeEn = event?.locationEn || event?.location || '';
  return isHindi ? PLACE_HI[placeEn] || placeEn : placeEn;
}

export function eventCategoryLabel(event, isHindi) {
  const label = CATEGORY_LABELS[event?.category];
  if (label) return isHindi ? label.hi : label.en;
  return isHindi ? '' : event?.category || '';
}

export function eventDescription(event, isHindi) {
  return (isHindi ? event?.desc : event?.descEn) || '';
}

/**
 * The traditional lunar date in the reader's language.
 * "भाद्रपद शुक्ल अष्टमी (प्रातः 04:00 AM)" -> Hindi "भाद्रपद शुक्ल अष्टमी (प्रातः 04:00)",
 * English "Bhadrapada Shukla Ashtami (04:00 AM)". '' when it cannot be given in English.
 */
export function eventLunarDate(event, isHindi) {
  const raw = String(event?.date || '').trim();
  if (!raw) return '';
  const pieces = raw
    .split(/(\([^)]*\))/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out = [];
  for (const piece of pieces) {
    const isNote = piece.startsWith('(') && piece.endsWith(')');
    const inner = isNote ? piece.slice(1, -1) : piece;
    const text = isHindi ? toHindi(inner) : toEnglish(inner);
    if (!text) {
      if (isNote) continue; // an untranslatable note is dropped, the date itself is not guessed
      return '';
    }
    out.push(isNote ? `(${text})` : text);
  }
  return out.join(' ');
}

/**
 * The month the celebration usually falls in.
 * "भाद्रपद (August - September)" -> Hindi "भाद्रपद (अगस्त – सितंबर)",
 * English "Bhadrapada (August – September)".
 */
export function eventSeason(event, isHindi) {
  const raw = String(event?.month || '');
  const lunar = raw.split('(')[0].trim();
  const inBrackets = /\(([^)]+)\)/.exec(raw);
  const months = inBrackets ? inBrackets[1].split(/\s*[-–]\s*/).map((m) => m.trim()) : [];

  if (isHindi) {
    const hiMonths = months.map((m) => MONTHS_HI[MONTHS_EN.indexOf(m)]);
    const greg = hiMonths.length && hiMonths.every(Boolean) ? ` (${hiMonths.join(' – ')})` : '';
    return lunar ? `${lunar}${greg}` : '';
  }
  const lunarEn = toEnglish(lunar);
  const greg = months.every((m) => MONTHS_EN.includes(m)) ? months.join(' – ') : '';
  if (lunarEn && greg) return `${lunarEn} (${greg})`;
  return lunarEn || greg;
}

/** Every text a reader could search an event by, in both languages. */
export function eventSearchFields(event) {
  if (!event) return [];
  const category = CATEGORY_LABELS[event.category];
  return [
    event.title,
    event.titleEn,
    event.location,
    event.locationEn,
    eventPlace(event, true),
    event.category,
    category && category.hi,
    category && category.en,
    event.date,
    eventLunarDate(event, false),
    eventSeason(event, true),
    eventSeason(event, false),
    event.desc,
    event.descEn,
  ];
}
