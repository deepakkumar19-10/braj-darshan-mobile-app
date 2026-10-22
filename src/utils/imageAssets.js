/**
 * Braj Darshan - Image Asset Registry
 * Provides offline bundle images with graceful fallbacks
 */

export const templeAssets = {
  1: require('../assets/images/temples/banke-bihari.jpg'),
  2: require('../assets/images/temples/krishna-janmabhoomi.jpg'),
  3: require('../assets/images/temples/prem-mandir.jpg'),
  4: require('../assets/images/temples/dwarkadhish.jpg'),
  5: require('../assets/images/temples/radha-rani.jpg'),
  6: require('../assets/images/temples/gokul.jpg'),
  9: require('../assets/images/temples/dauji.png'),
  10: require('../assets/images/temples/raman-reti.png'),
  11: require('../assets/images/temples/chandrawal-maiya.png'),
};

export const placeAssets = {
  1: require('../assets/images/places/vrindavan.jpg'),
  2: require('../assets/images/places/mathura.jpg'),
  3: require('../assets/images/places/govardhan.jpg'),
  4: require('../assets/images/places/barsana.jpg'),
  5: require('../assets/images/places/gokul.jpg'),
};

export const foodAssets = {
  1: require('../assets/images/food/mathura-peda.png'),
  2: require('../assets/images/food/rabri.png'),
  3: require('../assets/images/food/malai-makkhan.png'),
  4: require('../assets/images/food/kachori-sabzi.png'),
  5: require('../assets/images/food/jalebi.png'),
  6: require('../assets/images/food/kulhar-lassi.png'),
  7: require('../assets/images/food/puri-sabzi.png'),
  8: require('../assets/images/food/aloo-tikki.png'),
};

export const eventAssets = {
  1: require('../assets/images/events/krishna-janmashtami-mathura.png'),
  2: require('../assets/images/events/lathmar-holi-barsana.png'),
  3: require('../assets/images/events/phoolon-ki-holi-vrindavan.png'),
  4: require('../assets/images/events/radhashtami-barsana.png'),
  5: require('../assets/images/events/govardhan-puja.png'),
  6: require('../assets/images/events/annakoot-mahotsav.png'),
  7: require('../assets/images/events/gopal-janmotsav-gokul.png'),
  8: require('../assets/images/events/jhulan-utsav-vrindavan.png'),
  9: require('../assets/images/events/braj-parikrama.png'),
};

export function getTempleImage(temple) {
  if (!temple) return null;
  return templeAssets[temple.id] || null;
}

export function getFoodImage(food) {
  if (!food) return null;
  return foodAssets[food.id] || null;
}

export function getEventImage(event) {
  if (!event) return null;
  return eventAssets[event.id] || null;
}

export function getPlaceImage(place) {
  if (!place) return null;
  return placeAssets[place.id] || null;
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
