/**
 * Braj Darshan - Settings
 * Language, appearance (System / Light / Dark, System is the default), text size,
 * offline data, and "About & privacy". About has no screen of its own: it is the
 * "About" row here, which opens in place. Navigating to Settings with
 * { section: 'about' } opens it and scrolls to it.
 * No sign-in anywhere: accounts are not available. Only settings that really
 * change the app are shown here.
 * Layout from the Nov 2026 redesign (Claude Design "Settings"): a segmented language
 * control, the theme as three cards with small swatches, a text-size info row, the
 * offline-data card with a red outlined clear button, and the About & privacy list.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Linking, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { lightColors, darkColors } from '../../theme/colors';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Button,
  Card,
  InfoNote,
  LanguageToggle,
  ListRow,
  TopBar,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';
import { PRIVACY_URL } from '../more/MoreScreen';
import { PHOTO_CREDITS } from '../../utils/photoCredits';
import { getAppVersion } from '../../utils/appVersion';
import { clearDownloadedContent } from '../../services/contentService';

// From the build (app.json through expo-constants), e.g. "1.0.0 (2)".
const APP_VERSION = getAppVersion();

const LANGUAGE_OPTIONS = [
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
];

// Each swatch shows the app's real ground colour for that theme (System: half of each).
const THEME_OPTIONS = [
  { mode: 'system', hi: 'फ़ोन के अनुसार', en: 'System', swatch: [lightColors.background, darkColors.background] },
  { mode: 'light', hi: 'लाइट', en: 'Light', swatch: [lightColors.background] },
  { mode: 'dark', hi: 'डार्क', en: 'Dark', swatch: [darkColors.background] },
];

/** Section heading with an optional "currently" value on the right. */
function Heading({ title, value, colors }) {
  return (
    <View style={styles.heading}>
      <AppText variant="h4" weight="700" color={colors.navy} accessibilityRole="header" style={styles.flex}>
        {title}
      </AppText>
      {value ? (
        <AppText variant="small" weight="600" color={colors.primary}>
          {value}
        </AppText>
      ) : null}
    </View>
  );
}

