import { sunTimesIST, istInstant, panchangAt, kaalWindow } from "./vedicAstro.js";
// src/services/panchangService.js
/**
 * Authentic Vedic Panchang & Astronomical Calculation Engine for Braj (Mathura-Vrindavan)
 * Geo Coordinates: Latitude 27.4924° N, Longitude 77.6737° E
 * Calibrated for Vikram Samvat 2083, Shaka Samvat 1948, Krishna Samvat 5252
 */

export const TITHIS_SHUKLA = [
  { hi: "शुक्ल प्रतिपदा", en: "Shukla Pratipada", shortHi: "प्रतिपदा", shortEn: "Pratipada" },
  { hi: "शुक्ल द्वितीया", en: "Shukla Dwitiya", shortHi: "द्वितीया", shortEn: "Dwitiya" },
  { hi: "शुक्ल तृतीया", en: "Shukla Tritiya", shortHi: "तृतीया", shortEn: "Tritiya" },
  { hi: "शुक्ल चतुर्थी", en: "Shukla Chaturthi", shortHi: "चतुर्थी", shortEn: "Chaturthi" },
  { hi: "शुक्ल पंचमी", en: "Shukla Panchami", shortHi: "पंचमी", shortEn: "Panchami" },
  { hi: "शुक्ल षष्ठी", en: "Shukla Shashthi", shortHi: "षष्ठी", shortEn: "Shashthi" },
  { hi: "शुक्ल सप्तमी", en: "Shukla Saptami", shortHi: "सप्तमी", shortEn: "Saptami" },
  { hi: "शुक्ल अष्टमी", en: "Shukla Ashtami", shortHi: "अष्टमी", shortEn: "Ashtami" },
  { hi: "शुक्ल नवमी", en: "Shukla Navami", shortHi: "नवमी", shortEn: "Navami" },
  { hi: "शुक्ल दशमी", en: "Shukla Dashami", shortHi: "दशमी", shortEn: "Dashami" },
  { hi: "शुक्ल एकादशी", en: "Shukla Ekadashi", shortHi: "एकादशी", shortEn: "Ekadashi" },
  { hi: "शुक्ल द्वादशी", en: "Shukla Dwadashi", shortHi: "द्वादशी", shortEn: "Dwadashi" },
  { hi: "शुक्ल त्रयोदशी", en: "Shukla Trayodashi", shortHi: "त्रयोदशी", shortEn: "Trayodashi" },
  { hi: "शुक्ल चतुर्दशी", en: "Shukla Chaturdashi", shortHi: "चतुर्दशी", shortEn: "Chaturdashi" },
  { hi: "पूर्णिमा", en: "Purnima (Full Moon)", shortHi: "पूर्णिमा", shortEn: "Purnima" }
];

export const TITHIS_KRISHNA = [
  { hi: "कृष्ण प्रतिपदा", en: "Krishna Pratipada", shortHi: "प्रतिपदा", shortEn: "Pratipada" },
  { hi: "कृष्ण द्वितीया", en: "Krishna Dwitiya", shortHi: "द्वितीया", shortEn: "Dwitiya" },
  { hi: "कृष्ण तृतीया", en: "Krishna Tritiya", shortHi: "तृतीया", shortEn: "Tritiya" },
  { hi: "कृष्ण चतुर्थी", en: "Krishna Chaturthi", shortHi: "चतुर्थी", shortEn: "Chaturthi" },
  { hi: "कृष्ण पंचमी", en: "Krishna Panchami", shortHi: "पंचमी", shortEn: "Panchami" },
  { hi: "कृष्ण षष्ठी", en: "Krishna Shashthi", shortHi: "षष्ठी", shortEn: "Shashthi" },
  { hi: "कृष्ण सप्तमी", en: "Krishna Saptami", shortHi: "सप्तमी", shortEn: "Saptami" },
  { hi: "कृष्ण अष्टमी", en: "Krishna Ashtami", shortHi: "अष्टमी", shortEn: "Ashtami" },
  { hi: "कृष्ण नवमी", en: "Krishna Navami", shortHi: "नवमी", shortEn: "Navami" },
  { hi: "कृष्ण दशमी", en: "Krishna Dashami", shortHi: "दशमी", shortEn: "Dashami" },
  { hi: "कृष्ण एकादशी", en: "Krishna Ekadashi", shortHi: "एकादशी", shortEn: "Ekadashi" },
  { hi: "कृष्ण द्वादशी", en: "Krishna Dwadashi", shortHi: "द्वादशी", shortEn: "Dwadashi" },
  { hi: "कृष्ण त्रयोदशी", en: "Krishna Trayodashi", shortHi: "त्रयोदशी", shortEn: "Trayodashi" },
  { hi: "कृष्ण चतुर्दशी", en: "Krishna Chaturdashi", shortHi: "चतुर्दशी", shortEn: "Chaturdashi" },
  { hi: "अमावस्या", en: "Amavasya (New Moon)", shortHi: "अमावस्या", shortEn: "Amavasya" }
];

export const NAKSHATRAS = [
  { hi: "अश्विनी", en: "Ashwini", deity: "अश्विनी कुमार", lord: "केतु" },
  { hi: "भरणी", en: "Bharani", deity: "यमराज", lord: "शुक्र" },
  { hi: "कृत्तिका", en: "Krittika", deity: "अग्नि", lord: "सूर्य" },
  { hi: "रोहिणी", en: "Rohini", deity: "ब्रह्मा", lord: "चंद्र" },
  { hi: "मृगशिरा", en: "Mrigashira", deity: "सोम (चंद्र)", lord: "मंगल" },
  { hi: "आर्द्रा", en: "Ardra", deity: "रुद्र", lord: "राहु" },
  { hi: "पुनर्वसु", en: "Punarvasu", deity: "अदिति", lord: "गुरु" },
  { hi: "पुष्य", en: "Pushya", deity: "बृहस्पति", lord: "शनि" },
  { hi: "आश्लेषा", en: "Ashlesha", deity: "सर्प", lord: "बुध" },
  { hi: "मघा", en: "Magha", deity: "पितर", lord: "केतु" },
  { hi: "पूर्वाफाल्गुनी", en: "Purva Phalguni", deity: "भग", lord: "शुक्र" },
  { hi: "उत्तराफाल्गुनी", en: "Uttara Phalguni", deity: "अर्यमा", lord: "सूर्य" },
  { hi: "हस्त", en: "Hasta", deity: "सविता (सूर्य)", lord: "चंद्र" },
  { hi: "चित्रा", en: "Chitra", deity: "विश्वकर्मा", lord: "मंगल" },
  { hi: "स्वाति", en: "Swati", deity: "वायु", lord: "राहु" },
  { hi: "विशाखा", en: "Vishakha", deity: "इन्द्राग्नि", lord: "गुरु" },
  { hi: "अनुराधा", en: "Anuradha", deity: "मित्र", lord: "शनि" },
  { hi: "ज्येष्ठा", en: "Jyeshtha", deity: "इन्द्र", lord: "बुध" },
  { hi: "मूल", en: "Mula", deity: "निरृति", lord: "केतु" },
  { hi: "पूर्वाषाढ़ा", en: "Purva Ashadha", deity: "आपः (जल)", lord: "शुक्र" },
  { hi: "उत्तराषाढ़ा", en: "Uttara Ashadha", deity: "विश्वेदेव", lord: "सूर्य" },
  { hi: "श्रवण", en: "Shravana", deity: "विष्णु", lord: "चंद्र" },
  { hi: "धनिष्ठा", en: "Dhanishtha", deity: "अष्टवसु", lord: "मंगल" },
  { hi: "शतभिषा", en: "Shatabhisha", deity: "वरुण", lord: "राहु" },
  { hi: "पूर्वाभाद्रपद", en: "Purva Bhadrapada", deity: "अजैकपाद", lord: "गुरु" },
  { hi: "उत्तराभाद्रपद", en: "Uttara Bhadrapada", deity: "अहिर्बुध्न्य", lord: "शनि" },
  { hi: "रेवती", en: "Revati", deity: "पूषा", lord: "बुध" }
];

