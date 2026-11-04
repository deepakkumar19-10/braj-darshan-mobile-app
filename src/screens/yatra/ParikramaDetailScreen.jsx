/**
 * Braj Darshan - Parikrama guide
 * Layout from the Nov 2026 redesign (Parikrama artboard): photo hero, a rounded
 * sheet with the title, four fact tiles (approximate length and time, start,
 * good time to start), the stops grouped by section with numbered circles,
 * etiquette, three care rows, the facilities disclaimer, 112/108 call buttons and
 * a fixed "directions to the start" button.
 * Content comes from src/data/parikrama.json; English text for its Hindi-only
 * fields lives below. Distances and times are approximate and say so; the stop
 * order is illustrative, not a navigation map.
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Button,
  Card,
  IconButton,
  InfoNote,
  LanguageToggle,
  Photo,
  RepresentativeTag,
  SectionHeader,
  GUTTER,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { getPlaceImage } from '../../utils/imageAssets';
import parikramaData from '../../data/parikrama.json';
import { getTemples } from '../../services/contentService';

const HERO_HEIGHT = 210;
const SHEET_OVERLAP = 20;

// Daan Ghati Mandir (temple 5) is the usual starting point of the Govardhan parikrama.
function daanGhatiDestination() {
  const daanGhati = getTemples().find((t) => t.id === 5);
  return daanGhati ? `${daanGhati.latitude},${daanGhati.longitude}` : 'Daan Ghati Mandir, Govardhan';
}

// Per-parikrama extras. `en` mirrors the Hindi-only data fields in the same order.
const EXTRA = {
  govardhan: {
    image: 'places/govardhan',
    lengthHi: 'लगभग 21 किमी',
    // Read from the current temple data each time directions are opened.
    get destination() {
      return daanGhatiDestination();
    },
    en: {
      name: 'Govardhan Parikrama',
      length: 'About 21 km',
      subtitle: 'The parikrama around Giriraj Govardhan',
      overview:
        'Tradition says Shri Krishna lifted Govardhan hill on his little finger for seven days and nights to shelter the people and cows of Braj from Indra’s storm. Devotees walk around Giriraj with prayers and wishes in their hearts.',
      duration: 'approx. 5–7 hours on foot, about 2.5 hours by e-rickshaw',
      difficulty: 'Moderate',
      startPoint: 'Daan Ghati Mandir / Mansi Ganga',
      bestTime: 'Before sunrise (around 4 AM) or in the evening (around 5 PM)',
      sections: ['Part 1: Badi parikrama (approx. 12 km)', 'Part 2: Chhoti parikrama (approx. 9 km)'],
      stops: [
        ['Daan Ghati Mandir', 'The usual starting point. Devotees offer milk to Giriraj here before setting out.'],
        ['Anyor village', 'Linked by tradition with Annakut, where Krishna asked for “more” of the offerings of Braj.'],
        ['Govind Kund', 'Where, by tradition, Indra accepted defeat and bathed Krishna in a royal abhishek.'],
        ['Poonchari Ka Lautha', 'Shrine of Krishna’s childhood friend Lautha. Many believe the parikrama is not complete without his darshan.'],
        ['Jatipura Mukharvind', 'Associated with Shri Vallabhacharya and the appearance of Shrinathji. Devotees offer milk abhishek here.'],
        ['Radha Kund & Shyam Kund', 'Among the holiest places in Braj: the twin kunds of Radha and Krishna.'],
        ['Kusum Sarovar', 'A large sarovar where Radha Rani is said to have gathered flowers, with carved chhatris built by Raja Suraj Mal.'],
        ['Mansi Ganga', 'A sacred lake said to have appeared from Krishna’s wish. Many devotees take achaman or bathe here.'],
        ['Chakreshwar Mahadev', 'An old Shiva temple, revered as a guardian of Giriraj.'],
      ],
      rules: [
        'Walk clockwise, keeping Giriraj on your right-hand side.',
        'Do not step on the sacred rocks of the hill or take any stone home.',
        'Many walk while offering a stream of milk or chanting “Hare Krishna” or “Radhe Radhe”.',
        'If doing dandavat parikrama, mark your place with a stone before each prostration.',
      ],
      tips: 'In summer, start around 4 AM or after sunset. Water, fruit and resting places are usually found along the route — confirm locally.',
    },
  },
  vrindavan: {
    image: 'places/vrindavan',
    lengthHi: 'लगभग 11–12 किमी',
    destination: 'Keshi Ghat, Vrindavan',
    en: {
      name: 'Vrindavan Parikrama',
      length: 'About 11–12 km',
      subtitle: 'A walk along the Yamuna and Vrindavan’s sacred groves',
      overview:
        'Devotees hold that every particle of Vrindavan is filled with the eternal pastimes of Radha and Krishna. The Panchkoshi parikrama circles the town along the Yamuna banks, old ghats and the samadhis of saints. Many devotees walk it on Ekadashi, Purnima and in the month of Kartik.',
      duration: 'approx. 3–4 hours',
      difficulty: 'Easy to moderate',
      startPoint: 'Keshi Ghat / ISKCON, Raman Reti',
      bestTime: 'Early morning (around 4:30 AM, after mangala) or around 4:30 PM',
      sections: ['Main stops'],
      stops: [
        ['Keshi Ghat', 'One of the best-known ghats on the Yamuna, linked with Krishna’s victory over the demon Keshi. The evening aarti is a moving sight.'],
        ['Kaliya Dah', 'Where Krishna is said to have subdued the serpent Kaliya. Devotees point out an old kadamba tree here.'],
        ['Chir Ghat', 'Linked with the gopis’ pastimes by a kadamba tree; devotees tie cloth here with their prayers.'],
        ['Imli Tala', 'Associated with Krishna’s longing for Radha and with Shri Chaitanya Mahaprabhu’s meditation.'],
        ['Gyan Gudri', 'Where, by tradition, Uddhava’s pride in knowledge bowed before the gopis’ pure love.'],
        ['Tatiya Sthan', 'A quiet grove of Swami Haridas’s tradition, where the sadhus keep away from electricity and modern comforts.'],
      ],
      rules: [
        'Many devotees walk this parikrama barefoot.',
        'Begin by bowing to the Yamuna and taking achaman.',
        'Keep glasses, phones, caps and food inside a pocket or bag — monkeys snatch them.',
      ],
      tips: 'It is more crowded on Ekadashi. Walking before sunrise is cool and peaceful, with birdsong along the Yamuna.',
    },
  },
  chaurasi_kos: {
    image: 'events/braj-parikrama',
    lengthHi: 'लगभग 268 किमी (84 कोस)',
    destination: 'Vishram Ghat, Mathura',
    en: {
      name: 'Chaurasi Kos Braj Parikrama',
      length: 'About 268 km (84 kos)',
      subtitle: 'The great pilgrimage through the forests of Braj',
      overview:
        'The 84 kos parikrama is the longest pilgrimage of Braj. It passes the 12 main forests, 24 groves, many sacred kunds, four sacred hills and both banks of the Yamuna. Scriptures describe it as freeing the pilgrim from the cycle of 8.4 million births.',
      duration: 'approx. 21–40 days on foot, or 7–10 days by vehicle or bus',
      difficulty: 'Long and demanding',
      startPoint: 'Vishram Ghat (Mathura) or Chaumuha',
      bestTime: 'Bhadrapad, Ashwin and Kartik months (September to November)',
      sections: ['The sacred forests of Braj'],
      stops: [
        ['Madhuvan', 'Where Dhruva did his penance, and where Shatrughna defeated Lavanasura.'],
        ['Talvan', 'Where Balarama defeated Dhenukasura and the cowherds enjoyed sweet palm fruit.'],
        ['Kumudvan & Shantanu Kund', 'A forest of lotus flowers, and the place of penance of King Shantanu, father of Bhishma.'],
        ['Bahulavan', 'Linked with the story of the truthful cow Bahula and the lion, where truth won.'],
        ['Kamyavan', 'Known for Krishna’s pastimes, Chaurasi Khamba, Vimal Kund and Charan Pahadi.'],
        ['Kokilavan', 'Where Krishna is said to have called to Radha as a cuckoo; home to the Shani Dev temple.'],
        ['Bhandirvan', 'Where, by tradition, Brahma performed the divine marriage of Radha and Krishna.'],
        ['Mahavan (Gokul)', 'Nand Baba’s palace and the childhood pastimes of baby Krishna with Mother Yashoda.'],
      ],
      rules: [
        'Keep a sattvic diet, sleep simply on the ground and observe brahmacharya.',
        'Treat local saints and Brajwasis with respect.',
        'Walking with an organised group is safest.',
      ],
      tips: 'Every Kartik, several ashrams and groups run organised parikramas with tents, food, medical help and buses. Confirm the details directly with the organisers.',
    },
  },
  barsana: {
    image: 'places/barsana',
    lengthHi: 'लगभग 4 किमी',
    destination: 'Pili Pokhar, Barsana',
    en: {
      name: 'Barsana Parikrama',
      length: 'About 4 km',
      subtitle: 'Around Radha Rani’s hill and leela places',
      overview:
        'Barsana is the home of Shri Radha Rani. This parikrama circles the four peaks of Brahmanchal hill — Shriji Mahal, Maan Mandir, Vilasgarh and Daangarh — a deeply loved walk for devotees of Radha.',
      duration: 'approx. 1.5–2 hours',
      difficulty: 'Easy',
      startPoint: 'Pili Pokhar (Priya Kund) / Rangili Gali',
      bestTime: 'Around 5:30 AM or 4:30 PM',
      sections: ['Key stops'],
      stops: [
        ['Pili Pokhar (Priya Kund)', 'Tradition says its water turned yellow when Radha washed turmeric from her hands.'],
        ['Maan Mandir', 'On Maangarh peak, where Radha is said to have sulked and Krishna won her back as a peacock. Ashram of Ramesh Baba.'],
        ['Sankari Khor', 'A very narrow pass between two hills, where young Krishna is said to have stopped the gopis for butter and curd.'],
        ['Mor Kuti', 'Where Krishna is said to have danced as a peacock to please Radha. Paintings of the dance are kept here.'],
        ['Daangarh & Vilasgarh', 'Hilltops linked with playful leelas of love and giving.'],
      ],
      rules: [
        'In Barsana, greet with “Radhe Radhe”.',
        'Take care on the climb at Sankari Khor.',
        'Do have darshan at Mor Kuti and Maan Mandir.',
      ],
      tips: 'Very large crowds come for Radhashtami and Lathmar Holi. A ropeway is mentioned as an option to the steps — check locally that it is running.',
    },
  },
  mathura: {
    image: 'places/mathura',
    lengthHi: 'लगभग 10 किमी',
    destination: 'Vishram Ghat, Mathura',
    en: {
      name: 'Mathura Parikrama',
      length: 'About 10 km',
      subtitle: 'Along the Yamuna and Mathura’s four guardian Shiva temples',
      overview:
        'After defeating Kansa, Krishna and Balarama are said to have rested at Vishram Ghat. The Mathura Panchkoshi parikrama starts here and passes old mounds along the Yamuna and the four guardian Mahadev temples — Bhuteshwar, Rangeshwar, Gokarneshwar and Pipleshwar.',
      duration: 'approx. 2.5–3.5 hours',
      difficulty: 'Easy to moderate',
      startPoint: 'Vishram Ghat (Yamuna bank)',
      bestTime: 'Around 5 AM or 5 PM',
      sections: ['Main darshan points'],
      stops: [
        ['Vishram Ghat', 'Where the parikrama starts and ends. Known for Yamuna snan, the sankalp and the evening aarti.'],
        ['Kansa Tila', 'The mound where, by tradition, Krishna defeated Kansa and returned the throne to Ugrasen.'],
        ['Bhuteshwar Mahadev', 'Guardian Shiva of Mathura’s west. Devotees consider his darshan essential when staying in Mathura.'],
        ['Rangeshwar Mahadev', 'An old Shiva temple near Kansa’s arena, where Krishna is said to have prayed before the wrestling match.'],
        ['Dwarkadhish Mandir & Swami Ghat', 'A grand Pushtimarg temple near Vishram Ghat, where the Lord is worshipped as a king.'],
      ],
      rules: [
        'At Vishram Ghat, offer a diya and bow to the Yamuna, then take the sankalp for the parikrama.',
        'Tradition holds the parikrama on Ekadashi, Dev Uthani Ekadashi and Akshaya Navami to be especially meritorious.',
      ],
      tips: 'E-rickshaws often run along the route — confirm locally. After the parikrama, many offer the famous Mathura peda at Vishram Ghat.',
    },
  },
};

// Drop English glosses written in brackets inside Hindi text: "दानघाटी मंदिर (Danghati Temple)".
function hindiOnly(text) {
  return String(text || '').replace(/\s*\([^)]*[A-Za-z][^)]*\)/g, '').trim();
}

function findParikrama(id) {
  if (id === undefined || id === null) return null;
  const key = String(id);
  // Some links use ids like "govardhan-parikrama"; match on the data id prefix too.
  return parikramaData.find((p) => p.id === key || key.startsWith(`${p.id}-`)) || null;
}

// The part of a data field inside brackets, e.g. "बड़ी 12 किमी + छोटी 9 किमी" from "21 KM (बड़ी 12 किमी + छोटी 9 किमी)".
function bracketPart(text) {
  const m = String(text || '').match(/\(([^)]*)\)/);
  return m ? m[1].trim() : null;
}

function FactTile({ label, value, note, colors }) {
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="small" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="body" weight="700" color={colors.navy}>
        {value}
      </AppText>
      {note ? (
        <AppText variant="small" color={colors.muted}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

function CareRow({ title, text, colors }) {
  return (
    <View style={[styles.careRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="body" weight="700" color={colors.navy} style={styles.careTitle}>
        {title}
      </AppText>
      <AppText variant="caption" color={colors.text} style={styles.flex}>
        {text}
      </AppText>
    </View>
  );
}

function EmergencyButtons({ isHindi, colors }) {
  const callNumber = usePressGuard((n) => Linking.openURL(`tel:${n}`).catch(() => {}));
  const items = [
    { n: '112', icon: 'emergency', hi: 'आपातकाल', en: 'Emergency' },
    { n: '108', icon: 'ambulance', hi: 'एंबुलेंस', en: 'Ambulance' },
  ];
  return (
    <View style={styles.emergency}>
      <AppText variant="caption" weight="600" color={colors.muted}>
        {isHindi ? 'ये नंबर पास रखें' : 'Keep these numbers handy'}
      </AppText>
      <View style={styles.emergencyRow}>
        {items.map((item) => (
          <Pressable
            key={item.n}
            style={({ pressed }) => [
              styles.emergencyBtn,
              { backgroundColor: colors.warningBg, opacity: pressed ? 0.75 : 1 },
            ]}
            onPress={() => callNumber(item.n)}
            accessibilityRole="button"
            accessibilityLabel={isHindi ? `${item.n} पर कॉल करें` : `Call ${item.n}`}
          >
            <Icon name={item.icon} size={20} color={colors.warning} />
            <AppText variant="bodyBold" color={colors.warning} maxFontSizeMultiplier={1.3} style={styles.flexShrink}>
              {`${item.n} · ${isHindi ? item.hi : item.en}`}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ParikramaDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  const { id, parikrama: initialParikrama } = route.params || {};
  const parikrama = initialParikrama || findParikrama(id) || parikramaData[0];
  const extra = EXTRA[parikrama.id] || {};
  const en = extra.en || {};

  // Number the stops straight through all sections.
  let counter = 0;
  const sections = (parikrama.sections || []).map((section, sIdx) => ({
    name: isHindi ? hindiOnly(section.name) : (en.sections && en.sections[sIdx]) || section.name,
    stops: (section.stops || []).map((stop) => {
      const enStop = en.stops && en.stops[counter];
      counter += 1;
      return {
        n: counter,
        name: isHindi ? hindiOnly(stop.name) : enStop ? enStop[0] : stop.name,
        desc: isHindi ? stop.desc : enStop ? enStop[1] : stop.desc,
      };
    }),
  }));
  const rules = isHindi ? parikrama.rules || [] : en.rules || parikrama.rules || [];
  const tips = isHindi ? parikrama.tips : en.tips || parikrama.tips;

  const name = isHindi ? parikrama.title : en.name || parikrama.titleEn;
  const otherName = isHindi ? en.name || parikrama.titleEn : parikrama.title;
  const lengthHead = isHindi ? extra.lengthHi || parikrama.distance : en.length || parikrama.distance;
  // Hindi-only detail of the distance (e.g. the two parts of the Govardhan parikrama), unless already shown.
  const lengthPart = isHindi ? bracketPart(parikrama.distance) : null;
  const lengthNote = lengthPart && !String(lengthHead).includes(lengthPart) ? lengthPart : null;
  const durationValue = isHindi ? `लगभग ${parikrama.duration}` : en.duration || parikrama.duration;
  const difficulty = isHindi ? hindiOnly(parikrama.difficulty) : en.difficulty || parikrama.difficulty;

  const image = extra.image ? getPlaceImage({ image: extra.image }) : null;

  const openStart = () => {
    const destination = encodeURIComponent(extra.destination || `${parikrama.titleEn} Braj`);
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`).catch(() => {});
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <Photo source={image} fallbackIcon="parikrama" style={styles.hero} accessibilityLabel={name}>
          <View style={[styles.heroBar, { top: insets.top + 8 }]}>
            <IconButton
              icon="chevronLeft"
              size={28}
              filled
              onPress={() => navigation.goBack()}
              accessibilityLabel={isHindi ? 'वापस' : 'Back'}
            />
            <LanguageToggle />
          </View>
          {/* Placed above the sheet's rounded edge so it stays visible. */}
          {image ? <RepresentativeTag style={styles.heroTag} /> : null}
        </Photo>

        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {/* Title */}
          <View style={styles.titleBlock}>
            <AppText variant="h1" weight="700" color={colors.navy} accessibilityRole="header">
              {name}
            </AppText>
            {otherName && otherName !== name ? (
              <AppText variant="caption" color={colors.muted}>
                {otherName}
              </AppText>
            ) : null}
            <AppText variant="body" color={colors.muted}>
              {isHindi ? parikrama.subtitle : en.subtitle || parikrama.subtitle}
            </AppText>
            {difficulty ? (
              <View style={[styles.effortPill, { backgroundColor: colors.primaryLight }]}>
                <Icon name="parikrama" size={16} color={colors.primary} />
                <AppText variant="small" weight="700" color={colors.primary}>
                  {isHindi ? `श्रम: ${difficulty}` : `Effort: ${difficulty}`}
                </AppText>
              </View>
            ) : null}
          </View>

          {/* Facts */}
          <View style={styles.factsBlock}>
            <View style={styles.tileRow}>
              <FactTile
                label={isHindi ? 'दूरी (अनुमानित)' : 'Distance (approx.)'}
                value={lengthHead}
                note={lengthNote}
                colors={colors}
              />
              <FactTile label={isHindi ? 'समय (अनुमानित)' : 'Time (approx.)'} value={durationValue} colors={colors} />
            </View>
            <View style={styles.tileRow}>
              <FactTile
                label={isHindi ? 'आरंभ स्थल' : 'Starting point'}
                value={isHindi ? hindiOnly(parikrama.startPoint) : en.startPoint || parikrama.startPoint}
                colors={colors}
              />
              <FactTile
                label={isHindi ? 'शुरू करने का अच्छा समय (सुझाव)' : 'Good time to start (suggested)'}
                value={isHindi ? parikrama.bestTime : en.bestTime || parikrama.bestTime}
                colors={colors}
              />
            </View>
            <AppText variant="small" color={colors.muted}>
              {isHindi
                ? 'दूरी और समय अनुमानित हैं · दर्शन और विश्राम के साथ अक्सर अधिक समय लगता है। बीच-बीच में विश्राम करें।'
                : 'Distance and time are approximate · often longer with darshan and rest. Take regular breaks.'}
            </AppText>
          </View>

          {/* About */}
          <AppText variant="body" color={colors.text}>
            {isHindi ? parikrama.overview : en.overview || parikrama.overview}
          </AppText>

          {/* Stops */}
          <View style={styles.stopsBlock}>
            <View>
              <AppText variant="h3" weight="700" color={colors.navy}>
                {isHindi ? 'परिक्रमा के पड़ाव' : 'Along the parikrama'}
              </AppText>
              <AppText variant="small" color={colors.muted}>
                {isHindi
                  ? 'घड़ी की दिशा में चलें · प्रतीकात्मक क्रम, यह नेविगेशन नक्शा नहीं है'
                  : 'Walk clockwise · illustrative order, not a navigation map'}
              </AppText>
            </View>
            {sections.map((section, sIdx) => (
              <Card key={`s${sIdx}`} style={styles.sectionCard}>
                {section.name ? (
                  <AppText variant="caption" weight="700" color={colors.primary}>
                    {section.name}
                  </AppText>
                ) : null}
                {section.stops.map((stop) => (
                  <View key={stop.n} style={styles.stopRow}>
                    <View style={[styles.stopNum, { backgroundColor: colors.primaryLight }]}>
                      <AppText variant="small" weight="700" color={colors.primary} maxFontSizeMultiplier={1.2}>
                        {stop.n}
                      </AppText>
                    </View>
                    <View style={styles.flex}>
                      <AppText variant="body" weight="600" color={colors.navy}>
                        {stop.name}
                      </AppText>
                      {stop.desc ? (
                        <AppText variant="small" color={colors.textSecondary}>
                          {stop.desc}
                        </AppText>
                      ) : null}
                    </View>
                  </View>
                ))}
              </Card>
            ))}
          </View>

          {/* Etiquette */}
          {rules.length ? (
            <Card>
              <AppText variant="h4" weight="700" color={colors.navy}>
                {isHindi ? 'परिक्रमा की मर्यादा' : 'Parikrama etiquette'}
              </AppText>
              {rules.map((rule, idx) => (
                <View key={idx} style={styles.ruleRow}>
                  <Icon name="flower" size={18} color={colors.primary} style={styles.ruleIcon} />
                  <AppText variant="body" color={colors.text} style={styles.flex}>
                    {rule}
                  </AppText>
                </View>
              ))}
            </Card>
          ) : null}

          {/* Gentler, safer walk */}
          <View style={styles.careBlock}>
            <SectionHeader title={isHindi ? 'आराम से और सुरक्षित चलें' : 'A gentler, safer walk'} style={styles.careHead} />
            <CareRow
              title={isHindi ? 'जल्दी शुरू करें' : 'Start early'}
              text={
                isHindi
                  ? 'तेज़ धूप से बचें और अंधेरे में अकेले न चलें।'
                  : 'Avoid harsh heat and do not walk alone after dark.'
              }
              colors={colors}
            />
            <CareRow
              title={isHindi ? 'पैरों का ध्यान रखें' : 'Protect your feet'}
              text={
                isHindi
                  ? 'सुरक्षित जूते-चप्पल चुनें; परंपरा के बारे में स्थानीय लोगों से पूछें।'
                  : 'Choose safe footwear; ask locally about customs.'
              }
              colors={colors}
            />
            <CareRow
              title={isHindi ? 'पीने का पानी साथ रखें' : 'Carry drinking water'}
              text={
                isHindi
                  ? 'छाया में रुकें; बुज़ुर्गों और बच्चों को साथ रखें।'
                  : 'Pause in shade; keep elders and children together.'
              }
              colors={colors}
            />
            <AppText variant="small" color={colors.muted}>
              {isHindi
                ? 'सुविधाएं अलग-अलग होती हैं — इन पड़ावों पर पानी, शौचालय और ई-रिक्शा की पुष्टि नहीं है। स्थानीय रूप से जांचें।'
                : 'Facilities vary — water, toilets and e-rickshaws are not confirmed at these stops. Check locally.'}
            </AppText>
          </View>

          {tips ? (
            <InfoNote tone="warning" icon="info">
              {isHindi ? `स्थानीय सुझाव: ${tips}` : `Local tip: ${tips}`}
            </InfoNote>
          ) : null}

          <EmergencyButtons isHindi={isHindi} colors={colors} />

          <AppText variant="small" color={colors.muted} align="center">
            {isHindi
              ? 'Google Maps में खुलेगा। ऐप में रास्ता-दर-रास्ता मार्गदर्शन नहीं है।'
              : 'Opens Google Maps. The app does not give turn-by-turn guidance.'}
          </AppText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        <Button
          title={isHindi ? 'आरंभ स्थल का रास्ता' : 'Directions to the start'}
          icon="directions"
          onPress={openStart}
          accessibilityLabel={
            isHindi ? 'आरंभ स्थल का रास्ता, Google Maps में खुलेगा' : 'Directions to the start, opens Google Maps'
          }
          style={styles.flex}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  hero: { height: HERO_HEIGHT },
  heroBar: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTag: { position: 'absolute', left: GUTTER, bottom: SHEET_OVERLAP + 10 },
  sheet: {
    marginTop: -SHEET_OVERLAP,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: GUTTER,
    paddingTop: 20,
    gap: 20,
  },
  titleBlock: { gap: 6 },
  effortPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 2,
  },
  factsBlock: { gap: 8 },
  tileRow: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, gap: 2, padding: 12, borderRadius: 14, borderWidth: 1 },
  stopsBlock: { gap: 12 },
  sectionCard: { padding: 14, gap: 10 },
  stopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stopNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12 },
  ruleIcon: { marginTop: 3 },
  careBlock: { gap: 8 },
  careHead: { marginBottom: 2 },
  careRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  careTitle: { width: 110 },
  emergency: { gap: 8 },
  emergencyRow: { flexDirection: 'row', gap: 10 },
  emergencyBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
