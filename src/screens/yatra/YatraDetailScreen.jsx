/**
 * Braj Darshan - Yatra day plan
 * Layout from the redesign (design-input/figma "Light · Yatra day plan"): one day
 * of a plan as a numbered timeline. Times come from src/data/yatra.json and are
 * shown as suggestions; temple stops add the temple's regular darshan hours from
 * temples.json and a Google Maps link.
 *
 * Params: { id, yatra, planDayIds? } — planDayIds lists the days of the chosen plan.
 */

import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Linking, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Button,
  Card,
  Chip,
  InfoNote,
  LanguageToggle,
  ListRow,
  Photo,
  SectionHeader,
  TopBar,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import YatraPlannerModal from '../../components/yatra/YatraPlannerModal';
import { getTempleImage, isTempleImageRepresentative } from '../../utils/imageAssets';
import { formatMinutes, getIndianStandardTime, getTodaysWindows } from '../../utils/templeHours';
import { ROUTES } from '../../navigation/routes';
import yatraData from '../../data/yatra.json';
import templesData from '../../data/temples.json';

// English text for the Hindi-only fields of yatra.json (same order as the data).
const DAY_EN = {
  1: {
    places: ['Shri Krishna Janmasthan', 'Keshav Dev Mandir', 'Potra Kund', 'Dwarkadhish Mandir', 'Vishram Ghat Yamuna aarti'],
    stops: [
      'Check in at your hotel or dharamshala and rest',
      'Shri Krishna Janmasthan and Keshav Dev Mandir darshan',
      'Potra Kund, then a simple Braj lunch',
      'Darshan at the old Shri Dwarkadhish Mandir',
      'Evening Yamuna aarti at Vishram Ghat',
      'Peda prasad from the local market, then rest',
    ],
    tips: 'Phones and electronic items are not allowed inside the Janmabhoomi complex; deposit them at the cloak room.',
  },
  2: {
    places: ['Nand Bhavan (84 Khamba)', 'Raman Reti, Gokul', 'Brahmand Ghat', 'Chintaharan Mahadev', 'Yamuna ghat'],
    stops: [
      'Leave Mathura for Gokul',
      'Nand Bhavan (84 Khamba), where baby Krishna is said to have been raised',
      'Raman Reti, where devotees roll in the sand in love for baby Krishna',
      'Brahmand Ghat, where Krishna is said to have shown Mother Yashoda the universe in his mouth',
      'Chintaharan Mahadev Mandir on the Yamuna bank',
      'Return from Gokul to Mathura',
    ],
    tips: 'At Raman Reti, leave your footwear outside, sit on the sacred sand and join the kirtan.',
  },
  3: {
    places: ['Banke Bihari Ji Mandir', 'Radha Vallabh Ji Mandir', 'Seva Kunj', 'Nidhivan', 'ISKCON Mandir', 'Prem Mandir (light show)'],
    stops: [
      'Shri Banke Bihari Ji Mandir (shringar darshan)',
      'The old Radha Vallabh Ji Mandir and Seva Kunj',
      'Nidhivan, where devotees believe the raas leela still happens at night',
      'ISKCON (Shri Krishna Balaram Mandir)',
      'Yamuna darshan at Keshi Ghat',
      'Prem Mandir darshan and musical light show',
    ],
    tips: 'In the narrow lanes around Banke Bihari Ji, keep glasses and phones safe from monkeys.',
  },
  4: {
    places: ['Daan Ghati Mandir', 'Mansi Ganga', 'Kusum Sarovar', 'Radha Kund & Shyam Kund', 'Poonchari Ka Lautha', 'Jatipura Mukharvind'],
    stops: [
      'Milk offering at Daan Ghati Mandir and start of the parikrama',
      'Mansi Ganga snan and darshan',
      'The historic Kusum Sarovar',
      'Radha Kund and Shyam Kund (very sacred)',
      'Poonchari Ka Lautha Mandir darshan',
      'Aarti at Jatipura Mukharvind and end of the parikrama',
    ],
    tips: 'The parikrama route is about 21 km. Wear comfortable footwear or walk barefoot, and carry enough water.',
  },
  5: {
    places: ['Shri Radha Rani Mandir (Ladli Ji)', 'Pili Pokhar', 'Kushal Bihari Mandir', 'Nandishwar Mahadev', 'Nand Baba’s palace', 'Pavan Sarovar'],
    stops: [
      'Shri Ladli Ji (Radha Rani) Mandir on Bhanugarh hill, Barsana',
      'Pili Pokhar and Kushal Bihari Mandir darshan',
      'Lunch, then leave for Nandgaon (about 8 km)',
      'Nandishwar Mahadev Mandir and Nand Baba’s palace in Nandgaon',
      'Pavan Sarovar darshan and evening aarti',
    ],
    tips: 'There are about 200 steps up to the Radha Rani Mandir. Palki and a ropeway are mentioned for elders — confirm locally.',
  },
  6: {
    places: ['Dauji Mandir (Baldev)', 'Ksheer Sagar Kund', 'Kokilavan Shani Dev', 'Mathura peda market'],
    stops: [
      'Shri Dauji Maharaj Mandir (Baldev) darshan and makhan-mishri bhog',
      'Kokilavan Shani Dev Mandir darshan and parikrama',
      'Shopping for peda, makhan, deity clothes and kanthi mala at the local market',
      'Leave from Mathura Junction or the highway',
    ],
    tips: 'Do take the makhan-mishri prasad offered at Dauji.',
  },
};

