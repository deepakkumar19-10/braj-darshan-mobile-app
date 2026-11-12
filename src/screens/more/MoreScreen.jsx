/**
 * Braj Darshan - More (bottom tab)
 * Every section that is not a main tab, as grouped lists (MORE_GROUPS) of rows.
 * The same lists (MORE_GROUPS + MORE_SECTIONS) feed the side drawer so both always
 * match. "About" is not a separate item here: it lives in Settings (Settings → About).
 * Look: the Nov 2026 "clean Braj" redesign (artboard More): app icon header, two
 * grouped lists with tinted icon squares, a short note and a footer line.
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Linking, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import { Card, InfoNote, LanguageToggle, GUTTER, useBottomInset } from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { ROUTES } from '../../navigation/routes';

// The divyabraj.com logo, shown as the app icon (same as the Home header).
const LOGO = require('../../assets/images/brand/braj-logo.png');

export const PRIVACY_URL = 'https://www.divyabraj.com/privacy';

/** Headings the sections are grouped under, in order (More screen and drawer). */
export const MORE_GROUPS = [
  { id: 'explore', hi: 'ब्रज को जानें', en: 'Explore Braj' },
  { id: 'app', hi: 'सहायता व सेटिंग्स', en: 'Help & settings' },
];

// tone: tint of the icon square on the More screen ('red' for help & emergency, saffron otherwise).
export const MORE_SECTIONS = [
  {
    id: 'yatra',
    group: 'explore',
    icon: 'route',
    route: ROUTES.YATRA,
    hi: 'यात्रा योजना',
    en: 'Yatra plans',
    subHi: 'ब्रज में अपने दिनों की योजना',
    subEn: 'Plan your days in Braj',
  },
  {
    id: 'braj-places',
    group: 'explore',
    icon: 'temple',
    route: ROUTES.BRAJ_PLACES,
    hi: 'ब्रज के स्थल',
    en: 'Places of Braj',
    subHi: 'हर धाम के मंदिर, कुंड, वन — फ़ोटो सहित',
    subEn: 'Temples, kunds and vans of every town',
  },
  {
    id: 'places',
    group: 'explore',
    icon: 'ghat',
    route: ROUTES.PLACES,
    hi: 'घाट व स्थल',
    en: 'Places & ghats',
    subHi: 'घाट, कुंड और नगर',
    subEn: 'Ghats, kunds & towns',
  },
  {
    id: 'festivals',
    group: 'explore',
    icon: 'aarti',
    route: ROUTES.EVENTS,
    hi: 'उत्सव',
    en: 'Festivals',
    subHi: 'ब्रज का भक्तिमय वर्ष',
    subEn: 'The devotional year',
  },
  {
    id: 'food',
    group: 'explore',
    icon: 'food',
    route: ROUTES.FOOD,
    hi: 'ब्रज भोग',
    en: 'Braj food',
    subHi: 'ब्रज के स्वाद',
    subEn: 'Flavours of Braj',
  },
  {
    id: 'audio',
    group: 'explore',
    icon: 'music',
    route: ROUTES.AUDIO_PLAYER,
    hi: 'भक्ति ऑडियो',
    en: 'Bhakti audio',
    subHi: 'आरती, भजन, कीर्तन · YouTube से',
    subEn: 'Aarti, bhajans, kirtan · on YouTube',
  },
  {
    id: 'help',
    group: 'app',
    icon: 'phone',
    tone: 'red',
    route: ROUTES.HELPDESK,
    hi: 'सहायता व आपातकाल',
    en: 'Help & emergency',
    subHi: 'सुरक्षा व ज़रूरी नंबर',
    subEn: 'Safety & essential numbers',
  },
  {
    id: 'saved',
    group: 'app',
    icon: 'heart',
    route: ROUTES.FAVORITES,
    hi: 'सहेजे गए',
    en: 'Saved',
    subHi: 'आपके सहेजे मंदिर',
    subEn: 'Your saved temples',
  },
  {
    id: 'settings',
    group: 'app',
    icon: 'settings',
    route: ROUTES.SETTINGS,
    hi: 'सेटिंग्स',
    en: 'Settings',
    subHi: 'भाषा, थीम, डेटा व परिचय',
    subEn: 'Language, theme, data & about',
  },
  {
    id: 'privacy',
    group: 'app',
    icon: 'safety',
    url: PRIVACY_URL,
    hi: 'गोपनीयता',
    en: 'Privacy',
    subHi: 'divyabraj.com पर खुलेगा',
    subEn: 'Opens divyabraj.com',
  },
];

