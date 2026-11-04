/**
 * Braj Darshan - Profile
 * Accounts are not available in this app (see src/context/AuthContext.jsx), so this
 * screen says so plainly and points to what a profile would hold: the saved list
 * and the settings (plus About, which lives in Settings). Nothing here pretends to
 * be a signed-in account.
 * Layout from the Nov 2026 redesign (Claude Design "Profile"): one centred card that
 * explains there is no sign-in, then the "On this phone" list.
 */

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Card,
  LanguageToggle,
  ListRow,
  TopBar,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { ROUTES } from '../../navigation/routes';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate(ROUTES.MORE);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title={isHindi ? 'प्रोफ़ाइल' : 'Profile'} onBack={goBack} right={<LanguageToggle />} />

        <View style={styles.body}>
          <Card style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primaryLight }]}>
              <Icon name="people" size={38} color={colors.primary} />
            </View>
            <AppText variant="h3" weight="700" color={colors.navy} align="center" accessibilityRole="header">
              {isHindi ? 'बिना साइन-इन के सब कुछ' : 'Everything, without signing in'}
            </AppText>
            <AppText variant="body" color={colors.text} align="center">
              {isHindi
                ? 'खाते अभी उपलब्ध नहीं हैं। ऐप में सब कुछ बिना साइन-इन के चलता है — आपके सहेजे मंदिर, भाषा और थीम इसी फ़ोन पर रहते हैं।'
                : 'Accounts are not available yet. Everything in the app works without signing in — your saved temples, language and theme stay on this phone.'}
            </AppText>
          </Card>

          <View style={styles.section}>
            <AppText variant="small" weight="700" color={colors.muted} accessibilityRole="header">
              {isHindi ? 'इस फ़ोन पर' : 'On this phone'}
            </AppText>
            <Card padded={false}>
              <View style={styles.rowPad}>
                <ListRow
                  icon="heart"
                  title={isHindi ? 'सहेजे गए' : 'Saved'}
                  subtitle={isHindi ? 'आपके सहेजे मंदिर' : 'Your saved temples'}
                  onPress={() => navigation.navigate(ROUTES.FAVORITES)}
                />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.rowPad}>
                <ListRow
                  icon="settings"
                  title={isHindi ? 'सेटिंग्स' : 'Settings'}
                  subtitle={isHindi ? 'भाषा, थीम व ऑफ़लाइन डेटा' : 'Language, theme and offline data'}
                  onPress={() => navigation.navigate(ROUTES.SETTINGS)}
                />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.rowPad}>
                <ListRow
                  icon="info"
                  title={isHindi ? 'परिचय' : 'About'}
                  subtitle={isHindi ? 'श्री ब्रज दर्शन · DIVYABRAJ द्वारा' : 'Shri Braj Darshan, by DIVYABRAJ'}
                  onPress={() => navigation.navigate(ROUTES.SETTINGS, { section: 'about' })}
                />
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 22 },
  hero: { alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 20, borderRadius: 22 },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: 10 },
  rowPad: { paddingHorizontal: 14 },
  divider: { height: 1 },
});
