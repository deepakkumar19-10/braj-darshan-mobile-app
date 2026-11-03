/**
 * Picks the app's own photo for a festival by its name, so each festival card shows
 * imagery of that festival (Holi for Holi, Janmashtami for Janmashtami…).
 * Returns null when the app has no photo of that festival — callers show a plain
 * fallback instead of an unrelated picture. Callers label these photos
 * "Representative photo": they show the festival, not necessarily this year's
 * celebration in Braj. Photos from Wikimedia Commons are credited in photoCredits.json.
 */

const IMAGES = {
  lathmarHoli: require('../assets/images/events/lathmar-holi-barsana.jpg'),
  phoolonHoli: require('../assets/images/events/phoolon-ki-holi-vrindavan.jpg'),
  janmashtami: require('../assets/images/events/krishna-janmashtami-mathura.jpg'),
  nandotsav: require('../assets/images/events/gopal-janmotsav-gokul.jpg'),
  radhashtami: require('../assets/images/events/radhashtami-barsana.jpg'),
  govardhan: require('../assets/images/events/govardhan-puja.jpg'),
  annakoot: require('../assets/images/events/annakoot-mahotsav.jpg'),
  jhulan: require('../assets/images/events/jhulan-utsav-vrindavan.jpg'),
  parikrama: require('../assets/images/events/braj-parikrama.jpg'),
  // Wikimedia Commons (see photoCredits.json).
  deepotsav: require('../assets/images/events/deepotsav-river.jpg'),
  gopashtami: require('../assets/images/events/gopashtami-pichhavai.jpg'),
  tulsiVivah: require('../assets/images/events/tulsi-vivah.jpg'),
  // Bhai Dooj snan is held at Vishram Ghat, so the ghat's own photo fits it.
  vishramGhat: require('../assets/images/ghats/vishram-ghat.jpg'),
};

// Checked in order: the first matching rule wins.
const RULES = [
  [/phoolon|फूलों/i, 'phoolonHoli'],
  [/holi|होली|huranga|हुरंगा|dhulandi|धुलंडी|holika|होलिका/i, 'lathmarHoli'],
  [/janmashtami|जन्माष्टमी/i, 'janmashtami'],
  [/nandotsav|नंदोत्सव|dadhikando/i, 'nandotsav'],
  [/radhashtami|राधाष्टमी/i, 'radhashtami'],
  [/annakoot|अन्नकूट/i, 'annakoot'],
  [/govardhan|गोवर्धन/i, 'govardhan'],
  [/jhulan|झूलन|raksha|रक्षा/i, 'jhulan'],
  [/parikrama|परिक्रमा|mudiya|मुड़िया|guru purnima|गुरु पूर्णिमा/i, 'parikrama'],
  [/deepawali|diwali|dipawali|deepotsav|दीपावली|दिवाली|दीवाली|दीपोत्सव/i, 'deepotsav'],
  [/yama dwitiya|bhai dooj|यम द्वितीया|भाई दूज/i, 'vishramGhat'],
  [/gopashtami|गोपाष्टमी/i, 'gopashtami'],
  [/tulsi|तुलसी|devutthana|devuthani|देवउठनी|देवोत्थान|prabodhini|प्रबोधिनी/i, 'tulsiVivah'],
];

export function getFestivalImage(festival) {
  if (!festival) return null;
  const text = [festival.nameEn, festival.nameHi, festival.shortEn, festival.shortHi, festival.title, festival.titleEn]
    .filter(Boolean)
    .join(' ');
  const rule = RULES.find(([re]) => re.test(text));
  return rule ? IMAGES[rule[1]] : null;
}

/** Icon for a festival card without a photo: a diya for Deepawali, otherwise a general festival mark. */
export function getFestivalIcon(festival) {
  const text = festival ? `${festival.nameEn || ''} ${festival.nameHi || ''}` : '';
  return /deepawali|diwali|dipawali|दीपावली|दिवाली|दीवाली/i.test(text) ? 'aarti' : 'festival';
}

export default getFestivalImage;
