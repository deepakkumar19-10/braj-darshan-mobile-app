import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import {
  AppText,
  StitchHeader,
  StitchTag,
  StitchPill,
} from '../../components/common';
import { placeAssets, templeAssets } from '../../utils/imageAssets';
import { ROUTES } from '../../navigation/routes';
import placesData from '../../data/places.json';

export default function PlacesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'kunds' | 'ghats' | 'vans'

  const filterTabs = [
    { id: 'all', label: isHindi ? 'सभी (All)' : 'All Sacred Sites' },
    { id: 'kunds', label: isHindi ? '💧 पवित्र कुंड' : '💧 Sacred Kunds' },
    { id: 'ghats', label: isHindi ? '🏛️ ऐतिहासिक घाट' : '🏛️ Historic Ghats' },
    { id: 'vans', label: isHindi ? '🌿 लीला वन' : '🌿 Leela Vana' },
  ];

  const handleOpenMaps = (placeName) => {
    const query = encodeURIComponent(`${placeName} Braj`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handleMahatmya = (title, mahatmya) => {
    Alert.alert(
      isHindi ? `${title} महात्म्य` : `${title} Mahatmya`,
      mahatmya,
      [{ text: isHindi ? 'प्रणाम' : 'Close', style: 'default' }]
    );
  };

  const handleOpenInteractiveMap = () => {
    Alert.alert(
      isHindi ? 'इंटरैक्टिव कुंड तीर्थ मैप' : 'Interactive Kund Pilgrimage Map',
      isHindi
        ? 'गोवर्धन, राधा कुंड, मानसी गंगा, कुसुम सरोवर एवं 24 प्रमुख कुंडों के ऑफलाइन जीपीएस पिन लोड किए जा रहे हैं।'
        : 'Loading offline GPS pins for Govardhan, Radha Kund, Manasi Ganga, Kusum Sarovar and 24 holy Braj sarovars.',
      [
        {
          text: isHindi ? 'मैप देखें' : 'View Map',
          onPress: () => {
            Linking.openURL('https://www.google.com/maps/search/?api=1&query=Radha+Kund+Kusum+Sarovar+Govardhan');
          },
        },
        { text: isHindi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
      ]
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
        onProfilePress={() => navigation.navigate(ROUTES.PROFILE)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Top Tag & Screen Title */}
        <View style={styles.titleSection}>
          <StitchTag
            text={isHindi ? '🛕 पवित्र कुंड एवं घाट गाइड' : 'SACRED KUND & GHAT GUIDE'}
            color="#C2410C"
            backgroundColor="#FFEDD5"
          />
          <AppText variant="h1" color={colors.navy} style={styles.mainTitle}>
            {isHindi ? 'पवित्र कुंड एवं पावन घाट' : 'Sacred Kunds & Ghats'}
          </AppText>
          <AppText variant="body" weight="700" color={colors.primary} style={styles.hindiSubtitle}>
            {isHindi ? 'पवित्र सरोवर व यमुना घाट' : 'पवित्र सरोवर व यमुना घाट'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.descText}>
            {isHindi
              ? 'ब्रज के पावन जल, कालातीत प्रस्तर सोपानों एवं श्री राधा-कृष्ण की नित्य लीला स्थली में डुबकी लगाएं।'
              : 'Immerse in the sanctified waters, timeless stone steps, and divine pastime spots of Braj.'}
          </AppText>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
        >
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <StitchPill
                key={tab.id}
                label={tab.label}
                selected={isSelected}
                onPress={() => setSelectedFilter(tab.id)}
              />
            );
          })}
        </ScrollView>

        {/* 3 Quick Stat Counter Tiles */}
        <View style={styles.statsRow}>
          <View style={[styles.statTile, { backgroundColor: isDark ? colors.card : '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <AppText variant="h2" weight="800" color="#1D4ED8">
              💧 24+
            </AppText>
            <AppText variant="caption" weight="700" color={colors.navy} style={{ marginTop: 2 }}>
              {isHindi ? 'पवित्र कुंड' : 'Holy Kunds'}
            </AppText>
          </View>

          <View style={[styles.statTile, { backgroundColor: isDark ? colors.card : '#FEF3C7', borderColor: '#FDE68A' }]}>
            <AppText variant="h2" weight="800" color="#B45309">
              🏛️ 33
            </AppText>
            <AppText variant="caption" weight="700" color={colors.navy} style={{ marginTop: 2 }}>
              {isHindi ? 'पावन घाट' : 'Sanctified Ghats'}
            </AppText>
          </View>

          <View style={[styles.statTile, { backgroundColor: isDark ? colors.card : '#F3E8FF', borderColor: '#DDD6FE' }]}>
            <AppText variant="h2" weight="800" color="#7C3AED">
              🧭 12
            </AppText>
            <AppText variant="caption" weight="700" color={colors.navy} style={{ marginTop: 2 }}>
              {isHindi ? 'पावन वन' : 'Sacred Vans'}
            </AppText>
          </View>
        </View>

        {/* Sacred Snan Guidelines Card */}
        <View
          style={[
            styles.guidelinesCard,
            {
              backgroundColor: isDark ? colors.cardAlt : '#FFF7ED',
              borderColor: '#FED7AA',
            },
          ]}
        >
          <View style={styles.guidelinesHeader}>
            <AppText variant="body" color="#EA580C">
              📜
            </AppText>
            <AppText variant="body" weight="700" color={colors.navy} style={{ marginLeft: 8 }}>
              {isHindi ? 'पवित्र स्नान मर्यादा एवं नियम' : 'Sacred Snan Guidelines (स्नान मर्यादा)'}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textSecondary} style={styles.guidelinesText}>
            {isHindi
              ? 'पावन जल की दिव्यता सदैव बनाए रखें। ब्रज के सभी सरोवरों में साबुन, तेल और डिटर्जेंट का प्रयोग पूर्णतः वर्जित है। घाट सं. 2 के समीप माताओं-बहनों के लिए सुरक्षित वस्त्र परिवर्तन कक्ष उपलब्ध हैं।'
              : 'Always maintain sanctity of holy waters. Soap and detergents are strictly prohibited in all Braj sarovars. Dedicated changing rooms are open for ladies near Ghat No. 2.'}
          </AppText>
        </View>

        {/* Card 1: Radha Kund & Shyam Kund */}
        {(selectedFilter === 'all' || selectedFilter === 'kunds') && (
          <View
            style={[
              styles.placeCard,
              {
                backgroundColor: isDark ? colors.card : '#FFFFFF',
                borderColor: isDark ? colors.border : '#E5E7EB',
              },
            ]}
          >
            <View style={styles.cardImageContainer}>
              <Image
                source={placeAssets[3]}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={[styles.cardTagBadge, { backgroundColor: '#FEF3C7' }]}>
                <AppText variant="micro" weight="800" color="#B45309">
                  {isHindi ? 'ब्रज मण्डल का सर्वोच्च पावन कुंड' : 'Most Sacred Kund in Braj Mandala'}
                </AppText>
              </View>

              <TouchableOpacity
                style={styles.favBtn}
                onPress={() => toggleFavorite('place-radha-kund')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <AppText variant="body" color={isFavorite('place-radha-kund') ? '#DC2626' : '#FFFFFF'}>
                  {isFavorite('place-radha-kund') ? '❤️' : '🤍'}
                </AppText>
              </TouchableOpacity>

              <View style={styles.imageBottomTitle}>
                <AppText variant="micro" weight="800" color="#FEF3C7">
                  AHOI ASHTAMI • SUPREME RAS
                </AppText>
                <AppText variant="h2" weight="800" color="#FFFFFF">
                  {isHindi ? 'श्री राधा कुंड एवं श्याम कुंड' : 'Radha Kund & Shyam Kund'}
                </AppText>
              </View>
            </View>

            <View style={styles.cardBody}>
              <AppText variant="caption" weight="600" color={colors.primary} style={{ marginBottom: 4 }}>
                📍 {isHindi ? 'गोवर्धन 21 किमी परिक्रमा • मथुरा से 24 किमी' : 'Govardhan 21 km Parikrama • 24 km from Mathura'}
              </AppText>

              <AppText variant="caption" color={colors.textSecondary} style={styles.cardDesc}>
                {isHindi
                  ? 'अरिष्टासुर वध के पश्चात श्री कृष्ण एवं श्री राधा रानी द्वारा प्रकट किए गए पावन कुंड। ब्रह्मांड में सबसे पवित्र जल स्नान माना जाता है, अहोई अष्टमी की मध्यरात्रि में विशेष स्नान फल।'
                  : 'Formed by Shri Krishna and Shri Radha Rani following the Aristasura episode. Revered as the supreme kund bath across the universe, blessed with intense sanctity on Ahoi Ashtami midnight.'}
              </AppText>

              {/* Badges */}
              <View style={styles.chipsRow}>
                <View style={[styles.detailChip, { backgroundColor: '#FEF3C7' }]}>
                  <AppText variant="micro" weight="700" color="#B45309">
                    ✨ {isHindi ? 'अहोई अष्टमी मध्यरात्रि स्नान' : 'Midnight Snan on Ahoi Ashtami'}
                  </AppText>
                </View>
                <View style={[styles.detailChip, { backgroundColor: '#EFF6FF' }]}>
                  <AppText variant="micro" weight="700" color="#1D4ED8">
                    🕒 {isHindi ? 'स्नान: 05:00 AM से 08:00 PM' : 'Snan: 05:00 AM to 08:00 PM'}
                  </AppText>
                </View>
                <View style={[styles.detailChip, { backgroundColor: '#FFEDD5' }]}>
                  <AppText variant="micro" weight="700" color="#C2410C">
                    💧 {isHindi ? 'पावन स्नान एवं आचमन' : 'Holy Snan & Achaman Jal'}
                  </AppText>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleOpenMaps('Radha Kund Govardhan')}
                  activeOpacity={0.85}
                >
                  <AppText variant="caption" weight="800" color="#FFFFFF">
                    🚗 {isHindi ? 'मार्ग देखें (GPS)' : 'Get Directions'}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { backgroundColor: isDark ? colors.cardAlt : '#FFF7ED' }]}
                  onPress={() =>
                    handleMahatmya(
                      'Radha Kund',
                      isHindi
                        ? 'पद्म पुराण अनुसार: जैसे श्री राधा रानी भगवान श्री कृष्ण को अत्यंत प्रिय हैं, वैसे ही उनका यह पावन कुंड भी श्री कृष्ण को परम प्रिय है। यहाँ स्नान से गोलोक धाम की प्राप्ति होती है।'
                        : 'According to Padma Purana: Just as Srimati Radharani is most dear to Sri Krishna, Her sacred kund is similarly most beloved to Him. Holy dip here bestows supreme divine love.'
                    )
                  }
                  activeOpacity={0.85}
                >
                  <AppText variant="caption" weight="700" color={colors.primary}>
                    📖 {isHindi ? 'महात्म्य' : 'Mahatmya'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Card 2: Kusum Sarovar */}
        {(selectedFilter === 'all' || selectedFilter === 'kunds') && (
          <View
            style={[
              styles.placeCard,
              {
                backgroundColor: isDark ? colors.card : '#FFFFFF',
                borderColor: isDark ? colors.border : '#E5E7EB',
              },
            ]}
          >
            <View style={styles.cardImageContainer}>
              <Image
                source={placeAssets[3]}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={[styles.cardTagBadge, { backgroundColor: '#EFF6FF' }]}>
                <AppText variant="micro" weight="800" color="#1D4ED8">
                  {isHindi ? 'ऐतिहासिक प्रस्तर स्थापत्य' : 'Historic Sandstone Heritage'}
                </AppText>
              </View>

              <TouchableOpacity
                style={styles.favBtn}
                onPress={() => toggleFavorite('place-kusum-sarovar')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <AppText variant="body" color={isFavorite('place-kusum-sarovar') ? '#DC2626' : '#FFFFFF'}>
                  {isFavorite('place-kusum-sarovar') ? '❤️' : '🤍'}
                </AppText>
              </TouchableOpacity>

              <View style={styles.imageBottomTitle}>
                <AppText variant="micro" weight="800" color="#FEF3C7">
                  ARCHITECTURAL SPLENDOR
                </AppText>
                <AppText variant="h2" weight="800" color="#FFFFFF">
                  {isHindi ? 'कुसुम सरोवर (Kusum Sarovar)' : 'Kusum Sarovar (कुसुम सरोवर)'}
                </AppText>
              </View>
            </View>

            <View style={styles.cardBody}>
              <AppText variant="caption" weight="600" color={colors.primary} style={{ marginBottom: 4 }}>
                📍 {isHindi ? 'राधा कुंड एवं गोवर्धन के मध्य' : 'Between Radha Kund & Govardhan, Mathura'}
              </AppText>

              <AppText variant="caption" color={colors.textSecondary} style={styles.cardDesc}>
                {isHindi
                  ? '460 फीट लंबा नक्काशीदार लाल बलुआ पत्थर का भव्य जलाशय और ऐतिहासिक छतरियां, जहां श्री राधा रानी पुष्प वाटिका से कदंब व चमेली के सुगंधित पुष्प चुनती थीं।'
                  : 'Spectacular 460-ft carved red sandstone reservoir with monumental royal chhatris, where Shri Radha collected fragrant wild Kadamba and chameli flowers for floral adornments.'}
              </AppText>

              <View style={styles.chipsRow}>
                <View style={[styles.detailChip, { backgroundColor: '#FFEDD5' }]}>
                  <AppText variant="micro" weight="700" color="#C2410C">
                    🌅 {isHindi ? 'सूर्यास्त प्रतिबिंब हेतु सर्वोत्तम' : 'Best Sunset Reflection Spot'}
                  </AppText>
                </View>
                <View style={[styles.detailChip, { backgroundColor: '#EFF6FF' }]}>
                  <AppText variant="micro" weight="700" color="#1D4ED8">
                    🕒 {isHindi ? '06:00 AM - 07:00 PM (प्रवेश निःशुल्क)' : '06:00 AM - 07:00 PM (Entry Free)'}
                  </AppText>
                </View>
                <View style={[styles.detailChip, { backgroundColor: '#F3E8FF' }]}>
                  <AppText variant="micro" weight="700" color="#7C3AED">
                    📷 {isHindi ? 'धरोहर छतरियां' : 'Heritage Chhatris'}
                  </AppText>
                </View>
              </View>

              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleOpenMaps('Kusum Sarovar Govardhan')}
                  activeOpacity={0.85}
                >
                  <AppText variant="caption" weight="800" color="#FFFFFF">
                    🚗 {isHindi ? 'मार्ग देखें' : 'Directions'}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF' }]}
                  onPress={() =>
                    handleMahatmya(
                      'Kusum Sarovar',
                      isHindi
                        ? 'यह सरोवर चैतन्य महाप्रभु के प्रिय षड्गोस्वामियों और राजा सूरजमल की स्मृति में बनी कलात्मक छतरियों के लिए विश्व विख्यात है।'
                        : 'Famous for its intricately painted ceiling frescoes and historical royal pavilions built by King Suraj Mal.'
                    )
                  }
                  activeOpacity={0.85}
                >
                  <AppText variant="caption" weight="700" color="#2563EB">
                    🔍 {isHindi ? 'विवरण देखें' : 'Explore Details'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Card 3: Vishram Ghat (Banner Style) */}
        {(selectedFilter === 'all' || selectedFilter === 'ghats') && (
          <View style={[styles.ghatBannerCard, { backgroundColor: colors.primary }]}>
            <View style={styles.ghatHeaderRow}>
              <View style={[styles.ghatTagBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <AppText variant="micro" weight="800" color="#FEF3C7">
                  {isHindi ? 'मथुरा का प्रधान तीर्थ घाट' : 'CENTRAL GHAT OF MATHURA'}
                </AppText>
              </View>
              <AppText variant="caption" color="#FFFFFF">
                🔔
              </AppText>
            </View>

            <AppText variant="h1" color="#FFFFFF" style={styles.ghatTitle}>
              {isHindi ? 'विश्राम घाट (Vishram Ghat)' : 'Vishram Ghat (विश्राम घाट)'}
            </AppText>

            <AppText variant="caption" color="#FFEDD5" style={{ marginBottom: 8 }}>
              📍 {isHindi ? 'मथुरा नगर केंद्र • पावन यमुना नदी तट' : 'Mathura City Heart • Bank of Holy Yamuna River'}
            </AppText>

            <AppText variant="caption" color="#FFFFFF" style={styles.ghatDesc}>
              {isHindi
                ? 'वह परम पावन घाट जहां कंस वध के उपरांत भगवान श्री कृष्ण ने विश्राम किया था। पारंपरिक मथुरा परिक्रमा का आरंभ एवं समापन बिंदु, विश्व प्रसिद्ध 25-दीप संध्या यमुना महारती का केंद्र।'
                : 'The premier holy ghat where Bhagwan Shri Krishna rested after defeating tyrant King Kamsa. Starting and culminating point of the traditional Mathura Parikrama, celebrated for its world-famous 25-diya evening Yamuna Maha Aarti.'}
            </AppText>

            {/* Info Tiles */}
            <View style={styles.ghatInfoGrid}>
              <View style={styles.ghatInfoTile}>
                <AppText variant="micro" weight="700" color="#7C2D12">
                  🪔 {isHindi ? 'दैनिक यमुना महाआरती: सायं 07:00 बजे' : 'Daily Yamuna Maha Aarti at 07:00 PM'}
                </AppText>
              </View>
              <View style={styles.ghatInfoTile}>
                <AppText variant="micro" weight="700" color="#7C2D12">
                  ⛵ {isHindi ? 'पवित्र नौका विहार उपलब्ध (₹50 - ₹100)' : 'Holy Boat Rides Available (₹50 - ₹100 per person)'}
                </AppText>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.ghatButtonsRow}>
              <TouchableOpacity
                style={[styles.ghatDarkBtn, { backgroundColor: '#7C2D12' }]}
                onPress={() =>
                  Alert.alert(
                    isHindi ? 'यमुना महाआरती समय' : 'Yamuna Maha Aarti Timings',
                    isHindi
                      ? 'प्रातः आरती: 07:15 AM\nसंध्या महाआरती: 07:00 PM\n(नौका विहार से आरती के दर्शन सर्वोत्तम रहते हैं)'
                      : 'Morning Aarti: 07:15 AM\nEvening Maha Aarti: 07:00 PM\n(Boat view offers the best experience)'
                  )
                }
                activeOpacity={0.85}
              >
                <AppText variant="caption" weight="800" color="#FFFFFF">
                  🔔 {isHindi ? 'आरती समय' : 'Aarti Timings'}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ghatWhiteBtn, { backgroundColor: '#FFFFFF' }]}
                onPress={() => handleOpenMaps('Vishram Ghat Mathura')}
                activeOpacity={0.85}
              >
                <AppText variant="caption" weight="800" color={colors.primary}>
                  🚗 {isHindi ? 'मार्ग देखें' : 'Get Directions'}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Interactive Kund Pilgrimage Map Footer Banner */}
        <TouchableOpacity
          style={[
            styles.interactiveMapBanner,
            { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF', borderColor: '#BFDBFE' },
          ]}
          onPress={handleOpenInteractiveMap}
          activeOpacity={0.85}
        >
          <View style={styles.mapBannerIcon}>
            <AppText variant="h2" color="#1D4ED8">
              🗺️
            </AppText>
          </View>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <AppText variant="body" weight="700" color={colors.navy}>
              {isHindi ? 'इंटरैक्टिव कुंड तीर्थ मैप' : 'Interactive Kund Pilgrimage Map'}
            </AppText>
            <AppText variant="micro" color={colors.textSecondary}>
              {isHindi ? 'ऑफलाइन जीपीएस मार्करों के साथ सभी पड़ाव देखें' : 'View offline stops with GPS markers'}
            </AppText>
          </View>
          <View style={[styles.openMapBtn, { backgroundColor: colors.primary }]}>
            <AppText variant="micro" weight="700" color="#FFFFFF">
              {isHindi ? 'खोलें ›' : 'Open ›'}
            </AppText>
          </View>
        </TouchableOpacity>
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
  titleSection: {
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: 8,
  },
  hindiSubtitle: {
    fontSize: 16,
    marginTop: 2,
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
  },
  filterPillsScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statTile: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  guidelinesCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  guidelinesText: {
    fontSize: 12,
    lineHeight: 18,
  },
  placeCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
  },
  cardImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTagBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBottomTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cardBody: {
    padding: 16,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  detailChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghatBannerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  ghatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ghatTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ghatTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 4,
  },
  ghatDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  ghatInfoGrid: {
    gap: 6,
    marginBottom: 14,
  },
  ghatInfoTile: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
  },
  ghatButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ghatDarkBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghatWhiteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interactiveMapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  mapBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openMapBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
