import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import {
  AppText,
  StitchHeader,
  StitchTag,
} from '../../components/common';
import { templeAssets, placeAssets } from '../../utils/imageAssets';
import { ROUTES } from '../../navigation/routes';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi, setLanguage } = useLanguage();
  const { user, isGuest, logout } = useAuth();
  const { favorites } = useFavorites();

  // Audio toggles
  const [ambientChanting, setAmbientChanting] = useState(true);
  const [bellShankhSound, setBellShankhSound] = useState(true);

  // Notification toggles
  const [vratReminders, setVratReminders] = useState(true);
  const [aartiReminders, setAartiReminders] = useState(true);
  const [rahuKaalAlert, setRahuKaalAlert] = useState(true);

  // Script selection
  const [selectedLang, setSelectedLang] = useState(isHindi ? 'hi' : 'en');

  const handleLangChange = (langCode) => {
    setSelectedLang(langCode);
    if (langCode === 'hi' || langCode === 'en') {
      setLanguage(langCode);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Download Braj Darshan App — your authentic spiritual guide for Mathura, Vrindavan, Govardhan & Barsana with live aarti timetables, Vedic panchang, and parikrama maps!',
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadOfflinePack = () => {
    Alert.alert(
      isHindi ? 'ऑफलाइन दर्शन पैक डाउनलोड' : 'Download Offline Darshan Pack',
      isHindi
        ? '58.4 MB का सम्पूर्ण ब्रज ऑफलाइन डेटा (84 कोस मैप्स, आरती समय सारणी व आपातकालीन हेल्पलाइन) डाउनलोड किया जा रहा है।'
        : 'Downloading 58.4 MB complete Braj offline pack including 84-kos GPS maps, certified aarti schedules & emergency directory.',
      [{ text: isHindi ? 'उत्तम' : 'Download', style: 'default' }]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Stitch Standard Header */}
      <StitchHeader
        title={isHindi ? 'श्री ब्रज दर्शन' : 'Shri Braj Darshan'}
        subtitle={isHindi ? 'मथुरा • वृन्दावन • गोवर्धन' : 'Mathura • Vrindavan • Govardhan'}
        wishlistCount={favorites.length}
        onWishlistPress={() => navigation.navigate(ROUTES.FAVORITES)}
        onProfilePress={() => {}}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Devotee Card */}
        <View
          style={[
            styles.devoteeCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <View style={styles.devoteeAvatarWrap}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <AppText variant="h1" color="#FFFFFF">
                ॐ
              </AppText>
            </View>
            <View style={styles.verifiedCheck}>
              <AppText variant="micro" color="#FFFFFF">
                ✓
              </AppText>
            </View>
          </View>

          <AppText variant="h1" color={colors.navy} style={styles.devoteeName}>
            {user?.name || (isHindi ? 'राघवेंद्र जोशी' : 'Raghavendra Joshi')}
          </AppText>

          <View style={[styles.devoteeRoleTag, { backgroundColor: '#FFEDD5' }]}>
            <AppText variant="micro" weight="800" color="#C2410C">
              🛕 {isHindi ? 'ब्रज अनुरागी (Devotee Yatri)' : 'ब्रज अनुरागी (Devotee Yatri)'}
            </AppText>
          </View>

          <AppText variant="caption" color={colors.textSecondary} style={styles.devoteeLocation}>
            📍 {isHindi ? 'पुणे, महाराष्ट्र' : 'Pune, Maharashtra'} • {isHindi ? 'गत यात्रा: शरद पूर्णिमा 2025' : 'Last visited: Sharad Purnima 2025'}
          </AppText>

          {/* 3 Stat Tiles */}
          <View style={styles.statsRow}>
            <View style={[styles.statTile, { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF' }]}>
              <AppText variant="h2" weight="800" color="#1D4ED8">
                8
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi ? 'सहेजी गई यात्राएं' : 'Saved Itineraries'}
              </AppText>
            </View>

            <View style={[styles.statTile, { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF' }]}>
              <AppText variant="h2" weight="800" color={colors.primary}>
                {Math.max(favorites.length, 14)}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi ? 'प्रिय मंदिर' : 'Favorite Temples'}
              </AppText>
            </View>

            <View style={[styles.statTile, { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF' }]}>
              <AppText variant="h2" weight="800" color="#7C3AED">
                6
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi ? 'प्रसाद बुकमार्क' : 'Prasad Bookmarks'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Saved Braj Darshan (Wishlist) Carousel */}
        <View style={styles.wishlistSection}>
          <View style={styles.wishlistHeader}>
            <AppText variant="body" weight="800" color={colors.navy}>
              ❤️ {isHindi ? 'सहेजे गए दर्शन (Wishlist)' : 'Saved Braj Darshan (Wishlist)'}
            </AppText>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.FAVORITES)}>
              <AppText variant="caption" weight="700" color={colors.primary}>
                {isHindi ? 'सभी देखें (14) ›' : 'View All (14) ›'}
              </AppText>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wishlistScroll}>
            {/* Wishlist item 1 */}
            <TouchableOpacity
              style={[styles.wishlistCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}
              onPress={() => navigation.navigate(ROUTES.TEMPLE_DETAIL, { id: 1 })}
              activeOpacity={0.85}
            >
              <View style={styles.wishlistImageWrap}>
                <Image source={templeAssets[1]} style={styles.wishlistImage} resizeMode="cover" />
                <View style={styles.wishlistTownPill}>
                  <AppText variant="micro" weight="700" color="#FFFFFF">
                    {isHindi ? 'वृन्दावन' : 'Vrindavan'}
                  </AppText>
                </View>
              </View>
              <View style={styles.wishlistInfo}>
                <AppText variant="caption" weight="800" color={colors.navy}>
                  {isHindi ? 'श्री बांके बिहारी जी' : 'Shri Banke Bihari Ji'}
                </AppText>
                <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  🕐 {isHindi ? 'संध्या आरती • 04:30 PM' : 'Sandhya Aarti • 04:30 PM'}
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Wishlist item 2 */}
            <TouchableOpacity
              style={[styles.wishlistCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}
              onPress={() => navigation.navigate(ROUTES.YATRA)}
              activeOpacity={0.85}
            >
              <View style={styles.wishlistImageWrap}>
                <Image source={placeAssets[1]} style={styles.wishlistImage} resizeMode="cover" />
                <View style={styles.wishlistTownPill}>
                  <AppText variant="micro" weight="700" color="#FFFFFF">
                    {isHindi ? 'मथुरा' : 'Mathura'}
                  </AppText>
                </View>
              </View>
              <View style={styles.wishlistInfo}>
                <AppText variant="caption" weight="800" color={colors.navy}>
                  {isHindi ? '3-दिवसीय सम्पूर्ण यात्रा' : '3-Day Quintessential Yatra'}
                </AppText>
                <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  🧭 {isHindi ? 'मथुरा • वृन्दावन • गोवर्धन' : 'Mathura, Vrindavan, Govardhan'}
                </AppText>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Devotional Audio & Soundscapes Controls */}
        <View
          style={[
            styles.settingsGroupCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <View style={styles.groupHeaderRow}>
            <View style={[styles.groupIconWrap, { backgroundColor: '#FFEDD5' }]}>
              <AppText variant="caption">🔔</AppText>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText variant="body" weight="800" color={colors.navy}>
                {isHindi ? 'भक्ति संगीत एवं ऑडियो' : 'Devotional Audio & Soundscapes'}
              </AppText>
            </View>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <AppText variant="caption" weight="700" color={colors.navy}>
                {isHindi ? 'राधे-राधे ध्यान धुन (Ambient Chanting)' : 'Radhe Radhe Ambient Chanting'}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi
                  ? 'मार्गदर्शिका पढ़ते समय पृष्ठभूमि में मधुर ध्यानमयी धुन'
                  : 'Plays soft meditative temple soundscape when browsing routes'}
              </AppText>
            </View>
            <Switch
              value={ambientChanting}
              onValueChange={setAmbientChanting}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: isDark ? colors.border : '#F3F4F6' }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <AppText variant="caption" weight="700" color={colors.navy}>
                {isHindi ? 'मंदिर घंटी व शंख ध्वनि' : 'Temple Bell & Shankh Sound'}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi
                  ? 'आरती का समय होने पर शुभ शंख व कांस्य घंटी ध्वनि'
                  : 'Auspicious sound effect when Aarti window opens'}
              </AppText>
            </View>
            <Switch
              value={bellShankhSound}
              onValueChange={setBellShankhSound}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Darshan & Panchang Reminders */}
        <View
          style={[
            styles.settingsGroupCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <View style={styles.groupHeaderRow}>
            <View style={[styles.groupIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <AppText variant="caption">🗓️</AppText>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText variant="body" weight="800" color={colors.navy}>
                {isHindi ? 'दर्शन एवं पंचांग सूचनाएं' : 'Aarti & Auspicious Timings'}
              </AppText>
            </View>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <AppText variant="caption" weight="700" color={colors.navy}>
                {isHindi ? 'एकादशी एवं पूर्णिमा व्रत स्मरण' : 'Ekadashi & Purnima Vrat Reminders'}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi
                  ? 'व्रत से 1 दिन पूर्व एवं पारण समय पर सटीक सूचना'
                  : 'Timely notification 1 day prior and on Parana timings'}
              </AppText>
            </View>
            <Switch
              value={vratReminders}
              onValueChange={setVratReminders}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: isDark ? colors.border : '#F3F4F6' }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <AppText variant="caption" weight="700" color={colors.navy}>
                {isHindi ? 'लाइव पट खुलने की पूर्व चेतावनी' : 'Live Aarti Pat-Open Reminders'}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi
                  ? 'मंगला, राजभोग व संध्या आरती से 30 मिनट पूर्व चेतावनी'
                  : 'Alert 30 mins before Mangala, Rajbhog & Sandhya Aarti'}
              </AppText>
            </View>
            <Switch
              value={aartiReminders}
              onValueChange={setAartiReminders}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: isDark ? colors.border : '#F3F4F6' }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <AppText variant="caption" weight="700" color={colors.navy}>
                {isHindi ? 'राहु काल दैनिक चेतावनी' : 'Rahu Kaal Daily Warning Alert'}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi
                  ? 'नया कार्य या यात्रा टालने हेतु राहु काल प्रारंभ से पूर्व सूचना'
                  : 'Notify before Rahu Kaal begins to avoid new travels'}
              </AppText>
            </View>
            <Switch
              value={rahuKaalAlert}
              onValueChange={setRahuKaalAlert}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Language & Sacred Script Selector */}
        <View
          style={[
            styles.settingsGroupCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <View style={styles.groupHeaderRow}>
            <View style={[styles.groupIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <AppText variant="caption">🌐</AppText>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText variant="body" weight="800" color={colors.navy}>
                {isHindi ? 'भाषा एवं पवित्र लिपि' : 'Language & Sacred Script'}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi
                  ? 'मंदिर श्लोक, आरती एवं मार्गदर्शिका अपनी भाषा में देखें:'
                  : 'Display temple shlokas, aarti lyrics, and directions in selected script:'}
              </AppText>
            </View>
          </View>

          <View style={styles.langPillsRow}>
            <TouchableOpacity
              style={[
                styles.langPill,
                selectedLang === 'en'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: isDark ? colors.cardAlt : '#F3F4F6', borderColor: 'transparent' },
              ]}
              onPress={() => handleLangChange('en')}
            >
              <AppText variant="caption" weight="700" color={selectedLang === 'en' ? '#FFFFFF' : colors.text}>
                English (EN)
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langPill,
                selectedLang === 'hi'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: isDark ? colors.cardAlt : '#F3F4F6', borderColor: 'transparent' },
              ]}
              onPress={() => handleLangChange('hi')}
            >
              <AppText variant="caption" weight="700" color={selectedLang === 'hi' ? '#FFFFFF' : colors.text}>
                हिन्दी (HI)
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langPill,
                selectedLang === 'gu'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: isDark ? colors.cardAlt : '#F3F4F6', borderColor: 'transparent' },
              ]}
              onPress={() => handleLangChange('gu')}
            >
              <AppText variant="caption" weight="700" color={selectedLang === 'gu' ? '#FFFFFF' : colors.text}>
                ગુજરાતી (Guj)
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Braj Offline Darshan Pack Card */}
        <View
          style={[
            styles.offlinePackCard,
            {
              backgroundColor: isDark ? colors.cardAlt : '#EFF6FF',
              borderColor: '#BFDBFE',
            },
          ]}
        >
          <View style={styles.offlineHeader}>
            <View style={[styles.offlineIconBox, { backgroundColor: colors.primary }]}>
              <AppText variant="h2" color="#FFFFFF">
                🛕
              </AppText>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText variant="body" weight="800" color={colors.navy}>
                {isHindi ? 'सम्पूर्ण ब्रज ऑफलाइन दर्शन पैक' : 'Braj Offline Darshan Pack'}
              </AppText>
              <View style={[styles.alwaysWorksBadge, { backgroundColor: '#DCFCE7' }]}>
                <AppText variant="micro" weight="700" color="#15803D">
                  ⚡ Always Works Offline
                </AppText>
              </View>
            </View>
          </View>

          <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: 10, lineHeight: 18 }}>
            {isHindi
              ? '84 कोस ब्रज के ऑफलाइन जीपीएस नक्शे, सत्यापित आरती समय सारणी एवं आपातकालीन तीर्थ हेल्पलाइन डायरेक्टरी।'
              : 'Offline GPS maps of 84-kos Braj, verified aarti timetables, and emergency pilgrim helpline directory.'}
          </AppText>

          <View style={styles.packSizeRow}>
            <AppText variant="micro" weight="700" color="#1D4ED8">
              📦 58.4 MB • Updated Yesterday
            </AppText>
          </View>

          <TouchableOpacity
            style={[styles.downloadPackBtn, { backgroundColor: colors.primary }]}
            onPress={handleDownloadOfflinePack}
            activeOpacity={0.85}
          >
            <AppText variant="caption" weight="800" color="#FFFFFF">
              📥 {isHindi ? 'डाउनलोड ऑफलाइन पैक (Download)' : 'Download Offline Pack (डाउनलोड करें)'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Share App Button */}
        <TouchableOpacity
          style={[styles.shareAppBtn, { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' }]}
          onPress={handleShareApp}
          activeOpacity={0.85}
        >
          <AppText variant="caption" weight="800" color="#C2410C">
            🔗 {isHindi ? 'भक्तों के साथ ब्रज दर्शन साझा करें 🪷' : 'Share Braj Darshan with Devotees 🪷'}
          </AppText>
        </TouchableOpacity>

        {/* App Version & Footer */}
        <View style={styles.footerSection}>
          <AppText variant="micro" weight="700" color={colors.textSecondary}>
            APP VERSION 12.4.0 (VEDIC CALIBRATED 2026)
          </AppText>
          <AppText variant="micro" color={colors.primary} style={{ marginTop: 4 }}>
            Developed with heartfelt devotion for Braj Yatri Seva ♡
          </AppText>
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
    paddingTop: 12,
  },
  devoteeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 18,
  },
  devoteeAvatarWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  devoteeName: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 4,
  },
  devoteeRoleTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    marginBottom: 6,
  },
  devoteeLocation: {
    fontSize: 12,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  statTile: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  wishlistSection: {
    marginBottom: 18,
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  wishlistScroll: {
    gap: 12,
  },
  wishlistCard: {
    width: 170,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  wishlistImageWrap: {
    height: 90,
    position: 'relative',
  },
  wishlistImage: {
    width: '100%',
    height: '100%',
  },
  wishlistTownPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wishlistInfo: {
    padding: 8,
  },
  settingsGroupCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  langPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  langPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  offlinePackCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  offlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  offlineIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alwaysWorksBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  packSizeRow: {
    marginBottom: 12,
  },
  downloadPackBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareAppBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  footerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
});
