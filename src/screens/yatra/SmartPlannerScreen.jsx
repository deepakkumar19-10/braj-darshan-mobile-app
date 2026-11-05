/**
 * Braj Darshan - Make my own plan
 * Layout from the Nov 2026 redesign (Planner artboard): a short form (days as
 * segmented buttons, who is coming as checkboxes, pace as radio cards, places as
 * check chips, optional dates) that builds a suggested plan from the app's own
 * day plans in src/data/yatra.json and links to each day. Nothing is booked or
 * synced; the screen says the plan is a suggestion.
 *
 * Optional params (from older links): { days, elders, children, experiences, autoCreate }.
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Button,
  Card,
  InfoNote,
  LanguageToggle,
  ListRow,
  SectionHeader,
  TopBar,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { fontFor } from '../../theme/fonts';
import { ROUTES } from '../../navigation/routes';
import yatraData from '../../data/yatra.json';

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6];

const PACES = [
  {
    id: 'relaxed',
    icon: 'flower',
    hi: 'आरामदायक',
    en: 'Relaxed',
    descHi: 'दिन में 2–3 मुख्य स्थान, कम पैदल चलना, दोपहर में लंबा विश्राम।',
    descEn: '2–3 main places a day, little walking, a long afternoon rest.',
  },
  {
    id: 'balanced',
    icon: 'sun',
    hi: 'संतुलित',
    en: 'Balanced',
    descHi: 'मुख्य दर्शन और आरती; दोपहर में मंदिर बंद रहने पर विश्राम।',
    descEn: 'Main darshans and aartis, with a rest while temples close in the afternoon.',
  },
  {
    id: 'fast_track',
    icon: 'parikrama',
    hi: 'तेज़, परिक्रमा सहित',
    en: 'Faster, with parikrama',
    descHi: 'दिन में अधिक स्थान; गोवर्धन परिक्रमा पैदल (लगभग 21 किमी)।',
    descEn: 'More places a day; the Govardhan parikrama on foot (about 21 km).',
  },
];

// Each experience belongs to one day plan in yatra.json.
const EXPERIENCES = [
  { id: 'banke_bihari', icon: 'temple', day: 3, hi: 'श्री बांके बिहारी जी', en: 'Shri Banke Bihari Ji' },
  { id: 'janmabhoomi', icon: 'temple', day: 1, hi: 'श्री कृष्ण जन्मभूमि', en: 'Krishna Janmabhoomi' },
  { id: 'keshi_ghat', icon: 'ghat', day: 3, hi: 'केशी घाट, यमुना दर्शन', en: 'Keshi Ghat, Yamuna' },
  { id: 'govardhan', icon: 'parikrama', day: 4, hi: 'गोवर्धन परिक्रमा', en: 'Govardhan parikrama' },
  { id: 'radha_kund', icon: 'water', day: 4, hi: 'राधा कुंड', en: 'Radha Kund' },
  { id: 'barsana', icon: 'flower', day: 5, hi: 'बरसाना, श्री लाड़ली जी', en: 'Barsana, Shri Radha Rani' },
  { id: 'nandgaon', icon: 'temple', day: 5, hi: 'नंदगांव', en: 'Nandgaon' },
  { id: 'gokul', icon: 'temple', day: 2, hi: 'गोकुल व रमण रेती', en: 'Gokul & Raman Reti' },
  { id: 'dauji', icon: 'temple', day: 6, hi: 'दाऊजी (बलदेव)', en: 'Dauji (Baldev)' },
  { id: 'food_tour', icon: 'food', day: 1, hi: 'ब्रज के पेड़े व प्रसाद', en: 'Braj peda & prasad' },
];

const DEFAULT_EXPERIENCES = ['banke_bihari', 'janmabhoomi', 'keshi_ghat', 'govardhan'];
// Days used to fill a plan when fewer places are picked than days, most visited first.
const FILL_ORDER = [3, 1, 4, 5, 2, 6];

/**
 * Picks `days` day plans that cover the most chosen experiences, fills any spare
 * days in FILL_ORDER, and returns them in travel order (the order of yatra.json).
 */