// Stops that are a temple in temples.json (matched on the Hindi stop text).
const TEMPLE_MATCHES = [
  ['बांके बिहारी', 1],
  ['जन्मस्थान', 2],
  ['प्रेम मंदिर', 3],
  ['लाड़ली जी', 4],
  ['दानघाटी', 5],
  ['द्वारिकाधीश', 6],
  ['रमण रेती', 7],
  ['दाऊजी', 8],
];

// Day plans that are a parikrama with its own guide.
const DAY_PARIKRAMA = { 4: 'govardhan' };

function findDay(id) {
  return yatraData.find((d) => d.id === id || String(d.id) === String(id));
}

function parseStop(text) {
  const match = String(text).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(.*)$/i);
  if (!match) return { time: null, text: String(text) };
  return { time: `${Number(match[1])}:${match[2]} ${match[3].toUpperCase()}`, text: match[4] };
}

function templeFor(text) {
  const hit = TEMPLE_MATCHES.find(([word]) => String(text).includes(word));
  return hit ? templesData.find((t) => t.id === hit[1]) || null : null;
}

function darshanLine(temple, isHindi) {
  const windows = getTodaysWindows(temple, getIndianStandardTime(new Date()));
  if (!windows) return isHindi ? 'दर्शन समय मंदिर से पुष्टि करें' : 'Confirm darshan timings at the temple';
  const hours = windows.map(([s, e]) => `${formatMinutes(s)} – ${formatMinutes(e)}`).join(', ');
  return isHindi ? `सामान्य दर्शन समय (लगभग): ${hours}` : `Regular darshan (approx.): ${hours}`;
}

function durationText(duration, isHindi) {
  const match = String(duration || '').match(/\(([\d.\s\-–]+)\s*Hours?\)/i);
  if (!match) return duration;
  const hours = match[1].trim();
  return isHindi ? `लगभग ${hours} घंटे` : `Approx. ${hours} hours`;
}

