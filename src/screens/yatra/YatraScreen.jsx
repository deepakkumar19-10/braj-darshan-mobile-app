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
import { useFavorites } from '../../context/FavoritesContext';
import {
  AppText,
  StitchHeader,
  StitchTag,
  StitchPill,
} from '../../components/common';
import { placeAssets } from '../../utils/imageAssets';
import { ROUTES } from '../../navigation/routes';
import yatraData from '../../data/yatra.json';
import parikramaData from '../../data/parikrama.json';

export default function YatraScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { favorites } = useFavorites();

  const [selectedDuration, setSelectedDuration] = useState('3days'); // '1day' | '2days' | '3days' | '5days' | '84kos'
  const [expandedDays, setExpandedDays] = useState({ 1: true, 2: false, 3: false, 4: false, 5: false });

  const durationTabs = [
    { id: '1day', label: isHindi ? '1 दिन' : '1 Day' },
    { id: '2days', label: isHindi ? '2 दिन' : '2 Days' },
    { id: '3days', label: isHindi ? '3 दिन (अनुशंसित)' : '3 Days Recommended' },
    { id: '5days', label: isHindi ? '5 दिन' : '5 Days' },
    { id: '84kos', label: isHindi ? '84 कोस' : '84 Kos' },
  ];

  const toggleDay = (dayNum) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Explore authentic day-wise Braj Yatra & Parikrama Guides on Braj Darshan App! Includes certified routes, aarti schedules & offline maps.',
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadItinerary = () => {
    Alert.alert(
      isHindi ? 'ऑफलाइन यात्रा मार्गदर्शिका' : 'Offline Itinerary Downloaded',
      isHindi
        ? '3-दिवसीय सम्पूर्ण ब्रज यात्रा मार्गदर्शिका, जीपीएस मैप्स एवं मंदिर हेल्पलाइन पीडीएफ आपके फोन में सुरक्षित कर दी गई है।'
        : 'The 3-Day Complete Braj Pilgrimage Guide with GPS coordinates & emergency temple contacts has been saved offline.',
      [{ text: isHindi ? 'उत्तम' : 'Great', style: 'default' }]
    );
  };

  // 3-Day Default Quintessential Data matching Stitch
  const day1Timeline = [
    {
      time: '05:30 AM - 08:30 AM',
      tag: isHindi ? 'वृन्दावन पुराना नगर' : 'Vrindavan Old Town',
      tagBg: '#EFF6FF',
      tagColor: '#2563EB',
      title: isHindi ? 'राधा रमण जी मंदिर मंगला आरती' : 'Mangala Aarti at Radha Ramanji Mandir',
      desc: isHindi
        ? 'शांत प्रातःकालीन वेला में 500 वर्षों से अखंड प्रज्वलित पावन अग्नि व स्वयंभू शालिग्राम विग्रह के पावन दर्शन।'
        : 'Witness divine padmaraga 500-year sacred flame & self-manifested saligram deity during serene early hours.',
    },
    {
      time: '09:00 AM - 10:30 AM',
      tag: isHindi ? 'सर्वाधिक लोकप्रिय' : 'Most Popular',
      tagBg: '#FEF3C7',
      tagColor: '#D97706',
      title: isHindi ? 'श्री बांके बिहारी जी शृंगार दर्शन' : 'Shri Banke Bihari Ji Shringar Darshan',
      desc: isHindi
        ? 'दिव्य झलक दर्शन का अलौकिक अनुभव। कुंज गलियों में गर्म मालपुआ व रबड़ी का स्वाद लें।'
        : 'Experience the divine curtain jhalak darshan. Savor warm malpua along Kunj Gali in historic temple galis.',
    },
    {
      time: '11:00 AM - 01:00 PM',
      tag: isHindi ? 'पवित्र कुंज' : 'Sacred Grove',
      tagBg: '#ECFDF5',
      tagColor: '#059669',
      title: isHindi ? 'सेवा कुंज एवं निधिवन लीला स्थल' : 'Seva Kunj & Nidhivan Leela Sthal',
      desc: isHindi
        ? 'पवित्र वन-वृक्षों के मध्य शांति से विचरण करते हुए श्री राधा-कृष्ण की नित्य रास लीला का ध्यान।'
        : 'Walk quietly amidst intertwining van-vriksh, meditating on sacred nocturnal pastimes of Sri Radha Krishna.',
    },
    {
      time: '01:00 PM - 04:30 PM',
      tag: isHindi ? 'पट-बंद समय' : 'Pat Bandh Hours',
      tagBg: '#F3F4F6',
      tagColor: '#4B5563',
      title: isHindi ? 'दोपहर विश्राम एवं शांत प्रसाद सेवन' : 'Midday Sanctuary & Quiet Prasad Rest',
      desc: isHindi
        ? 'ठाकुर जी के शयन के लिए मंदिर पट बंद रहते हैं। यह समय अन्नक्षेत्र में भोजन प्रसाद व ऊर्जा संचय के लिए सर्वोत्तम है।'
        : 'Temples remain closed for midday resting of deities. Ideal window for lunch at an authentic Annakshetra and recharging.',
    },
    {
      time: '05:00 PM - 06:30 PM',
      tag: isHindi ? 'संध्या भक्ति' : 'Evening Bhakti',
      tagBg: '#F3E8FF',
      tagColor: '#7C3AED',
      title: isHindi ? 'इस्कॉन श्री श्री कृष्ण बलराम मंदिर' : 'ISKCON Sri Sri Krishna Balaram Temple',
      desc: isHindi
        ? 'हृदयस्पर्शी गौर संध्या आरती, कांस्य घंटियों की ताल और उल्लासपूर्ण सामूहिक हरे कृष्ण महामंत्र कीर्तन में लीन हों।'
        : 'Immerse in soul-stirring Gaura Sandhya Aarti, synchronized brass bells, and joyous congregational Hare Krishna Harinam Kirtanam.',
    },
    {
      time: '07:00 PM - 08:15 PM',
      tag: isHindi ? 'यमुना तट' : 'Yamuna Bank',
      tagBg: '#FFF7ED',
      tagColor: '#C2410C',
      title: isHindi ? 'केशी घाट भव्य यमुना दीपदान एवं महाआरती' : 'Keshi Ghat Grand Yamuna Deep Daan & Maha Aarti',
      desc: isHindi
        ? 'प्राचीन मेहराबों के नीचे पवित्र यमुना जी की मंद धारा में पुष्पमय दीप प्रवाहित कर दिन का आध्यात्मिक समापन।'
        : 'Conclude the sacred day offering floating floral diyas upon the gentle current of sacred Yamuna under ancient arches.',
    },
  ];

  const day2Timeline = [
    {
      time: '06:30 AM - 08:30 AM',
      tag: isHindi ? 'मथुरा जन्मस्थान' : 'Mathura Janmasthan',
      tagBg: '#EFF6FF',
      tagColor: '#2563EB',
      title: isHindi ? 'श्री कृष्ण जन्मभूमि एवं केशव देव दर्शन' : 'Krishna Janmabhoomi & Garbha Griha Darshan',
      desc: isHindi
        ? 'उस पावन कारागार स्थल के दर्शन जहां भगवान श्री कृष्ण ने भाद्रपद अष्टमी की मध्यरात्रि में अवतार लिया।'
        : 'Darshan at the sacred subterranean sanctum where Lord Krishna manifested on midnight of Ashtami.',
    },
    {
      time: '09:00 AM - 11:30 AM',
      tag: isHindi ? 'प्राचीन मथुरा' : 'Ancient Mathura',
      tagBg: '#FEF3C7',
      tagColor: '#D97706',
      title: isHindi ? 'श्री द्वारिकाधीश मंदिर एवं विश्राम घाट' : 'Dwarkadhish Temple & Vishram Ghat Yamuna Jal',
      desc: isHindi
        ? 'राजाधिराज स्वरूप के दर्शन एवं विश्राम घाट पर श्री कृष्ण द्वारा कंस वधोपरांत विश्राम स्थली पर नमन।'
        : 'Experience opulent royal darshan of Rajadhiraj followed by holy parikrama at Vishram Ghat.',
    },
    {
      time: '03:30 PM - 07:00 PM',
      tag: isHindi ? 'गोकुल बाललीला' : 'Gokul Leela Sthali',
      tagBg: '#ECFDF5',
      tagColor: '#059669',
      title: isHindi ? 'रमण रेती एवं नन्द भवन (84 खंभा)' : 'Raman Reti & Nand Bhavan Gokul',
      desc: isHindi
        ? 'गोकुल की पावन रेती में रज वंदन जहां कान्हा ने माखन चोरी की लीलाएं की थीं, तत्पश्चात ब्रह्मांड घाट दर्शन।'
        : 'Prostrate in sacred sand where child Krishna rolled in play; visit Nand Bhavan and Brahmand Ghat.',
    },
  ];

  const day3Timeline = [
    {
      time: '05:00 AM - 10:30 AM',
      tag: isHindi ? '21 किमी परिक्रमा' : '21 km Parikrama',
      tagBg: '#FEF3C7',
      tagColor: '#D97706',
      title: isHindi ? 'श्री गिरिराज गोवर्धन महापरिक्रमा' : 'Sacred Giriraj Govardhan Maha Parikrama',
      desc: isHindi
        ? 'दानघाटी से प्रारंभ, मानसी गंगा में आचमन, मुखारविंद व जतीपुरा में दुग्धाभिषेक करते हुए पवित्र परिक्रमा।'
        : 'Begin from Dan Ghati, sacred achaman at Manasi Ganga, and milk offering at Jatipura Mukharbind.',
    },
    {
      time: '11:00 AM - 01:30 PM',
      tag: isHindi ? 'परम पावन कुंड' : 'Most Sacred Kunds',
      tagBg: '#EFF6FF',
      tagColor: '#2563EB',
      title: isHindi ? 'श्री राधा कुंड एवं श्याम कुंड स्नान' : 'Radha Kund & Shyam Kund Snan',
      desc: isHindi
        ? 'ब्रज का सर्वोच्च रस स्थल, जहां दोनों कुंडों के पावन जल में डुबकी लगाकर असीम प्रेम की प्राप्ति होती है।'
        : 'The pinnacle of divine love in Braj; offer prayers and holy sprinkles at the conjoined kunds.',
    },
    {
      time: '04:30 PM - 07:00 PM',
      tag: isHindi ? 'ऐतिहासिक धरोहर' : 'Historic Splendor',
      tagBg: '#FFF7ED',
      tagColor: '#C2410C',
      title: isHindi ? 'कुसुम सरोवर एवं पूँछरी का लौठा' : 'Kusum Sarovar & Punchari Ka Lautha',
      desc: isHindi
        ? 'कलात्मक छतरियों के भव्य सरोवर पर सूर्यास्त के दर्शन और गोवर्धन के रक्षक पूँछरी के लौठा के दर्शन।'
        : 'Marvel at exquisite sandstone cenotaphs during sunset and seek blessings at Punchari Lautha.',
    },
  ];

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
            text={isHindi ? '🛕 प्रामाणिक तीर्थ यात्रा मार्ग' : 'AUTHENTIC PILGRIM ROUTES'}
            color="#C2410C"
            backgroundColor="#FFEDD5"
          />
          <AppText variant="h1" color={colors.navy} style={styles.mainTitle}>
            {isHindi ? 'ब्रज यात्रा एवं परिक्रमा गाइड' : 'Braj Yatra & Parikrama Guide'}
          </AppText>
          <AppText variant="body" weight="700" color={colors.primary} style={styles.hindiSubtitle}>
            {isHindi ? 'ब्रज यात्रा मार्गदर्शिका' : 'ब्रज यात्रा मार्गदर्शिका'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.descText}>
            {isHindi
              ? 'मथुरा, वृन्दावन, गोवर्धन और बरसाना के संपूर्ण दिवस-वार यात्रा कार्यक्रम, परिक्रमा मार्ग एवं आरती समय सारणी।'
              : 'Curated day-wise itineraries, sacred parikrama routes & authentic pilgrim schedules across Mathura, Vrindavan, Govardhan & Barsana.'}
          </AppText>
        </View>

        {/* Smart Yatra Custom Planner Promo Card */}
        <View
          style={[
            styles.plannerPromoCard,
            {
              backgroundColor: isDark ? colors.card : '#FFF7ED',
              borderColor: '#FED7AA',
            },
          ]}
        >
          <View style={styles.promoHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="h2" color="#D97706" style={{ marginRight: 6 }}>
                ✨
              </AppText>
              <AppText variant="h3" weight="800" color={colors.navy}>
                {isHindi ? 'स्मार्ट यात्रा कस्टम प्लानर' : 'Smart Yatra Custom Planner'}
              </AppText>
            </View>
            <TouchableOpacity
              onPress={handleShare}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <AppText variant="body" color={colors.textSecondary}>
                🔗
              </AppText>
            </TouchableOpacity>
          </View>

          <AppText variant="caption" color={colors.textSecondary} style={styles.promoSubtext}>
            {isHindi
              ? 'अपने परिवार की सुविधा, दर्शन प्राथमिकता एवं उपलब्ध दिनों के अनुसार अपनी यात्रा स्वयं तैयार करें।'
              : 'Tailor your pilgrimage according to family pace, darshan priorities & days available.'}
          </AppText>

          <TouchableOpacity
            style={[styles.buildPlanBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate(ROUTES.SMART_PLANNER)}
            activeOpacity={0.85}
          >
            <AppText variant="caption" weight="800" color="#FFFFFF">
              {isHindi ? 'कस्टम प्लान बनाएं →' : 'Build Custom Plan →'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Duration Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.durationTabsScroll}
        >
          {durationTabs.map((tab) => {
            const isSelected = selectedDuration === tab.id;
            return (
              <StitchPill
                key={tab.id}
                label={tab.label}
                selected={isSelected}
                onPress={() => setSelectedDuration(tab.id)}
              />
            );
          })}
        </ScrollView>

        {/* Summary Card for Selected Route */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <AppText variant="micro" weight="700" color="#9A3412" style={styles.eyebrowTag}>
            {selectedDuration === '1day'
              ? '5 KEY SITES • MATHURA & VRINDAVAN'
              : selectedDuration === '2days'
              ? '8 KEY SITES • VRINDAVAN & GOKUL'
              : selectedDuration === '84kos'
              ? '84 KOS • 108 SACRED LEELA STHALS'
              : '14 KEY SITES • MATHURA, VRINDAVAN & GOVARDHAN'}
          </AppText>

          <AppText variant="h2" color={colors.navy} style={styles.summaryTitle}>
            {isHindi ? 'सर्वोत्कृष्ट ब्रज अनुभव' : 'The Quintessential Braj Experience'}
          </AppText>

          <View style={styles.summaryGrid}>
            <View style={[styles.summaryTile, { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF' }]}>
              <AppText variant="caption" color={colors.navy}>
                🚗 {isHindi ? 'वाहन' : 'Transport'}
              </AppText>
              <AppText variant="caption" weight="700" color={colors.navy} style={{ marginTop: 2 }}>
                {isHindi ? 'ई-रिक्शा व एसी कैब' : 'E-Rickshaw & AC Cab'}
              </AppText>
            </View>

            <View style={[styles.summaryTile, { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF' }]}>
              <AppText variant="caption" color={colors.navy}>
                💰 {isHindi ? 'अनुमानित बजट' : 'Est. Budget'}
              </AppText>
              <AppText variant="caption" weight="700" color={colors.navy} style={{ marginTop: 2 }}>
                {selectedDuration === '1day'
                  ? '₹1,500 - ₹2,000'
                  : selectedDuration === '2days'
                  ? '₹2,800 - ₹3,600'
                  : '₹4,200 - ₹5,800 /युगल'}
              </AppText>
            </View>

            <View style={[styles.summaryTile, { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF' }]}>
              <AppText variant="caption" color={colors.navy}>
                ⏱️ {isHindi ? 'दैनिक गति' : 'Daily Pace'}
              </AppText>
              <AppText variant="caption" weight="700" color={colors.navy} style={{ marginTop: 2 }}>
                {isHindi ? 'संतुलित (मंदिर व विश्राम)' : 'Balanced (Mandir & Vishram)'}
              </AppText>
            </View>

            <View style={[styles.summaryTile, { backgroundColor: isDark ? colors.cardAlt : '#EFF6FF' }]}>
              <AppText variant="caption" color={colors.navy}>
                🛕 {isHindi ? 'कुल मंदिर' : 'Total Mandirs'}
              </AppText>
              <AppText variant="caption" weight="700" color={colors.navy} style={{ marginTop: 2 }}>
                {selectedDuration === '1day'
                  ? '5 पवित्र धाम'
                  : selectedDuration === '2days'
                  ? '8 पवित्र धाम'
                  : '11 Sanctified Sanctuaries'}
              </AppText>
            </View>
          </View>
        </View>

        {/* DAY 1: Heart of Vrindavan Dham (Expanded Flow) */}
        <View
          style={[
            styles.dayCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <View style={styles.dayCardHeader}>
            <View style={[styles.dayBadge, { backgroundColor: '#FFEDD5' }]}>
              <AppText variant="micro" weight="800" color="#C2410C">
                {isHindi ? 'दिवस 1 (3 में से)' : 'DAY 1 OF 3'}
              </AppText>
            </View>
            <View style={styles.completeFlowTag}>
              <AppText variant="micro" weight="700" color="#16A34A">
                ● {isHindi ? 'पूर्ण यात्रा क्रम' : 'Complete Flow'}
              </AppText>
            </View>
          </View>

          <AppText variant="h2" color={colors.navy} style={styles.dayTitle}>
            {isHindi
              ? 'वृन्दावन धाम का हृदय एवं केशी घाट यमुना महाआरती'
              : 'Heart of Vrindavan Dham & Keshi Ghat Yamuna Aarti'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.dayDesc}>
            {isHindi
              ? 'प्रातः मंगला दर्शन, वृन्दावन के दिव्य मंदिर, पारंपरिक गलियों का प्रसाद एवं गोधूलि वेला में यमुना दीपदान।'
              : 'Early Mangala darshan, divine temples of Vrindavan, traditional street prasad and twilight Yamuna Deep Daan.'}
          </AppText>

          {/* Vertical Golden Timeline */}
          <View style={styles.timelineWrap}>
            <View style={styles.goldenTimelineLine} />
            {day1Timeline.map((stop, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
                  <AppText variant="micro" weight="800" color="#FFFFFF">
                    {idx + 1}
                  </AppText>
                </View>

                <View style={styles.timelineContent}>
                  <View style={styles.stopMetaRow}>
                    <AppText variant="micro" weight="700" color={colors.primary}>
                      {stop.time}
                    </AppText>
                    <View style={[styles.stopBadge, { backgroundColor: stop.tagBg }]}>
                      <AppText variant="micro" weight="700" color={stop.tagColor}>
                        {stop.tag}
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="body" weight="700" color={colors.navy} style={styles.stopTitle}>
                    {stop.title}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary} style={styles.stopDesc}>
                    {stop.desc}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          {/* Panoramic Image Banner */}
          <View style={styles.panoramaWrap}>
            <Image
              source={placeAssets[1]}
              style={styles.panoramaImage}
              resizeMode="cover"
            />
            <View style={styles.panoramaScrim}>
              <AppText variant="caption" weight="700" color="#FFFFFF">
                🛕 {isHindi ? 'केशी घाट संध्या आरती मनोरम दृश्य' : 'Keshi Ghat Sandhya Aarti Panorama'}
              </AppText>
            </View>
          </View>
        </View>

        {/* DAY 2: Accordion Card */}
        <View
          style={[
            styles.accordionCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleDay(2)}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.accordionBadgeRow}>
                <View style={[styles.dayBadge, { backgroundColor: '#EFF6FF' }]}>
                  <AppText variant="micro" weight="800" color="#1D4ED8">
                    {isHindi ? 'दिवस 2' : 'DAY 2'}
                  </AppText>
                </View>
                <AppText variant="micro" color={colors.textSecondary} style={{ marginLeft: 8 }}>
                  {isHindi ? 'मथुरा एवं गोकुल' : 'Mathura & Gokul'}
                </AppText>
              </View>
              <AppText variant="h3" color={colors.navy} style={{ marginTop: 4 }}>
                {isHindi
                  ? 'पावन मथुरा जन्मभूमि एवं गोकुल लीला स्थली'
                  : 'Sacred Mathura Janmabhoomi & Gokul Leela Sthali'}
              </AppText>
            </View>
            <AppText variant="h2" color={colors.textSecondary}>
              {expandedDays[2] ? '▲' : '▼'}
            </AppText>
          </TouchableOpacity>

          {expandedDays[2] && (
            <View style={styles.expandedContent}>
              <View style={styles.timelineWrap}>
                <View style={styles.goldenTimelineLine} />
                {day2Timeline.map((stop, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#1D4ED8' }]}>
                      <AppText variant="micro" weight="800" color="#FFFFFF">
                        {idx + 1}
                      </AppText>
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.stopMetaRow}>
                        <AppText variant="micro" weight="700" color="#1D4ED8">
                          {stop.time}
                        </AppText>
                        <View style={[styles.stopBadge, { backgroundColor: stop.tagBg }]}>
                          <AppText variant="micro" weight="700" color={stop.tagColor}>
                            {stop.tag}
                          </AppText>
                        </View>
                      </View>
                      <AppText variant="body" weight="700" color={colors.navy} style={styles.stopTitle}>
                        {stop.title}
                      </AppText>
                      <AppText variant="caption" color={colors.textSecondary} style={styles.stopDesc}>
                        {stop.desc}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* DAY 3: Accordion Card */}
        <View
          style={[
            styles.accordionCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleDay(3)}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.accordionBadgeRow}>
                <View style={[styles.dayBadge, { backgroundColor: '#FEF3C7' }]}>
                  <AppText variant="micro" weight="800" color="#B45309">
                    {isHindi ? 'दिवस 3' : 'DAY 3'}
                  </AppText>
                </View>
                <AppText variant="micro" color={colors.textSecondary} style={{ marginLeft: 8 }}>
                  {isHindi ? 'गोवर्धन 21 किमी' : 'Govardhan 21 km'}
                </AppText>
              </View>
              <AppText variant="h3" color={colors.navy} style={{ marginTop: 4 }}>
                {isHindi
                  ? 'पावन गोवर्धन गिरिराज परिक्रमा एवं राधा कुंड'
                  : 'Sacred Govardhan Giriraj Parikrama & Radha Kund'}
              </AppText>
            </View>
            <AppText variant="h2" color={colors.textSecondary}>
              {expandedDays[3] ? '▲' : '▼'}
            </AppText>
          </TouchableOpacity>

          {expandedDays[3] && (
            <View style={styles.expandedContent}>
              <View style={styles.timelineWrap}>
                <View style={styles.goldenTimelineLine} />
                {day3Timeline.map((stop, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#B45309' }]}>
                      <AppText variant="micro" weight="800" color="#FFFFFF">
                        {idx + 1}
                      </AppText>
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.stopMetaRow}>
                        <AppText variant="micro" weight="700" color="#B45309">
                          {stop.time}
                        </AppText>
                        <View style={[styles.stopBadge, { backgroundColor: stop.tagBg }]}>
                          <AppText variant="micro" weight="700" color={stop.tagColor}>
                            {stop.tag}
                          </AppText>
                        </View>
                      </View>
                      <AppText variant="body" weight="700" color={colors.navy} style={styles.stopTitle}>
                        {stop.title}
                      </AppText>
                      <AppText variant="caption" color={colors.textSecondary} style={styles.stopDesc}>
                        {stop.desc}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Pilgrim Yatra Advisory Card */}
        <View
          style={[
            styles.advisoryCard,
            {
              backgroundColor: isDark ? colors.cardAlt : '#EFF6FF',
              borderColor: '#BFDBFE',
            },
          ]}
        >
          <View style={styles.advisoryIconWrap}>
            <AppText variant="body" color="#EA580C">
              📍
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="body" weight="700" color={colors.navy}>
              {isHindi ? 'यात्री परामर्श एवं सावधानियां' : 'Pilgrim Yatra Advisory'}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 4, lineHeight: 18 }}>
              {isHindi
                ? 'दोपहर मंदिर पट बंद रहने (12:30 PM - 04:30 PM) के समय केवल यात्रा या विश्राम करें, सरलता से खुलने वाले जूते-चप्पल पहनें, पर्याप्त जल पिएं और संकरी गलियों में ई-रिक्शा के लिए खुल्ले पैसे साथ रखें।'
                : 'Always transit afternoon temple closure (12:30 PM - 04:30 PM), keep slip-on footwear, stay hydrated, and carry small change for e-rickshaws across narrow temple galis.'}
            </AppText>
          </View>
        </View>

        {/* Download Offline Button */}
        <TouchableOpacity
          style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
          onPress={handleDownloadItinerary}
          activeOpacity={0.85}
        >
          <AppText variant="body" weight="800" color="#FFFFFF">
            📥 {isHindi ? 'ऑफलाइन यात्रा विवरण डाउनलोड करें (PDF व मैप्स)' : 'Download Offline Itinerary (PDF & Maps)'}
          </AppText>
        </TouchableOpacity>

        <AppText variant="micro" color={colors.textSecondary} style={styles.downloadMicrotext}>
          {isHindi
            ? 'पूर्व-सत्यापित ऑफलाइन जीपीएस बिंदु एवं आपातकालीन मंदिर हेल्पलाइन नंबर सम्मिलित हैं।'
            : 'Includes pre-certified offline GPS points & emergency temple helpline numbers.'}
        </AppText>
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
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: 8,
  },
  hindiSubtitle: {
    fontSize: 16,
    marginTop: 2,
    marginBottom: 6,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
  },
  plannerPromoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  promoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  promoSubtext: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  buildPlanBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9999,
  },
  durationTabsScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  eyebrowTag: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryTile: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
  },
  dayCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completeFlowTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dayTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 6,
  },
  dayDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  timelineWrap: {
    position: 'relative',
    paddingLeft: 28,
    marginBottom: 16,
  },
  goldenTimelineLine: {
    position: 'absolute',
    left: 10,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: '#F59E0B',
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 16,
  },
  timelineDot: {
    position: 'absolute',
    left: -28,
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContent: {
    paddingLeft: 6,
  },
  stopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  stopBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stopTitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
  },
  stopDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  panoramaWrap: {
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  panoramaImage: {
    width: '100%',
    height: '100%',
  },
  panoramaScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  accordionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 64,
  },
  accordionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  advisoryCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  advisoryIconWrap: {
    marginRight: 10,
    marginTop: 2,
  },
  downloadBtn: {
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
  downloadMicrotext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
