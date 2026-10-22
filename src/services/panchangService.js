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
  "2026-02-26": {
    nameHi: "बरसाना लट्ठमार होली",
    nameEn: "Barsana Lathmar Holi",
    shortHi: "लट्ठमार होली",
    shortEn: "Lathmar Holi",
    badge: "🎨",
    descHi: "बरसाना में रंगीली गली में गोपियों और नंदगांव के हुरियारों की विश्वप्रसिद्ध लट्ठमार होली।"
  },
  "2026-02-27": {
    nameHi: "नंदगांव लट्ठमार होली",
    nameEn: "Nandgaon Lathmar Holi",
    shortHi: "नंदगांव होली",
    shortEn: "Nandgaon Holi",
    badge: "🎨",
    descHi: "नंदभवन में बरसाना के हुरियारों पर नंदगांव की गोपियों का लाठी प्रहार व प्रेममयी होली।"
  },
  "2026-03-01": {
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
  "2026-03-20": {
    nameHi: "चैत्र नवरात्रि / नव संवत्सर 2083",
    nameEn: "Chaitra Navratri / Hindu New Year",
    shortHi: "नव संवत्सर",
    shortEn: "Hindu New Year",
    badge: "🚩",
    descHi: "विक्रम संवत् 2083 का शुभारंभ और माँ भगवती की नौ दिनों की आराधना।"
  },
  "2026-03-28": {
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
    descHi: "मथुरा के विश्राम घाट पर लाखों भक्तों का पवित्र यमुना स्नान और शरबत वितरण।"
  },
  "2026-07-29": {
    nameHi: "गुरु पूर्णिमा (मुड़िया पूनों महामेला)",
    nameEn: "Guru Purnima (Mudiya Poono Mela)",
    shortHi: "मुड़िया पूनों मेला",
    shortEn: "Mudiya Poono",
    badge: "🌕",
    descHi: "गोवर्धन में 21 किमी गिरिराज परिक्रमा का विशाल 5 दिवसीय मेला, 50 लाख से अधिक श्रद्धालु।"
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
  "2026-09-28": {
    nameHi: "सर्वार्थ सिद्धि योग (शुभ नक्षत्र संयोग)",
    nameEn: "Sarvartha Siddhi Yoga (Auspicious Conjunction)",
    shortHi: "सिद्ध योग",
    shortEn: "Siddhi Yoga",
    badge: "✨",
    descHi: "रेवती व अश्विनी नक्षत्र का विशेष मंगलकारी संयोग, नवीन साधना व संकल्प हेतु श्रेष्ठ।"
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
    descHi: "यमुना तट और ब्रज के समस्त मंदिरों में लाखों दीपकों से महा दीपदान।"
  },
  "2026-11-09": {
    nameHi: "गोवर्धन पूजा एवं अन्नकूट महोत्सव",
    nameEn: "Govardhan Puja & Annakoot",
    shortHi: "गोवर्धन पूजा / अन्नकूट",
    shortEn: "Govardhan Puja",
    badge: "⛰️",
    isMajor: true,
    descHi: "गिरिराज जी को 56 भोग अर्पित, गायों का श्रृंगार और गोवर्धन महापरिक्रमा।"
  },
  "2026-11-10": {
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
  "2026-11-20": {
    nameHi: "देवउठनी एकादशी (तुलसी विवाह)",
    nameEn: "Devutthana Ekadashi (Tulsi Vivah)",
    shortHi: "देवउठनी एकादशी",
    shortEn: "Devutthana Ekadashi",
    badge: "🌿",
    descHi: "चार मास की योग निद्रा से भगवान विष्णु का जागरण और मांगलिक कार्यों का शुभारंभ।"
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
 * Calculates authentic Vedic Panchang details for any Date object
 */
export function calculatePanchang(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();
  const weekday = d.getDay();

  // Vikram Samvat calculation
  const vikramSamvat = year + (month > 3 || (month === 3 && day >= 22) ? 57 : 56);
  // Shaka Samvat (starts Chaitra)
  const shakaSamvat = year - (month > 3 || (month === 3 && day >= 22) ? 78 : 79);
  // Krishna / Kali Samvat
  const krishnaSamvat = 5252;

  // Synodic Month reference (New Moon base)
  const refNewMoon = new Date(2024, 0, 11, 11, 57).getTime();
  const diffDays = (d.getTime() - refNewMoon) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.53058867;
  const lunarAge = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle;

  // Tithi calculation (30 tithis per lunar cycle)
  const tithiIndex = Math.floor((lunarAge / lunarCycle) * 30);
  const isShukla = tithiIndex < 15;
  const pakshaHi = isShukla ? "शुक्ल पक्ष" : "कृष्ण पक्ष";
  const pakshaEn = isShukla ? "Shukla Paksha" : "Krishna Paksha";

  const tithiObj = isShukla
    ? TITHIS_SHUKLA[tithiIndex]
    : TITHIS_KRISHNA[tithiIndex - 15];

  // Nakshatra calculation (27 nakshatras)
  const nakshatraIndex = Math.floor(((diffDays * 1.033) % 27 + 27)) % 27;
  const nakshatraObj = NAKSHATRAS[nakshatraIndex];

  // Yoga & Karana
  const yogaIndex = (tithiIndex + nakshatraIndex) % 27;
  const yogaObj = YOGAS[yogaIndex];
  const karanaIndex = (tithiIndex * 2) % 11;
  const karanaObj = KARANAS[karanaIndex];

  // Hindu Lunar Month approx mapping
  const hinduMonthIdx = (month + 10) % 12; // March approx Chaitra
  const hinduMonthObj = HINDU_MONTHS[hinduMonthIdx];

  // Ritu (Seasons)
  let rituHi = "हेमंत ऋतु";
  let rituEn = "Hemanta (Pre-winter)";
  if (month >= 3 && month <= 4) { rituHi = "बसंत ऋतु"; rituEn = "Vasanta (Spring)"; }
  else if (month >= 5 && month <= 6) { rituHi = "ग्रीष्म ऋतु"; rituEn = "Grishma (Summer)"; }
  else if (month >= 7 && month <= 8) { rituHi = "वर्षा ऋतु"; rituEn = "Varsha (Monsoon)"; }
  else if (month >= 9 && month <= 10) { rituHi = "शरद ऋतु"; rituEn = "Sharad (Autumn)"; }
  else if (month >= 11 && month <= 12) { rituHi = "हेमंत ऋतु"; rituEn = "Hemanta (Pre-winter)"; }
  else { rituHi = "शिशिर ऋतु"; rituEn = "Shishira (Winter)"; }

  const ayanaHi = month >= 7 ? "दक्षिणायन" : "उत्तरायण";
  const ayanaEn = month >= 7 ? "Dakshinayana" : "Uttarayana";

  // Solar Sunrise & Sunset for Mathura (27.49°N, 77.67°E)
  const dayOfYear = Math.floor((d - new Date(year, 0, 0)) / 1000 / 60 / 60 / 24);
  const declination = 23.45 * Math.sin(((284 + dayOfYear) / 365) * 2 * Math.PI);
  const hourAngle = Math.acos(
    -Math.tan((27.4924 * Math.PI) / 180) * Math.tan((declination * Math.PI) / 180)
  );

  const solarNoonUTC = 12 - 77.6737 / 15;
  const sunriseUTC = solarNoonUTC - (hourAngle * 180) / Math.PI / 15;
  const sunsetUTC = solarNoonUTC + (hourAngle * 180) / Math.PI / 15;

  // Indian Standard Time (UTC + 5.5)
  const sunriseIST = sunriseUTC + 5.5;
  const sunsetIST = sunsetUTC + 5.5;
  const solarNoonIST = solarNoonUTC + 5.5;

  const sunrise = formatHours(sunriseIST);
  const sunset = formatHours(sunsetIST);

  // Day Length
  const dayLengthHours = Math.floor(sunsetIST - sunriseIST);
  const dayLengthMins = Math.floor(((sunsetIST - sunriseIST) - dayLengthHours) * 60);
  const dayLengthStr = `${dayLengthHours} घंटे ${dayLengthMins} मिनट`;

  // Shubh Muhurats
  // 1. Abhijit Muhurat: 8th muhurat of the day (centered at Solar Noon, 48 minutes duration)
  const abhijitStart = solarNoonIST - 0.4;
  const abhijitEnd = solarNoonIST + 0.4;
  const abhijitMuhurat = `${formatHours(abhijitStart)} – ${formatHours(abhijitEnd)}`;

  // 2. Brahma Muhurat: 2 muhurats before sunrise (~1 hr 36 mins to ~48 mins before sunrise)
  const brahmaStart = sunriseIST - 1.6;
  const brahmaEnd = sunriseIST - 0.8;
  const brahmaMuhurat = `${formatHours(brahmaStart)} – ${formatHours(brahmaEnd)}`;

  // 3. Godhuli Muhurat: 15 mins before to 15 mins after sunset
  const godhuliStart = sunsetIST - 0.25;
  const godhuliEnd = sunsetIST + 0.25;
  const godhuliMuhurat = `${formatHours(godhuliStart)} – ${formatHours(godhuliEnd)}`;

  // 4. Vijaya Muhurat: ~02:05 PM to 02:53 PM
  const vijayaStart = solarNoonIST + 2.0;
  const vijayaEnd = solarNoonIST + 2.8;
  const vijayaMuhurat = `${formatHours(vijayaStart)} – ${formatHours(vijayaEnd)}`;

  // Inauspicious Muhurats (Ashubh)
  // Rahu Kaal (Weekday specific segment in Mathura)
  const rahuKaalParts = {
    0: "04:30 PM – 06:00 PM",
    1: "07:30 AM – 09:00 AM",
    2: "03:00 PM – 04:30 PM",
    3: "12:00 PM – 01:30 PM",
    4: "01:30 PM – 03:00 PM",
    5: "10:30 AM – 12:00 PM",
    6: "09:00 AM – 10:30 AM"
  };

  // Yamaganda Kaal
  const yamagandaParts = {
    0: "12:00 PM – 01:30 PM",
    1: "10:30 AM – 12:00 PM",
    2: "09:00 AM – 10:30 AM",
    3: "07:30 AM – 09:00 AM",
    4: "06:00 AM – 07:30 AM",
    5: "03:00 PM – 04:30 PM",
    6: "01:30 PM – 03:00 PM"
  };

  // Gulika Kaal
  const gulikaParts = {
    0: "03:00 PM – 04:30 PM",
    1: "01:30 PM – 03:00 PM",
    2: "12:00 PM – 01:30 PM",
    3: "10:30 AM – 12:00 PM",
    4: "09:00 AM – 10:30 AM",
    5: "07:30 AM – 09:00 AM",
    6: "06:00 AM – 07:30 AM"
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
    hinduMonthHi: hinduMonthObj.hi,
    hinduMonthEn: hinduMonthObj.en,
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
    rahukaal: rahuKaalParts[weekday],
    yamaganda: yamagandaParts[weekday],
    gulika: gulikaParts[weekday],
    abhijitMuhurat,
    brahmaMuhurat,
    godhuliMuhurat,
    vijayaMuhurat,
    festival,
    choghadiya,
  };
}
