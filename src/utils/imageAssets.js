/**
 * Braj Darshan - Image Asset Registry
 * Provides offline bundle images with graceful fallbacks
 */

// Keys must match the temple ids in src/data/temples.json.
// Temples 5 (Daan Ghati) and 6 (Dwarkadhish) have no verified photo yet, so they use the fallback.
export const templeAssets = {
  1: require('../assets/images/temples/banke-bihari.jpg'),
  2: require('../assets/images/temples/krishna-janmabhoomi.jpg'),
  3: require('../assets/images/temples/prem-mandir.jpg'),
  4: require('../assets/images/temples/radha-rani.jpg'),
  7: require('../assets/images/temples/raman-reti.jpg'),
  8: require('../assets/images/temples/dauji.jpg'),
  9: require('../assets/images/temples/chandrawal-maiya.jpg'),
};

export const placeAssets = {
  1: require('../assets/images/places/vrindavan.jpg'),
  2: require('../assets/images/places/mathura.jpg'),
  3: require('../assets/images/places/govardhan.jpg'),
  4: require('../assets/images/places/barsana.jpg'),
  5: require('../assets/images/places/gokul.jpg'),
};

export const foodAssets = {
  1: require('../assets/images/food/mathura-peda.jpg'),
  2: require('../assets/images/food/rabri.jpg'),
  3: require('../assets/images/food/malai-makkhan.jpg'),
  4: require('../assets/images/food/kachori-sabzi.jpg'),
  5: require('../assets/images/food/jalebi.jpg'),
  6: require('../assets/images/food/kulhar-lassi.jpg'),
  7: require('../assets/images/food/puri-sabzi.jpg'),
  8: require('../assets/images/food/aloo-tikki.jpg'),
};

export const eventAssets = {
  1: require('../assets/images/events/krishna-janmashtami-mathura.jpg'),
  2: require('../assets/images/events/lathmar-holi-barsana.jpg'),
  3: require('../assets/images/events/phoolon-ki-holi-vrindavan.jpg'),
  4: require('../assets/images/events/radhashtami-barsana.jpg'),
  5: require('../assets/images/events/govardhan-puja.jpg'),
  6: require('../assets/images/events/annakoot-mahotsav.jpg'),
  7: require('../assets/images/events/gopal-janmotsav-gokul.jpg'),
  8: require('../assets/images/events/jhulan-utsav-vrindavan.jpg'),
  9: require('../assets/images/events/braj-parikrama.jpg'),
};

// Photos looked up by the file name used in the data files (e.g. "/images/places/mathura.avif"
// -> "places/mathura"), so a photo can never be attached to the wrong id again.
const IMAGES_BY_NAME = {
  'temples/banke-bihari': require('../assets/images/temples/banke-bihari.jpg'),
  'temples/krishna-janmabhoomi': require('../assets/images/temples/krishna-janmabhoomi.jpg'),
  'temples/prem-mandir': require('../assets/images/temples/prem-mandir.jpg'),
  'temples/radha-rani': require('../assets/images/temples/radha-rani.jpg'),
  'temples/raman-reti': require('../assets/images/temples/raman-reti.jpg'),
  'temples/dauji': require('../assets/images/temples/dauji.jpg'),
  'temples/chandrawal-maiya': require('../assets/images/temples/chandrawal-maiya.jpg'),
  'places/mathura': require('../assets/images/places/mathura.jpg'),
  'places/vrindavan': require('../assets/images/places/vrindavan.jpg'),
  'places/gokul': require('../assets/images/places/gokul.jpg'),
  'places/govardhan': require('../assets/images/places/govardhan.jpg'),
  'places/barsana': require('../assets/images/places/barsana.jpg'),
  'places/mahadev': require('../assets/images/places/mahadev.jpg'),
  'places/raman-reti': require('../assets/images/places/raman-reti.jpg'),
  'places/dauji': require('../assets/images/places/dauji.jpg'),
  'places/chandrawal-maiya': require('../assets/images/places/chandrawal-maiya.jpg'),
  'food/mathura-peda': require('../assets/images/food/mathura-peda.jpg'),
  'food/puri-sabzi': require('../assets/images/food/puri-sabzi.jpg'),
  'food/malai-makkhan': require('../assets/images/food/malai-makkhan.jpg'),
  'food/kulhar-lassi': require('../assets/images/food/kulhar-lassi.jpg'),
  'food/kachori-sabzi': require('../assets/images/food/kachori-sabzi.jpg'),
  'food/rabri': require('../assets/images/food/rabri.jpg'),
  'food/aloo-tikki': require('../assets/images/food/aloo-tikki.jpg'),
  'food/jalebi': require('../assets/images/food/jalebi.jpg'),
  'events/krishna-janmashtami-mathura': require('../assets/images/events/krishna-janmashtami-mathura.jpg'),
  'events/lathmar-holi-barsana': require('../assets/images/events/lathmar-holi-barsana.jpg'),
  'events/phoolon-ki-holi-vrindavan': require('../assets/images/events/phoolon-ki-holi-vrindavan.jpg'),
  'events/govardhan-puja': require('../assets/images/events/govardhan-puja.jpg'),
  'events/radhashtami-barsana': require('../assets/images/events/radhashtami-barsana.jpg'),
  'events/jhulan-utsav-vrindavan': require('../assets/images/events/jhulan-utsav-vrindavan.jpg'),
  'events/braj-parikrama': require('../assets/images/events/braj-parikrama.jpg'),
  'events/gopal-janmotsav-gokul': require('../assets/images/events/gopal-janmotsav-gokul.jpg'),
};

function imageFromDataPath(path) {
  if (!path) return null;
  const key = String(path).replace(/^\/?images\//, '').replace(/\.[a-z]+$/, '');
  return IMAGES_BY_NAME[key] || null;
}

export function getTempleImage(temple) {
  return temple ? imageFromDataPath(temple.image) : null;
}

export function getFoodImage(food) {
  return food ? imageFromDataPath(food.image) : null;
}

export function getEventImage(event) {
  return event ? imageFromDataPath(event.image) : null;
}

export function getPlaceImage(place) {
  return place ? imageFromDataPath(place.image) : null;
}

export default {
  templeAssets,
  placeAssets,
  foodAssets,
  eventAssets,
  getTempleImage,
  getFoodImage,
  getEventImage,
  getPlaceImage,
};
