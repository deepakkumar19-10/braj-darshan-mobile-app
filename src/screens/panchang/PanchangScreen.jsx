/**
 * Braj Darshan - Panchang
 * Layout from the redesign (design-input/figma "Light · Panchang"): month calendar
 * with the tithi under each date, the selected day's Panchang and muhurat, and the
 * festivals of the month. Every value comes from panchangService, which is an
 * approximation, so the details say "अनुमानित" / "approx." and the calendar
 * carries one note for the whole grid.
 * Language: Hindi mode shows Hindi words and part-of-day times ("प्रातः 06:31"),
 * English mode shows English only; values the service does not give are hidden.
 */

import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  TopBar,
  LanguageToggle,
  IconButton,
  Card,
  Button,
  InfoNote,
  SectionHeader,
  ListRow,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';
import {
  calculatePanchang,
  getMonthlyFestivals,
  formatDateKey,
  YEAR_FESTIVALS_MAP,
} from '../../services/panchangService';
import { daysUntil } from '../../utils/festivals';

const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];
const MONTHS_SHORT_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const WEEKDAYS = [
  { hi: 'रवि', en: 'Sun' },
  { hi: 'सोम', en: 'Mon' },
  { hi: 'मंगल', en: 'Tue' },
  { hi: 'बुध', en: 'Wed' },
  { hi: 'गुरु', en: 'Thu' },
  { hi: 'शुक्र', en: 'Fri' },
  { hi: 'शनि', en: 'Sat' },
];

// Tithi names under each date in the month grid, keyed by the service's tithiShortEn.
// Hindi uses the service's own tithiShortHi ("पंचमी"), which fits a 1/7-width cell.
// Most English names ("Chaturdashi") are too wide for a ~40px cell, so they get a
// clipped form that still reads as the word. The full name is in the day's details.
const TITHI_SHORT_EN = {
  Pratipada: 'Prati.',
  Dwitiya: 'Dwiti.',
  Tritiya: 'Triti.',
  Chaturthi: 'Chatur.',
  Panchami: 'Panch.',
  Shashthi: 'Shash.',
  Saptami: 'Sapt.',
  Ashtami: 'Asht.',
  Navami: 'Navami',
  Dashami: 'Dash.',
  Ekadashi: 'Ekad.',
  Dwadashi: 'Dwad.',
  Trayodashi: 'Trayo.',
  Chaturdashi: 'Chaturd.',
  Purnima: 'Purnima',
  Amavasya: 'Amav.',
};

function tithiCellLabel(p, isHindi) {
  return isHindi ? p.tithiShortHi : TITHI_SHORT_EN[p.tithiShortEn] || p.tithiShortEn;
}

// The service writes clock times as "06:31 AM". Hindi gets the part of the day
// instead of AM/PM, as printed panchangs do: "प्रातः 06:31", "दोपहर 11:55 – 12:43".
function dayPartHi(hour24) {
  if (hour24 >= 3 && hour24 < 11) return 'प्रातः';
  if (hour24 >= 11 && hour24 < 16) return 'दोपहर';
  if (hour24 >= 16 && hour24 < 20) return 'सायं';
  return 'रात्रि';
}

function clockText(text, isHindi) {
  if (!text) return '';
  if (!isHindi) return String(text);
  let lastPart = null;
  return String(text).replace(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi, (match, h, m, ap) => {
    const part = dayPartHi((Number(h) % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0));
    const out = part === lastPart ? `${h}:${m}` : `${part} ${h}:${m}`;
    lastPart = part;
    return out;
  });
}

// The service gives day length in Hindi only ("10 घंटे 59 मिनट").
function dayLengthText(text, isHindi) {
  const match = /(\d+)\D+(\d+)/.exec(String(text || ''));
  if (!match) return '';
  return isHindi ? `${match[1]} घंटे ${match[2]} मिनट` : `${match[1]} h ${match[2]} min`;
}

