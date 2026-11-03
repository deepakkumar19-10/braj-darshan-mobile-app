/**
 * Braj Darshan - Settings
 * Language, appearance (System / Light / Dark, System is the default), text size,
 * offline data, and "About & privacy". About has no screen of its own: it is the
 * "About" row here, which opens in place. Navigating to Settings with
 * { section: 'about' } opens it and scrolls to it.
 * No sign-in anywhere: accounts are not available. Only settings that really
 * change the app are shown here.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Linking, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Button,
  Card,
  Chip,
  InfoNote,
  LanguageToggle,
  ListRow,
  SectionHeader,
  TopBar,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { ROUTES } from '../../navigation/routes';
import { PRIVACY_URL } from '../more/MoreScreen';
import { PHOTO_CREDITS } from '../../utils/photoCredits';

const APP_VERSION = '1.0';

const LANGUAGE_OPTIONS = [
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
];

const THEME_OPTIONS = [
  { mode: 'system', icon: 'theme', hi: 'फ़ोन के अनुसार', en: 'System' },
  { mode: 'light', icon: 'sun', hi: 'लाइट', en: 'Light' },
  { mode: 'dark', icon: 'tithi', hi: 'डार्क', en: 'Dark' },
];

function CardTitle({ icon, title, value, colors }) {
  return (
    <View style={styles.cardTitle}>
      <View style={[styles.cardIcon, { backgroundColor: colors.primaryLight }]}>
        <Icon name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText variant="h4" weight="700" color={colors.navy} accessibilityRole="header">
          {title}
        </AppText>
        {value ? (
          <AppText variant="caption" weight="600" color={colors.primary}>
            {value}
          </AppText>
        ) : null}
      </View>
    </View>
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
    const result = await storageService.clearCache();
    setClearState(result && result.success ? 'done' : 'error');
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
          <Card>
            <CardTitle
              icon="language"
              title={isHindi ? 'भाषा · Language' : 'Language · भाषा'}
              value={currentLanguage}
              colors={colors}
            />
            <View style={styles.chips}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.code}
                  icon={language === opt.code ? 'open' : undefined}
                  label={opt.label}
                  selected={language === opt.code}
                  onPress={() => setLanguage(opt.code)}
                />
              ))}
            </View>
            <AppText variant="caption" color={colors.textSecondary} style={styles.note}>
              {isHindi
                ? 'मेनू और जानकारी इसी भाषा में दिखेंगी। ऊपर के बटन से भी कभी भी बदल सकते हैं।'
                : 'Menus and information are shown in this language. You can also switch any time with the button at the top.'}
            </AppText>
          </Card>

          {/* Appearance */}
          <Card>
            <CardTitle
              icon="theme"
              title={isHindi ? 'रंग-रूप (थीम)' : 'Appearance (theme)'}
              value={currentTheme}
              colors={colors}
            />
            <View style={styles.chips}>
              {THEME_OPTIONS.map((opt) => (
                <Chip
                  key={opt.mode}
                  icon={opt.icon}
                  label={isHindi ? opt.hi : opt.en}
                  selected={activeTheme.mode === opt.mode}
                  onPress={() => setThemeMode(opt.mode)}
                />
              ))}
            </View>
            <AppText variant="caption" color={colors.textSecondary} style={styles.note}>
              {isHindi
                ? '"फ़ोन के अनुसार" चुनने पर ऐप आपके फ़ोन की लाइट या डार्क सेटिंग अपनाता है। यही शुरुआती सेटिंग है।'
                : '"System" follows your phone\'s light or dark setting. This is the default.'}
            </AppText>
          </Card>

          {/* Text size */}
          <Card>
            <CardTitle icon="textSize" title={isHindi ? 'अक्षरों का आकार' : 'Text size'} colors={colors} />
            <AppText variant="body" color={colors.text}>
              {isHindi
                ? 'अक्षरों का आकार आपके फ़ोन की सेटिंग के अनुसार चलता है। बड़ा करने के लिए फ़ोन की डिस्प्ले सेटिंग में फ़ॉन्ट साइज़ बढ़ाएँ।'
                : "Text follows your phone's font size. To make it bigger, increase the font size in your phone's display settings."}
            </AppText>
            <View style={[styles.preview, { backgroundColor: colors.primaryLight }]}>
              <AppText variant="h4" weight="700" color={colors.navy}>
                {isHindi ? 'राधे राधे' : 'Radhe Radhe'}
              </AppText>
              <AppText variant="body" color={colors.text}>
                {isHindi ? 'अपनी गति से यात्रा करें।' : 'Take your yatra at your own pace.'}
              </AppText>
            </View>
          </Card>

          {/* Offline data */}
          <Card>
            <CardTitle icon="offline" title={isHindi ? 'ऑफ़लाइन डेटा' : 'Offline data'} colors={colors} />
            <AppText variant="body" color={colors.text}>
              {isHindi
                ? 'मंदिर, पंचांग और उत्सवों की जानकारी ऐप में ही है और बिना इंटरनेट के चलती है। रास्ता (दिशा) और ऑनलाइन ऑडियो के लिए इंटरनेट चाहिए।'
                : 'Temple, Panchang and festival information is built into the app and works without internet. Directions and online audio need internet.'}
            </AppText>

            {clearState === 'confirm' || clearState === 'working' ? (
              <View style={[styles.confirmBox, { backgroundColor: colors.infoBg }]}>
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
                  <Button
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
              <Button
                variant="secondary"
                icon="trash"
                title={isHindi ? 'डेटा साफ़ करें' : 'Clear data'}
                accessibilityLabel={isHindi ? 'ऑफ़लाइन डेटा साफ़ करें' : 'Clear offline data'}
                onPress={() => setClearState('confirm')}
                style={styles.clearButton}
              />
            )}

            {clearState === 'done' ? (
              <InfoNote icon="open" style={styles.result}>
                {isHindi
                  ? 'ऑफ़लाइन डेटा साफ़ हो गया। सहेजे मंदिर, भाषा और थीम बने हुए हैं।'
                  : 'Offline data cleared. Saved temples, language and theme were kept.'}
              </InfoNote>
            ) : null}
            {clearState === 'error' ? (
              <InfoNote icon="alert" style={styles.result}>
                {isHindi ? 'डेटा साफ़ नहीं हो सका। कृपया दोबारा कोशिश करें।' : 'Could not clear the data. Please try again.'}
              </InfoNote>
            ) : null}
            {clearState === 'idle' ? (
              <AppText variant="caption" color={colors.textSecondary} style={styles.note}>
                {isHindi
                  ? 'इससे केवल अस्थायी डेटा हटता है, आपकी सहेजी मंदिर सूची नहीं।'
                  : 'This clears temporary data only, not your saved temple list.'}
              </AppText>
            ) : null}
          </Card>

          {/* About & privacy */}
          <View
            style={styles.group}
            onLayout={(e) => {
              aboutY.current = e.nativeEvent.layout.y;
            }}
          >
            <SectionHeader title={isHindi ? 'परिचय व गोपनीयता' : 'About & privacy'} />
            <Card style={styles.listCard}>
              <ListRow
                icon="info"
                title={isHindi ? 'परिचय' : 'About'}
                subtitle={
                  isHindi
                    ? 'श्री ब्रज दर्शन · DIVYABRAJ द्वारा'
                    : 'Shri Braj Darshan, by DIVYABRAJ'
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
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <ListRow
                icon="safety"
                title={isHindi ? 'गोपनीयता नीति' : 'Privacy policy'}
                subtitle={
                  isHindi
                    ? 'साइन-इन की ज़रूरत नहीं · divyabraj.com पर खुलेगा'
                    : 'No sign-in required · opens divyabraj.com'
                }
                onPress={openPrivacy}
                right={<Icon name="externalLink" size={20} color={colors.muted} />}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <ListRow
                icon="camera"
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
            </Card>
            <AppText variant="small" color={colors.muted} align="center" style={styles.version}>
              {isHindi
                ? `श्री ब्रज दर्शन · संस्करण ${APP_VERSION}`
                : `Shri Braj Darshan · Version ${APP_VERSION}`}
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
  body: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 16 },
  group: { marginTop: 8 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  note: { marginTop: 12 },
  preview: { marginTop: 14, padding: 14, borderRadius: 14, gap: 4 },
  confirmBox: { marginTop: 16, padding: 14, borderRadius: 14, gap: 6 },
  confirmButtons: { gap: 10, marginTop: 8 },
  clearButton: { marginTop: 16 },
  result: { marginTop: 12 },
  listCard: { paddingVertical: 4 },
  // Starts under the row text, past the 44px icon tile and its 14px gap.
  divider: { height: 1, marginLeft: 58 },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  creditRow: { gap: 2, minHeight: 44, justifyContent: 'center' },
  about: { gap: 8, paddingTop: 2, paddingBottom: 14 },
  version: { marginTop: 12 },
});