export const YOGAS = [
  { hi: "विष्कुम्भ", en: "Vishkumbha" }, { hi: "प्रीति", en: "Priti" }, { hi: "आयुष्मान", en: "Ayushman" },
  { hi: "सौभाग्य", en: "Saubhagya" }, { hi: "शोभन", en: "Shobhana" }, { hi: "अतिगण्ड", en: "Atiganda" },
  { hi: "सुकर्मा", en: "Sukarma" }, { hi: "धृति", en: "Dhriti" }, { hi: "शूल", en: "Shula" },
  { hi: "गण्ड", en: "Ganda" }, { hi: "वृद्धि", en: "Vriddhi" }, { hi: "ध्रुव", en: "Dhruva" },
  { hi: "व्याघात", en: "Vyaghata" }, { hi: "हर्षण", en: "Harshana" }, { hi: "वज्र", en: "Vajra" },
  { hi: "सिद्धि", en: "Siddhi" }, { hi: "व्यतीपात", en: "Vyatipata" }, { hi: "वरीयान्", en: "Variyana" },
  { hi: "परिघ", en: "Parigha" }, { hi: "शिव", en: "Shiva" }, { hi: "सिद्ध", en: "Siddha" },
  { hi: "साध्य", en: "Sadhya" }, { hi: "शुभ", en: "Shubha" }, { hi: "शुक्ल", en: "Shukla" },
  { hi: "ब्रह्म", en: "Brahma" }, { hi: "इन्द्र", en: "Indra" }, { hi: "वैधृति", en: "Vaidhriti" }
];

export const KARANAS = [
  { hi: "बव", en: "Bava" }, { hi: "बालव", en: "Balava" }, { hi: "कौलव", en: "Kaulava" },
  { hi: "तैतिल", en: "Taitila" }, { hi: "गर", en: "Gara" }, { hi: "वणिज", en: "Vanija" },
  { hi: "विष्टि (भद्रा)", en: "Vishti (Bhadra)" }, { hi: "शकुनि", en: "Shakuni" },
  { hi: "चतुष्पाद", en: "Chatushpada" }, { hi: "नाग", en: "Naga" }, { hi: "किंस्तुघ्न", en: "Kinstughna" }
];

export const HINDU_MONTHS = [
  { hi: "चैत्र", en: "Chaitra" },
  { hi: "वैशाख", en: "Vaishakha" },
  { hi: "ज्येष्ठ", en: "Jyeshtha" },
  { hi: "आषाढ़", en: "Ashadha" },
  { hi: "श्रावण", en: "Shravana" },
  { hi: "भाद्रपद", en: "Bhadrapada" },
  { hi: "आश्विन", en: "Ashwina" },
  { hi: "कार्तिक", en: "Kartika" },
  { hi: "मार्गशीर्ष", en: "Margashirsha" },
  { hi: "पौष", en: "Pausha" },
  { hi: "माघ", en: "Magha" },
  { hi: "फाल्गुन", en: "Phalguna" }
];

export const CHOGHADIYA_DEFINITIONS = {
  AMRIT: { nameHi: "अमृत", nameEn: "Amrit", quality: "अति शुभ", type: "auspicious", color: "#16A34A", descHi: "सर्वोत्तम व अमृततुल्य फलदायी" },
  SHUBH: { nameHi: "शुभ", nameEn: "Shubh", quality: "शुभ", type: "auspicious", color: "#15803D", descHi: "मांगलिक व धार्मिक कार्यों हेतु" },
  LABH: { nameHi: "लाभ", nameEn: "Labh", quality: "शुभ", type: "auspicious", color: "#0D9488", descHi: "व्यापार, धन व विद्या वृद्धि हेतु" },
  CHAR: { nameHi: "चर", nameEn: "Char", quality: "सामान्य शुभ", type: "neutral", color: "#D97706", descHi: "यात्रा व गतिशील कार्यों हेतु" },
  UDVEG: { nameHi: "उद्वेग", nameEn: "Udveg", quality: "अशुभ", type: "inauspicious", color: "#DC2626", descHi: "चिंता व तनाव कारक (सूर्य)" },
  KAAL: { nameHi: "काल", nameEn: "Kaal", quality: "अशुभ", type: "inauspicious", color: "#991B1B", descHi: "हानि व संकट कारक (शनि)" },
  ROG: { nameHi: "रोग", nameEn: "Rog", quality: "अशुभ", type: "inauspicious", color: "#B91C1C", descHi: "कष्ट व रोग कारक (मंगल)" },
};

// Day choghadiya starting index for Sunday (0) to Saturday (6)
const DAY_CHOGHADIYA_ORDER = [
  ["UDVEG", "CHAR", "LABH", "AMRIT", "KAAL", "SHUBH", "ROG", "UDVEG"], // Sun
  ["AMRIT", "KAAL", "SHUBH", "ROG", "UDVEG", "CHAR", "LABH", "AMRIT"], // Mon
  ["ROG", "UDVEG", "CHAR", "LABH", "AMRIT", "KAAL", "SHUBH", "ROG"],    // Tue
  ["LABH", "AMRIT", "KAAL", "SHUBH", "ROG", "UDVEG", "CHAR", "LABH"],   // Wed
  ["SHUBH", "ROG", "UDVEG", "CHAR", "LABH", "AMRIT", "KAAL", "SHUBH"],  // Thu
  ["CHAR", "LABH", "AMRIT", "KAAL", "SHUBH", "ROG", "UDVEG", "CHAR"],   // Fri
  ["KAAL", "SHUBH", "ROG", "UDVEG", "CHAR", "LABH", "AMRIT", "KAAL"],   // Sat
];