function buildPlan(days, experienceIds) {
  const counts = {};
  experienceIds.forEach((id) => {
    const exp = EXPERIENCES.find((e) => e.id === id);
    if (exp) counts[exp.day] = (counts[exp.day] || 0) + 1;
  });
  const wanted = Object.keys(counts)
    .map(Number)
    .sort((a, b) => counts[b] - counts[a] || FILL_ORDER.indexOf(a) - FILL_ORDER.indexOf(b));
  const chosen = wanted.slice(0, days);
  const left = wanted.slice(days);
  FILL_ORDER.forEach((d) => {
    if (chosen.length < days && !chosen.includes(d)) chosen.push(d);
  });
  chosen.sort((a, b) => a - b);
  const missed = EXPERIENCES.filter((e) => experienceIds.includes(e.id) && left.includes(e.day));
  const planDays = chosen.map((id) => yatraData.find((d) => d.id === id)).filter(Boolean);
  return { planDays, missed };
}

// Tick mark of a checkbox: a filled check circle when on, an empty ring when off.
function CheckMark({ checked, colors, size = 22 }) {
  if (checked) return <Icon name="open" size={size} color={colors.primary} />;
  return <View style={[styles.checkRing, { width: size, height: size, borderRadius: size / 2, borderColor: colors.subtle }]} />;
}

