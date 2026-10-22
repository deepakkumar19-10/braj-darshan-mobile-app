import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import StitchHeader from '../../components/common/StitchHeader';
import StitchTag from '../../components/common/StitchTag';
import StitchPill from '../../components/common/StitchPill';
import {
  calculatePanchang,
  getMonthlyFestivals,
  formatDateKey,
} from '../../services/panchangService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 32 - 12) / 7);

const WEEKDAYS = [
  { hi: 'रवि', en: 'Sun' },
  { hi: 'सोम', en: 'Mon' },
  { hi: 'मंगल', en: 'Tue' },
  { hi: 'बुध', en: 'Wed' },
  { hi: 'गुरु', en: 'Thu' },
  { hi: 'शुक्र', en: 'Fri' },
  { hi: 'शनि', en: 'Sat' },
];

export default function PanchangScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [reminders, setReminders] = useState({});

  // Astronomical calculations for selected date
  const panchang = useMemo(() => {
    return calculatePanchang(selectedDate);
  }, [selectedDate]);

  // Festivals for the currently viewed month
  const monthlyFestivals = useMemo(() => {
    return getMonthlyFestivals(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  // Days in currently viewed month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
      cells.push({ empty: true, key: `empty-${i}` });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const p = calculatePanchang(date);
      const isToday =
        d === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear();
      const isSelected =
        d === selectedDate.getDate() &&
        viewMonth === selectedDate.getMonth() &&
        viewYear === selectedDate.getFullYear();

      cells.push({
        day: d,
        date,
        p,
        isToday,
        isSelected,
        key: `day-${d}`,
      });
    }

    return cells;
  }, [viewYear, viewMonth, selectedDate, today]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const toggleReminder = (id, festTitle) => {
    setReminders((prev) => {
      const active = !prev[id];
      Alert.alert(
        active ? 'स्मरण पत्र सक्रिय (Reminder Set)' : 'स्मरण पत्र निरस्त (Reminder Removed)',
        active
          ? `${festTitle} का पावन स्मरण पत्र आपके पंचांग कैलेंडर में दर्ज हो गया है।`
          : 'स्मरण पत्र हटा दिया गया है।'
      );
      return { ...prev, [id]: active };
    });
  };

  const monthLabel = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthNamesHi = [
      'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    return isHindi ? `${monthNamesHi[viewMonth]} ${viewYear}` : `${monthNames[viewMonth]} ${viewYear}`;
  }, [viewMonth, viewYear, isHindi]);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* 1. Universal Stitch Header */}
      <StitchHeader
        title={isHindi ? 'वैदिक पंचांग' : 'Vedic Panchang'}
        subtitle={isHindi ? 'दैनिक तिथि व शुभ मुहूर्त' : 'Tithi & Auspicious Timings'}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Top Sacred Header Card */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.surface,
              borderColor: isDark ? colors.border : colors.border,
            },
          ]}
        >
          <View style={styles.headerCardTop}>
            <View style={styles.headerTitleWrap}>
              <StitchTag icon="🪷" text={isHindi ? 'वैदिक पंचांग' : 'Vedic Calendar'} variant="saffron" />
              <AppText variant="h1" weight="700" color={colors.navy} style={styles.cardMainTitle}>
                {isHindi ? 'वैदिक पंचांग एवं दैनिक मुहूर्त' : 'Vedic Panchang & Muhurat'}
              </AppText>
              <AppText variant="caption" color={colors.muted}>
                {isHindi
                  ? 'मथुरा-वृंदावन धाम • २७.५०° N, ७७.६७° E | श्री धाम देवालय'
                  : 'Vedic Panchang • Mathura-Vrindavan Dham • 27.50° N, 77.67° E'}
              </AppText>
            </View>

            <View style={[styles.calIconBox, { backgroundColor: isDark ? colors.surface : colors.primaryLight }]}>
              <AppText variant="h3">🗓️</AppText>
            </View>
          </View>

          {/* Paksha & Ritu Tags */}
          <View style={styles.pakshaRow}>
            <View style={[styles.pakshaPill, { backgroundColor: isDark ? '#3D2010' : colors.primaryLight }]}>
              <View style={styles.redDot} />
              <AppText variant="small" weight="700" color={colors.primary}>
                {panchang.pakshaHi || 'भाद्रपद कृष्ण पक्ष'}
              </AppText>
            </View>

            <View style={[styles.pakshaPill, { backgroundColor: isDark ? colors.cardAlt : colors.surfaceContainerLow }]}>
              <AppText variant="small" weight="700" color={colors.navy}>
                {isHindi ? `ऋतु: ${panchang.rituHi || 'शरद'}` : `Season: ${panchang.rituEn || 'Sharad'}`}
              </AppText>
            </View>
          </View>
        </View>

        {/* 3. Month Navigation & Calendar Grid */}
        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.surface,
              borderColor: isDark ? colors.border : colors.border,
            },
          ]}
        >
          {/* Month Selector Bar */}
          <View style={styles.monthBar}>
            <TouchableOpacity
              style={[styles.arrowBtn, { backgroundColor: isDark ? colors.surface : colors.surfaceContainerLow }]}
              onPress={handlePrevMonth}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="body" color={colors.navy}>‹</AppText>
            </TouchableOpacity>

            <View style={styles.monthCenter}>
              <AppText variant="h3" weight="700" color={colors.navy}>
                {monthLabel}
              </AppText>
              <AppText variant="small" color={colors.muted}>
                {isHindi ? `विक्रम संवत् ${panchang.samvat || '२०८३'}` : `Vikram Samvat ${panchang.samvat || '2083'}`}
              </AppText>
            </View>

            <TouchableOpacity
              style={[styles.arrowBtn, { backgroundColor: isDark ? colors.surface : colors.surfaceContainerLow }]}
              onPress={handleNextMonth}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="body" color={colors.navy}>›</AppText>
            </TouchableOpacity>
          </View>

          {/* Weekday Row */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((w, idx) => (
              <View key={idx} style={[styles.weekdayCell, { width: CELL_SIZE }]}>
                <AppText
                  variant="small"
                  weight="700"
                  color={idx === 0 ? colors.primary : colors.muted}
                >
                  {isHindi ? w.hi : w.en}
                </AppText>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((cell) => {
              if (cell.empty) {
                return <View key={cell.key} style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE + 10 }]} />;
              }

              const isEkadashi = cell.p?.isEkadashi;
              const isPurnima = cell.p?.isPurnima || cell.p?.isAmavasya;

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={[
                    styles.cell,
                    { width: CELL_SIZE, height: CELL_SIZE + 10 },
                    cell.isSelected && [styles.cellSelected, { backgroundColor: colors.primary }],
                  ]}
                  onPress={() => setSelectedDate(cell.date)}
                  activeOpacity={0.75}
                >
                  {/* Indicators */}
                  <View style={styles.cellDots}>
                    {isEkadashi && <View style={[styles.dot, { backgroundColor: '#7C3AED' }]} />}
                    {isPurnima && <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />}
                  </View>

                  <AppText
                    variant="body"
                    weight="700"
                    color={cell.isSelected ? '#FFFFFF' : cell.isToday ? colors.primary : colors.navy}
                  >
                    {cell.day}
                  </AppText>

                  <AppText
                    variant="small"
                    color={cell.isSelected ? '#FFFFFF' : colors.muted}
                    numberOfLines={1}
                    style={styles.cellTithi}
                  >
                    {cell.p?.tithiShortHi || ''}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend Bar */}
          <View style={[styles.legendBar, { borderTopColor: colors.borderLight }]}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <AppText variant="small" color={colors.muted}>{isHindi ? 'आज' : 'Today'}</AppText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#7C3AED' }]} />
              <AppText variant="small" color={colors.muted}>{isHindi ? 'एकादशी व्रत' : 'Ekadashi'}</AppText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <AppText variant="small" color={colors.muted}>{isHindi ? 'पूर्णिमा / अमावस्या' : 'Purnima / Amavasya'}</AppText>
            </View>
          </View>
        </View>

        {/* 4. Today / Selected Day Details Card */}
        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.surface,
              borderColor: isDark ? colors.border : colors.border,
            },
          ]}
        >
          <View style={styles.detailsHeader}>
            <View>
              <AppText variant="h2" weight="700" color={colors.navy}>
                {panchang.dayNameHi || 'रविवार'}, {selectedDate.getDate()} {monthLabel}
              </AppText>
              <AppText variant="caption" color={colors.primary} weight="600">
                {panchang.tithiHi} • {panchang.pakshaHi}, संवत् {panchang.samvat}
              </AppText>
            </View>

            <View style={[styles.darshanPill, { backgroundColor: colors.primaryLight }]}>
              <AppText variant="small" weight="700" color={colors.primary}>
                {isHindi ? 'नित्य दर्शन' : 'Daily Darshan'}
              </AppText>
            </View>
          </View>

          {/* 6 Grid Data Tiles */}
          <View style={styles.tilesGrid}>
            <View style={[styles.tile, { backgroundColor: isDark ? colors.surface : colors.surfaceContainerLow }]}>
              <AppText variant="small" color={colors.muted}>{isHindi ? 'तिथि (Tithi)' : 'Tithi'}</AppText>
              <AppText variant="body" weight="700" color={colors.navy} numberOfLines={1}>
                {panchang.tithiHi}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                {isHindi ? 'अहोरात्र पर्यंत' : 'Full Day'}
              </AppText>
            </View>

            <View style={[styles.tile, { backgroundColor: isDark ? colors.surface : colors.surfaceContainerLow }]}>
              <AppText variant="small" color={colors.muted}>{isHindi ? 'नक्षत्र (Nakshatra)' : 'Nakshatra'}</AppText>
              <AppText variant="body" weight="700" color={colors.navy} numberOfLines={1}>
                {panchang.nakshatraHi}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                {isHindi ? `देव: ${panchang.nakshatraDeity || 'अश्विनी'}` : `Lord: ${panchang.nakshatraLord || 'Ketu'}`}
              </AppText>
            </View>

            <View style={[styles.tile, { backgroundColor: isDark ? colors.surface : colors.surfaceContainerLow }]}>
              <AppText variant="small" color={colors.muted}>{isHindi ? 'योग व करण' : 'Yoga & Karana'}</AppText>
              <AppText variant="body" weight="700" color={colors.navy} numberOfLines={1}>
                {panchang.yogaHi}
              </AppText>
              <AppText variant="small" color={colors.textSecondary} numberOfLines={1}>
                {isHindi ? `करण: ${panchang.karanaHi}` : `Karana: ${panchang.karanaEn}`}
              </AppText>
            </View>

            <View style={[styles.tile, { backgroundColor: isDark ? colors.surface : colors.surfaceContainerLow }]}>
              <AppText variant="small" color={colors.muted}>{isHindi ? 'वैदिक संवत्सर' : 'Vedic Samvat'}</AppText>
              <AppText variant="body" weight="700" color={colors.navy} numberOfLines={1}>
                वि.सं. {panchang.samvat}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                शक संवत् {panchang.shakaSamvat}
              </AppText>
            </View>

            <View style={[styles.tile, { backgroundColor: isDark ? colors.surface : colors.surfaceContainerLow }]}>
              <AppText variant="small" color={colors.muted}>{isHindi ? 'सूर्योदय / सूर्यास्त' : 'Sunrise / Sunset'}</AppText>
              <AppText variant="body" weight="700" color={colors.primary} numberOfLines={1}>
                {panchang.sunrise} / {panchang.sunset}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                {isHindi ? `दिनमान: ${panchang.dayLength}` : `Day: ${panchang.dayLength}`}
              </AppText>
            </View>

            <View style={[styles.tile, { backgroundColor: isDark ? colors.surface : colors.surfaceContainerLow }]}>
              <AppText variant="small" color={colors.muted}>{isHindi ? 'अयन व ऋतु' : 'Ayana & Ritu'}</AppText>
              <AppText variant="body" weight="700" color={colors.navy} numberOfLines={1}>
                {panchang.rituHi || 'शरद ऋतु'}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                {panchang.ayanaHi || 'दक्षिणायन'}
              </AppText>
            </View>
          </View>
        </View>

        {/* 5. दैनिक शुभ-अशुभ मुहूर्त (Divine Timings) */}
        <View style={styles.muhuratSection}>
          <View style={styles.muhuratSectionHeader}>
            <View>
              <AppText variant="h2" weight="700" color={colors.navy}>
                {isHindi ? 'दैनिक शुभ-अशुभ मुहूर्त' : 'Divine Timings (शुभ-अशुभ मुहूर्त)'}
              </AppText>
              <AppText variant="caption" color={colors.muted}>
                {isHindi ? 'ब्रज काल गणना अनुसार' : 'Braj Vedic calculations'}
              </AppText>
            </View>
          </View>

          {/* Card 1: Abhijit Muhurat */}
          <View
            style={[
              styles.muhuratCard,
              {
                backgroundColor: isDark ? colors.cardAlt : colors.surface,
                borderColor: isDark ? colors.border : '#FDE68A',
              },
            ]}
          >
            <View style={styles.muhuratCardTop}>
              <View style={styles.muhuratTitleCol}>
                <View style={styles.muhuratIconTitle}>
                  <AppText variant="body">✧</AppText>
                  <AppText variant="h3" weight="700" color={colors.navy} style={styles.muhuratName}>
                    {isHindi ? 'अभिजित मुहूर्त (Abhijit)' : 'Abhijit Muhurat'}
                  </AppText>
                </View>
                <AppText variant="body" weight="700" color={colors.primary} style={styles.muhuratTime}>
                  {panchang.abhijitMuhurat || '11:48 AM – 12:36 PM'}
                </AppText>
              </View>

              <View style={[styles.statusPillBadge, { backgroundColor: colors.goldLight }]}>
                <AppText variant="small" weight="700" color={colors.goldDark}>
                  {isHindi ? 'सर्वश्रेष्ठ मुहूर्त' : 'Most Auspicious'}
                </AppText>
              </View>
            </View>

            <AppText variant="caption" color={colors.textSecondary} style={styles.muhuratDesc}>
              {isHindi
                ? 'पूजा, संकल्प, देवालय दर्शन एवं नवीन कार्य प्रारंभ हेतु सर्वसिद्धिदायक काल।'
                : 'Most auspicious window for Pujan, Yatra Sankalpa & Mandir Archanas.'}
            </AppText>
          </View>

          {/* Card 2: Amrit Kaal */}
          <View
            style={[
              styles.muhuratCard,
              {
                backgroundColor: isDark ? colors.cardAlt : colors.surface,
                borderColor: isDark ? colors.border : '#FDE68A',
              },
            ]}
          >
            <View style={styles.muhuratCardTop}>
              <View style={styles.muhuratTitleCol}>
                <View style={styles.muhuratIconTitle}>
                  <AppText variant="body">☀️</AppText>
                  <AppText variant="h3" weight="700" color={colors.navy} style={styles.muhuratName}>
                    {isHindi ? 'अमृत काल (Amrit Kaal)' : 'Amrit Kaal'}
                  </AppText>
                </View>
                <AppText variant="body" weight="700" color={colors.goldDark} style={styles.muhuratTime}>
                  02:15 PM – 03:50 PM
                </AppText>
              </View>

              <View style={[styles.statusPillBadge, { backgroundColor: colors.goldLight }]}>
                <AppText variant="small" weight="700" color={colors.goldDark}>
                  {isHindi ? 'अमृत सिद्धि' : 'Amrit Siddhi'}
                </AppText>
              </View>
            </View>

            <AppText variant="caption" color={colors.textSecondary} style={styles.muhuratDesc}>
              {isHindi
                ? 'मंत्र जप, धार्मिक अनुष्ठान, दान-पुण्य एवं आध्यात्मिक स्वाध्याय हेतु परम लाभकारी।'
                : 'Highly beneficial for initiation of spiritual study, japa, and Dana.'}
            </AppText>
          </View>

          {/* Card 3: Rahu Kaal */}
          <View
            style={[
              styles.muhuratCard,
              {
                backgroundColor: isDark ? '#451A1A' : '#FEF2F2',
                borderColor: isDark ? colors.border : '#FECACA',
              },
            ]}
          >
            <View style={styles.muhuratCardTop}>
              <View style={styles.muhuratTitleCol}>
                <View style={styles.muhuratIconTitle}>
                  <AppText variant="body">⏳</AppText>
                  <AppText variant="h3" weight="700" color="#DC2626" style={styles.muhuratName}>
                    {isHindi ? 'राहु काल (Rahu Kaal)' : 'Rahu Kaal'}
                  </AppText>
                </View>
                <AppText variant="body" weight="700" color="#DC2626" style={styles.muhuratTime}>
                  {panchang.rahukaal || '04:41 PM – 06:11 PM'}
                </AppText>
              </View>

              <View style={[styles.statusPillBadge, { backgroundColor: '#FEE2E2' }]}>
                <AppText variant="small" weight="700" color="#DC2626">
                  {isHindi ? 'अशुभ काल' : 'Inauspicious'}
                </AppText>
              </View>
            </View>

            <AppText variant="caption" color="#991B1B" style={styles.muhuratDesc}>
              {isHindi
                ? 'शास्त्रानुसार सर्वथा वर्जित काल। इस अवधि में नवीन यात्रा अथवा मांगलिक कार्य न करें।'
                : 'Strictly inauspicious. Avoid starting new journeys, purchases, or consecrations.'}
            </AppText>
          </View>
        </View>

        {/* 6. आगामी प्रमुख पर्व (Major Festivals) */}
        <View style={styles.festSection}>
          <View style={styles.festSectionHeader}>
            <AppText variant="h2" weight="700" color={colors.navy}>
              {isHindi ? 'आगामी प्रमुख पर्व' : 'Major Festivals (आगामी पर्व)'}
            </AppText>
            <AppText variant="caption" weight="700" color={colors.primary}>
              {isHindi ? 'सम्पूर्ण सूची >' : 'View All >'}
            </AppText>
          </View>

          {monthlyFestivals.slice(0, 3).map((fest) => {
            const hasReminder = reminders[fest.dateKey];
            return (
              <View
                key={fest.dateKey}
                style={[
                  styles.festCard,
                  {
                    backgroundColor: isDark ? colors.cardAlt : colors.surface,
                    borderColor: isDark ? colors.border : colors.border,
                  },
                ]}
              >
                <View style={styles.festCardTop}>
                  <View style={[styles.festBadge, { backgroundColor: colors.goldLight }]}>
                    <AppText variant="small" weight="700" color={colors.goldDark}>
                      {fest.badge || '🌸'} {isHindi ? fest.shortHi : fest.shortEn}
                    </AppText>
                  </View>
                </View>

                <AppText variant="h2" weight="700" color={colors.navy} style={styles.festTitle}>
                  {isHindi ? fest.nameHi : fest.nameEn}
                </AppText>

                <AppText variant="caption" color={colors.primary} weight="600">
                  {isHindi ? `${fest.day} ${monthLabel}` : `${fest.day} ${monthLabel}`}
                </AppText>

                <AppText variant="caption" color={colors.textSecondary} style={styles.festDesc}>
                  {isHindi
                    ? 'ब्रज धाम के प्रमुख देवालयों में विशेष दर्शन, छप्पन भोग एवं महाआरती उत्सव।'
                    : 'Grand festive darshan, Chhappan Bhog, and special Maha Aarti across Braj Dham.'}
                </AppText>

                <TouchableOpacity
                  style={[
                    styles.reminderBtn,
                    {
                      backgroundColor: hasReminder ? colors.success : colors.surfaceContainerLow,
                      borderColor: hasReminder ? colors.success : colors.border,
                    },
                  ]}
                  onPress={() => toggleReminder(fest.dateKey, isHindi ? fest.nameHi : fest.nameEn)}
                  activeOpacity={0.8}
                >
                  <AppText
                    variant="caption"
                    weight="700"
                    color={hasReminder ? '#FFFFFF' : colors.primary}
                  >
                    🔔 {hasReminder ? (isHindi ? 'स्मरण पत्र सक्रिय' : 'Reminder Set') : (isHindi ? 'स्मरण पत्र जोड़ें' : 'Add Reminder')}
                  </AppText>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 10,
  },
  cardMainTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginVertical: 4,
  },
  calIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pakshaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pakshaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 6,
  },
  calendarCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginVertical: 8,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  monthBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: {
    alignItems: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekdayCell: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
    position: 'relative',
  },
  cellSelected: {
    shadowColor: '#A43700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cellDots: {
    position: 'absolute',
    top: 4,
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  cellTithi: {
    fontSize: 8,
    marginTop: 1,
  },
  legendBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  darshanPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: '48.5%',
    borderRadius: 14,
    padding: 10,
    gap: 2,
  },
  muhuratSection: {
    marginVertical: 10,
  },
  muhuratSectionHeader: {
    marginBottom: 10,
  },
  muhuratCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  muhuratCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  muhuratTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  muhuratIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  muhuratName: {
    fontSize: 16,
  },
  muhuratTime: {
    marginTop: 2,
    fontSize: 15,
  },
  statusPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  muhuratDesc: {
    lineHeight: 18,
  },
  festSection: {
    marginVertical: 10,
  },
  festSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  festCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  festCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  festBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  festTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 2,
  },
  festDesc: {
    lineHeight: 18,
    marginVertical: 6,
  },
  reminderBtn: {
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
});