// Night choghadiya starting index for Sunday (0) to Saturday (6)
const NIGHT_CHOGHADIYA_ORDER = [
  ["SHUBH", "AMRIT", "CHAR", "ROG", "KAAL", "LABH", "UDVEG", "SHUBH"], // Sun
  ["CHAR", "ROG", "KAAL", "LABH", "UDVEG", "SHUBH", "AMRIT", "CHAR"],  // Mon
  ["KAAL", "LABH", "UDVEG", "SHUBH", "AMRIT", "CHAR", "ROG", "KAAL"],   // Tue
  ["UDVEG", "SHUBH", "AMRIT", "CHAR", "ROG", "KAAL", "LABH", "UDVEG"],  // Wed
  ["AMRIT", "CHAR", "ROG", "KAAL", "LABH", "UDVEG", "SHUBH", "AMRIT"],  // Thu
  ["ROG", "KAAL", "LABH", "UDVEG", "SHUBH", "AMRIT", "CHAR", "ROG"],    // Fri
  ["LABH", "UDVEG", "SHUBH", "AMRIT", "CHAR", "ROG", "KAAL", "LABH"],   // Sat
];

/**
 * Authentic Multi-Year Braj & Vedic Festival Calendar Database
 * Format: "YYYY-MM-DD"
 */