function DayButton({ n, selected, onPress, isHindi, colors, isDark }) {
  const guarded = usePressGuard(onPress, 250);
  const label = isHindi ? `${n} दिन` : `${n} ${n === 1 ? 'day' : 'days'}`;
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.dayBtn,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <AppText
        variant="bodyBold"
        color={selected ? (isDark ? '#1E1B18' : '#FFFFFF') : colors.navy}
        numberOfLines={1}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function CheckCard({ label, checked, onPress, colors }) {
  const guarded = usePressGuard(onPress, 250);
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.checkCard,
        {
          backgroundColor: checked ? colors.primaryLight : colors.surface,
          borderColor: checked ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <CheckMark checked={checked} colors={colors} />
      <AppText variant="body" weight="500" color={colors.text} style={styles.flexShrink}>
        {label}
      </AppText>
    </Pressable>
  );
}

function PaceCard({ pace, selected, onPress, isHindi, colors }) {
  const guarded = usePressGuard(onPress, 250);
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${isHindi ? pace.hi : pace.en}. ${isHindi ? pace.descHi : pace.descEn}`}
      style={({ pressed }) => [
        styles.paceCard,
        selected ? styles.paceOn : styles.paceOff,
        selected
          ? { backgroundColor: colors.primaryLight, borderColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View
        style={[
          styles.radio,
          selected ? styles.radioOn : styles.radioOff,
          { borderColor: selected ? colors.primary : colors.subtle },
        ]}
      />
      <View style={styles.flex}>
        <AppText variant="bodyBold" color={colors.navy}>
          {isHindi ? pace.hi : pace.en}
        </AppText>
        <AppText variant="caption" color={colors.text}>
          {isHindi ? pace.descHi : pace.descEn}
        </AppText>
      </View>
    </Pressable>
  );
}

function IncludeChip({ label, selected, onPress, colors }) {
  const guarded = usePressGuard(onPress, 250);
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.includeChip,
        {
          backgroundColor: selected ? colors.primaryLight : colors.surface,
          borderColor: selected ? colors.borderGold : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <CheckMark checked={selected} colors={colors} size={20} />
      <AppText variant="caption" weight={selected ? '600' : '500'} color={selected ? colors.navy : colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function SmartPlannerScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const params = (route && route.params) || {};

  const scrollRef = useRef(null);
  const resultY = useRef(0);
  const pendingScroll = useRef(Boolean(params.autoCreate));

  const [selectedDays, setSelectedDays] = useState(
    DAY_OPTIONS.includes(params.days) ? params.days : 3
  );
  const [withElders, setWithElders] = useState(Boolean(params.elders));
  const [withChildren, setWithChildren] = useState(Boolean(params.children));
  const [selectedPace, setSelectedPace] = useState(params.elders ? 'relaxed' : 'balanced');
  const [selectedExperiences, setSelectedExperiences] = useState(
    Array.isArray(params.experiences) && params.experiences.length
      ? params.experiences.filter((id) => EXPERIENCES.some((e) => e.id === id))
      : DEFAULT_EXPERIENCES
  );
  const [travelDates, setTravelDates] = useState('');
  const [showResult, setShowResult] = useState(Boolean(params.autoCreate));

  const { planDays, missed } = useMemo(
    () => buildPlan(selectedDays, selectedExperiences),
    [selectedDays, selectedExperiences]
  );
  const dayIds = planDays.map((d) => d.id);

  const toggleExperience = (id) =>
    setSelectedExperiences((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleReset = () => {
    setSelectedDays(3);
    setWithElders(false);
    setWithChildren(false);
    setSelectedPace('balanced');
    setSelectedExperiences(DEFAULT_EXPERIENCES);
    setTravelDates('');
    setShowResult(false);
  };

  const handleCreate = () => {
    pendingScroll.current = true;
    if (showResult && scrollRef.current) {
      scrollRef.current.scrollTo({ y: resultY.current, animated: true });
      pendingScroll.current = false;
    }
    setShowResult(true);
  };

  const onResultLayout = (e) => {
    resultY.current = e.nativeEvent.layout.y;
    if (pendingScroll.current && scrollRef.current) {
      pendingScroll.current = false;
      scrollRef.current.scrollTo({ y: resultY.current, animated: true });
    }
  };

  const openDay = (day) =>
    navigation.navigate(ROUTES.YATRA_DETAIL, { id: day.id, yatra: day, planDayIds: dayIds });

  // Honest, situation-specific notes for the plan.
  const notes = [];
  if (selectedPace === 'relaxed') {
    notes.push(
      isHindi
        ? 'आरामदायक गति: हर दिन 2–3 स्थान चुनें, बाकी निश्चिंत होकर छोड़ दें।'
        : 'Relaxed pace: pick 2–3 places each day and skip the rest without worry.'
    );
  }
  if (selectedPace === 'fast_track') {
    notes.push(
      isHindi
        ? 'तेज़ गति: जल्दी शुरू करें। कई मंदिर दोपहर में कुछ घंटे बंद रहते हैं — समय स्थानीय रूप से पुष्टि करें।'
        : 'Faster pace: start early. Many temples close for a few hours around midday — confirm timings locally.'
    );
  }
  if (withElders) {
    notes.push(
      isHindi
        ? 'बुज़ुर्गों के साथ: दोपहर विश्राम के लिए रखें और भीड़ वाले समय से बचें।'
        : 'With elders: keep afternoons for rest and avoid the most crowded hours.'
    );
    if (dayIds.includes(4)) {
      notes.push(
        isHindi
          ? 'गोवर्धन परिक्रमा लगभग 21 किमी है — छोटा भाग चुनें या वाहन के बारे में स्थानीय रूप से पूछें।'
          : 'The Govardhan parikrama is about 21 km — choose a shorter part or ask locally about a vehicle.'
      );
    }
    if (dayIds.includes(5)) {
      notes.push(
        isHindi
          ? 'बरसाना का श्री राधा रानी मंदिर लंबी सीढ़ियों के ऊपर है — आसान रास्ते के बारे में स्थानीय रूप से पूछें।'
          : 'Shri Radha Rani Mandir in Barsana is up a long flight of steps — ask locally about easier access.'
      );
    }
  }
  if (withChildren) {
    notes.push(
      isHindi
        ? 'बच्चों के साथ: पानी व नाश्ता रखें और भीड़ भरी गलियों के लिए मिलने की जगह तय करें।'
        : 'With children: carry water and snacks, and agree on a meeting point for crowded lanes.'
    );
  }

  const handleShare = async () => {
    const lines = planDays.map((d, i) =>
      isHindi ? `दिन ${i + 1}: ${d.title}` : `Day ${i + 1}: ${d.titleEn}`
    );
    const header = isHindi
      ? `मेरी ${selectedDays} दिन की ब्रज यात्रा (सुझाव)`
      : `My ${selectedDays}-day Braj yatra (suggested)`;
    const dates = travelDates.trim() ? `\n${isHindi ? 'तारीखें' : 'Dates'}: ${travelDates.trim()}` : '';
    const note = isHindi
      ? 'समय केवल सुझाव हैं — स्थानीय पुष्टि करें।'
      : 'Times are suggestions — confirm locally.';
    try {
      await Share.share({ message: `${header}${dates}\n\n${lines.join('\n')}\n\n${note}\n— DivyaBraj` });
    } catch {
      // Share sheet dismissed or unavailable.
    }
  };

  const paceLabel = (PACES.find((p) => p.id === selectedPace) || PACES[1])[isHindi ? 'hi' : 'en'];

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <TopBar
        title={isHindi ? 'अपनी योजना बनाएं' : 'Make my own plan'}
        subtitle={isHindi ? 'बताइए आपके समूह के लिए क्या सुविधाजनक है' : 'Tell us what feels comfortable for your group'}
        onBack={() => navigation.goBack()}
        right={<LanguageToggle />}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Days */}
          <View>
            <SectionHeader
              title={isHindi ? 'कितने दिन?' : 'How many days?'}
              actionLabel={isHindi ? 'फिर से शुरू करें' : 'Reset'}
              onAction={handleReset}
            />
            <View style={styles.dayGrid} accessibilityRole="radiogroup">
              {DAY_OPTIONS.map((n) => (
                <DayButton
                  key={n}
                  n={n}
                  selected={selectedDays === n}
                  onPress={() => setSelectedDays(n)}
                  isHindi={isHindi}
                  colors={colors}
                  isDark={isDark}
                />
              ))}
            </View>
          </View>

          {/* Group */}
          <View>
            <SectionHeader title={isHindi ? 'कौन साथ आ रहा है?' : 'Who’s coming?'} />
            <View style={styles.checkRow}>
              <CheckCard
                label={isHindi ? 'बुज़ुर्ग' : 'Elders'}
                checked={withElders}
                onPress={() => setWithElders((v) => !v)}
                colors={colors}
              />
              <CheckCard
                label={isHindi ? 'बच्चे' : 'Children'}
                checked={withChildren}
                onPress={() => setWithChildren((v) => !v)}
                colors={colors}
              />
            </View>
          </View>

          {/* Pace */}
          <View>
            <SectionHeader title={isHindi ? 'यात्रा की गति' : 'Pace'} />
            <View style={styles.stack} accessibilityRole="radiogroup">
              {PACES.map((pace) => (
                <PaceCard
                  key={pace.id}
                  pace={pace}
                  selected={selectedPace === pace.id}
                  onPress={() => setSelectedPace(pace.id)}
                  isHindi={isHindi}
                  colors={colors}
                />
              ))}
            </View>
          </View>

          {/* Places */}
          <View>
            <SectionHeader title={isHindi ? 'क्या शामिल करना चाहेंगे?' : 'What would you like to include?'} />
            <View style={styles.chipRow}>
              {EXPERIENCES.map((exp) => (
                <IncludeChip
                  key={exp.id}
                  label={isHindi ? exp.hi : exp.en}
                  selected={selectedExperiences.includes(exp.id)}
                  onPress={() => toggleExperience(exp.id)}
                  colors={colors}
                />
              ))}
            </View>
          </View>

          {/* Dates */}
          <View style={styles.datesBlock}>
            <AppText variant="h3" weight="700" color={colors.navy}>
              {isHindi ? 'यात्रा की तारीखें ' : 'Travel dates '}
              <AppText variant="body" weight="400" color={colors.muted}>
                {isHindi ? '(वैकल्पिक)' : '(optional)'}
              </AppText>
            </AppText>
            <TextInput
              value={travelDates}
              onChangeText={setTravelDates}
              placeholder={isHindi ? 'जैसे 12–14 नवंबर' : 'e.g. 12–14 November'}
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                fontFor('400'),
              ]}
              accessibilityLabel={isHindi ? 'यात्रा की तारीखें (वैकल्पिक)' : 'Travel dates (optional)'}
              returnKeyType="done"
              maxFontSizeMultiplier={1.4}
            />
            <AppText variant="small" color={colors.muted}>
              {isHindi
                ? 'केवल आपके साझा संदेश के लिए। पर्व की तारीखें पंचांग में देखें।'
                : 'Only used in the plan you share. Check festival dates in the Panchang.'}
            </AppText>
          </View>

          <View style={styles.createBlock}>
            <Button
              title={isHindi ? 'मेरी योजना बनाएं' : 'Create my plan'}
              icon="route"
              onPress={handleCreate}
              style={styles.createBtn}
            />
            <AppText variant="small" color={colors.muted} align="center">
              {isHindi
                ? 'योजना ऐप की दिन-योजनाओं से बनती है। यह बुकिंग नहीं है; समय केवल सुझाव हैं।'
                : 'Your plan is built from the app’s day plans. It is not a booking; times are suggestions.'}
            </AppText>
          </View>

          {/* Result */}
          {showResult ? (
            <View onLayout={onResultLayout} style={styles.stack}>
              <SectionHeader title={isHindi ? 'आपकी सुझाई गई योजना' : 'Your suggested plan'} style={styles.resultHead} />
              <AppText variant="body" color={colors.textSecondary}>
                {isHindi
                  ? `${selectedDays} दिन · गति: ${paceLabel}${withElders ? ' · बुज़ुर्गों के साथ' : ''}${withChildren ? ' · बच्चों के साथ' : ''}`
                  : `${selectedDays} ${selectedDays === 1 ? 'day' : 'days'} · Pace: ${paceLabel}${withElders ? ' · with elders' : ''}${withChildren ? ' · with children' : ''}`}
              </AppText>

              <Card style={styles.listCard}>
                {planDays.map((day, i) => (
                  <View key={day.id}>
                    {i > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                    <ListRow
                      icon="calendar"
                      title={isHindi ? `दिन ${i + 1} · ${day.title}` : `Day ${i + 1} · ${day.titleEn}`}
                      subtitle={isHindi ? day.tagline : day.taglineEn}
                      onPress={() => openDay(day)}
                    />
                  </View>
                ))}
              </Card>

              {missed.length ? (
                <InfoNote tone="warning" icon="alert">
                  {isHindi
                    ? `इतने दिनों में शामिल नहीं हो सका: ${missed.map((m) => m.hi).join(', ')}। दिन बढ़ाएं या चुनाव बदलें।`
                    : `Did not fit in ${selectedDays} ${selectedDays === 1 ? 'day' : 'days'}: ${missed.map((m) => m.en).join(', ')}. Add days or change your choices.`}
                </InfoNote>
              ) : null}

              {notes.length ? (
                <Card>
                  <AppText variant="h4" weight="700" color={colors.navy}>
                    {isHindi ? 'आपके समूह के लिए' : 'For your group'}
                  </AppText>
                  {notes.map((note) => (
                    <View key={note} style={styles.noteRow}>
                      <Icon name="info" size={18} color={colors.primary} style={styles.noteIcon} />
                      <AppText variant="body" color={colors.text} style={styles.flex}>
                        {note}
                      </AppText>
                    </View>
                  ))}
                </Card>
              ) : null}

              <InfoNote>
                {isHindi
                  ? 'समय केवल सुझाव हैं। त्योहारों पर मंदिरों का समय बदलता है — कृपया स्थानीय पुष्टि करें।'
                  : 'Times are suggestions. Temple timings change on festivals — please confirm locally.'}
              </InfoNote>

              <Button
                title={isHindi ? 'योजना साझा करें' : 'Share plan'}
                variant="secondary"
                icon="share"
                onPress={handleShare}
              />
              <Button
                title={isHindi ? 'पंचांग में पर्व देखें' : 'Check festivals in Panchang'}
                variant="text"
                icon="panchang"
                onPress={() => navigation.navigate(ROUTES.PANCHANG)}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 24 },
  stack: { gap: 10 },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // Three per row: (100% - 2 gaps) / 3.
  dayBtn: {
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  checkRow: { flexDirection: 'row', gap: 10 },
  checkCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  checkRing: { borderWidth: 2 },
  paceCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 16 },
  paceOn: { borderWidth: 1.5 },
  paceOff: { borderWidth: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, marginTop: 2 },
  radioOn: { borderWidth: 6 },
  radioOff: { borderWidth: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  includeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  datesBlock: { gap: 6 },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  createBlock: { gap: 10 },
  createBtn: { minHeight: 56 },
  resultHead: { marginBottom: 2 },
  listCard: { paddingVertical: 4 },
  divider: { height: 1 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12 },
  noteIcon: { marginTop: 3 },
});