function openDirections(temple) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`;
  Linking.openURL(url).catch(() => {});
}

function StopCard({ index, stop, isHindi, colors }) {
  const temple = templeFor(stop.textHi);
  const image = temple ? getTempleImage(temple) : null;
  return (
    <View>
      <View style={styles.stopHead}>
        <View style={[styles.stopNum, { backgroundColor: colors.primaryLight }]}>
          <AppText variant="caption" weight="700" color={colors.primary}>
            {index + 1}
          </AppText>
        </View>
        <AppText variant="h4" weight="700" color={colors.navy} style={styles.flex}>
          {stop.time
            ? `${stop.time} · ${isHindi ? 'सुझाया गया समय' : 'suggested'}`
            : isHindi
              ? 'समय अपनी सुविधा से'
              : 'Time as convenient'}
        </AppText>
      </View>
      <Card padded={false}>
        {image ? (
          <Photo
            source={image}
            representative={isTempleImageRepresentative(temple)}
            style={styles.stopPhoto}
            accessibilityLabel={isHindi ? temple.nameHindi : temple.name}
          />
        ) : null}
        <View style={styles.stopBody}>
          <AppText variant="h4" weight="700" color={colors.navy}>
            {isHindi ? stop.textHi : stop.textEn}
          </AppText>
          {temple ? (
            <>
              <AppText variant="caption" color={colors.muted}>
                {darshanLine(temple, isHindi)}
              </AppText>
              <Button
                title={isHindi ? 'रास्ता देखें (Google Maps)' : 'Directions (Google Maps)'}
                variant="text"
                icon="directions"
                onPress={() => openDirections(temple)}
                style={styles.directionsBtn}
              />
            </>
          ) : null}
        </View>
      </Card>
    </View>
  );
}

export default function YatraDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const scrollRef = useRef(null);
  const [plannerVisible, setPlannerVisible] = useState(false);

  const { id, yatra: initialYatra, planDayIds } = route.params || {};
  const yatra = initialYatra || findDay(id) || yatraData[0];

  const planDays = useMemo(() => {
    const list = Array.isArray(planDayIds) ? planDayIds.map(findDay).filter(Boolean) : [];
    return list.some((d) => d.id === yatra.id) ? list : [yatra];
  }, [planDayIds, yatra]);
  const position = planDays.findIndex((d) => d.id === yatra.id);
  const total = planDays.length;
  const nextDay = planDays[position + 1] || null;

  const en = DAY_EN[yatra.id] || {};
  const stops = (yatra.stops || []).map((raw, i) => {
    const parsed = parseStop(raw);
    return { time: parsed.time, textHi: parsed.text, textEn: (en.stops && en.stops[i]) || parsed.text };
  });
  const places = isHindi ? yatra.places || [] : en.places || yatra.places || [];
  const tips = isHindi ? yatra.tips : en.tips || yatra.tips;
  const parikramaId = DAY_PARIKRAMA[yatra.id];

  const goToDay = (day) => {
    navigation.setParams({ id: day.id, yatra: day, planDayIds: planDays.map((d) => d.id) });
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  };

  const handleShare = async () => {
    const title = isHindi ? yatra.title : yatra.titleEn;
    const lines = stops.map((s) => `${s.time ? `${s.time} – ` : ''}${isHindi ? s.textHi : s.textEn}`);
    const note = isHindi
      ? 'समय केवल सुझाव हैं — त्योहारों पर बदल सकते हैं, स्थानीय पुष्टि करें।'
      : 'Times are suggestions — they change on festivals, so confirm locally.';
    try {
      await Share.share({ message: `${title}\n\n${lines.join('\n')}\n\n${note}\n— Braj Darshan` });
    } catch {
      // Share sheet dismissed or unavailable.
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <TopBar
        eyebrow={isHindi ? `${total} दिन की योजना` : `${total}-day plan`}
        title={isHindi ? `दिन ${position + 1} (${total} में से)` : `Day ${position + 1} of ${total}`}
        onBack={() => navigation.goBack()}
        right={<LanguageToggle />}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {total > 1 ? (
          <View style={styles.chipRow}>
            {planDays.map((day, i) => (
              <Chip
                key={day.id}
                label={isHindi ? `दिन ${i + 1}` : `Day ${i + 1}`}
                selected={day.id === yatra.id}
                onPress={() => goToDay(day)}
              />
            ))}
          </View>
        ) : null}

        {/* Day summary */}
        <View>
          <AppText variant="h2" weight="700" color={colors.navy}>
            {isHindi ? yatra.title : yatra.titleEn}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.gapSmall}>
            {isHindi ? yatra.tagline : yatra.taglineEn}
          </AppText>
        </View>

        <Card style={styles.factsCard}>
          <ListRow
            icon="clock"
            title={durationText(yatra.duration, isHindi)}
            subtitle={isHindi ? 'दिन की अवधि' : 'Length of the day'}
          />
          <ListRow
            icon="sunrise"
            title={isHindi ? yatra.bestTime : yatra.bestTimeEn}
            subtitle={isHindi ? 'शुरुआत (सुझाव)' : 'Start (suggested)'}
          />
          <ListRow
            icon="car"
            title={isHindi ? yatra.transport : yatra.transportEn}
            subtitle={isHindi ? 'आने-जाने का साधन (सुझाव)' : 'Getting around (suggested)'}
          />
          {places.length ? (
            <ListRow
              icon="location"
              title={places.join(' · ')}
              subtitle={isHindi ? 'आज के स्थान' : 'Places today'}
            />
          ) : null}
        </Card>

        <InfoNote>
          {isHindi
            ? 'समय केवल सुझाव हैं। यह बुकिंग या आधिकारिक यात्रा कार्यक्रम नहीं है। अपने समूह के अनुसार बदलें और स्थानीय पुष्टि करें।'
            : 'Times are suggestions. This is not a booking or an official travel schedule. Adjust for your group and confirm locally.'}
        </InfoNote>

        {/* Timeline */}
        <View>
          <SectionHeader title={isHindi ? 'आपका दिन, एक नज़र में' : 'Your day, at a glance'} />
          {stops.map((stop, i) => (
            <View key={`${yatra.id}-${i}`}>
              <StopCard index={i} stop={stop} isHindi={isHindi} colors={colors} />
              {i < stops.length - 1 ? (
                <View style={styles.transfer}>
                  <Icon name="route" size={18} color={colors.muted} />
                  <AppText variant="caption" color={colors.muted} style={styles.flex}>
                    {isHindi
                      ? 'पैदल या स्थानीय वाहन से आगे बढ़ें। यात्रा का समय बदलता है; स्थानीय लोगों से पूछें।'
                      : 'Walk or take a local transfer. Travel time varies; ask locally.'}
                  </AppText>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {parikramaId ? (
          <Card style={styles.listCard}>
            <ListRow
              icon="parikrama"
              title={isHindi ? 'गोवर्धन परिक्रमा मार्गदर्शिका' : 'Govardhan Parikrama guide'}
              subtitle={isHindi ? 'पड़ाव, नियम और सावधानियां' : 'Stops, etiquette and safety'}
              onPress={() => navigation.navigate(ROUTES.PARIKRAMA_DETAIL, { id: parikramaId })}
            />
          </Card>
        ) : null}

        {tips ? (
          <Card>
            <View style={styles.tipHead}>
              <Icon name="info" size={20} color={colors.primary} />
              <AppText variant="h4" weight="700" color={colors.navy}>
                {isHindi ? 'जाने से पहले' : 'Before you go'}
              </AppText>
            </View>
            <AppText variant="body" color={colors.text} style={styles.gapSmall}>
              {tips}
            </AppText>
          </Card>
        ) : null}

        <InfoNote>
          {isHindi
            ? 'त्योहारों पर समय बदल सकता है — कृपया स्थानीय पुष्टि करें।'
            : 'Timings may change on festivals — confirm locally.'}
        </InfoNote>

        {nextDay ? (
          <Card style={styles.listCard}>
            <ListRow
              icon="route"
              title={isHindi ? nextDay.title : nextDay.titleEn}
              subtitle={isHindi ? `अगला: दिन ${position + 2}` : `Next: Day ${position + 2}`}
              onPress={() => goToDay(nextDay)}
            />
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button
            title={isHindi ? 'स्थान नक्शे पर देखें' : 'View places on map'}
            icon="map"
            onPress={() => navigation.navigate(ROUTES.MAP)}
          />
          <Button
            title={isHindi ? 'योजना के दिन बदलें' : 'Change plan length'}
            variant="secondary"
            icon="calendar"
            onPress={() => setPlannerVisible(true)}
          />
          <Button
            title={isHindi ? 'यह दिन साझा करें' : 'Share this day'}
            variant="text"
            icon="share"
            onPress={handleShare}
          />
        </View>
      </ScrollView>

      <YatraPlannerModal
        visible={plannerVisible}
        initialDays={total}
        onClose={() => setPlannerVisible(false)}
        onSelectDay={(day, dayIds) => {
          navigation.setParams({ id: day.id, yatra: day, planDayIds: dayIds || [day.id] });
          if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gapSmall: { marginTop: 6 },
  factsCard: { paddingVertical: 4 },
  listCard: { paddingVertical: 4 },
  stopHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  stopNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopPhoto: { height: 160 },
  stopBody: { padding: 16, gap: 6 },
  directionsBtn: { alignSelf: 'flex-start', marginLeft: -8 },
  transfer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 14,
    paddingLeft: 8,
  },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { gap: 12, marginTop: 4 },
});