export const YEAR_FESTIVALS_MAP = {
  // ================= 2026 (YEAR 2026) =================
  "2026-01-14": {
    nameHi: "मकर संक्रांति (ब्रज पतंगोत्सव)",
    nameEn: "Makar Sankranti (Braj Kite Festival)",
    shortHi: "मकर संक्रांति",
    shortEn: "Makar Sankranti",
    badge: "🪁",
    descHi: "सूर्य का मकर राशि में प्रवेश, यमुना स्नान और ठाकुर जी को खिचड़ी भोग।"
  },
  "2026-02-15": {
    nameHi: "महाशिवरात्रि (गोपेश्वर महादेव पूजन)",
    nameEn: "Maha Shivratri (Gopeshwar Mahadev)",
    shortHi: "महाशिवरात्रि",
    shortEn: "Maha Shivratri",
    badge: "🔱",
    descHi: "वृंदावन के गोपेश्वर महादेव, भूतेश्वर व रंगेश्वर महादेव का महाअभिषेक।"
  },
  "2026-02-25": {
    nameHi: "बरसाना लट्ठमार होली",
    nameEn: "Barsana Lathmar Holi",
    shortHi: "लट्ठमार होली",
    shortEn: "Lathmar Holi",
    badge: "🎨",
    descHi: "बरसाना में रंगीली गली में गोपियों और नंदगांव के हुरियारों की प्रसिद्ध लट्ठमार होली।"
  },
  "2026-02-26": {
    nameHi: "नंदगांव लट्ठमार होली",
    nameEn: "Nandgaon Lathmar Holi",
    shortHi: "नंदगांव होली",
    shortEn: "Nandgaon Holi",
    badge: "🎨",
    descHi: "नंदभवन में बरसाना के हुरियारों पर नंदगांव की गोपियों का लाठी प्रहार व प्रेममयी होली।"
  },
  "2026-02-27": {
    nameHi: "वृंदावन फूलों की होली (रंगभरी एकादशी)",
    nameEn: "Phoolon Ki Holi (Rangbhari Ekadashi)",
    shortHi: "फूलों की होली",
    shortEn: "Flower Holi",
    badge: "🌸",
    descHi: "बांके बिहारी जी के आंगन में सुगंधित फूलों की पंखुड़ियों और हर्बल गुलाल की अलौकिक होली।"
  },
  "2026-03-02": {
    nameHi: "गोकुल छड़ीमार होली",
    nameEn: "Gokul Chhadimar Holi",
    shortHi: "छड़ीमार होली",
    shortEn: "Chhadimar Holi",
    badge: "🎋",
    descHi: "बाल कृष्ण की बाल लीलाओं को समर्पित गोकुल में छोटी छड़ियों से खेली जाने वाली होली।"
  },
  "2026-03-03": {
    nameHi: "होलिका दहन",
    nameEn: "Holika Dahan",
    shortHi: "होलिका दहन",
    shortEn: "Holika Dahan",
    badge: "🔥",
    descHi: "फाल्गुन पूर्णिमा पर बुराई पर अच्छाई की विजय, फालेन गांव में दहकती आग से पंडा का निकलना।"
  },
  "2026-03-04": {
    nameHi: "धुलेंडी महाहोली (दाऊजी हुरंगा)",
    nameEn: "Dhulandi Mahaholi (Dauji Huranga)",
    shortHi: "दाऊजी हुरंगा",
    shortEn: "Dauji Huranga",
    badge: "🌈",
    descHi: "बलदेव में दाऊजी महाराज का भव्य हुरंगा, जहाँ टेसू के रंगों की नदियाँ बहती हैं।"
  },
  "2026-03-19": {
    nameHi: "चैत्र नवरात्रि / नव संवत्सर 2083",
    nameEn: "Chaitra Navratri / Hindu New Year",
    shortHi: "नव संवत्सर",
    shortEn: "Hindu New Year",
    badge: "🚩",
    descHi: "विक्रम संवत् 2083 का शुभारंभ और माँ भगवती की नौ दिनों की आराधना।"
  },
  "2026-03-26": {
    nameHi: "श्री राम नवमी",
    nameEn: "Shri Ram Navami",
    shortHi: "राम नवमी",
    shortEn: "Ram Navami",
    badge: "🏹",
    descHi: "मर्यादा पुरुषोत्तम भगवान श्री राम का पावन जन्मोत्सव।"
  },
  "2026-04-20": {
    nameHi: "अक्षय तृतीया (बांके बिहारी जी चरण दर्शन)",
    nameEn: "Akshaya Tritiya (Charan Darshan)",
    shortHi: "चरण दर्शन",
    shortEn: "Charan Darshan",
    badge: "🪷",
    descHi: "वर्ष में केवल एक बार बांके बिहारी जी के श्री चरणों के दर्शन एवं चंदन लेप श्रृंगार।"
  },
  "2026-06-25": {
    nameHi: "निर्जला एकादशी (यमुना स्नान मेला)",
    nameEn: "Nirjala Ekadashi (Yamuna Snan)",
    shortHi: "निर्जला एकादशी",
    shortEn: "Nirjala Ekadashi",
    badge: "💧",
    descHi: "मथुरा के विश्राम घाट पर बड़ी संख्या में भक्तों का पवित्र यमुना स्नान और शरबत वितरण।"
  },
  "2026-07-29": {
    nameHi: "गुरु पूर्णिमा (मुड़िया पूनों महामेला)",
    nameEn: "Guru Purnima (Mudiya Poono Mela)",
    shortHi: "मुड़िया पूनों मेला",
    shortEn: "Mudiya Poono",
    badge: "🌕",
    descHi: "गोवर्धन में 21 किमी गिरिराज परिक्रमा का विशाल 5 दिवसीय मेला, जिसमें बड़ी संख्या में श्रद्धालु आते हैं।"
  },
  "2026-08-28": {
    nameHi: "रक्षाबंधन एवं झूलन उत्सव समापन",
    nameEn: "Raksha Bandhan & Jhulan Utsav",
    shortHi: "रक्षाबंधन / झूलन",
    shortEn: "Raksha Bandhan",
    badge: "🎋",
    descHi: "सावन मास के स्वर्ण-रजत हिंडोला झूलन उत्सव का समापन और रक्षाबंधन पर्व।"
  },
  "2026-09-04": {
    nameHi: "श्री कृष्ण जन्माष्टमी (महा जन्मोत्सव)",
    nameEn: "Shri Krishna Janmashtami (Supreme Advent)",
    shortHi: "🎉 जन्माष्टमी",
    shortEn: "🎉 Janmashtami",
    badge: "🦚",
    isMajor: true,
    descHi: "मथुरा श्रीकृष्ण जन्मस्थान व बांके बिहारी मंदिर में मध्यरात्रि जन्मोत्सव, पंचामृत अभिषेक व मंगला आरती।"
  },
  "2026-09-05": {
    nameHi: "गोकुल नंदोत्सव (दधिकांदो मेला)",
    nameEn: "Gokul Nandotsav (Dadhikando Festival)",
    shortHi: "नंदोत्सव",
    shortEn: "Nandotsav",
    badge: "🏺",
    descHi: "नंदबाबा के आंगन में हल्दी-दही का छिड़काव, बधाई गायन और आनंद की वर्षा।"
  },
  "2026-09-19": {
    nameHi: "श्री राधाष्टमी (बरसाना महामहोत्सव)",
    nameEn: "Shri Radhashtami (Barsana Mahotsav)",
    shortHi: "🌸 राधाष्टमी",
    shortEn: "🌸 Radhashtami",
    badge: "👑",
    isMajor: true,
    descHi: "श्री राधा रानी के प्राकट्य दिवस पर बरसाना लाड़ली जी मंदिर में भव्य जन्मोत्सव व महाअभिषेक।"
  },
  "2026-10-20": {
    nameHi: "विजयादशमी (दशहरा मेला)",
    nameEn: "Vijayadashami (Dussehra)",
    shortHi: "विजयादशमी",
    shortEn: "Dussehra",
    badge: "🏹",
    descHi: "भगवान राम की विजय और रावण दहन मेला।"
  },
  "2026-10-25": {
    nameHi: "शरद पूर्णिमा (महारास दर्शन)",
    nameEn: "Sharad Purnima (Maharaas Darshan)",
    shortHi: "शरद पूर्णिमा",
    shortEn: "Sharad Purnima",
    badge: "🌕",
    isMajor: true,
    descHi: "वृंदावन वंशीवट और निधिवन में महारास लीला, ठाकुर जी का विशेष चंद्रिका व श्वेत वेश श्रृंगार।"
  },
  "2026-11-08": {
    nameHi: "दीपावली (दीपदान महोत्सव)",
    nameEn: "Deepawali (Festival of Lights)",
    shortHi: "दीपावली",
    shortEn: "Diwali",
    badge: "🪔",
    isMajor: true,
    descHi: "यमुना तट और ब्रज के समस्त मंदिरों में दीपकों से महा दीपदान।"
  },
  "2026-11-10": {
    nameHi: "गोवर्धन पूजा एवं अन्नकूट महोत्सव",
    nameEn: "Govardhan Puja & Annakoot",
    shortHi: "गोवर्धन पूजा / अन्नकूट",
    shortEn: "Govardhan Puja",
    badge: "⛰️",
    isMajor: true,
    descHi: "गिरिराज जी को 56 भोग अर्पित, गायों का श्रृंगार और गोवर्धन महापरिक्रमा।"
  },
  "2026-11-11": {
    nameHi: "यम द्वितीया (विश्राम घाट भाई दूज स्नान)",
    nameEn: "Yama Dwitiya (Bhai Dooj Snan)",
    shortHi: "यम द्वितीया",
    shortEn: "Bhai Dooj",
    badge: "🌊",
    descHi: "यमुना जी और यमराज के मिलन पर भाई-बहन का विश्राम घाट पर हाथ पकड़कर पवित्र स्नान।"
  },
  "2026-11-17": {
    nameHi: "गोपाष्टमी (गौ पूजा महोत्सव)",
    nameEn: "Gopashtami (Gau Mata Puja)",
    shortHi: "गोपाष्टमी",
    shortEn: "Gopashtami",
    badge: "🐄",
    descHi: "भगवान कृष्ण द्वारा प्रथम बार गौ चारण का शुभारंभ, ब्रज की गौशालाओं में विशेष पूजन।"
  },
  "2026-11-18": {
    nameHi: "अक्षय नवमी (मथुरा परिक्रमा)",
    nameEn: "Akshaya Navami (Mathura Parikrama)",
    shortHi: "अक्षय नवमी",
    shortEn: "Akshaya Navami",
    badge: "🙏",
    descHi: "कार्तिक शुक्ल नवमी पर मथुरा की परिक्रमा और आंवला पूजन।"
  },
  "2026-11-20": {
    nameHi: "देवउठनी एकादशी (तुलसी विवाह)",
    nameEn: "Devutthana Ekadashi (Tulsi Vivah)",
    shortHi: "देवउठनी एकादशी",
    shortEn: "Devutthana Ekadashi",
    badge: "🌿",
    descHi: "चार मास की योग निद्रा से भगवान विष्णु का जागरण और मांगलिक कार्यों का शुभारंभ।"
  },
  "2026-11-24": {
    nameHi: "कार्तिक पूर्णिमा (यमुना स्नान व दीपदान)",
    nameEn: "Kartik Purnima (Yamuna Snan & Deepdaan)",
    shortHi: "कार्तिक पूर्णिमा",
    shortEn: "Kartik Purnima",
    badge: "🌕",
    descHi: "कार्तिक मास का समापन — यमुना स्नान और दीपदान।"
  },
  "2026-12-14": {
    nameHi: "विहार पंचमी (बांके बिहारी प्राकट्य उत्सव)",
    nameEn: "Vihar Panchami (Banke Bihari Prakatya Utsav)",
    shortHi: "विहार पंचमी",
    shortEn: "Vihar Panchami",
    badge: "🎶",
    descHi: "मार्गशीर्ष शुक्ल पंचमी — निधिवन में स्वामी हरिदास जी के समक्ष ठाकुर बांके बिहारी जी के प्रकट होने का उत्सव।"
  },
  "2026-12-20": {
    nameHi: "गीता जयंती (मोक्षदा एकादशी)",
    nameEn: "Gita Jayanti (Mokshada Ekadashi)",
    shortHi: "गीता जयंती",
    shortEn: "Gita Jayanti",
    badge: "📖",
    descHi: "मार्गशीर्ष शुक्ल एकादशी — श्रीकृष्ण द्वारा अर्जुन को गीता उपदेश की स्मृति और मोक्षदा एकादशी व्रत।"
  },

  // ================= 2027 (YEAR 2027) =================
  "2027-01-15": {
    nameHi: "मकर संक्रांति (ब्रज पतंगोत्सव)",
    nameEn: "Makar Sankranti (Braj Kite Festival)",
    shortHi: "मकर संक्रांति",
    shortEn: "Makar Sankranti",
    badge: "🪁",
    descHi: "सूर्य का मकर राशि में प्रवेश (14 जनवरी की रात), इसलिए स्नान-दान 15 जनवरी को; यमुना स्नान और ठाकुर जी को खिचड़ी भोग।"
  },
  "2027-02-11": {
    nameHi: "बसंत पंचमी (ब्रज में गुलाल उत्सव आरंभ)",
    nameEn: "Basant Panchami (Braj colour season begins)",
    shortHi: "बसंत पंचमी",
    shortEn: "Basant Panchami",
    badge: "🌼",
    descHi: "सरस्वती पूजन; इसी दिन से ब्रज के मंदिरों में गुलाल और होली के पद शुरू होते हैं।"
  },
  "2027-03-06": {
    nameHi: "महाशिवरात्रि (गोपेश्वर महादेव पूजन)",
    nameEn: "Maha Shivratri (Gopeshwar Mahadev)",
    shortHi: "महाशिवरात्रि",
    shortEn: "Maha Shivratri",
    badge: "🔱",
    descHi: "वृंदावन के गोपेश्वर महादेव, भूतेश्वर व रंगेश्वर महादेव का महाअभिषेक।"
  },
  "2027-03-16": {
    nameHi: "बरसाना लट्ठमार होली (संभावित)",
    nameEn: "Barsana Lathmar Holi (tentative)",
    shortHi: "लट्ठमार होली",
    shortEn: "Lathmar Holi",
    badge: "🎨",
    descHi: "फाल्गुन शुक्ल नवमी। अंतिम तिथि बरसाना मंदिर व प्रशासन घोषित करते हैं — जाने से पहले पुष्टि करें।"
  },
  "2027-03-17": {
    nameHi: "नंदगांव लट्ठमार होली (संभावित)",
    nameEn: "Nandgaon Lathmar Holi (tentative)",
    shortHi: "नंदगांव होली",
    shortEn: "Nandgaon Holi",
    badge: "🎨",
    descHi: "फाल्गुन शुक्ल दशमी। अंतिम तिथि नंदगांव मंदिर व प्रशासन घोषित करते हैं — जाने से पहले पुष्टि करें।"
  },
  "2027-03-18": {
    nameHi: "वृंदावन फूलों की होली (रंगभरी एकादशी)",
    nameEn: "Phoolon Ki Holi (Rangbhari Ekadashi)",
    shortHi: "फूलों की होली",
    shortEn: "Flower Holi",
    badge: "🌸",
    descHi: "बांके बिहारी जी के आंगन में फूलों की पंखुड़ियों और गुलाल की होली।"
  },
  "2027-03-21": {
    nameHi: "होलिका दहन",
    nameEn: "Holika Dahan",
    shortHi: "होलिका दहन",
    shortEn: "Holika Dahan",
    badge: "🔥",
    descHi: "फाल्गुन पूर्णिमा पर बुराई पर अच्छाई की विजय; फालेन गांव में पंडा का जलती होली से निकलना।"
  },
  "2027-03-22": {
    nameHi: "धुलेंडी (रंगवाली होली)",
    nameEn: "Dhulandi (Rangwali Holi)",
    shortHi: "धुलेंडी",
    shortEn: "Holi",
    badge: "🌈",
    descHi: "पूरे ब्रज में रंग और गुलाल की होली।"
  },
  "2027-03-23": {
    nameHi: "दाऊजी हुरंगा (बलदेव)",
    nameEn: "Dauji Huranga (Baldeo)",
    shortHi: "दाऊजी हुरंगा",
    shortEn: "Dauji Huranga",
    badge: "🌈",
    descHi: "होली के अगले दिन बलदेव में दाऊजी महाराज के मंदिर में हुरंगा।"
  },
  "2027-04-07": {
    nameHi: "चैत्र नवरात्रि / नव संवत्सर 2084",
    nameEn: "Chaitra Navratri / Hindu New Year",
    shortHi: "नव संवत्सर",
    shortEn: "Hindu New Year",
    badge: "🚩",
    descHi: "विक्रम संवत् 2084 का शुभारंभ और माँ भगवती की नौ दिनों की आराधना।"
  },
  "2027-04-15": {
    nameHi: "श्री राम नवमी",
    nameEn: "Shri Ram Navami",
    shortHi: "राम नवमी",
    shortEn: "Ram Navami",
    badge: "🏹",
    descHi: "मर्यादा पुरुषोत्तम भगवान श्री राम का पावन जन्मोत्सव।"
  },
  "2027-05-09": {
    nameHi: "अक्षय तृतीया (बांके बिहारी जी चरण दर्शन)",
    nameEn: "Akshaya Tritiya (Charan Darshan)",
    shortHi: "चरण दर्शन",
    shortEn: "Charan Darshan",
    badge: "🪷",
    descHi: "वर्ष में केवल एक बार बांके बिहारी जी के श्री चरणों के दर्शन एवं चंदन लेप श्रृंगार।"
  },
  "2027-06-14": {
    nameHi: "निर्जला एकादशी (यमुना स्नान मेला)",
    nameEn: "Nirjala Ekadashi (Yamuna Snan)",
    shortHi: "निर्जला एकादशी",
    shortEn: "Nirjala Ekadashi",
    badge: "💧",
    descHi: "मथुरा के विश्राम घाट पर पवित्र यमुना स्नान और शरबत वितरण।"
  },
  "2027-07-18": {
    nameHi: "गुरु पूर्णिमा (मुड़िया पूनों मेला)",
    nameEn: "Guru Purnima (Mudiya Poono Mela)",
    shortHi: "मुड़िया पूनों मेला",
    shortEn: "Mudiya Poono",
    badge: "🌕",
    descHi: "गोवर्धन में 21 किमी गिरिराज परिक्रमा का मेला।"
  },
  "2027-08-04": {
    nameHi: "हरियाली तीज (बांके बिहारी हिंडोला दर्शन)",
    nameEn: "Hariyali Teej (Banke Bihari Hindola)",
    shortHi: "हरियाली तीज",
    shortEn: "Hariyali Teej",
    badge: "🌿",
    descHi: "श्रावण शुक्ल तृतीया पर बांके बिहारी जी स्वर्ण-रजत हिंडोले में दर्शन देते हैं; ब्रज में झूलन उत्सव।"
  },
  "2027-08-17": {
    nameHi: "रक्षाबंधन एवं झूलन उत्सव समापन",
    nameEn: "Raksha Bandhan & Jhulan Utsav",
    shortHi: "रक्षाबंधन / झूलन",
    shortEn: "Raksha Bandhan",
    badge: "🎋",
    descHi: "सावन मास के झूलन उत्सव का समापन और रक्षाबंधन पर्व।"
  },
  "2027-08-25": {
    nameHi: "श्री कृष्ण जन्माष्टमी",
    nameEn: "Shri Krishna Janmashtami",
    shortHi: "🎉 जन्माष्टमी",
    shortEn: "🎉 Janmashtami",
    badge: "🦚",
    isMajor: true,
    descHi: "मथुरा श्रीकृष्ण जन्मस्थान व बांके बिहारी मंदिर में मध्यरात्रि जन्मोत्सव और पंचामृत अभिषेक।"
  },
  "2027-08-26": {
    nameHi: "गोकुल नंदोत्सव (दधिकांदो)",
    nameEn: "Gokul Nandotsav (Dadhikando)",
    shortHi: "नंदोत्सव",
    shortEn: "Nandotsav",
    badge: "🏺",
    descHi: "नंदबाबा के आंगन में हल्दी-दही का छिड़काव और बधाई गायन।"
  },
  "2027-09-08": {
    nameHi: "श्री राधाष्टमी (बरसाना)",
    nameEn: "Shri Radhashtami (Barsana)",
    shortHi: "🌸 राधाष्टमी",
    shortEn: "🌸 Radhashtami",
    badge: "👑",
    isMajor: true,
    descHi: "श्री राधा रानी के प्राकट्य दिवस पर बरसाना लाड़ली जी मंदिर में जन्मोत्सव व महाअभिषेक।"
  },
  "2027-10-09": {
    nameHi: "विजयादशमी (दशहरा मेला)",
    nameEn: "Vijayadashami (Dussehra)",
    shortHi: "विजयादशमी",
    shortEn: "Dussehra",
    badge: "🏹",
    descHi: "भगवान राम की विजय और रावण दहन मेला।"
  },
  "2027-10-14": {
    nameHi: "शरद पूर्णिमा (महारास दर्शन)",
    nameEn: "Sharad Purnima (Maharaas Darshan)",
    shortHi: "शरद पूर्णिमा",
    shortEn: "Sharad Purnima",
    badge: "🌕",
    isMajor: true,
    descHi: "वृंदावन वंशीवट और निधिवन में महारास लीला, ठाकुर जी का श्वेत वेश श्रृंगार।"
  },
  "2027-10-22": {
    nameHi: "राधा कुंड स्नान (अहोई अष्टमी)",
    nameEn: "Radha Kund Snan (Ahoi Ashtami)",
    shortHi: "राधा कुंड स्नान",
    shortEn: "Radha Kund Snan",
    badge: "🌙",
    descHi: "कार्तिक कृष्ण अष्टमी की मध्यरात्रि गोवर्धन के राधा कुंड में पवित्र स्नान।"
  },
  "2027-10-29": {
    nameHi: "दीपावली (दीपदान महोत्सव)",
    nameEn: "Deepawali (Festival of Lights)",
    shortHi: "दीपावली",
    shortEn: "Diwali",
    badge: "🪔",
    isMajor: true,
    descHi: "यमुना तट और ब्रज के मंदिरों में दीपदान।"
  },
  "2027-10-30": {
    nameHi: "गोवर्धन पूजा एवं अन्नकूट महोत्सव",
    nameEn: "Govardhan Puja & Annakoot",
    shortHi: "गोवर्धन पूजा / अन्नकूट",
    shortEn: "Govardhan Puja",
    badge: "⛰️",
    isMajor: true,
    descHi: "गिरिराज जी को अन्नकूट भोग, गायों का श्रृंगार और गोवर्धन परिक्रमा।"
  },
  "2027-10-31": {
    nameHi: "यम द्वितीया (विश्राम घाट भाई दूज स्नान)",
    nameEn: "Yama Dwitiya (Bhai Dooj Snan)",
    shortHi: "यम द्वितीया",
    shortEn: "Bhai Dooj",
    badge: "🌊",
    descHi: "मथुरा के विश्राम घाट पर भाई-बहन का साथ में यमुना स्नान।"
  },
  "2027-11-06": {
    nameHi: "गोपाष्टमी (गौ पूजा महोत्सव)",
    nameEn: "Gopashtami (Gau Mata Puja)",
    shortHi: "गोपाष्टमी",
    shortEn: "Gopashtami",
    badge: "🐄",
    descHi: "भगवान कृष्ण द्वारा प्रथम बार गौ चारण का शुभारंभ, ब्रज की गौशालाओं में विशेष पूजन।"
  },
  "2027-11-07": {
    nameHi: "अक्षय नवमी (मथुरा परिक्रमा)",
    nameEn: "Akshaya Navami (Mathura Parikrama)",
    shortHi: "अक्षय नवमी",
    shortEn: "Akshaya Navami",
    badge: "🙏",
    descHi: "कार्तिक शुक्ल नवमी पर मथुरा की परिक्रमा और आंवला पूजन।"
  },
  "2027-11-10": {
    nameHi: "देवउठनी एकादशी (तुलसी विवाह)",
    nameEn: "Devutthana Ekadashi (Tulsi Vivah)",
    shortHi: "देवउठनी एकादशी",
    shortEn: "Devutthana Ekadashi",
    badge: "🌿",
    descHi: "चार मास की योग निद्रा से भगवान विष्णु का जागरण और मांगलिक कार्यों का शुभारंभ।"
  },
  "2027-11-14": {
    nameHi: "कार्तिक पूर्णिमा (यमुना स्नान व दीपदान)",
    nameEn: "Kartik Purnima (Yamuna Snan & Deepdaan)",
    shortHi: "कार्तिक पूर्णिमा",
    shortEn: "Kartik Purnima",
    badge: "🌕",
    descHi: "कार्तिक मास का समापन — यमुना स्नान और दीपदान।"
  },
  "2027-12-03": {
    nameHi: "विहार पंचमी (बांके बिहारी प्राकट्य उत्सव)",
    nameEn: "Vihar Panchami (Banke Bihari Prakatya Utsav)",
    shortHi: "विहार पंचमी",
    shortEn: "Vihar Panchami",
    badge: "🎶",
    descHi: "मार्गशीर्ष शुक्ल पंचमी — निधिवन में स्वामी हरिदास जी के समक्ष ठाकुर बांके बिहारी जी के प्रकट होने का उत्सव।"
  },
  "2027-12-09": {
    nameHi: "गीता जयंती (मोक्षदा एकादशी)",
    nameEn: "Gita Jayanti (Mokshada Ekadashi)",
    shortHi: "गीता जयंती",
    shortEn: "Gita Jayanti",
    badge: "📖",
    descHi: "मार्गशीर्ष शुक्ल एकादशी — श्रीकृष्ण द्वारा अर्जुन को गीता उपदेश की स्मृति और मोक्षदा एकादशी व्रत।"
  },

  // ================= 2025 (YEAR 2025) =================
  "2025-01-14": { nameHi: "मकर संक्रांति", nameEn: "Makar Sankranti", shortHi: "मकर संक्रांति", shortEn: "Makar Sankranti", badge: "🪁" },
  "2025-02-26": { nameHi: "महाशिवरात्रि", nameEn: "Maha Shivratri", shortHi: "महाशिवरात्रि", shortEn: "Maha Shivratri", badge: "🔱" },
  "2025-03-08": { nameHi: "बरसाना लट्ठमार होली", nameEn: "Barsana Lathmar Holi", shortHi: "लट्ठमार होली", shortEn: "Lathmar Holi", badge: "🎨" },
  "2025-03-09": { nameHi: "नंदगांव लट्ठमार होली", nameEn: "Nandgaon Lathmar Holi", shortHi: "नंदगांव होली", shortEn: "Nandgaon Holi", badge: "🎨" },
  "2025-03-10": { nameHi: "वृंदावन फूलों की होली", nameEn: "Phoolon Ki Holi", shortHi: "फूलों की होली", shortEn: "Flower Holi", badge: "🌸" },
  "2025-03-13": { nameHi: "होलिका दहन", nameEn: "Holika Dahan", shortHi: "होलिका दहन", shortEn: "Holika Dahan", badge: "🔥" },
  "2025-03-14": { nameHi: "धुलेंडी (दाऊजी हुरंगा)", nameEn: "Dhulandi (Dauji Huranga)", shortHi: "दाऊजी हुरंगा", shortEn: "Dauji Huranga", badge: "🌈" },
  "2025-04-06": { nameHi: "श्री राम नवमी", nameEn: "Shri Ram Navami", shortHi: "राम नवमी", shortEn: "Ram Navami", badge: "🏹" },
  "2025-04-30": { nameHi: "अक्षय तृतीया (चरण दर्शन)", nameEn: "Akshaya Tritiya", shortHi: "चरण दर्शन", shortEn: "Charan Darshan", badge: "🪷" },
  "2025-06-06": { nameHi: "निर्जला एकादशी", nameEn: "Nirjala Ekadashi", shortHi: "निर्जला एकादशी", shortEn: "Nirjala Ekadashi", badge: "💧" },
  "2025-07-10": { nameHi: "गुरु पूर्णिमा (मुड़िया पूनों मेला)", nameEn: "Guru Purnima", shortHi: "मुड़िया पूनों", shortEn: "Mudiya Poono", badge: "🌕" },
  "2025-08-09": { nameHi: "रक्षाबंधन", nameEn: "Raksha Bandhan", shortHi: "रक्षाबंधन", shortEn: "Raksha Bandhan", badge: "🎋" },
  "2025-08-16": { nameHi: "श्री कृष्ण जन्माष्टमी", nameEn: "Shri Krishna Janmashtami", shortHi: "🎉 जन्माष्टमी", shortEn: "🎉 Janmashtami", badge: "🦚", isMajor: true },
  "2025-08-17": { nameHi: "गोकुल नंदोत्सव", nameEn: "Gokul Nandotsav", shortHi: "नंदोत्सव", shortEn: "Nandotsav", badge: "🏺" },
  "2025-08-31": { nameHi: "श्री राधाष्टमी (बरसाना)", nameEn: "Shri Radhashtami", shortHi: "🌸 राधाष्टमी", shortEn: "🌸 Radhashtami", badge: "👑", isMajor: true },
  "2025-10-02": { nameHi: "विजयादशमी (दशहरा)", nameEn: "Vijayadashami", shortHi: "दशहरा", shortEn: "Dussehra", badge: "🏹" },
  "2025-10-06": { nameHi: "शरद पूर्णिमा (महारास)", nameEn: "Sharad Purnima", shortHi: "शरद पूर्णिमा", shortEn: "Sharad Purnima", badge: "🌕" },
  "2025-10-20": { nameHi: "दीपावली", nameEn: "Deepawali", shortHi: "दीपावली", shortEn: "Diwali", badge: "🪔" },
  "2025-10-21": { nameHi: "गोवर्धन पूजा एवं अन्नकूट", nameEn: "Govardhan Puja & Annakoot", shortHi: "गोवर्धन पूजा", shortEn: "Govardhan Puja", badge: "⛰️", isMajor: true },
  "2025-10-22": { nameHi: "यम द्वितीया", nameEn: "Yama Dwitiya", shortHi: "भाई दूज", shortEn: "Bhai Dooj", badge: "🌊" },
  "2025-11-01": { nameHi: "देवउठनी एकादशी", nameEn: "Devutthana Ekadashi", shortHi: "देवउठनी एकादशी", shortEn: "Devutthana Ekadashi", badge: "🌿" }
};

