import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common';
import { placeAssets } from '../../utils/imageAssets';
import { ROUTES } from '../../navigation/routes';

export default function SmartPlannerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();

  // Step 1: Days Selection
  const [selectedDays, setSelectedDays] = useState(3);
  const [darshanWindow, setDarshanWindow] = useState('September 2026 (Sharad Navratri Season)');

  // Step 2: Pace Selection
  const [selectedPace, setSelectedPace] = useState('balanced'); // 'relaxed' | 'balanced' | 'fast_track'

  // Step 3: Must-Visit Sacred Experiences
  const [selectedExperiences, setSelectedExperiences] = useState([
    'banke_bihari',
    'janmabhoomi',
    'keshi_ghat',
    'govardhan',
  ]);

  const daysOptions = [
    { days: 1, label: isHindi ? '1 दिन' : '1 Day', sub: isHindi ? 'एक्सप्रेस' : 'Express' },
    { days: 2, label: isHindi ? '2 दिन' : '2 Days', sub: isHindi ? 'सप्ताहांत' : 'Weekend' },
    { days: 3, label: isHindi ? '3 दिन' : '3 Days', sub: isHindi ? 'संतुलित' : 'Balanced', popular: true },
    { days: 4, label: isHindi ? '4 दिन' : '4 Days', sub: isHindi ? 'गहन दर्शन' : 'Deep Darshan' },
    { days: 5, label: isHindi ? '5 दिन' : '5 Days', sub: isHindi ? 'घाट व कुंड' : 'Ghats & Kunds' },
    { days: 6, label: isHindi ? '6+ दिन' : '6+ Days', sub: isHindi ? '84 कोस परिक्रमा' : '84 Kos Parikrama' },
  ];

  const paceOptions = [
    {
      id: 'relaxed',
      title: isHindi ? 'Relaxed (आरामदायक)' : 'Relaxed (आरामदायक)',
      badge: isHindi ? 'वरिष्ठ एवं बच्चे' : 'Senior & Kids Friendly',
      desc: isHindi
        ? 'प्रतिदिन 2-3 प्रमुख मंदिर, न्यूनतम पैदल चलना, दोपहर में 3 घंटे का अनिवार्य विश्राम, प्रमाणित ई-रिक्शा सेवा।'
        : '2-3 key sanctums daily, minimal walking, mandatory 3-hour afternoon rest, verified E-rickshaw point-to-point drop.',
    },
    {
      id: 'balanced',
      title: isHindi ? 'Balanced (संतुलित)' : 'Balanced (संतुलित)',
      badge: isHindi ? 'सर्वाधिक लोकप्रिय' : 'Most Popular',
      desc: isHindi
        ? 'प्रमुख मंदिर आरती, पावन कुंड स्नान, ऐतिहासिक घाट, और दोपहर के सुगम विश्राम के साथ ब्रज के स्वादिष्ट व्यंजन।'
        : 'Core temple aartis, holy kund snan, historic ghats, and iconic Braj delicacies with a comfortable mid-day break.',
    },
    {
      id: 'fast_track',
      title: isHindi ? 'Fast-Track & Parikrama (तीव्र)' : 'Fast-Track & Parikrama (तीव्र)',
      badge: isHindi ? 'ऊर्जावान यात्री' : 'Energetic Yatri',
      desc: isHindi
        ? 'अधिकतम पवित्र स्थल, संपूर्ण 21 किमी गोवर्धन परिक्रमा, प्रातः मंगला से रात्रि शयन आरती तक का पूरा परिक्रमा चक्र।'
        : 'Maximum sacred sthals, complete 21-km Govardhan Parikrama, every Mangala to night Shayan Aarti circuit.',
    },
  ];

  const experienceOptions = [
    { id: 'banke_bihari', title: isHindi ? '🛕 श्री बांके बिहारी जी (वृंदावन)' : '🛕 Shri Banke Bihari Ji (Vrindavan)' },
    { id: 'janmabhoomi', title: isHindi ? '🛕 श्री कृष्ण जन्मभूमि (मथुरा)' : '🛕 Krishna Janmabhoomi (Mathura)' },
    { id: 'keshi_ghat', title: isHindi ? '🪔 केशी घाट यमुना महारती' : '🪔 Keshi Ghat Yamuna Aarti' },
    { id: 'govardhan', title: isHindi ? '🪨 गोवर्धन परिक्रमा (गिरिराज जी)' : '🪨 Govardhan Parikrama (Girirajji)' },
    { id: 'radha_kund', title: isHindi ? '💧 राधा कुंड पावन स्नान' : '💧 Radha Kund Holy Snan' },
    { id: 'barsana', title: isHindi ? '🌺 बरसाना श्री लाडली जी मंदिर' : '🌺 Barsana Shri Radha Rani Mandir' },
    { id: 'food_tour', title: isHindi ? '🍲 ब्रज स्ट्रीट फूड टूर (पेड़ा व कचौड़ी)' : '🍲 Braj Street Food Tour (Peda & Kachori)' },
    { id: 'nandgaon', title: isHindi ? '🐄 नंदगांव एवं नन्द बाबा गौशाला' : '🐄 Nandgaon & Gokul Gaushalas' },
  ];

  const toggleExperience = (id) => {
    setSelectedExperiences((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setSelectedDays(3);
    setSelectedPace('balanced');
    setSelectedExperiences(['banke_bihari', 'janmabhoomi', 'keshi_ghat', 'govardhan']);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Plan my ${selectedDays}-Day Braj Darshan Yatra with Braj Darshan App! Pace: ${selectedPace.toUpperCase()}, Must-visits: ${selectedExperiences.length} holy sites.`,
      });
    } catch {
      // ignore
    }
  };

  // Real-time calculation helpers
  const calculatedStops = Math.max(selectedExperiences.length * (selectedDays >= 3 ? 2 : 1), selectedDays * 3);
  const commuteKm = selectedDays === 1 ? '10-15 km' : selectedDays === 2 ? '15-20 km' : selectedDays === 3 ? '18-25 km' : '30-45 km';
  const budgetMin = selectedDays * 450 + 200;
  const budgetMax = selectedDays * 750 + 400;

  const handleGenerateItinerary = () => {
    Alert.alert(
      isHindi ? 'यात्रा योजना तैयार है!' : 'Itinerary Generated!',
      isHindi
        ? `आपकी ${selectedDays}-दिवसीय ब्रज यात्रा सफलतापूर्वक तैयार की गई है (${calculatedStops} पवित्र स्थल)। क्या आप इसे देखना चाहते हैं?`
        : `Your ${selectedDays}-Day Braj Pilgrimage has been calibrated with ${calculatedStops} sacred sites. View the detailed guide now?`,
      [
        { text: isHindi ? 'संपादित करें' : 'Edit', style: 'cancel' },
        {
          text: isHindi ? 'यात्रा देखें' : 'View Itinerary',
          onPress: () => navigation.navigate(ROUTES.YATRA),
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={[styles.topHeader, { borderBottomColor: isDark ? colors.border : '#F3F4F6' }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="h2" color={colors.text}>
            ←
          </AppText>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <AppText variant="body" weight="700" color={colors.navy}>
            {isHindi ? 'स्मार्ट यात्रा प्लानर' : 'Smart Yatra Planner'}
          </AppText>
          <AppText variant="micro" color={colors.primary} weight="600">
            {isHindi ? 'श्री ब्रज दर्शन' : 'Shri Braj Darshan'}
          </AppText>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleShare}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <AppText variant="body" color={colors.textSecondary}>
              🔗
            </AppText>
          </TouchableOpacity>
          <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
            <AppText variant="caption" weight="700" color="#FFFFFF">
              ॐ
            </AppText>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Top Tag & Reset row */}
        <View style={styles.subHeaderRow}>
          <View style={[styles.panchangTag, { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF' }]}>
            <AppText variant="micro" weight="700" color="#1D4ED8">
              🧭 {isHindi ? 'पंचांग आधारित मार्गदर्शक' : 'AI Panchang-Calibrated Route Builder'}
            </AppText>
          </View>
          <TouchableOpacity onPress={handleClearAll} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <AppText variant="caption" weight="700" color={colors.primary}>
              {isHindi ? 'रीसेट करें' : 'Clear All'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Welcome Card Banner */}
        <View
          style={[
            styles.welcomeBanner,
            {
              backgroundColor: isDark ? colors.card : '#FFF7ED',
              borderColor: '#FED7AA',
            },
          ]}
        >
          <View style={styles.welcomeBadgesRow}>
            <View style={[styles.welcomePill, { backgroundColor: '#FDBA74' }]}>
              <AppText variant="micro" weight="700" color="#7C2D12">
                {isHindi ? 'अपनी यात्रा बनाएं' : 'Build Custom Plan'}
              </AppText>
            </View>
            <View style={styles.syncBadge}>
              <AppText variant="micro" weight="700" color="#D97706">
                ⚡ {isHindi ? 'वैदिक सिंक' : 'Vedic Sync'}
              </AppText>
            </View>
          </View>

          <AppText variant="h2" color={colors.navy} style={styles.welcomeTitle}>
            {isHindi ? 'व्यक्तिगत ब्रज यात्रा प्लानर' : 'Personalized Pilgrimage Builder'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.welcomeSubtitle}>
            {isHindi
              ? '3 आसान चरणों में अपनी आदर्श तीर्थ यात्रा बनाएं — मंदिर पट खुलने-बंद होने के समय, परिवार की गति व पवित्र परिक्रमा के अनुसार अनुकूलित।'
              : 'Create your ideal pilgrimage itinerary in 3 simple steps — calibrated for sanctum timings, family needs, and sacred parikramas.'}
          </AppText>
        </View>

        {/* STEP 1: How many days in Braj Dham? */}
        <View style={styles.sectionWrap}>
          <View style={styles.stepTitleRow}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <AppText variant="micro" weight="800" color="#FFFFFF">
                1
              </AppText>
            </View>
            <AppText variant="h3" color={colors.navy} style={styles.stepTitle}>
              {isHindi ? 'ब्रज धाम में कितने दिन रुकेंगे?' : 'How many days in Braj Dham?'}
            </AppText>
            <AppText variant="micro" color={colors.textSecondary} style={styles.stepFraction}>
              Step 1 of 3
            </AppText>
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {daysOptions.map((opt) => {
              const isSelected = selectedDays === opt.days;
              return (
                <TouchableOpacity
                  key={opt.days}
                  style={[
                    styles.dayCard,
                    {
                      backgroundColor: isSelected ? colors.primary : isDark ? colors.card : '#F3F4F6',
                      borderColor: isSelected ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedDays(opt.days)}
                  activeOpacity={0.8}
                >
                  {opt.popular && !isSelected && (
                    <View style={styles.popularMiniBadge}>
                      <AppText variant="micro" weight="700" color="#FFFFFF">
                        ★
                      </AppText>
                    </View>
                  )}
                  <AppText
                    variant="body"
                    weight="800"
                    color={isSelected ? '#FFFFFF' : colors.text}
                  >
                    {opt.label}
                  </AppText>
                  <AppText
                    variant="micro"
                    color={isSelected ? '#FFEDD5' : colors.textSecondary}
                    style={{ marginTop: 2 }}
                  >
                    {opt.sub}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Darshan Window Date Pill */}
          <View
            style={[
              styles.dateWindowBox,
              { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF', borderColor: '#BFDBFE' },
            ]}
          >
            <AppText variant="caption" color="#1E40AF">
              📅
            </AppText>
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <AppText variant="micro" weight="600" color="#6B7280">
                {isHindi ? 'चयनित दर्शन अवधि' : 'Selected Darshan Window'}
              </AppText>
              <AppText variant="caption" weight="700" color={colors.navy} numberOfLines={1}>
                {darshanWindow}
              </AppText>
            </View>
            <AppText variant="caption" color={colors.primary}>
              🗓️
            </AppText>
          </View>
        </View>

        {/* STEP 2: Choose travel pace & comfort */}
        <View style={styles.sectionWrap}>
          <View style={styles.stepTitleRow}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <AppText variant="micro" weight="800" color="#FFFFFF">
                2
              </AppText>
            </View>
            <AppText variant="h3" color={colors.navy} style={styles.stepTitle}>
              {isHindi ? 'यात्रा की गति व सुविधा चुनें' : 'Choose travel pace & comfort'}
            </AppText>
            <AppText variant="micro" color={colors.textSecondary} style={styles.stepFraction}>
              Step 2 of 3
            </AppText>
          </View>

          {paceOptions.map((pace) => {
            const isSelected = selectedPace === pace.id;
            return (
              <TouchableOpacity
                key={pace.id}
                style={[
                  styles.paceCard,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#2A1810'
                        : '#FFF7ED'
                      : isDark
                      ? colors.card
                      : '#FFFFFF',
                    borderColor: isSelected ? colors.primary : isDark ? colors.border : '#E5E7EB',
                  },
                ]}
                onPress={() => setSelectedPace(pace.id)}
                activeOpacity={0.85}
              >
                <View style={styles.paceRadioRow}>
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : '#9CA3AF',
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>

                  <AppText
                    variant="body"
                    weight="700"
                    color={isSelected ? colors.primary : colors.text}
                    style={{ flex: 1, marginLeft: 8 }}
                  >
                    {pace.title}
                  </AppText>

                  <View
                    style={[
                      styles.paceBadge,
                      {
                        backgroundColor: isSelected
                          ? '#F59E0B'
                          : isDark
                          ? colors.cardAlt
                          : '#EFF6FF',
                      },
                    ]}
                  >
                    <AppText
                      variant="micro"
                      weight="700"
                      color={isSelected ? '#FFFFFF' : '#2563EB'}
                    >
                      {pace.badge}
                    </AppText>
                  </View>
                </View>

                <AppText
                  variant="caption"
                  color={colors.textSecondary}
                  style={styles.paceDesc}
                >
                  {pace.desc}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* STEP 3: Must-Visit Sacred Experiences */}
        <View style={styles.sectionWrap}>
          <View style={styles.stepTitleRow}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <AppText variant="micro" weight="800" color="#FFFFFF">
                3
              </AppText>
            </View>
            <AppText variant="h3" color={colors.navy} style={styles.stepTitle}>
              {isHindi ? 'अवश्य दर्शन योग्य पावन स्थल' : 'Must-Visit Sacred Experiences'}
            </AppText>
            <AppText variant="micro" color={colors.textSecondary} style={styles.stepFraction}>
              Step 3 of 3
            </AppText>
          </View>

          <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
            {isHindi
              ? 'अपनी यात्रा में शामिल करने या हटाने के लिए स्पर्श करें:'
              : 'Tap to include or remove holy sanctums & cultural rituals:'}
          </AppText>

          <View style={styles.chipsContainer}>
            {experienceOptions.map((exp) => {
              const isIncluded = selectedExperiences.includes(exp.id);
              return (
                <TouchableOpacity
                  key={exp.id}
                  style={[
                    styles.experienceChip,
                    {
                      backgroundColor: isIncluded ? colors.primary : isDark ? colors.card : '#F3F4F6',
                      borderColor: isIncluded ? colors.primary : isDark ? colors.border : '#E5E7EB',
                    },
                  ]}
                  onPress={() => toggleExperience(exp.id)}
                  activeOpacity={0.8}
                >
                  <AppText
                    variant="caption"
                    weight={isIncluded ? '700' : '500'}
                    color={isIncluded ? '#FFFFFF' : colors.text}
                  >
                    {exp.title}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Corridor Photo Preview Banner */}
        <View style={styles.corridorBannerWrap}>
          <Image
            source={placeAssets[3]}
            style={styles.corridorImage}
            resizeMode="cover"
          />
          <View style={styles.corridorScrim}>
            <AppText variant="body" weight="700" color="#FFFFFF">
              🛕 {isHindi ? 'गोवर्धन - राधा कुंड परिक्रमा गलियारा' : 'Govardhan - Radha Kund Corridor'}
            </AppText>
            <AppText variant="micro" color="#FEF3C7" style={{ marginTop: 2 }}>
              {isHindi
                ? 'राजभोग एवं संध्या आरती के पट समय के अनुकूल संयोजित'
                : 'Timings aligned with Rajbhog & Sandhya Aarti curtains'}
            </AppText>
          </View>
        </View>

        {/* Real-Time Plan Estimate Card */}
        <View
          style={[
            styles.estimateCard,
            {
              backgroundColor: isDark ? colors.card : '#F8FAFC',
              borderColor: isDark ? colors.border : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.estimateHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="caption" color={colors.navy}>
                📄
              </AppText>
              <AppText variant="body" weight="700" color={colors.navy} style={{ marginLeft: 6 }}>
                {isHindi ? 'वास्तविक समय यात्रा अनुमान' : 'Real-Time Plan Estimate'}
              </AppText>
            </View>
            <View style={styles.liveTag}>
              <AppText variant="micro" weight="700" color="#B45309">
                {isHindi ? 'लाइव पुनर्गणना' : 'LIVE RE-CALCULATED'}
              </AppText>
            </View>
          </View>

          <View style={styles.estimateGrid}>
            <View style={[styles.estimateTile, { backgroundColor: isDark ? colors.cardAlt : '#FFFFFF' }]}>
              <AppText variant="micro" color={colors.textSecondary}>
                {isHindi ? 'अनुमानित दर्शन स्थल' : 'Projected Stops'}
              </AppText>
              <AppText variant="h3" weight="800" color={colors.primary} style={{ marginTop: 2 }}>
                {calculatedStops} {isHindi ? 'तीर्थ स्थल' : 'Sacred Sites'}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {selectedDays >= 3 ? (isHindi ? '3 नगर आच्छादित' : '3 towns covered') : (isHindi ? '2 नगर' : '2 towns')}
              </AppText>
            </View>

            <View style={[styles.estimateTile, { backgroundColor: isDark ? colors.cardAlt : '#FFFFFF' }]}>
              <AppText variant="micro" color={colors.textSecondary}>
                {isHindi ? 'दैनिक यात्रा दूरी' : 'Daily Commute'}
              </AppText>
              <AppText variant="h3" weight="800" color={colors.navy} style={{ marginTop: 2 }}>
                {commuteKm}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi ? 'सत्यापित ई-रिक्शा द्वारा' : 'via Pre-booked E-Rickshaw'}
              </AppText>
            </View>

            <View style={[styles.estimateTile, { backgroundColor: isDark ? colors.cardAlt : '#FFFFFF' }]}>
              <AppText variant="micro" color={colors.textSecondary}>
                {isHindi ? 'अनुमानित स्थानीय खर्च' : 'Est. Local Budget'}
              </AppText>
              <AppText variant="h3" weight="800" color={colors.navy} style={{ marginTop: 2 }}>
                ₹{budgetMin} - ₹{budgetMax}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi ? 'प्रति यात्री (भोजन व यात्रा)' : 'per yatri (meals & transit)'}
              </AppText>
            </View>

            <View style={[styles.estimateTile, { backgroundColor: isDark ? colors.cardAlt : '#FFFFFF' }]}>
              <AppText variant="micro" color={colors.textSecondary}>
                {isHindi ? 'आरती सुसंगतता' : 'Aarti Compatibility'}
              </AppText>
              <AppText variant="h3" weight="800" color="#16A34A" style={{ marginTop: 2 }}>
                100% 🛡️
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi ? 'पट-बंद होने का शून्य टकराव' : 'Zero pat-closure clashes'}
              </AppText>
            </View>
          </View>

          <View style={styles.closureProtectionNote}>
            <AppText variant="micro" color="#9A3412" weight="600">
              ℹ️ {isHindi
                ? 'दोपहर 12:00 PM - 04:00 PM बांके बिहारी व जन्मस्थान मंदिर विश्राम सुरक्षा स्वतः शामिल है।'
                : 'Includes 12:00 PM - 4:00 PM afternoon sanctuary closure protection for Banke Bihari & Janmasthan.'}
            </AppText>
          </View>
        </View>

        {/* Sticky Generate Button */}
        <TouchableOpacity
          style={[styles.generateCtaBtn, { backgroundColor: colors.primary }]}
          onPress={handleGenerateItinerary}
          activeOpacity={0.85}
        >
          <AppText variant="body" weight="800" color="#FFFFFF">
            {isHindi ? 'मेरी व्यक्तिगत यात्रा बनाएं और सहेजें →' : 'Generate & Save My Personalized Itinerary →'}
          </AppText>
        </TouchableOpacity>

        <View style={styles.syncFooter}>
          <AppText variant="micro" color={colors.textSecondary} style={{ textAlign: 'center' }}>
            ☁️ {isHindi
              ? 'निःशुल्क तत्काल ऑफलाइन सिंक + आरती समय की लाइव सूचनाएं'
              : 'Free instant offline sync + live push notifications for aarti timings.'}
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingRight: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    padding: 6,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  panchangTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  welcomeBanner: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  welcomeBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  welcomePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  welcomeTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionWrap: {
    marginBottom: 24,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  stepFraction: {
    fontSize: 11,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  dayCard: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
    minHeight: 70,
  },
  popularMiniBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateWindowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  paceCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  paceRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  paceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  paceDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginLeft: 26,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  experienceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  corridorBannerWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 140,
    marginBottom: 20,
  },
  corridorImage: {
    width: '100%',
    height: '100%',
  },
  corridorScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  estimateCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  estimateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  liveTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  estimateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  estimateTile: {
    width: '48%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closureProtectionNote: {
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    padding: 8,
    borderRadius: 8,
  },
  generateCtaBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  syncFooter: {
    marginTop: 10,
    alignItems: 'center',
  },
});
