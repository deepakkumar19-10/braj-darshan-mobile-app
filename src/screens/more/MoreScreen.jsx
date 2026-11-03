/**
 * Braj Darshan - More (bottom tab)
 * Every section that is not a main tab, as grouped lists (MORE_GROUPS) of rows.
 * The same lists (MORE_GROUPS + MORE_SECTIONS) feed the side drawer so both always
 * match. "About" is not a separate item here: it lives in Settings (Settings → About).
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Linking, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Card,
  InfoNote,
  LanguageToggle,
  ListRow,
  SectionHeader,
  TopBar,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { ROUTES } from '../../navigation/routes';

// The divyabraj.com header logo, same as the Home header circle.
const LOGO = require('../../assets/images/brand/braj-logo.png');

export const PRIVACY_URL = 'https://www.divyabraj.com/privacy';

/** Headings the sections are grouped under, in order (More screen and drawer). */
export const MORE_GROUPS = [
  { id: 'explore', hi: 'ब्रज को जानें', en: 'Explore Braj' },
  { id: 'app', hi: 'सहायता व सेटिंग्स', en: 'Help & settings' },
];

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
    icon: 'festival',
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
    subHi: 'नाम जप · फ़ोन की आवाज़ में',
    subEn: "Naam jap · in your phone's voice",
  },
  {
    id: 'help',
    group: 'app',
    icon: 'phone',
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
        <TopBar
          title={isHindi ? 'और देखें' : 'Explore more'}
          subtitle={isHindi ? 'राधे राधे · ब्रज में आपका साथी' : 'Radhe Radhe · your companion in Braj'}
          right={<LanguageToggle />}
        />

        <View style={styles.body}>
          {MORE_GROUPS.map((group) => (
            <View key={group.id}>
              <SectionHeader title={isHindi ? group.hi : group.en} />
              <Card style={styles.listCard}>
                {sectionsInGroup(group.id).map((item, index) => (
                  <View key={item.id}>
                    {index > 0 ? (
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    ) : null}
                    <ListRow
                      icon={item.icon}
                      title={isHindi ? item.hi : item.en}
                      subtitle={isHindi ? item.subHi : item.subEn}
                      onPress={() => openSection(navigate, item)}
                      right={
                        item.url ? <Icon name="externalLink" size={20} color={colors.muted} /> : undefined
                      }
                    />
                  </View>
                ))}
              </Card>
            </View>
          ))}

          <InfoNote>
            {isHindi
              ? 'कोई खाता नहीं चाहिए। आराम से देखें — सहेजे मंदिर और आपकी पसंद इसी फ़ोन पर रहती हैं।'
              : 'No account needed. Explore freely; saved temples and preferences stay on this phone.'}
          </InfoNote>

          <View style={styles.footer}>
            <View style={[styles.footerIcon, { backgroundColor: colors.surface, borderColor: colors.borderGold }]}>
              <Image source={LOGO} style={styles.footerLogo} resizeMode="cover" fadeDuration={0} accessibilityLabel="DivyaBraj" />
            </View>
            <AppText variant="h3" weight="700" color={colors.navy} align="center">
              श्री ब्रज दर्शन
            </AppText>
            <AppText variant="small" color={colors.muted} align="center">
              {isHindi ? 'DIVYABRAJ · शांत, सजग यात्रा के लिए' : 'DIVYABRAJ · Made for a mindful yatra'}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 24 },
  listCard: { paddingVertical: 4 },
  // Starts under the row text, past the 44px icon tile and its 14px gap.
  divider: { height: 1, marginLeft: 58 },
  footer: { alignItems: 'center', gap: 4, paddingTop: 8 },
  footerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  footerLogo: { width: 64, height: 64 },
});