// Seasons by lunar month pair: Chaitra–Vaishakha = Vasanta, and so on.
const RITUS = [
  { hi: "बसंत ऋतु", en: "Vasanta (Spring)" },
  { hi: "ग्रीष्म ऋतु", en: "Grishma (Summer)" },
  { hi: "वर्षा ऋतु", en: "Varsha (Monsoon)" },
  { hi: "शरद ऋतु", en: "Sharad (Autumn)" },
  { hi: "हेमंत ऋतु", en: "Hemanta (Pre-winter)" },
  { hi: "शिशिर ऋतु", en: "Shishira (Winter)" },
];

/**
 * Format Date to YYYY-MM-DD
 */
export function formatDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get all festivals for given year and month index (0-11)
 */
export function getMonthlyFestivals(year, monthIndex) {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const events = [];

  Object.entries(YEAR_FESTIVALS_MAP).forEach(([key, fest]) => {
    if (key.startsWith(prefix)) {
      const dayNumber = parseInt(key.split("-")[2], 10);
      events.push({
        dateKey: key,
        day: dayNumber,
        ...fest
      });
    }
  });

  return events.sort((a, b) => a.day - b.day);
}

/**
 * Helper to convert decimal hours to AM/PM string format
 */
export function formatHours(decimalHours) {
  let hrs = Math.floor(decimalHours);
  let mins = Math.floor((decimalHours - hrs) * 60);
  hrs = ((hrs % 24) + 24) % 24;
  const period = hrs >= 12 ? "PM" : "AM";
  const displayHrs = hrs > 12 ? hrs - 12 : hrs === 0 ? 12 : hrs;
  return `${String(displayHrs).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${period}`;
}

