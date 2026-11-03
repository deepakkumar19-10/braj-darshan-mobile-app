/**
 * Braj Darshan - Yamuna ghats and Govardhan kunds
 * The ghats and kunds that the old Places screen featured (plus Keshi Ghat from
 * parikrama.json). Shown on the Places screen and searched from Home.
 *
 * Each has a real photo of that ghat or kund from Wikimedia Commons, used under
 * its licence; `photoKey` links it to its credit in photoCredits.json.
 * None has coordinates, so Directions searches Google Maps by `query` instead
 * of guessing a point. Aarti and bathing times change with the season, so none
 * are stored here.
 */

export const GHATS = [
  {
    id: 'vishram-ghat',
    photo: require('../assets/images/ghats/vishram-ghat.jpg'),
    photoKey: 'ghats/vishram-ghat',
    icon: 'ghat',
    nameHi: 'विश्राम घाट',
    nameEn: 'Vishram Ghat',
    townHi: 'मथुरा',
    townEn: 'Mathura',
    descHi:
      'मान्यता है कि कंस वध के बाद श्री कृष्ण ने यहाँ विश्राम किया था। मथुरा का प्रमुख यमुना घाट, जहाँ शाम को यमुना आरती होती है।',
    descEn:
      "Believed to be where Shri Krishna rested after defeating Kamsa. Mathura's main Yamuna ghat, with an evening Yamuna aarti.",
    aarti: true,
    query: 'Vishram Ghat, Mathura',
  },
  {
    id: 'keshi-ghat',
    photo: require('../assets/images/ghats/keshi-ghat.jpg'),
    photoKey: 'ghats/keshi-ghat',
    icon: 'ghat',
    nameHi: 'केशी घाट',
    nameEn: 'Keshi Ghat',
    townHi: 'वृंदावन',
    townEn: 'Vrindavan',
    descHi: 'वृंदावन का प्रमुख यमुना घाट। मान्यता है कि श्री कृष्ण ने यहाँ केशी दैत्य का वध किया था।',
    descEn: "One of Vrindavan's main Yamuna ghats, linked with Shri Krishna defeating the demon Keshi.",
    aarti: true,
    query: 'Keshi Ghat, Vrindavan',
  },
  {
    id: 'radha-kund',
    photo: require('../assets/images/ghats/radha-kund.jpg'),
    photoKey: 'ghats/radha-kund',
    icon: 'water',
    nameHi: 'राधा कुंड व श्याम कुंड',
    nameEn: 'Radha Kund & Shyam Kund',
    townHi: 'राधा कुंड, गोवर्धन',
    townEn: 'Radha Kund, Govardhan',
    descHi:
      'गोवर्धन परिक्रमा मार्ग पर दो पावन कुंड, जो श्री राधा और श्री कृष्ण से जुड़े माने जाते हैं। पद्म पुराण के अनुसार जैसे श्री राधा श्री कृष्ण को प्रिय हैं, वैसे ही उनका कुंड भी।',
    descEn:
      "Two sacred ponds on the Govardhan parikrama route, revered as Shri Radha's and Shri Krishna's kunds. The Padma Purana says Radha Kund is as dear to Krishna as Radha herself.",
    query: 'Radha Kund, Govardhan',
  },
  {
    id: 'kusum-sarovar',
    photo: require('../assets/images/ghats/kusum-sarovar.jpg'),
    photoKey: 'ghats/kusum-sarovar',
    icon: 'water',
    nameHi: 'कुसुम सरोवर',
    nameEn: 'Kusum Sarovar',
    townHi: 'राधा कुंड और गोवर्धन के बीच',
    townEn: 'Between Radha Kund and Govardhan',
    descHi:
      'बलुआ पत्थर की छतरियों वाला ऐतिहासिक सरोवर। मान्यता है कि श्री राधा यहाँ फूल चुनने आती थीं।',
    descEn:
      'A historic sandstone tank lined with chhatris, where Shri Radha is said to have gathered flowers.',
    query: 'Kusum Sarovar, Govardhan',
  },
];

export default GHATS;
