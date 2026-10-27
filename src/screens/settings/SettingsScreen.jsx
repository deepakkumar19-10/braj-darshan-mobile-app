import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { AppHeader, MorpankhIcon } from '../../components/common';
import { useDrawer } from '../../context/DrawerContext';
import audioService from '../../services/audioService';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t, isHindi } = useLanguage();
  const { openDrawer } = useDrawer();

  const [aartiAlerts, setAartiAlerts] = useState(true);
  const [chantOnLaunch, setChantOnLaunch] = useState(true);
  const [highQualityAudio, setHighQualityAudio] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const s = await storageService.getSettings();
      if (s) {
        if (typeof s.aartiAlerts === 'boolean') setAartiAlerts(s.aartiAlerts);
        if (typeof s.chantEnabled === 'boolean') setChantOnLaunch(s.chantEnabled);
        if (typeof s.highQualityAudio === 'boolean') setHighQualityAudio(s.highQualityAudio);
      }
    }
    loadSettings();
  }, []);

  const updateSetting = async (key, val) => {
    const s = await storageService.getSettings();
    const updated = { ...s, [key]: val };
    await storageService.saveSettings(updated);
  };

  const handleTestChant = async () => {
    await audioService.speakChant(isHindi ? 'राधे राधे' : 'Radhe Radhe');
  };

  const handleClearCache = () => {
    Alert.alert(
      isHindi ? 'कैश डेटा साफ़ करें' : 'Clear Cache',
      isHindi
        ? 'क्या आप स्थानीय अस्थायी डेटा को ताज़ा करना चाहते हैं? आपकी दर्शन सूची सुरक्षित रहेगी।'
        : 'Do you want to refresh cached data? Your wishlist will remain safe.',
      [
        { text: isHindi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: isHindi ? 'साफ़ करें' : 'Clear',
          onPress: async () => {
            const result = await storageService.clearCache();
            Alert.alert(
              result.success ? (isHindi ? 'सफल' : 'Success') : (isHindi ? 'त्रुटि' : 'Error'),
              result.success
                ? t('settings.cacheCleared', 'कैश डेटा सफलतापूर्वक साफ़ हुआ!')
                : (isHindi ? 'कैश साफ़ नहीं हो सका। कृपया दोबारा कोशिश करें।' : 'Could not clear the cache. Please try again.')
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AppHeader
        title={t('settings.title', 'सेटिंग्स')}
        subtitle={t('settings.subtitle', 'ऐप प्राथमिकताएं एवं ऑफलाइन डेटा')}
        showBack={false}
        leftAction={
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openDrawer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.menuIcon, { color: colors.navy }]}>☰</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Notifications */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.navy }]}>
            🔔 {t('settings.notifications', 'सूचनाएं')}
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('settings.aartiAlerts', 'दैनिक आरती व संध्या स्मरण')}
              </Text>
              <Text style={[styles.settingDesc, { color: colors.muted }]}>
                {isHindi ? 'बांके बिहारी व द्वारकाधीश आरती समय पूर्व सूचना' : 'Alerts before Banke Bihari & Dwarkadhish Aarti'}
              </Text>
            </View>
            <Switch
              value={aartiAlerts}
              onValueChange={(val) => {
                setAartiAlerts(val);
                updateSetting('aartiAlerts', val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={aartiAlerts ? '#FFFFFF' : '#F4F4F5'}
            />
          </View>
        </View>

        {/* Section: Audio Preferences */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.navy }]}>
            🎶 {t('settings.audioPref', 'भक्ति संगीत प्राथमिकताएं')}
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('settings.chantOnLaunch', 'ऐप खोलने पर "राधे राधे" जयकारा')}
              </Text>
              <Text style={[styles.settingDesc, { color: colors.muted }]}>
                {isHindi ? 'नेत्र-सुखद आध्यात्मिक स्वागत ध्वनि' : 'Spiritual welcome chant upon app launch'}
              </Text>
            </View>
            <Switch
              value={chantOnLaunch}
              onValueChange={(val) => {
                setChantOnLaunch(val);
                updateSetting('chantEnabled', val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={chantOnLaunch ? '#FFFFFF' : '#F4F4F5'}
            />
          </View>

          {chantOnLaunch && (
            <TouchableOpacity
              style={[styles.testChantBtn, { backgroundColor: isDark ? colors.cardAlt : colors.primaryLight }]}
              onPress={handleTestChant}
              activeOpacity={0.7}
            >
              <Text style={[styles.testChantText, { color: colors.primary }]}>
                🔊 {isHindi ? '"राधे राधे" ध्वनि का परीक्षण करें' : 'Test "Radhe Radhe" Voice'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={[styles.settingRow, { marginTop: 14 }]}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('settings.highQualityAudio', 'उच्च गुणवत्ता भजन ऑडियो')}
              </Text>
              <Text style={[styles.settingDesc, { color: colors.muted }]}>
                {isHindi ? 'स्पष्ट ध्वनि एवं संपूर्ण पद' : 'Lossless devotional bitrate'}
              </Text>
            </View>
            <Switch
              value={highQualityAudio}
              onValueChange={(val) => {
                setHighQualityAudio(val);
                updateSetting('highQualityAudio', val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={highQualityAudio ? '#FFFFFF' : '#F4F4F5'}
            />
          </View>
        </View>

        {/* Section: Storage & Cache */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.navy }]}>
            💾 {t('settings.offlineStorage', 'ऑफलाइन डेटा एवं कैश')}
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('settings.clearCache', 'कैश डेटा साफ़ करें')}
              </Text>
              <Text style={[styles.settingDesc, { color: colors.muted }]}>
                {t('settings.clearCacheDesc', 'दर्शन सूची सुरक्षित रखते हुए स्थानीय डेटा ताज़ा करें')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.clearPill, { borderColor: colors.primary }]}
              onPress={handleClearCache}
              activeOpacity={0.7}
            >
              <Text style={[styles.clearPillText, { color: colors.primary }]}>
                {isHindi ? 'साफ़ करें' : 'Clear'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: About & Trust */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.aboutHeader}>
            <View style={[styles.aboutIconWrap, { backgroundColor: colors.primaryLight }]}>
              <MorpankhIcon size={32} />
            </View>
            <View>
              <Text style={[styles.aboutTitle, { color: colors.navy }]}>
                {isHindi ? 'श्री ब्रज दर्शन' : 'Braj Darshan'}
              </Text>
              <Text style={[styles.aboutVersion, { color: colors.primary }]}>
                v1.0.0 • {t('settings.architecture', 'React Native New Architecture')}
              </Text>
            </View>
          </View>

          <Text style={[styles.aboutDescText, { color: colors.textSecondary }]}>
            {t(
              'settings.aboutDesc',
              'मथुरा, वृन्दावन, गोवर्धन, बरसाना और गोकुल धाम के संपूर्ण दर्शन हेतु एक प्रामाणिक डिजिटल साथी।'
            )}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.linkList}>
            <TouchableOpacity
              style={styles.infoLinkRow}
              onPress={() =>
                Alert.alert(
                  isHindi ? 'गोपनीयता नीति' : 'Privacy Policy',
                  isHindi
                    ? 'श्री ब्रज दर्शन ऐप किसी भी व्यक्तिगत डेटा को ट्रैक या साझा नहीं करता है। आपकी दर्शन सूची केवल आपके डिवाइस पर सुरक्षित रूप से संग्रहित रहती है।'
                    : 'Braj Darshan does not track or share personal data. Your wishlist remains stored privately on your device.'
                )
              }
            >
              <Text style={[styles.infoLinkText, { color: colors.text }]}>
                📜 {t('settings.privacy', 'गोपनीयता नीति')}
              </Text>
              <Text style={[styles.linkArrow, { color: colors.muted }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoLinkRow}
              onPress={() =>
                Alert.alert(
                  isHindi ? 'तीर्थ सेवा नियम' : 'Terms of Service',
                  isHindi
                    ? 'सभी आरती समय व पंचांग गणना वैदिक सिद्धांतों पर आधारित हैं। विशेष पर्वों पर मंदिर प्रबंधन द्वारा समय में परिवर्तन संभव है।'
                    : 'All aarti timings and panchang calculations are based on Vedic principles. Timings may vary on festival days per temple trust guidelines.'
                )
              }
            >
              <Text style={[styles.infoLinkText, { color: colors.text }]}>
                ⚖️ {t('settings.terms', 'तीर्थ सेवा नियम व शर्तें')}
              </Text>
              <Text style={[styles.linkArrow, { color: colors.muted }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sacred Footer Signature */}
        <View style={styles.sacredFooter}>
          <Text style={[styles.footerChant, { color: colors.primary }]}>॥ राधे राधे ॥</Text>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            श्री कृष्णाय नमः • {t('settings.allRights', 'सर्वाधिकार सुरक्षित।')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  settingTextCol: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  testChantBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  testChantText: {
    fontSize: 13,
    fontWeight: '700',
  },
  clearPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44, // 44pt touch target
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  aboutIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  aboutVersion: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  aboutDescText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  linkList: {
    gap: 8,
  },
  infoLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  infoLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  linkArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  sacredFooter: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerChant: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