/**
 * Calculate Day & Night Choghadiya for a given date, sunrise, and sunset
 */
export function calculateChoghadiya(date, sunriseIST, sunsetIST) {
  const d = new Date(date);
  const weekday = d.getDay(); // 0 = Sun, 6 = Sat
  const now = new Date();
  const isSelectedToday = formatDateKey(d) === formatDateKey(now);
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;

  // Day Choghadiya: 8 equal parts from Sunrise to Sunset
  const dayDuration = sunsetIST - sunriseIST;
  const daySegment = dayDuration / 8;
  const dayKeys = DAY_CHOGHADIYA_ORDER[weekday];

  const dayChoghadiya = dayKeys.map((key, index) => {
    const startDec = sunriseIST + index * daySegment;
    const endDec = sunriseIST + (index + 1) * daySegment;
    const def = CHOGHADIYA_DEFINITIONS[key];
    const isCurrent = isSelectedToday && currentDecimalHour >= startDec && currentDecimalHour < endDec;

    return {
      index: index + 1,
      nameHi: def.nameHi,
      nameEn: def.nameEn,
      quality: def.quality,
      type: def.type,
      color: def.color,
      descHi: def.descHi,
      startTime: formatHours(startDec),
      endTime: formatHours(endDec),
      isCurrent,
    };
  });

  // Night Choghadiya: 8 equal parts from Sunset to next Sunrise (~24 hours cycle)
  const nightDuration = 24 - dayDuration;
  const nightSegment = nightDuration / 8;
  const nightKeys = NIGHT_CHOGHADIYA_ORDER[weekday];

  const nightChoghadiya = nightKeys.map((key, index) => {
    const startDec = sunsetIST + index * nightSegment;
    const endDec = sunsetIST + (index + 1) * nightSegment;
    const def = CHOGHADIYA_DEFINITIONS[key];
    
    // Normalize current hour check across midnight
    let isCurrent = false;
    if (isSelectedToday) {
      if (currentDecimalHour >= sunsetIST) {
        isCurrent = currentDecimalHour >= startDec && currentDecimalHour < endDec;
      } else if (currentDecimalHour < sunriseIST) {
        const adjustedCurrent = currentDecimalHour + 24;
        isCurrent = adjustedCurrent >= startDec && adjustedCurrent < endDec;
      }
    }

    return {
      index: index + 1,
      nameHi: def.nameHi,
      nameEn: def.nameEn,
      quality: def.quality,
      type: def.type,
      color: def.color,
      descHi: def.descHi,
      startTime: formatHours(startDec),
      endTime: formatHours(endDec),
      isCurrent,
    };
  });

  return { dayChoghadiya, nightChoghadiya };
}