/** Red button for clearing data: outlined to offer it, filled to confirm it. */
function DangerButton({ title, onPress, filled = false, disabled = false, accessibilityLabel, style }) {
  const { colors, isDark } = useTheme();
  const guarded = usePressGuard(onPress);
  const onRed = isDark ? '#1E1B18' : '#FFFFFF';
  return (
    <Pressable
      onPress={guarded}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.dangerButton,
        {
          backgroundColor: filled ? colors.warning : pressed ? colors.warningBg : colors.surface,
          borderColor: colors.warning,
          opacity: disabled ? 0.45 : filled && pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <AppText variant="body" weight="600" color={filled ? onRed : colors.warning}>
        {title}
      </AppText>
    </Pressable>
  );
}

export default function SettingsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { isHindi, language, setLanguage } = useLanguage();

  const section = route?.params?.section;
  const scrollRef = useRef(null);
  const bodyY = useRef(0);
  const aboutY = useRef(0);
  const [aboutOpen, setAboutOpen] = useState(section === 'about');
  const [creditsOpen, setCreditsOpen] = useState(false);
  // 'idle' | 'confirm' | 'working' | 'done' | 'error'
  const [clearState, setClearState] = useState('idle');

  // Opened with { section: 'about' }: expand About and scroll to it.
  useEffect(() => {
    if (section !== 'about') return undefined;
    setAboutOpen(true);
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, bodyY.current + aboutY.current - 12),
        animated: true,
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [section]);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate(ROUTES.MORE);
  };

  const clearOfflineData = async () => {
    setClearState('working');
    // Old cache keys, plus the temple/place updates downloaded from the website
    // (@braj_content_v1_*), so the app goes back to its built-in data at once.
    const [cache, content] = await Promise.all([storageService.clearCache(), clearDownloadedContent()]);
    setClearState(cache && cache.success && content && content.success ? 'done' : 'error');
  };

  const openPrivacy = () => {
    Linking.openURL(PRIVACY_URL).catch(() => {});
  };

  const currentLanguage = isHindi ? 'अभी: हिन्दी' : 'Currently: English';

  const activeTheme = THEME_OPTIONS.find((opt) => opt.mode === themeMode) || THEME_OPTIONS[0];
  let currentTheme;
  if (activeTheme.mode === 'system') {
    currentTheme = isHindi
      ? `अभी: फ़ोन के अनुसार (${isDark ? 'डार्क' : 'लाइट'})`
      : `Currently: System (${isDark ? 'dark' : 'light'})`;
  } else {
    currentTheme = isHindi ? `अभी: ${activeTheme.hi}` : `Currently: ${activeTheme.en}`;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={isHindi ? 'सेटिंग्स' : 'Settings'}
          subtitle={isHindi ? 'ऐप को अपने अनुसार सहज बनाएँ' : 'Make the app comfortable for you'}
          onBack={goBack}
          right={<LanguageToggle />}
        />

        <View
          style={styles.body}
          onLayout={(e) => {
            bodyY.current = e.nativeEvent.layout.y;
          }}
        >
          {/* Language. The heading names both languages so it can be found in either. */}
          <View style={styles.section}>
            <Heading
              title={isHindi ? 'भाषा · Language' : 'Language · भाषा'}
              value={currentLanguage}
              colors={colors}
            />
            <View style={[styles.segmented, { backgroundColor: colors.infoBg }]} accessibilityRole="radiogroup">
              {LANGUAGE_OPTIONS.map((opt) => {
                const selected = language === opt.code;
                return (
                  <Pressable
                    key={opt.code}
                    onPress={() => setLanguage(opt.code)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={opt.label}
                    style={[
                      styles.segment,
                      // Background set in both states (Android drops the radius of conditional backgrounds).
                      { backgroundColor: selected ? colors.surface : colors.infoBg },
                    ]}
                  >
                    <AppText
                      variant="body"
                      weight={selected ? '700' : '600'}
                      color={selected ? colors.navy : colors.muted}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            <AppText variant="small" color={colors.muted}>
              {isHindi
                ? 'मेनू और जानकारी इसी भाषा में दिखेंगी। ऊपर के बटन से भी कभी भी बदल सकते हैं।'
                : 'Menus and information are shown in this language. You can also switch any time with the button at the top.'}
            </AppText>
          </View>

          {/* Appearance */}
          <View style={styles.section}>
            <Heading title={isHindi ? 'रंग-रूप (थीम)' : 'Appearance (theme)'} value={currentTheme} colors={colors} />
            <View style={styles.themeRow} accessibilityRole="radiogroup">
              {THEME_OPTIONS.map((opt) => {
                const selected = activeTheme.mode === opt.mode;
                const label = isHindi ? opt.hi : opt.en;
                return (
                  <Pressable
                    key={opt.mode}
                    onPress={() => setThemeMode(opt.mode)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={label}
                    style={({ pressed }) => [
                      styles.themeCard,
                      {
                        backgroundColor: selected ? colors.primaryLight : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.swatch, { borderColor: colors.border }]}>
                      {opt.swatch.map((c) => (
                        <View key={c} style={[styles.flex, { backgroundColor: c }]} />
                      ))}
                    </View>
                    <AppText
                      variant="caption"
                      weight={selected ? '700' : '600'}
                      color={selected ? colors.navy : colors.text}
                      align="center"
                    >
                      {label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            <AppText variant="small" color={colors.muted}>
              {isHindi
                ? '"फ़ोन के अनुसार" चुनने पर ऐप आपके फ़ोन की लाइट या डार्क सेटिंग अपनाता है। यही शुरुआती सेटिंग है।'
                : '"System" follows your phone\'s light or dark setting. This is the default.'}
            </AppText>
          </View>

          {/* Text size */}
          <Card style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.primaryLight }]}>
              <Icon name="textSize" size={22} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyBold" color={colors.navy} accessibilityRole="header">
                {isHindi ? 'अक्षरों का आकार' : 'Text size'}
              </AppText>
              <AppText variant="caption" color={colors.text}>
                {isHindi
                  ? 'अक्षरों का आकार आपके फ़ोन की सेटिंग के अनुसार चलता है। बड़ा करने के लिए फ़ोन की डिस्प्ले सेटिंग में फ़ॉन्ट साइज़ बढ़ाएँ।'
                  : "Text follows your phone's font size. To make it bigger, increase the font size in your phone's display settings."}
              </AppText>
            </View>
          </Card>

          {/* Offline data */}
          <Card style={styles.dataCard}>
            <AppText variant="h4" weight="700" color={colors.navy} accessibilityRole="header">
              {isHindi ? 'ऑफ़लाइन डेटा' : 'Offline data'}
            </AppText>
            <AppText variant="caption" color={colors.text}>
              {isHindi
                ? 'मंदिर, पंचांग और उत्सवों की जानकारी ऐप में ही है और बिना इंटरनेट के चलती है। रास्ता (दिशा) और ऑनलाइन ऑडियो के लिए इंटरनेट चाहिए।'
                : 'Temple, Panchang and festival information is built into the app and works without internet. Directions and online audio need internet.'}
            </AppText>

            {clearState === 'confirm' || clearState === 'working' ? (
              <View style={[styles.confirmBox, { backgroundColor: colors.warningBg }]}>
                <AppText variant="body" weight="700" color={colors.navy}>
                  {isHindi ? 'ऑफ़लाइन डेटा साफ़ करें?' : 'Clear offline data?'}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {isHindi
                    ? 'अस्थायी डेटा हटेगा। आपके सहेजे मंदिर, भाषा और थीम बने रहेंगे।'
                    : 'Temporary data will be removed. Your saved temples, language and theme are kept.'}
                </AppText>
                {/* Stacked, so the labels never get cut off at a large font size. */}
                <View style={styles.confirmButtons}>
                  <DangerButton
                    filled
                    title={isHindi ? 'हाँ, साफ़ करें' : 'Yes, clear'}
                    onPress={clearOfflineData}
                    disabled={clearState === 'working'}
                  />
                  <Button
                    variant="secondary"
                    title={isHindi ? 'रहने दें' : 'Cancel'}
                    onPress={() => setClearState('idle')}
                    disabled={clearState === 'working'}
                  />
                </View>
              </View>
            ) : (
              <DangerButton
                title={isHindi ? 'ऑफ़लाइन डेटा साफ़ करें' : 'Clear offline data'}
                onPress={() => setClearState('confirm')}
                style={styles.clearButton}
              />
            )}

            {clearState === 'done' ? (
              <InfoNote icon="open">
                {isHindi
                  ? 'ऑफ़लाइन डेटा साफ़ हो गया। सहेजे मंदिर, भाषा और थीम बने हुए हैं।'
                  : 'Offline data cleared. Saved temples, language and theme were kept.'}
              </InfoNote>
            ) : null}
            {clearState === 'error' ? (
              <InfoNote icon="alert" tone="danger">
                {isHindi ? 'डेटा साफ़ नहीं हो सका। कृपया दोबारा कोशिश करें।' : 'Could not clear the data. Please try again.'}
              </InfoNote>
            ) : null}
            {clearState === 'idle' ? (
              <AppText variant="small" color={colors.muted}>
                {isHindi
                  ? 'इससे केवल अस्थायी डेटा हटता है, आपकी सहेजी मंदिर सूची नहीं।'
                  : 'This clears temporary data only, not your saved temple list.'}
              </AppText>
            ) : null}
          </Card>

          {/* About & privacy */}
          <View
            style={styles.section}
            onLayout={(e) => {
              aboutY.current = e.nativeEvent.layout.y;
            }}
          >
            <AppText
              variant="small"
              weight="700"
              color={colors.muted}
              accessibilityRole="header"
              style={styles.groupLabel}
            >
              {isHindi ? 'परिचय व गोपनीयता' : 'About & privacy'}
            </AppText>
            <Card padded={false}>
              <View style={styles.rowPad}>
                <ListRow
                  title={isHindi ? 'परिचय' : 'About'}
                  subtitle={
                    isHindi
                      ? 'दिव्यब्रज · ब्रज दर्शन'
                      : 'DivyaBraj · Braj Darshan'
                  }
                  onPress={() => setAboutOpen((open) => !open)}
                  right={
                    <View style={aboutOpen ? styles.chevronOpen : null}>
                      <Icon name="chevronDown" size={20} color={colors.muted} />
                    </View>
                  }
                />
                {aboutOpen ? (
                  <View style={styles.about}>
                    <AppText variant="body" color={colors.text}>
                      {isHindi
                        ? 'ब्रज — मथुरा, वृंदावन, गोवर्धन, बरसाना और गोकुल — के मंदिरों, घाटों, उत्सवों और पंचांग की सरल जानकारी, DIVYABRAJ की ओर से।'
                        : 'A gentle guide to the temples, ghats, festivals and Panchang of Braj — Mathura, Vrindavan, Govardhan, Barsana and Gokul — from DIVYABRAJ.'}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {isHindi
                        ? 'मंदिरों का समय नियमित समय-सारणी पर आधारित है और त्योहारों पर बदल सकता है — कृपया स्थानीय पुष्टि करें। पंचांग फ़ोन पर गणना से बनता है और अनुमानित है।'
                        : 'Temple timings follow regular schedules and may change on festivals — please confirm locally. The Panchang is calculated on your phone and is approximate.'}
                    </AppText>
                  </View>
                ) : null}
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.rowPad}>
                <ListRow
                  title={isHindi ? 'गोपनीयता नीति' : 'Privacy policy'}
                  subtitle={
                    isHindi
                      ? 'साइन-इन की ज़रूरत नहीं · divyabraj.com पर खुलेगा'
                      : 'No sign-in required · opens divyabraj.com'
                  }
                  onPress={openPrivacy}
                  right={<Icon name="externalLink" size={20} color={colors.muted} />}
                />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.rowPad}>
                <ListRow
                  title={isHindi ? 'फ़ोटो श्रेय' : 'Photo credits'}
                  subtitle={
                    isHindi
                      ? `Wikimedia Commons से ${PHOTO_CREDITS.length} फ़ोटो`
                      : `${PHOTO_CREDITS.length} photos from Wikimedia Commons`
                  }
                  onPress={() => setCreditsOpen((open) => !open)}
                  right={
                    <View style={creditsOpen ? styles.chevronOpen : null}>
                      <Icon name="chevronDown" size={20} color={colors.muted} />
                    </View>
                  }
                />
                {creditsOpen ? (
                  <View style={styles.about}>
                    {PHOTO_CREDITS.map((c) => (
                      <Pressable
                        key={c.key}
                        onPress={() => Linking.openURL(c.source).catch(() => {})}
                        accessibilityRole="link"
                        style={({ pressed }) => [styles.creditRow, { opacity: pressed ? 0.6 : 1 }]}
                      >
                        <AppText variant="caption" weight="700" color={colors.navy}>
                          {c.subject}
                        </AppText>
                        <AppText variant="small" color={colors.textSecondary}>
                          {`${c.author} · ${c.licence}`}
                        </AppText>
                      </Pressable>
                    ))}
                    <AppText variant="small" color={colors.muted}>
                      {isHindi
                        ? 'किसी फ़ोटो पर दबाएँ तो Wikimedia पर उसका पेज और पूरा लाइसेंस खुलेगा।'
                        : 'Tap a photo credit to open its Wikimedia page and full licence.'}
                    </AppText>
                  </View>
                ) : null}
              </View>
            </Card>
            <AppText variant="small" color={colors.muted} align="center" style={styles.version}>
              {isHindi
                ? `दिव्यब्रज${APP_VERSION ? ` · संस्करण ${APP_VERSION}` : ''}`
                : `DivyaBraj${APP_VERSION ? ` · Version ${APP_VERSION}` : ''}`}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  body: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 22 },
  section: { gap: 10 },
  heading: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  segmented: { flexDirection: 'row', padding: 4, borderRadius: 16 },
  segment: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeCard: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  swatch: {
    width: 44,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 16, paddingVertical: 14 },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataCard: { gap: 10 },
  dangerButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: { alignSelf: 'flex-start' },
  confirmBox: { padding: 14, borderRadius: 14, gap: 6 },
  confirmButtons: { gap: 10, marginTop: 8 },
  groupLabel: { letterSpacing: 0 },
  rowPad: { paddingHorizontal: 14 },
  divider: { height: 1 },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  creditRow: { gap: 2, minHeight: 44, justifyContent: 'center' },
  about: { gap: 8, paddingTop: 2, paddingBottom: 14 },
  version: { marginTop: 4 },
});