/** The sections of one group, in list order. */
export function sectionsInGroup(groupId) {
  return MORE_SECTIONS.filter((item) => item.group === groupId);
}

/** Opens a section: web links in the browser, everything else in the app. */
export function openSection(navigate, item) {
  if (item.url) {
    Linking.openURL(item.url).catch(() => {});
    return;
  }
  navigate(item.route, item.params);
}

// One row of a grouped list: tinted icon square, title, subtitle, chevron (or "opens outside" for web links).
function MoreRow({ item, first, isHindi, colors, onPress }) {
  const guarded = usePressGuard(onPress);
  const tint = item.tone === 'red'
    ? { bg: colors.warningBg, fg: colors.warning }
    : { bg: colors.primaryLight, fg: colors.primary };
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        !first && { borderTopWidth: 1, borderTopColor: colors.border },
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: tint.bg }]}>
        <Icon name={item.icon} size={22} color={tint.fg} />
      </View>
      <View style={styles.flex}>
        <AppText variant="body" weight="600" color={colors.navy}>
          {isHindi ? item.hi : item.en}
        </AppText>
        <AppText variant="small" color={colors.muted}>
          {isHindi ? item.subHi : item.subEn}
        </AppText>
      </View>
      <Icon name={item.url ? 'externalLink' : 'chevronRight'} size={item.url ? 18 : 20} color={colors.muted} />
    </Pressable>
  );
}

export default function MoreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  const navigate = (route, params) => navigation.navigate(route, params);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: app icon, title and greeting; language switch on the right */}
        <View style={styles.header}>
          <Image
            source={LOGO}
            style={[styles.logo, { backgroundColor: colors.surface }]}
            resizeMode="cover"
            fadeDuration={0}
            accessibilityLabel="DivyaBraj"
          />
          <View style={styles.flex}>
            <AppText variant="h1" weight="700" color={colors.navy} accessibilityRole="header" numberOfLines={2}>
              {isHindi ? 'और देखें' : 'Explore more'}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              {isHindi ? 'राधे राधे · ब्रज में आपका साथी' : 'Radhe Radhe · your companion in Braj'}
            </AppText>
          </View>
          <LanguageToggle />
        </View>

        <View style={styles.body}>
          {MORE_GROUPS.map((group) => (
            <View key={group.id} style={styles.group}>
              <AppText variant="small" weight="700" color={colors.muted} accessibilityRole="header">
                {isHindi ? group.hi : group.en}
              </AppText>
              <Card padded={false}>
                {sectionsInGroup(group.id).map((item, index) => (
                  <MoreRow
                    key={item.id}
                    item={item}
                    first={index === 0}
                    isHindi={isHindi}
                    colors={colors}
                    onPress={() => openSection(navigate, item)}
                  />
                ))}
              </Card>
            </View>
          ))}

          <InfoNote>
            {isHindi
              ? 'कोई खाता नहीं चाहिए। आराम से देखें — सहेजे मंदिर और आपकी पसंद इसी फ़ोन पर रहती हैं।'
              : 'No account needed. Explore freely; saved temples and preferences stay on this phone.'}
          </InfoNote>

          <AppText variant="small" color={colors.muted} align="center">
            {isHindi ? 'DIVYABRAJ · शांत, सजग यात्रा के लिए' : 'DIVYABRAJ · Made for a mindful yatra'}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingTop: 16,
  },
  logo: { width: 52, height: 52, borderRadius: 16 },
  body: { paddingHorizontal: GUTTER, paddingTop: 22, gap: 22 },
  group: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
