/**
 * Braj Darshan - Festivals of Braj
 * Layout from the Nov 2026 redesign (Festivals artboard): search and category
 * pills on top, the next festival as a photo card with a days-only countdown,
 * the coming festival dates with coloured date chips, the gold "dates are
 * approximate" note, then the celebrations of Braj. Dates come from the app's own
 * festival calendar (panchangService) and are approximate; the screen says so.
 *
 * Search matches a celebration by its Hindi or English name, place, lunar date,
 * month or description (each word of the query must appear somewhere), and also
 * lists matching upcoming dates from the festival calendar. While searching or
 * filtering, the results take the place of the next-festival overview. Home can
 * open this screen with { search } to show one festival.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  TopBar,
  LanguageToggle,
  Card,
  Chip,
  Button,
  IconButton,
  InfoNote,
  Photo,
  SectionHeader,
  SearchField,
  normalizeSearch,
  matchesSearch,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import EventCard from '../../components/cards/EventCard';
import { ROUTES } from '../../navigation/routes';
import { YEAR_FESTIVALS_MAP } from '../../services/panchangService';
import { daysUntil, istDateKey } from '../../utils/festivals';
import { getFestivalImage } from '../../utils/festivalImages';
import { eventSearchFields } from '../../utils/eventText';
import { searchTerms, searchFields } from '../../utils/searchText';
import eventsData from '../../data/events.json';

const EVENT_CATEGORIES = [
  { id: 'All', hi: 'सभी उत्सव', en: 'All events' },
  { id: 'Spiritual Festival', hi: 'आध्यात्मिक पर्व', en: 'Festivals' },
  { id: 'Holi Celebration', hi: 'होली महोत्सव', en: 'Holi' },
  { id: 'Aarti & Raslila', hi: 'आरती व रासलीला', en: 'Aarti & Raslila' },
  { id: 'Parikrama', hi: 'पावन परिक्रमा', en: 'Parikrama' },
];

const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];
const MONTHS_SHORT_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const UPCOMING_COUNT = 6;

// Festival names in the data still carry emoji for older screens; never show them.
function cleanName(text) {
  return String(text || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .trim();
}

function daysLabel(days, isHindi) {
  if (days <= 0) return isHindi ? 'आज' : 'Today';
  if (days === 1) return isHindi ? 'कल' : 'Tomorrow';
  return isHindi ? `${days} दिन बाकी` : `In ${days} days`;
}

// The app cannot send notifications, so "remind me" hands the festival to the
// phone's calendar (Google Calendar) as an all-day event the user saves.
function openInCalendar(dateKey, title) {
  const pad = (n) => String(n).padStart(2, '0');
  const [y, m, d] = dateKey.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const start = `${y}${pad(m)}${pad(d)}`;
  const end = `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
  const details =
    'अनुमानित तिथि — कृपया स्थानीय पंचांग से पुष्टि करें। Approximate date from the Braj Darshan app — please confirm locally.';
  const url =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
  Linking.openURL(url).catch(() => {});
}

function splitKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month: month - 1, day, weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay() };
}

// Date-chip colour by the kind of day: Ekadashi violet, Purnima teal, other festivals saffron.
function festivalTint(fest, colors) {
  const text = `${fest.nameHi || ''} ${fest.nameEn || ''}`;
  if (/एकादशी|ekadashi/i.test(text)) return { bg: colors.ekadashiLight, fg: colors.ekadashi };
  if (/पूर्णिमा|purnima/i.test(text)) return { bg: colors.purnimaLight, fg: colors.purnima };
  return { bg: colors.primaryLight, fg: colors.primary };
}

// Folded words of the query (वृन्दावन = वृंदावन); an item matches when every word is in one of its fields.
function queryTerms(text) {
  return searchTerms(normalizeSearch(text));
}

function matchesAll(terms, fields) {
  const folded = searchFields(fields);
  return terms.every((term) => matchesSearch(term, ...folded));
}

function NextFestivalCard({ fest, isHindi, colors, onOpenPanchang }) {
  const { year, month, day, weekday } = splitKey(fest.key);
  const name = cleanName(isHindi ? fest.nameHi : fest.nameEn);
  const otherName = cleanName(isHindi ? fest.nameEn : fest.nameHi);
  const days = daysUntil(fest.key);
  const image = getFestivalImage(fest);
  const countdown = (
    <View style={[styles.countPill, image ? styles.countOnPhoto : null, { backgroundColor: image ? colors.surface : colors.primaryLight }]}>
      <AppText variant="small" weight="700" color={colors.primary} maxFontSizeMultiplier={1.3}>
        {daysLabel(days, isHindi)}
      </AppText>
    </View>
  );

  return (
    <Card padded={false} style={styles.nextCard}>
      {image ? (
        <Photo source={image} representative style={styles.nextPhoto} accessibilityLabel={name}>
          {countdown}
        </Photo>
      ) : null}
      <View style={styles.nextBody}>
        {image ? null : countdown}
        <AppText variant="small" weight="600" color={colors.muted}>
          {isHindi
            ? `आगामी पर्व · ${WEEKDAYS_HI[weekday]}, ${day} ${MONTHS_HI[month]} ${year} (अनुमानित तिथि)`
            : `Next festival · ${WEEKDAYS_EN[weekday]}, ${day} ${MONTHS_EN[month]} ${year} (approx. date)`}
        </AppText>
        <View>
          <AppText variant="h2" weight="700" color={colors.navy}>
            {name}
          </AppText>
          {otherName && otherName !== name ? (
            <AppText variant="caption" color={colors.muted}>
              {otherName}
            </AppText>
          ) : null}
        </View>

        {isHindi && fest.descHi ? (
          <AppText variant="body" color={colors.text}>
            {fest.descHi}
          </AppText>
        ) : null}

        <View style={styles.nextActions}>
          <Button
            variant="secondary"
            title={isHindi ? 'कैलेंडर में जोड़ें' : 'Add to calendar'}
            accessibilityLabel={isHindi ? `${name} को फ़ोन कैलेंडर में जोड़ें` : `Add ${name} to your phone calendar`}
            onPress={() => openInCalendar(fest.key, name)}
            style={styles.nextBtn}
          />
          <Button
            variant="primary"
            title={isHindi ? 'पंचांग में देखें' : 'See in Panchang'}
            onPress={onOpenPanchang}
            style={styles.nextBtn}
          />
        </View>
      </View>
    </Card>
  );
}

function UpcomingRow({ fest, isHindi, colors, first }) {
  const { month, day } = splitKey(fest.key);
  const name = cleanName(isHindi ? fest.nameHi : fest.nameEn);
  const days = daysUntil(fest.key);
  const tint = festivalTint(fest, colors);
  return (
    <View
      style={[
        styles.upRow,
        !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
      ]}
    >
      <View style={[styles.miniDate, { backgroundColor: tint.bg }]}>
        <AppText variant="h3" weight="700" color={tint.fg} maxFontSizeMultiplier={1.2} style={styles.miniDay}>
          {day}
        </AppText>
        <AppText variant="badge" weight="600" color={tint.fg} maxFontSizeMultiplier={1.2}>
          {isHindi ? MONTHS_SHORT_HI[month] : MONTHS_SHORT_EN[month]}
        </AppText>
      </View>
      <View style={styles.flex}>
        <AppText variant="body" weight="600" color={colors.navy}>
          {name}
        </AppText>
        {isHindi && fest.descHi ? (
          <AppText variant="small" color={colors.muted}>
            {fest.descHi}
          </AppText>
        ) : null}
        <AppText variant="small" color={colors.muted}>
          {isHindi ? `${daysLabel(days, true)} · अनुमानित तिथि` : `${daysLabel(days, false)} · approx. date`}
        </AppText>
      </View>
      <IconButton
        icon="bell"
        size={20}
        color={colors.primary}
        onPress={() => openInCalendar(fest.key, name)}
        accessibilityLabel={isHindi ? `${name} को फ़ोन कैलेंडर में जोड़ें` : `Add ${name} to your phone calendar`}
      />
    </View>
  );
}

export default function EventsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const incomingSearch = typeof route?.params?.search === 'string' ? route.params.search : undefined;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(incomingSearch || '');
  const scrollRef = useRef(null);

  const pick = (hi, en) => (isHindi ? hi : en);

  // A search from Home (also when this screen is already open) fills the box and
  // shows every category; the results sit right under the search box.
  useEffect(() => {
    if (incomingSearch === undefined) return;
    setSearchQuery(incomingSearch);
    setSelectedCategory('All');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [incomingSearch]);

  // Festivals on or after today (IST) from the app's own festival calendar. Days only.
  const upcoming = useMemo(() => {
    const todayKey = istDateKey();
    return Object.keys(YEAR_FESTIVALS_MAP)
      .sort()
      .filter((key) => key >= todayKey)
      .map((key) => ({ key, ...YEAR_FESTIVALS_MAP[key] }));
  }, []);
  const nextFestival = upcoming[0] || null;
  const laterFestivals = upcoming.slice(1, 1 + UPCOMING_COUNT);

  const terms = useMemo(() => queryTerms(searchQuery), [searchQuery]);
  const isSearching = terms.length > 0;
  const browsing = !isSearching && selectedCategory === 'All';

  // Celebrations: category chip and search work together.
  const filteredEvents = useMemo(
    () =>
      eventsData.filter(
        (item) =>
          (selectedCategory === 'All' || item.category === selectedCategory) &&
          matchesAll(terms, eventSearchFields(item))
      ),
    [terms, selectedCategory]
  );

  // Upcoming dated festivals that match the search. Calendar dates have no category,
  // so they belong to "All events" only.
  const matchingDates = useMemo(() => {
    if (!isSearching || selectedCategory !== 'All') return [];
    return upcoming.filter((f) => matchesAll(terms, [f.nameHi, f.nameEn, f.shortHi, f.shortEn, f.descHi]));
  }, [terms, isSearching, selectedCategory, upcoming]);

  const resultCount = filteredEvents.length + matchingDates.length;
  const nothingFound = resultCount === 0;

  const typed = searchQuery.trim();
  const category = EVENT_CATEGORIES.find((c) => c.id === selectedCategory) || EVENT_CATEGORIES[0];
  let emptyHint;
  if (isSearching && selectedCategory !== 'All') {
    emptyHint = pick(
      `“${typed}” “${category.hi}” में नहीं मिला। खोज साफ़ करें या सभी उत्सवों में देखें।`,
      `Nothing for “${typed}” in ${category.en}. Clear the search or look in all events.`
    );
  } else if (isSearching) {
    emptyHint = pick(
      `“${typed}” से मिलता कोई त्योहार नहीं है। वर्तनी जाँचें या दूसरा नाम खोजें, जैसे होली या जन्माष्टमी।`,
      `Nothing matches “${typed}”. Check the spelling or try another name, such as Holi or Janmashtami.`
    );
  } else {
    emptyHint = pick('इस श्रेणी में अभी कोई उत्सव नहीं है।', 'There are no celebrations in this category yet.');
  }

  const openPanchang = () => navigation.navigate(ROUTES.PANCHANG);

  // Honesty note: festival dates are approximate.
  const datesNote = (
    <InfoNote tone="warning" icon="calendar">
      {pick(
        'पर्व की तिथियाँ ऐप के अपने पर्व-कैलेंडर से हैं और अनुमानित हैं — चंद्र पंचांग के कारण एक दिन बदल सकती हैं। यात्रा से पहले मंदिर या स्थानीय पंचांग से पुष्टि करें।',
        "Festival dates come from the app's own festival calendar and are approximate — they follow the lunar calendar and can shift by a day. Confirm with the temple or a local panchang before you travel."
      )}
    </InfoNote>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={pick('ब्रज के उत्सव', 'Festivals of Braj')}
          subtitle={pick('पर्व की योजना सावधानी से बनाएँ', 'Plan around festivals with care')}
          onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
          right={<LanguageToggle />}
        />

        <View style={styles.content}>
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={pick('जन्माष्टमी, होली, अन्नकूट खोजें', 'Search Janmashtami, Holi, Annakoot')}
          />

          <View style={styles.chips}>
            {EVENT_CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                label={isHindi ? cat.hi : cat.en}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id)}
              />
            ))}
          </View>

          {browsing ? (
            <>
              {/* Next festival */}
              {nextFestival ? (
                <NextFestivalCard
                  fest={nextFestival}
                  isHindi={isHindi}
                  colors={colors}
                  onOpenPanchang={openPanchang}
                />
              ) : (
                <InfoNote icon="calendar">
                  {pick(
                    'ऐप के पर्व-कैलेंडर में अभी कोई आगामी पर्व दर्ज नहीं है। तिथियों के लिए स्थानीय पंचांग देखें।',
                    "No upcoming festivals are listed in the app's festival calendar yet. Please check a local panchang for dates."
                  )}
                </InfoNote>
              )}

              {/* Coming festival dates */}
              {laterFestivals.length ? (
                <View style={styles.section}>
                  <SectionHeader
                    title={pick('आगे के पर्व · अनुमानित तिथियाँ', 'Coming up · approx. dates')}
                    actionLabel={pick('पंचांग', 'Panchang')}
                    onAction={openPanchang}
                  />
                  <Card style={styles.upCard}>
                    {laterFestivals.map((fest, i) => (
                      <UpcomingRow key={fest.key} fest={fest} isHindi={isHindi} colors={colors} first={i === 0} />
                    ))}
                  </Card>
                </View>
              ) : null}

              {datesNote}

              {/* Celebrations of Braj */}
              <SectionHeader title={pick('ब्रज की उत्सव परंपरा', 'Celebrations of Braj')} style={styles.celebrationsHead} />
            </>
          ) : null}

          {!browsing && isSearching && !nothingFound ? (
            <AppText variant="caption" weight="600" color={colors.muted} accessibilityLiveRegion="polite">
              {pick(`${resultCount} परिणाम मिले`, resultCount === 1 ? '1 result' : `${resultCount} results`)}
            </AppText>
          ) : null}

          {matchingDates.length ? (
            <View style={styles.resultGroup}>
              <AppText variant="caption" weight="700" color={colors.primary}>
                {pick('पर्व-कैलेंडर की आगामी तिथियाँ', 'Upcoming dates in the festival calendar')}
              </AppText>
              <Card style={styles.upCard}>
                {matchingDates.map((fest, i) => (
                  <UpcomingRow key={fest.key} fest={fest} isHindi={isHindi} colors={colors} first={i === 0} />
                ))}
              </Card>
              {datesNote}
              {filteredEvents.length ? (
                <AppText variant="caption" weight="700" color={colors.primary} style={styles.groupGap}>
                  {pick('ब्रज के उत्सव', 'Celebrations')}
                </AppText>
              ) : null}
            </View>
          ) : null}

          {filteredEvents.map((item) => (
            <EventCard key={String(item.id)} event={item} />
          ))}

          {nothingFound ? (
            <Card style={styles.emptyCard}>
              <Icon name="search" size={32} color={colors.muted} />
              <AppText variant="h4" weight="700" color={colors.navy} align="center" accessibilityLiveRegion="polite">
                {pick('कोई त्योहार नहीं मिला', 'No festivals match')}
              </AppText>
              <AppText variant="body" color={colors.textSecondary} align="center">
                {emptyHint}
              </AppText>
              <View style={styles.emptyActions}>
                {isSearching ? (
                  <Button
                    variant="secondary"
                    icon="close"
                    title={pick('खोज साफ़ करें', 'Clear search')}
                    onPress={() => setSearchQuery('')}
                  />
                ) : null}
                {selectedCategory !== 'All' ? (
                  <Button
                    variant="text"
                    icon="festival"
                    title={pick('सभी उत्सव दिखाएँ', 'Show all events')}
                    onPress={() => setSelectedCategory('All')}
                  />
                ) : null}
              </View>
            </Card>
          ) : null}

          <AppText variant="caption" color={colors.muted}>
            {pick(
              'उत्सव की व्यवस्थाएँ बदल सकती हैं। स्थानीय रूप से पुष्टि करें और कार्यक्रम लचीला रखें।',
              'Festival arrangements can change. Confirm locally and keep your plans flexible.'
            )}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  section: { marginTop: 4 },

  nextCard: { borderRadius: 22 },
  nextPhoto: { height: 170 },
  countPill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  countOnPhoto: { position: 'absolute', top: 12, left: 12 },
  nextBody: { padding: 16, gap: 8 },
  nextActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  nextBtn: { flex: 1, paddingHorizontal: 10 },

  upCard: { paddingVertical: 4, paddingHorizontal: 14 },
  upRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 68, paddingVertical: 12 },
  miniDate: { width: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  miniDay: { lineHeight: 24 },

  celebrationsHead: { marginTop: 8, marginBottom: 0 },
  resultGroup: { gap: 8 },
  groupGap: { marginTop: 8 },
  emptyCard: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  emptyActions: { alignSelf: 'stretch', gap: 4, marginTop: 8 },
});
