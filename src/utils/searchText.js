/**
 * Braj Darshan - Search text helpers
 * Works on top of normalizeSearch / matchesSearch from the UI kit.
 *
 * foldHindi() maps common Hindi spelling variants to one form, so a name is
 * found however it is typed: वृन्दावन = वृंदावन (half nasal = anusvara),
 * ज़ = ज (nukta), पूँछ = पूंछ (chandrabindu = anusvara). Apply it to both the
 * query and the text being searched.
 */

// Precomposed nukta letters (U+0958–U+095F) -> base letters.
const NUKTA_BASE = {
  'क़': 'क',
  'ख़': 'ख',
  'ग़': 'ग',
  'ज़': 'ज',
  'ड़': 'ड',
  'ढ़': 'ढ',
  'फ़': 'फ',
  'य़': 'य',
};

export function foldHindi(text) {
  return String(text || '')
    .replace(/[क़-य़]/g, (ch) => NUKTA_BASE[ch] || ch)
    .replace(/़/g, '')
    .replace(/ँ/g, 'ं')
    // ङ् ञ् ण् न् म् before a consonant (or at the end of a half-typed word) -> anusvara.
    .replace(/[ङञणनम]्(?=[क-ह]|$)/g, 'ं');
}

/**
 * Split an already-normalised query into folded words. Every word has to be
 * found somewhere in an item for it to match, so "ghat mathura" works.
 */
export function searchTerms(normalisedQuery) {
  return foldHindi(normalisedQuery)
    .split(/[\s,]+/)
    .filter(Boolean);
}

/** Folded, lower-cased copies of an item's searchable fields (empty ones dropped). */
export function searchFields(...fields) {
  return fields
    .flat()
    .filter(Boolean)
    .map((f) => foldHindi(String(f).toLowerCase()));
}

export default { foldHindi, searchTerms, searchFields };