/**
 * Calculates APPROXIMATE Panchang details for a calendar date.
 * Tithi and nakshatra use a mean lunar cycle, not true Sun/Moon positions,
 * so results can be off by one; the UI must label them as approximate.
 * Every date is evaluated at 06:00 local time (about sunrise) so the same
 * date always gives the same answer, whatever time of day it is called.
 */
export function calculatePanchang(date) {
  const d = new Date(date);
  d.setHours(6, 0, 0, 0);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();
  const weekday = d.getDay();

  // Sunrise/sunset for Mathura (NOAA method, includes the equation of time).
  const { sunriseIST, sunsetIST } = sunTimesIST(year, month, day);

  // Tithi, nakshatra, yoga, karana and lunar month from true Sun/Moon positions at sunrise.
  const p = panchangAt(istInstant(year, month, day, sunriseIST));

  // Vikram Samvat changes at Chaitra Shukla Pratipada; Shaka Samvat is 135 years behind.
  const vikramSamvat = year + (month <= 4 && p.monthAmanta >= 9 ? 56 : 57);
  const shakaSamvat = vikramSamvat - 135;
  // Krishna / Kali Samvat
  const krishnaSamvat = 5252;

  const tithiIndex = p.tithi;
  const isShukla = tithiIndex < 15;
  const pakshaHi = isShukla ? "शुक्ल पक्ष" : "कृष्ण पक्ष";
  const pakshaEn = isShukla ? "Shukla Paksha" : "Krishna Paksha";

  const tithiObj = isShukla
    ? TITHIS_SHUKLA[tithiIndex]
    : TITHIS_KRISHNA[tithiIndex - 15];

  const nakshatraObj = NAKSHATRAS[p.nakshatra];
  const yogaObj = YOGAS[p.yoga];
  const karanaObj = KARANAS[p.karana];

  // Month as counted in Braj (purnimanta): Krishna paksha belongs to the next month.
  const hinduMonthObj = HINDU_MONTHS[p.monthPurnimanta];
  const hinduMonthHi = (p.isAdhik ? "अधिक " : "") + hinduMonthObj.hi;
  const hinduMonthEn = (p.isAdhik ? "Adhik " : "") + hinduMonthObj.en;

  // Ritu: two lunar months each, starting with Chaitra.
  const ritu = RITUS[Math.floor(p.monthAmanta / 2)];
  const rituHi = ritu.hi;
  const rituEn = ritu.en;

  const ayanaHi = p.isUttarayana ? "उत्तरायण" : "दक्षिणायन";
  const ayanaEn = p.isUttarayana ? "Uttarayana" : "Dakshinayana";


  const sunrise = formatHours(sunriseIST);
  const sunset = formatHours(sunsetIST);

  // Day Length
  const dayLengthHours = Math.floor(sunsetIST - sunriseIST);
  const dayLengthMins = Math.floor(((sunsetIST - sunriseIST) - dayLengthHours) * 60);
  const dayLengthStr = `${dayLengthHours} घंटे ${dayLengthMins} मिनट`;

  // Shubh Muhurats
  // 1. Abhijit Muhurat: the 8th of the day's 15 muhurtas (around solar noon)
  const muhurta = (sunsetIST - sunriseIST) / 15;
  const abhijitStart = sunriseIST + 7 * muhurta;
  const abhijitEnd = sunriseIST + 8 * muhurta;
  const abhijitMuhurat = `${formatHours(abhijitStart)} – ${formatHours(abhijitEnd)}`;

  // 2. Brahma Muhurat: 2 muhurats before sunrise (~1 hr 36 mins to ~48 mins before sunrise)
  const brahmaStart = sunriseIST - 1.6;
  const brahmaEnd = sunriseIST - 0.8;
  const brahmaMuhurat = `${formatHours(brahmaStart)} – ${formatHours(brahmaEnd)}`;

  // 3. Godhuli Muhurat: 15 mins before to 15 mins after sunset
  const godhuliStart = sunsetIST - 0.25;
  const godhuliEnd = sunsetIST + 0.25;
  const godhuliMuhurat = `${formatHours(godhuliStart)} – ${formatHours(godhuliEnd)}`;

  // 4. Vijaya Muhurat: the 11th of the day's 15 muhurtas
  const vijayaStart = sunriseIST + 10 * muhurta;
  const vijayaEnd = sunriseIST + 11 * muhurta;
  const vijayaMuhurat = `${formatHours(vijayaStart)} – ${formatHours(vijayaEnd)}`;

  // Inauspicious Muhurats (Ashubh)
  const kaal = (kind) => {
    const [start, end] = kaalWindow(kind, weekday, sunriseIST, sunsetIST);
    return `${formatHours(start)} – ${formatHours(end)}`;
  };

  const dateKey = formatDateKey(d);
  const festival = YEAR_FESTIVALS_MAP[dateKey] || null;

  // Choghadiya
  const choghadiya = calculateChoghadiya(d, sunriseIST, sunsetIST);

  return {
    dateKey,
    dateObj: d,
    dayNameHi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"][weekday],
    dayNameEn: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekday],
    tithiHi: tithiObj.hi,
    tithiEn: tithiObj.en,
    tithiShortHi: tithiObj.shortHi,
    tithiShortEn: tithiObj.shortEn,
    isEkadashi: tithiObj.shortHi === "एकादशी",
    isPurnima: tithiObj.shortHi === "पूर्णिमा",
    isAmavasya: tithiObj.shortHi === "अमावस्या",
    pakshaHi,
    pakshaEn,
    nakshatraHi: nakshatraObj.hi,
    nakshatraEn: nakshatraObj.en,
    nakshatraDeity: nakshatraObj.deity,
    nakshatraLord: nakshatraObj.lord,
    yogaHi: yogaObj.hi,
    yogaEn: yogaObj.en,
    karanaHi: karanaObj.hi,
    karanaEn: karanaObj.en,
    hinduMonthHi,
    hinduMonthEn,
    isAdhikMaas: p.isAdhik,
    samvat: String(vikramSamvat),
    shakaSamvat: String(shakaSamvat),
    krishnaSamvat: String(krishnaSamvat),
    ayanaHi,
    ayanaEn,
    rituHi,
    rituEn,
    sunrise,
    sunset,
    dayLength: dayLengthStr,
    rahukaal: kaal("rahu"),
    yamaganda: kaal("yamaganda"),
    gulika: kaal("gulika"),
    abhijitMuhurat,
    brahmaMuhurat,
    godhuliMuhurat,
    vijayaMuhurat,
    festival,
    choghadiya,
  };
}