// Festival names in the data still carry emoji for older screens; never show them.
function cleanName(text) {
  return String(text || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .trim();
}

function daysLabel(days, isHindi) {
  if (days === 0) return isHindi ? 'आज' : 'Today';
  if (days === 1) return isHindi ? 'कल' : 'Tomorrow';
  if (days < 0) return isHindi ? 'बीत गया' : 'Passed';
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

function calendarCoverage(isHindi) {
  const keys = Object.keys(YEAR_FESTIVALS_MAP).sort();
  if (!keys.length) return '';
  const label = (key) => {
    const [y, m] = key.split('-').map(Number);
    return `${isHindi ? MONTHS_HI[m - 1] : MONTHS_EN[m - 1]} ${y}`;
  };
  return `${label(keys[0])} – ${label(keys[keys.length - 1])}`;
}

/* ------------------------------------------------------------ Pieces */

function Ring({ color }) {
  return <View style={[styles.ring, { borderColor: color }]} />;
}

function Disc({ color }) {
  return <View style={[styles.disc, { backgroundColor: color }]} />;
}

function DayCell({ cell, isSelected, isToday, onSelect, colors, isHindi }) {
  const guarded = usePressGuard(onSelect, 200);
  const p = cell.p;
  const fest = p.festival;
  const special = p.isPurnima || p.isAmavasya || p.isEkadashi;
  const tithiColor = p.isPurnima
    ? colors.purnima
    : p.isAmavasya
      ? colors.navy
      : p.isEkadashi
        ? colors.ekadashi
        : colors.muted;
  const monthName = isHindi ? MONTHS_HI[cell.date.getMonth()] : MONTHS_EN[cell.date.getMonth()];
  const a11y = [
    `${cell.day} ${monthName}`,
    isToday ? (isHindi ? 'आज' : 'today') : null,
    isHindi ? `${p.tithiHi} (अनुमानित)` : `${p.tithiEn} (approx.)`,
    fest ? cleanName(isHindi ? fest.nameHi : fest.nameEn) : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={a11y}
      style={({ pressed }) => [
        styles.cell,
        { backgroundColor: isSelected ? colors.primaryLight : colors.card },
        isSelected && { borderColor: colors.primaryContainer },
        !isSelected && isToday && { borderColor: colors.primary },
        pressed && styles.pressed,
      ]}
    >
      <AppText
        variant="body"
        weight={isSelected || isToday ? '700' : '500'}
        color={isToday ? colors.primary : colors.navy}
        maxFontSizeMultiplier={1.2}
      >
        {cell.day}
      </AppText>
      {/* Latin text runs wider than Devanagari, so English uses the 12px step; both shrink to fit. */}
      <AppText
        variant={isHindi ? 'small' : 'badge'}
        weight={special ? '700' : '500'}
        color={tithiColor}
        align="center"
        numberOfLines={1}
        adjustsFontSizeToFit
        maxFontSizeMultiplier={1.2}
        style={styles.cellTithi}
      >
        {tithiCellLabel(p, isHindi)}
      </AppText>
      <View style={styles.markRow}>
        {p.isEkadashi ? <Icon name="tithi" size={12} color={colors.ekadashi} /> : null}
        {p.isPurnima ? <Ring color={colors.purnima} /> : null}
        {p.isAmavasya ? <Disc color={colors.navy} /> : null}
        {fest ? <Icon name="sparkles" size={12} color={colors.primary} /> : null}
      </View>
    </Pressable>
  );
}

function LegendItem({ mark, label, colors }) {
  return (
    <View style={styles.legendItem}>
      {mark}
      <AppText variant="small" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

function Tag({ icon, label, fg, bg, mark }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      {mark || <Icon name={icon} size={16} color={fg} />}
      <AppText variant="caption" weight="700" color={fg} style={styles.flexShrink}>
        {label}
      </AppText>
    </View>
  );
}

function GroupTitle({ children, colors }) {
  return (
    <AppText variant="caption" weight="700" color={colors.primary} style={styles.groupTitle}>
      {children}
    </AppText>
  );
}

// A row with no value for this day is left out rather than showing a placeholder.
function DetailRow({ icon, label, value, note, tone, colors }) {
  if (!value) return null;
  const toneFg = tone === 'warn' ? colors.warning : tone === 'good' ? colors.success : colors.primary;
  const toneBg = tone === 'warn' ? colors.warningBg : tone === 'good' ? colors.successLight : colors.primaryLight;
  return (
    <View style={styles.detailRow}>
      {icon ? (
        <View style={[styles.detailIcon, { backgroundColor: toneBg }]}>
          <Icon name={icon} size={20} color={toneFg} />
        </View>
      ) : null}
      <View style={styles.flex}>
        <AppText variant="caption" weight="600" color={colors.muted}>
          {label}
        </AppText>
        <AppText variant="body" weight="600" color={colors.navy}>
          {value}
        </AppText>
        {note ? (
          <View style={styles.noteLine}>
            <Icon name={tone === 'warn' ? 'alert' : 'open'} size={16} color={toneFg} />
            <AppText variant="small" weight="600" color={toneFg} style={styles.flexShrink}>
              {note}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function FestivalItem({ fest, year, month, isHindi, colors, onShowDay }) {
  const name = cleanName(isHindi ? fest.nameHi : fest.nameEn);
  const otherName = cleanName(isHindi ? fest.nameEn : fest.nameHi);
  const days = daysUntil(fest.dateKey);
  const dateLabel = `${fest.day} ${isHindi ? MONTHS_SHORT_HI[month] : MONTHS_SHORT_EN[month]}`;
  return (
    <Card style={styles.festCard}>
      <AppText variant="caption" weight="700" color={colors.primary}>
        {isHindi ? `${dateLabel} · अनुमानित तिथि` : `${dateLabel} · approx. date`}
      </AppText>
      <AppText variant="h4" weight="700" color={colors.navy}>
        {name}
      </AppText>
      {otherName ? (
        <AppText variant="caption" color={colors.muted}>
          {otherName}
        </AppText>
      ) : null}
      {isHindi && fest.descHi ? (
        <AppText variant="body" color={colors.textSecondary} style={styles.festDesc}>
          {fest.descHi}
        </AppText>
      ) : null}
      <View style={styles.festMeta}>
        <Icon name="calendar" size={18} color={colors.muted} />
        <AppText variant="caption" weight="600" color={colors.text}>
          {daysLabel(days, isHindi)}
        </AppText>
      </View>
      <View style={styles.festActions}>
        <Button
          variant="text"
          icon="panchang"
          title={isHindi ? 'उस दिन का पंचांग' : "That day's Panchang"}
          onPress={() => onShowDay(new Date(year, month, fest.day))}
        />
        {days >= 0 ? (
          <Button
            variant="text"
            icon="bell"
            title={isHindi ? 'कैलेंडर में जोड़ें' : 'Add to calendar'}
            accessibilityLabel={isHindi ? `${name} को फ़ोन कैलेंडर में जोड़ें` : `Add ${name} to your phone calendar`}
            onPress={() => openInCalendar(fest.dateKey, name)}
          />
        ) : null}
      </View>
    </Card>
  );
}

/* ------------------------------------------------------------ Screen */

export default function PanchangScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const scrollRef = useRef(null);
  const detailsY = useRef(0);

  // Read on every render: this tab can stay open past midnight.
  const today = new Date();
  const todayKey = formatDateKey(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [showMethod, setShowMethod] = useState(false);

  const selectedKey = formatDateKey(selectedDate);
  const panchang = useMemo(() => calculatePanchang(selectedDate), [selectedDate]);
  const monthlyFestivals = useMemo(() => getMonthlyFestivals(viewYear, viewMonth), [viewYear, viewMonth]);

  // Weeks of the viewed month, each cell with its approximate Panchang.
  const weeks = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      cells.push({ day: d, date, key: formatDateKey(date), p: calculatePanchang(date) });
    }
    while (cells.length % 7) cells.push(null);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewYear, viewMonth]);

  // Vikram Samvat changes in March, so a month can span two years.
  const samvatLabel = useMemo(() => {
    const days = weeks.flat().filter(Boolean);
    const first = days[0].p.samvat;
    const last = days[days.length - 1].p.samvat;
    return first === last ? first : `${first}–${last}`;
  }, [weeks]);

  const changeMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewMonth(d.getMonth());
    setViewYear(d.getFullYear());
  };

  const goToToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setSelectedDate(today);
  };

  const showDay = (date) => {
    setSelectedDate(date);
    scrollRef.current?.scrollTo({ y: Math.max(0, detailsY.current - 12), animated: true });
  };

  const onToday =
    selectedKey === todayKey && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelectedToday = selectedKey === todayKey;

  const monthTitle = `${isHindi ? MONTHS_HI[viewMonth] : MONTHS_EN[viewMonth]} ${viewYear}`;
  const selMonth = selectedDate.getMonth();
  const dayTitle = isHindi
    ? `${panchang.dayNameHi}, ${selectedDate.getDate()} ${MONTHS_HI[selMonth]} ${selectedDate.getFullYear()}`
    : `${panchang.dayNameEn}, ${selectedDate.getDate()} ${MONTHS_EN[selMonth]} ${selectedDate.getFullYear()}`;

  const pick = (hi, en) => (isHindi ? hi : en);
  // Every value is approximate. A missing value stays empty, so its row is hidden.
  const approx = (value) => (value ? pick(`${value} · अनुमानित`, `${value} · approx.`) : '');
  const joined = (...parts) => parts.filter(Boolean).join(' · ');
  const clock = (text) => clockText(text, isHindi);
  const dayLength = dayLengthText(panchang.dayLength, isHindi);
  const festivalToday = panchang.festival;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={pick('पंचांग', 'Panchang')}
          subtitle={pick('भक्तिमय दिन की मार्गदर्शिका · मथुरा', 'A guide to the devotional day · Mathura')}
          right={<LanguageToggle />}
        />

        {/* Honesty note */}
        <View style={styles.sectionFirst}>
          <InfoNote>
            {pick(
              'यहाँ हर मान मथुरा के लिए अनुमानित गणना है — समय कुछ मिनट और तिथि एक दिन आगे-पीछे हो सकती है। व्रत व पर्व का समय पुरोहित या स्थानीय पंचांग से अवश्य पुष्टि करें।',
              'Every value here is an approximate calculation for Mathura — times can be off by several minutes and a tithi by a day. Please confirm vrat and festival timings with a priest or your local panchang.'
            )}
          </InfoNote>
        </View>

        {/* Month calendar */}
        <View style={styles.section}>
          <Card padded={false} style={styles.calendarCard}>
            <View style={styles.monthBar}>
              <IconButton
                icon="chevronLeft"
                onPress={() => changeMonth(-1)}
                accessibilityLabel={pick('पिछला माह', 'Previous month')}
              />
              <View style={styles.monthCenter}>
                <AppText variant="h3" weight="700" color={colors.navy} align="center">
                  {monthTitle}
                </AppText>
                {/* Two short lines: Android clipped the wrapped Hindi line when it was one string. */}
                <AppText variant="caption" color={colors.muted} align="center">
                  {pick(`विक्रम संवत ${samvatLabel}`, `Vikram Samvat ${samvatLabel}`)}
                </AppText>
                <AppText variant="small" color={colors.muted} align="center">
                  {pick('अनुमानित', 'approx.')}
                </AppText>
              </View>
              <IconButton
                icon="chevronRight"
                onPress={() => changeMonth(1)}
                accessibilityLabel={pick('अगला माह', 'Next month')}
              />
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((w, idx) => (
                <View key={w.en} style={styles.weekdayCell}>
                  <AppText
                    variant="small"
                    weight="700"
                    color={idx === 0 ? colors.primary : colors.muted}
                    maxFontSizeMultiplier={1.1}
                  >
                    {isHindi ? w.hi : w.en}
                  </AppText>
                </View>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={`w${wi}`} style={styles.weekRow}>
                {week.map((cell, ci) =>
                  cell ? (
                    <DayCell
                      key={cell.key}
                      cell={cell}
                      isSelected={cell.key === selectedKey}
                      isToday={cell.key === todayKey}
                      onSelect={() => setSelectedDate(cell.date)}
                      colors={colors}
                      isHindi={isHindi}
                    />
                  ) : (
                    <View key={`e${wi}-${ci}`} style={styles.cellEmpty} />
                  )
                )}
              </View>
            ))}

            <View style={[styles.legend, { borderTopColor: colors.border }]}>
              <AppText variant="small" color={colors.muted}>
                {pick(
                  'तारीख़ के नीचे तिथि का नाम है। तिथि व चिह्न अनुमानित हैं — पूरा विवरण देखने के लिए दिन चुनें।',
                  'The tithi is under each date, shortened to fit. Tithis and marks are approximate — tap a day for full details.'
                )}
              </AppText>
              <View style={styles.legendRow}>
                <LegendItem
                  colors={colors}
                  mark={<Icon name="tithi" size={14} color={colors.ekadashi} />}
                  label={pick('एकादशी', 'Ekadashi')}
                />
                <LegendItem colors={colors} mark={<Ring color={colors.purnima} />} label={pick('पूर्णिमा', 'Purnima')} />
                <LegendItem colors={colors} mark={<Disc color={colors.navy} />} label={pick('अमावस्या', 'Amavasya')} />
                <LegendItem
                  colors={colors}
                  mark={<Icon name="sparkles" size={14} color={colors.primary} />}
                  label={pick('पर्व', 'Festival')}
                />
                <LegendItem
                  colors={colors}
                  mark={<View style={[styles.todayBox, { borderColor: colors.primary }]} />}
                  label={pick('आज', 'Today')}
                />
              </View>
            </View>

            {!onToday ? (
              <Button
                variant="text"
                icon="calendar"
                title={pick('आज पर लौटें', 'Back to today')}
                onPress={goToToday}
                style={styles.todayButton}
              />
            ) : null}
          </Card>
        </View>

        {/* Selected day */}
        <View
          style={styles.section}
          onLayout={(e) => {
            detailsY.current = e.nativeEvent.layout.y;
          }}
        >
          <Card>
            <AppText variant="caption" weight="700" color={colors.primary}>
              {isSelectedToday ? pick('आज का पंचांग', "Today's Panchang") : pick('चुने गए दिन का पंचांग', 'Panchang for the chosen day')}
            </AppText>
            <AppText variant="h2" weight="700" color={colors.navy}>
              {dayTitle}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              {approx(
                pick(joined(panchang.pakshaHi, panchang.rituHi), joined(panchang.pakshaEn, panchang.rituEn))
              )}
            </AppText>

            {festivalToday || panchang.isEkadashi || panchang.isPurnima || panchang.isAmavasya ? (
              <View style={styles.tags}>
                {festivalToday ? (
                  <Tag
                    icon="sparkles"
                    fg={colors.primary}
                    bg={colors.primaryLight}
                    label={approx(cleanName(pick(festivalToday.nameHi, festivalToday.nameEn)))}
                  />
                ) : null}
                {panchang.isEkadashi ? (
                  <Tag
                    icon="tithi"
                    fg={colors.ekadashi}
                    bg={colors.ekadashiLight}
                    label={pick(
                      'एकादशी (अनुमानित) — व्रत की तिथि पुरोहित से पुष्टि करें',
                      'Ekadashi (approx.) — confirm the vrat date with a priest'
                    )}
                  />
                ) : null}
                {panchang.isPurnima ? (
                  <Tag
                    mark={<Ring color={colors.purnima} />}
                    fg={colors.purnima}
                    bg={colors.purnimaLight}
                    label={pick('पूर्णिमा (अनुमानित)', 'Purnima (approx.)')}
                  />
                ) : null}
                {panchang.isAmavasya ? (
                  <Tag
                    mark={<Disc color={colors.navy} />}
                    fg={colors.navy}
                    bg={colors.infoBg}
                    label={pick('अमावस्या (अनुमानित)', 'Amavasya (approx.)')}
                  />
                ) : null}
              </View>
            ) : null}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <GroupTitle colors={colors}>{pick('तिथि व नक्षत्र', 'Tithi & nakshatra')}</GroupTitle>
            <DetailRow colors={colors} label={pick('तिथि', 'Tithi')} value={approx(pick(panchang.tithiHi, panchang.tithiEn))} />
            <DetailRow colors={colors} label={pick('पक्ष', 'Paksha')} value={approx(pick(panchang.pakshaHi, panchang.pakshaEn))} />
            <DetailRow
              colors={colors}
              label={pick('नक्षत्र', 'Nakshatra')}
              value={approx(pick(panchang.nakshatraHi, panchang.nakshatraEn))}
            />
            <DetailRow colors={colors} label={pick('योग', 'Yoga')} value={approx(pick(panchang.yogaHi, panchang.yogaEn))} />
            <DetailRow colors={colors} label={pick('करण', 'Karana')} value={approx(pick(panchang.karanaHi, panchang.karanaEn))} />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <GroupTitle colors={colors}>{pick('सूर्य', 'Sun')}</GroupTitle>
            <DetailRow colors={colors} icon="sunrise" label={pick('सूर्योदय', 'Sunrise')} value={approx(clock(panchang.sunrise))} />
            <DetailRow colors={colors} icon="sunset" label={pick('सूर्यास्त', 'Sunset')} value={approx(clock(panchang.sunset))} />
            <DetailRow colors={colors} icon="sun" label={pick('दिनमान', 'Day length')} value={approx(dayLength)} />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <GroupTitle colors={colors}>{pick('मुहूर्त', 'Muhurat')}</GroupTitle>
            <DetailRow
              colors={colors}
              icon="clock"
              tone="good"
              label={pick('ब्रह्म मुहूर्त', 'Brahma muhurat')}
              value={approx(clock(panchang.brahmaMuhurat))}
              note={pick('जप व ध्यान का पारंपरिक समय', 'Traditional time for japa and meditation')}
            />
            <DetailRow
              colors={colors}
              icon="clock"
              tone="good"
              label={pick('अभिजित मुहूर्त', 'Abhijit muhurat')}
              value={approx(clock(panchang.abhijitMuhurat))}
              note={pick('शुभ समय माना जाता है', 'Considered auspicious')}
            />
            <DetailRow
              colors={colors}
              icon="clock"
              tone="good"
              label={pick('गोधूलि मुहूर्त', 'Godhuli muhurat')}
              value={approx(clock(panchang.godhuliMuhurat))}
              note={pick('संध्या आरती का समय', 'Around evening aarti')}
            />
            <DetailRow
              colors={colors}
              icon="alert"
              tone="warn"
              label={pick('राहु काल', 'Rahu kaal')}
              value={approx(clock(panchang.rahukaal))}
              note={pick('नए शुभ कार्य टालने की परंपरा', 'Traditionally avoided for new beginnings')}
            />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <GroupTitle colors={colors}>{pick('संवत व ऋतु', 'Year & season')}</GroupTitle>
            <DetailRow
              colors={colors}
              label={pick('हिंदू माह (पूर्णिमांत)', 'Hindu month (purnimanta)')}
              value={approx(pick(panchang.hinduMonthHi, panchang.hinduMonthEn))}
            />
            <DetailRow
              colors={colors}
              label={pick('विक्रम संवत · शक संवत', 'Vikram Samvat · Shaka Samvat')}
              value={approx(joined(panchang.samvat, panchang.shakaSamvat))}
            />
            <DetailRow colors={colors} label={pick('ऋतु', 'Season')} value={approx(pick(panchang.rituHi, panchang.rituEn))} />
            <DetailRow colors={colors} label={pick('अयन', 'Ayana')} value={approx(pick(panchang.ayanaHi, panchang.ayanaEn))} />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ListRow
              icon="info"
              title={pick('यह गणना कैसे होती है', 'How this is calculated')}
              subtitle={pick('मान अनुमानित क्यों हैं', 'Why the values are approximate')}
              onPress={() => setShowMethod((v) => !v)}
              right={<Icon name={showMethod ? 'chevronDown' : 'chevronRight'} size={20} color={colors.muted} />}
            />
            {showMethod ? (
              <View style={styles.method}>
                <AppText variant="body" color={colors.textSecondary}>
                  {pick(
                    'तिथि, नक्षत्र, योग, करण और माह मथुरा के सूर्योदय के समय सूर्य-चंद्र की वास्तविक स्थिति (लाहिड़ी अयनांश) से गिने जाते हैं। किसी के बदलने के कुछ मिनट आस-पास छपे पंचांग से अंतर संभव है।',
                    'Tithi, nakshatra, yoga, karana and month are worked out from the true positions of the sun and moon at sunrise in Mathura (Lahiri ayanamsa). Within a few minutes of a change they can differ from a printed panchang.'
                  )}
                </AppText>
                <AppText variant="body" color={colors.textSecondary}>
                  {pick(
                    'सूर्योदय व सूर्यास्त मथुरा (27.49° N, 77.67° E) के लिए गिने गए हैं; एक-दो मिनट का अंतर संभव है।',
                    'Sunrise and sunset are calculated for Mathura (27.49° N, 77.67° E) and are usually within a minute or two.'
                  )}
                </AppText>
                <AppText variant="body" color={colors.textSecondary}>
                  {pick(
                    'राहु काल उस दिन के सूर्योदय से सूर्यास्त के आठ भागों में से वार का भाग है; मुहूर्त भी इन्हीं सूर्य-समयों पर आधारित हैं। व्रत व पर्व के लिए पुरोहित या स्थानीय पंचांग से पुष्टि करें।',
                    'Rahu kaal is the weekday’s eighth of that day’s sunrise-to-sunset span; muhurats use the same sun times. Confirm vrat and festival timings with a priest or local panchang.'
                  )}
                </AppText>
              </View>
            ) : null}
          </Card>
        </View>

        {/* Festivals of the month */}
        <View style={styles.sectionWide}>
          <SectionHeader
            title={pick(`${MONTHS_HI[viewMonth]} के पर्व`, `Festivals in ${MONTHS_EN[viewMonth]}`)}
            actionLabel={pick('सभी पर्व', 'All festivals')}
            onAction={() => navigation.navigate(ROUTES.EVENTS)}
          />
          {monthlyFestivals.length ? (
            monthlyFestivals.map((fest) => (
              <FestivalItem
                key={fest.dateKey}
                fest={fest}
                year={viewYear}
                month={viewMonth}
                isHindi={isHindi}
                colors={colors}
                onShowDay={showDay}
              />
            ))
          ) : (
            <InfoNote icon="calendar">
              {pick(
                `इस माह के लिए ऐप के पर्व-कैलेंडर में कोई पर्व दर्ज नहीं है। यह कैलेंडर अभी ${calendarCoverage(true)} तक का है।`,
                `No festivals are listed for this month in the app's festival calendar. It currently covers ${calendarCoverage(false)}.`
              )}
            </InfoNote>
          )}
          <AppText variant="small" color={colors.muted} style={styles.footNote}>
            {pick(
              'पर्व की तिथियाँ चंद्र पंचांग पर निर्भर हैं और एक दिन बदल सकती हैं। यात्रा से पहले स्थानीय रूप से पुष्टि करें।',
              'Festival dates follow the lunar calendar and can shift by a day. Confirm locally before you travel.'
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
  flexShrink: { flexShrink: 1 },
  pressed: { opacity: 0.7 },
  sectionFirst: { paddingHorizontal: GUTTER, marginTop: 4 },
  section: { paddingHorizontal: GUTTER, marginTop: 16 },
  sectionWide: { paddingHorizontal: GUTTER, marginTop: 28 },

  // Narrow side padding so each day cell is wide enough for a tithi name (~40px on a 360px phone).
  calendarCard: { paddingHorizontal: 4, paddingTop: 12, paddingBottom: 8 },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  monthCenter: { flex: 1, alignItems: 'center' },
  weekRow: { flexDirection: 'row' },
  weekdayCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  cell: {
    flex: 1,
    minHeight: 64,
    margin: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  cellTithi: { alignSelf: 'stretch', letterSpacing: 0 },
  cellEmpty: { flex: 1, minHeight: 64, margin: 1 },
  markRow: { height: 14, flexDirection: 'row', alignItems: 'center', gap: 2 },
  ring: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.6 },
  disc: { width: 10, height: 10, borderRadius: 5 },
  todayBox: { width: 14, height: 14, borderRadius: 4, borderWidth: 1.5 },
  legend: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
    paddingTop: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  todayButton: { alignSelf: 'center', marginTop: 4 },

  tags: { gap: 8, marginTop: 12 },
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: '100%',
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 14 },
  groupTitle: { marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  detailIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  noteLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  method: { gap: 10, paddingBottom: 4 },

  festCard: { marginBottom: 12, gap: 2 },
  festDesc: { marginTop: 6 },
  festMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  festActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, marginTop: 4, marginLeft: -8 },
  footNote: { marginTop: 4 },
});
