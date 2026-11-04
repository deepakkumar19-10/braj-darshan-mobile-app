/**
 * Braj Darshan - Yatra day plan
 * Layout from the Nov 2026 redesign (YatraDay artboard): a photo of the day's
 * town, then a rounded sheet with the day pill, title and tagline, three "at a
 * glance" tiles, the day's stops as a vertical timeline, the gold tip note and
 * the disclaimer, with Share and Map fixed at the bottom. Times come from
 * src/data/yatra.json and are shown as suggestions; temple stops add the
 * temple's regular darshan hours from temples.json and a Google Maps link.
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
  IconButton,
  InfoNote,
  LanguageToggle,
  ListRow,
  Photo,
  RepresentativeTag,
  SectionHeader,
  GUTTER,
} from '../../components/ui';
import YatraPlannerModal from '../../components/yatra/YatraPlannerModal';
import { getPlaceImage } from '../../utils/imageAssets';
import { formatMinutes, getIndianStandardTime, getTodaysWindows } from '../../utils/templeHours';
import { ROUTES } from '../../navigation/routes';
import yatraData from '../../data/yatra.json';
import { getPlaces, getTemples } from '../../services/contentService';

const HERO_HEIGHT = 220;
const SHEET_OVERLAP = 20;

// The main town of each day plan (from its title in yatra.json) and the places.json
// entry whose photo stands for it; the photo is marked "Representative photo".
const DAY_TOWN = {
  1: { hi: 'मथुरा', en: 'Mathura', place: 'Mathura' },
  2: { hi: 'गोकुल', en: 'Gokul', place: 'Gokul' },
  3: { hi: 'वृंदावन', en: 'Vrindavan', place: 'Vrindavan' },
  4: { hi: 'गोवर्धन', en: 'Govardhan', place: 'Govardhan' },
  5: { hi: 'बरसाना', en: 'Barsana', place: 'Barsana' },
  6: { hi: 'बलदेव', en: 'Baldev', place: 'Dauji Mandir' },
};

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
  return hit ? getTemples().find((t) => t.id === hit[1]) || null : null;
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

function GlanceTile({ label, value, colors }) {
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="small" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="caption" weight="600" color={colors.navy}>
        {value}
      </AppText>
    </View>
  );
}

function TimelineStop({ stop, last, isHindi, colors }) {
  const temple = templeFor(stop.textHi);
  return (
    <View style={styles.stopRow}>
      <View style={styles.rail}>
        <View style={[styles.railDot, { backgroundColor: colors.surface, borderColor: colors.primaryContainer }]} />
        {last ? null : <View style={[styles.railLine, { backgroundColor: colors.borderGold }]} />}
      </View>
      <View style={[styles.stopBody, last && styles.stopBodyLast]}>
        <AppText variant="small" weight="700" color={colors.primary}>
          {stop.time || (isHindi ? 'समय अपनी सुविधा से' : 'Time as convenient')}
        </AppText>
        <AppText variant="body" weight="600" color={colors.navy}>
          {isHindi ? stop.textHi : stop.textEn}
        </AppText>
        {temple ? (
          <>
            <AppText variant="small" color={colors.muted} style={styles.stopDarshan}>
              {darshanLine(temple, isHindi)}
            </AppText>
            <Button
              title={isHindi ? 'रास्ता देखें (Google Maps)' : 'Directions (Google Maps)'}
              variant="text"
              icon="directions"
              onPress={() => openDirections(temple)}
              accessibilityLabel={
                isHindi
                  ? `${temple.nameHindi} का रास्ता देखें (Google Maps)`
                  : `Directions to ${temple.name} (Google Maps)`
              }
              style={styles.directionsBtn}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

export default function YatraDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
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
  const tips = isHindi ? yatra.tips : en.tips || yatra.tips;
  const parikramaId = DAY_PARIKRAMA[yatra.id];
  const town = DAY_TOWN[yatra.id] || null;
  const heroImage = town ? getPlaceImage(getPlaces().find((p) => p.name === town.place)) : null;
  const title = isHindi ? yatra.title : yatra.titleEn;

  const planLabel =
    total > 1
      ? isHindi
        ? `दिन ${position + 1} (${total} में से)`
        : `Day ${position + 1} of ${total}`
      : isHindi
        ? '1 दिन की योजना'
        : '1-day plan';
  const pill = town ? `${planLabel} · ${isHindi ? town.hi : town.en}` : planLabel;

  const goToDay = (day) => {
    navigation.setParams({ id: day.id, yatra: day, planDayIds: planDays.map((d) => d.id) });
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  };

  const handleShare = async () => {
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
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Photo
          source={heroImage}
          fallbackIcon="route"
          style={styles.hero}
          accessibilityLabel={town ? (isHindi ? town.hi : town.en) : undefined}
        >
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
          {heroImage ? <RepresentativeTag style={styles.heroTag} /> : null}
        </Photo>

        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {/* Day summary */}
          <View style={styles.titleBlock}>
            <View style={[styles.dayPill, { backgroundColor: colors.primaryLight }]}>
              <AppText variant="small" weight="700" color={colors.primary}>
                {pill}
              </AppText>
            </View>
            <AppText variant="h1" weight="700" color={colors.navy} accessibilityRole="header">
              {title}
            </AppText>
            <AppText variant="body" color={colors.muted}>
              {isHindi ? yatra.tagline : yatra.taglineEn}
            </AppText>
          </View>

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

          {/* At a glance */}
          <View>
            <SectionHeader title={isHindi ? 'आपका दिन, एक नज़र में' : 'Your day, at a glance'} />
            <View style={styles.tiles}>
              <GlanceTile
                label={isHindi ? 'दिन की अवधि' : 'Length of the day'}
                value={durationText(yatra.duration, isHindi)}
                colors={colors}
              />
              <GlanceTile
                label={isHindi ? 'शुरुआत (सुझाव)' : 'Start (suggested)'}
                value={isHindi ? yatra.bestTime : yatra.bestTimeEn}
                colors={colors}
              />
              <GlanceTile
                label={isHindi ? 'साधन (सुझाव)' : 'Getting around (suggested)'}
                value={isHindi ? yatra.transport : yatra.transportEn}
                colors={colors}
              />
            </View>
          </View>

          {/* Timeline */}
          <View>
            <SectionHeader title={isHindi ? 'आज के स्थान' : 'Places today'} />
            {stops.map((stop, i) => (
              <TimelineStop
                key={`${yatra.id}-${i}`}
                stop={stop}
                last={i === stops.length - 1}
                isHindi={isHindi}
                colors={colors}
              />
            ))}
            {stops.length > 1 ? (
              <View style={styles.transfer}>
                <Icon name="route" size={18} color={colors.muted} />
                <AppText variant="small" color={colors.muted} style={styles.flex}>
                  {isHindi
                    ? 'पैदल या स्थानीय वाहन से आगे बढ़ें। यात्रा का समय बदलता है; स्थानीय लोगों से पूछें।'
                    : 'Walk or take a local transfer. Travel time varies; ask locally.'}
                </AppText>
              </View>
            ) : null}
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
            <InfoNote tone="warning" icon="info">
              {tips}
            </InfoNote>
          ) : null}

          <View style={styles.disclaimer}>
            <AppText variant="small" color={colors.muted}>
              {isHindi
                ? 'समय केवल सुझाव हैं। यह बुकिंग या आधिकारिक यात्रा कार्यक्रम नहीं है। अपने समूह के अनुसार बदलें और स्थानीय पुष्टि करें।'
                : 'Times are suggestions. This is not a booking or an official travel schedule. Adjust for your group and confirm locally.'}
            </AppText>
            <AppText variant="small" color={colors.muted}>
              {isHindi
                ? 'त्योहारों पर समय बदल सकता है — कृपया स्थानीय पुष्टि करें।'
                : 'Timings may change on festivals — confirm locally.'}
            </AppText>
          </View>

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

          <Button
            title={isHindi ? 'योजना के दिन बदलें' : 'Change plan length'}
            variant="secondary"
            icon="calendar"
            onPress={() => setPlannerVisible(true)}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        <Button
          title={isHindi ? 'साझा करें' : 'Share'}
          variant="secondary"
          icon="share"
          onPress={handleShare}
          accessibilityLabel={isHindi ? 'यह दिन साझा करें' : 'Share this day'}
          style={styles.barShare}
        />
        <Button
          title={isHindi ? 'स्थान नक्शे पर' : 'Places on map'}
          icon="map"
          onPress={() => navigation.navigate(ROUTES.MAP)}
          accessibilityLabel={isHindi ? 'स्थान नक्शे पर देखें' : 'View places on map'}
          style={styles.barMap}
        />
      </View>

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
  dayPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 1, borderRadius: 999 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, gap: 2, padding: 12, borderRadius: 14, borderWidth: 1 },
  stopRow: { flexDirection: 'row', gap: 14 },
  rail: { width: 20, alignItems: 'center' },
  railDot: { width: 14, height: 14, marginTop: 4, borderRadius: 7, borderWidth: 3 },
  railLine: { flex: 1, width: 2 },
  stopBody: { flex: 1, paddingBottom: 18 },
  stopBodyLast: { paddingBottom: 4 },
  stopDarshan: { marginTop: 2 },
  directionsBtn: { alignSelf: 'flex-start', marginLeft: -8, minHeight: 44 },
  transfer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingTop: 8 },
  listCard: { paddingVertical: 4 },
  disclaimer: { gap: 6 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  barShare: { flex: 1, paddingHorizontal: 12 },
  barMap: { flex: 1.3, paddingHorizontal: 12 },
});
