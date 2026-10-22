import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { ROUTES } from '../../navigation/routes';

export default function HelpdeskScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { favorites } = useFavorites();

  const [selectedSector, setSelectedSector] = useState('mathura_vrindavan');
  const [pilgrimName, setPilgrimName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [devoteesCount, setDevoteesCount] = useState('Family of 4 (incl. 2 Seniors)');
  const [inquiryText, setInquiryText] = useState('');

  const [expandedFaq, setExpandedFaq] = useState(0);

  const sectorOptions = [
    { id: 'mathura_vrindavan', label: isHindi ? 'मथुरा-वृन्दावन' : 'Mathura-Vrindavan' },
    { id: 'govardhan', label: isHindi ? 'गोवर्धन परिक्रमा' : 'Govardhan Parikrama' },
    { id: 'aarti_pass', label: isHindi ? 'आरती व दर्शन पास' : 'Aarti & Darshan Pass' },
    { id: 'dharmashala', label: isHindi ? 'धर्मशाला बुकिंग' : 'Dharmashala Booking' },
    { id: 'rickshaw', label: isHindi ? 'ई-रिक्शा निर्धारित दर' : 'E-Rickshaw Fixed Rate' },
  ];

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleOpenMaps = () => {
    Linking.openURL('https://www.google.com/maps/search/?api=1&query=Krishna+Janmasthan+Gate+1+Mathura');
  };

  const handleSubmitInquiry = () => {
    if (!pilgrimName.trim() || !mobileNumber.trim()) {
      Alert.alert(
        isHindi ? 'कृपया विवरण भरें' : 'Required Fields Missing',
        isHindi ? 'कृपया अपना नाम एवं व्हाट्सएप नंबर दर्ज करें।' : 'Please enter your full name and mobile number.'
      );
      return;
    }

    Alert.alert(
      isHindi ? 'सहायता अनुरोध प्रेषित!' : 'Inquiry Submitted Successfully!',
      isHindi
        ? `श्री ${pilgrimName}, आपका सहायता अनुरोध मथुरा-वृन्दावन तीर्थ सेवा परिषद को प्रेषित कर दिया गया है। हमारे सेवादार 15 मिनट में आपसे संपर्क करेंगे।`
        : `Devotee ${pilgrimName}, your seva request has been dispatched to Mathura-Vrindavan Tourist Seva Parishad. Average response time: 15 mins.`,
      [{ text: isHindi ? 'स्वीकृत' : 'OK', onPress: () => setInquiryText('') }]
    );
  };

  const faqs = [
    {
      q: isHindi
        ? 'गोवर्धन परिक्रमा में बैटरी वाली गोल्फ कार्ट कैसे बुक करें?'
        : 'How to book battery-operated golf carts at Govardhan Parikrama?',
      a: isHindi
        ? 'राधा कुंड स्टैंड एवं दानघाटी परिक्रमा बिंदु पर वरिष्ठ नागरिकों एवं दिव्यांग तीर्थयात्रियों के लिए ₹200-₹250 में अधिकृत सरकारी गोल्फ कार्ट उपलब्ध हैं। अग्रिम ऑनलाइन टोकन की आवश्यकता नहीं है; सरकारी काउंटर प्रातः 05:00 AM से रात्रि 10:00 PM तक निरंतर कार्यरत रहते हैं।'
        : 'Official battery-operated carts are available at Radha Kund Stand and Dan Ghati Parikrama Point for ₹200-₹250 per senior citizen / differently-abled pilgrim. No advance online token required; government queue counters operate 05:00 AM to 10:00 PM.',
    },
    {
      q: isHindi
        ? 'श्री कृष्ण जन्मभूमि पर क्लॉक रूम के क्या नियम हैं?'
        : 'What are the strict cloakroom rules at Janmabhoomi?',
      a: isHindi
        ? 'गर्भ गृह परिसर में मोबाइल फोन, स्मार्टवॉच, कैमरा, चमड़े का बेल्ट अथवा चाबियां ले जाना पूर्णतः प्रतिबंधित है। गेट नंबर 1 व 3 के बाहर उत्तर प्रदेश पुलिस प्रमाणित निःशुल्क लॉकर क्लॉक रूम उपलब्ध हैं।'
        : 'No mobile phones, smartwatches, cameras, belts, or electronic keys are allowed inside the Garbha Griha perimeter. Government-certified locker cloakrooms are available free of charge at Gate No. 1 & 3.',
    },
    {
      q: isHindi
        ? 'प्रामाणिक महाप्रसाद पैकिंग एवं होम कूरियर विकल्प?'
        : 'Authentic Prasad packing & courier options?',
      a: isHindi
        ? 'बांके बिहारी जी एवं जन्मस्थान मंदिर के अधिकृत काउंटर से सीलबंद डिब्बों में पेड़ा व महाप्रसाद प्राप्त करें। संपूर्ण भारत में 24-48 घंटे में सुरक्षित कूरियर सेवा हेतु मंदिर सेवादार केंद्र पर संपर्क करें।'
        : 'Devotees can avail official sealed prasad packing at authorized temple counters in Banke Bihari and Janmasthan with next-day express delivery across India.',
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
            text={isHindi ? '🛕 आधिकारिक तीर्थ सेवा सहायता' : 'OFFICIAL SUPPORT'}
            color="#C2410C"
            backgroundColor="#FFEDD5"
          />
          <AppText variant="h1" color={colors.navy} style={styles.mainTitle}>
            {isHindi ? 'तीर्थ यात्री सेवा एवं हेल्पलाइन' : 'Pilgrim Seva & Helpdesk'}
          </AppText>
          <AppText variant="body" weight="700" color={colors.primary} style={styles.hindiSubtitle}>
            {isHindi ? '(तीर्थ यात्री सेवा केंद्र)' : '(तीर्थ यात्री सेवा केंद्र)'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.descText}>
            {isHindi
              ? 'मथुरा, वृन्दावन, गोवर्धन और बरसाना के तीर्थयात्रियों के लिए 24x7 निरंतर समर्पित व सत्यापित सहायता केंद्र।'
              : 'Official round-the-clock verified assistance for Mathura, Vrindavan, Govardhan, and Barsana pilgrims.'}
          </AppText>
        </View>

        {/* 24x7 Emergency Helpline Card */}
        <View
          style={[
            styles.helplineCard,
            {
              backgroundColor: isDark ? colors.card : '#FFF7ED',
              borderColor: '#FED7AA',
            },
          ]}
        >
          <View style={styles.helplineHeader}>
            <View style={styles.phoneIconWrap}>
              <AppText variant="h2" color="#EA580C">
                🚨
              </AppText>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText variant="body" weight="800" color={colors.navy}>
                {isHindi ? '24x7 तीर्थ सेवा आपातकालीन हेल्पलाइन' : '24x7 Pilgrim Seva Emergency Helpline'}
              </AppText>
              <AppText variant="micro" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {isHindi
                  ? 'बिछुड़े तीर्थयात्रियों, चिकित्सा सहायता, मंदिर पट समय एवं वरिष्ठ नागरिक सहयोग हेतु निःशुल्क मार्गदर्शन।'
                  : 'Instant toll-free guidance for lost pilgrims, medical emergencies, sanctum timings, and senior citizen assistance.'}
              </AppText>
            </View>
          </View>

          {/* Big Terracotta Call Button */}
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleCall('18001801947')}
            activeOpacity={0.85}
          >
            <AppText variant="body" weight="800" color="#FFFFFF">
              📞 {isHindi ? 'टोल-फ्री: 1800-180-1947 (कॉल करें)' : 'Toll-Free: 1800-180-1947 / 112 (Call Now)'}
            </AppText>
          </TouchableOpacity>

          {/* Quick Contact Pills */}
          <View style={styles.quickContactsRow}>
            <TouchableOpacity
              style={[styles.contactPill, { backgroundColor: '#FEE2E2' }]}
              onPress={() => handleCall('108')}
            >
              <AppText variant="micro" weight="700" color="#DC2626">
                🚑 {isHindi ? 'चिकित्सा: 108' : 'Medical: 108'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactPill, { backgroundColor: '#EFF6FF' }]}
              onPress={() => handleCall('112')}
            >
              <AppText variant="micro" weight="700" color="#2563EB">
                👮 {isHindi ? 'मथुरा पुलिस: 112' : 'Police: 112'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactPill, { backgroundColor: '#FEF3C7' }]}
              onPress={() => handleCall('1363')}
            >
              <AppText variant="micro" weight="700" color="#B45309">
                🛕 {isHindi ? 'पर्यटन: 1363' : 'Tourism: 1363'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Central Pilgrim Assistance Office Card */}
        <View
          style={[
            styles.officeCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <View style={styles.officeHeader}>
            <View>
              <AppText variant="micro" weight="800" color={colors.primary}>
                PHYSICAL SEVA KENDRA
              </AppText>
              <AppText variant="h2" color={colors.navy} style={{ marginTop: 2 }}>
                {isHindi ? 'केंद्रीय तीर्थ यात्री सहायता केंद्र' : 'Central Pilgrim Assistance Office'}
              </AppText>
            </View>
            <AppText variant="h2">🏛️</AppText>
          </View>

          <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
            📍 {isHindi
              ? 'श्री कृष्ण जन्मस्थान मार्ग, निकट गेट नं. 1, मथुरा (उ.प्र.) 281001\n• गेट 1 से 200 मी. दूरी • 24 घंटे खुला रहता है'
              : 'Shri Krishna Janmasthan Marg, Near Gate, Mathura (U.P.) 281001\n• 200m from Gate No. 1 • Open 24 Hours'}
          </AppText>

          {/* 4 Complementary On-ground Facilities */}
          <View style={styles.facilitiesGrid}>
            <View style={[styles.facilityTile, { backgroundColor: isDark ? colors.cardAlt : '#F8FAFC' }]}>
              <AppText variant="caption" color={colors.navy}>
                ♿ {isHindi ? 'निःशुल्क व्हीलचेयर सेवा' : 'Free Wheelchair Support'}
              </AppText>
            </View>
            <View style={[styles.facilityTile, { backgroundColor: isDark ? colors.cardAlt : '#F8FAFC' }]}>
              <AppText variant="caption" color={colors.navy}>
                🧳 {isHindi ? 'सत्यापित सुरक्षित लॉकर' : 'Verified Safe Cloakroom'}
              </AppText>
            </View>
            <View style={[styles.facilityTile, { backgroundColor: isDark ? colors.cardAlt : '#F8FAFC' }]}>
              <AppText variant="caption" color={colors.navy}>
                📜 {isHindi ? 'प्रमाणित तीर्थ पुरोहित' : 'Certified Purohit Guides'}
              </AppText>
            </View>
            <View style={[styles.facilityTile, { backgroundColor: isDark ? colors.cardAlt : '#F8FAFC' }]}>
              <AppText variant="caption" color={colors.navy}>
                🏨 {isHindi ? 'मान्यता प्राप्त धर्मशालाएं' : 'Verified Dharmashalas'}
              </AppText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.officeBtnsRow}>
            <TouchableOpacity
              style={[styles.officeWhiteBtn, { borderColor: colors.primary }]}
              onPress={handleOpenMaps}
              activeOpacity={0.85}
            >
              <AppText variant="caption" weight="800" color={colors.primary}>
                🗺️ {isHindi ? 'गूगल मैप्स' : 'Google Maps'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.officePrimaryBtn, { backgroundColor: colors.primary }]}
              onPress={handleOpenMaps}
              activeOpacity={0.85}
            >
              <AppText variant="caption" weight="800" color="#FFFFFF">
                🚗 {isHindi ? 'मार्ग देखें' : 'Directions'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Direct Pilgrim Inquiry Form */}
        <View
          style={[
            styles.inquiryCard,
            {
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E5E7EB',
            },
          ]}
        >
          <View style={styles.inquiryHeader}>
            <AppText variant="body" weight="800" color={colors.navy}>
              📍 {isHindi ? 'सीधा तीर्थ सहायता अनुरोध' : 'Direct Pilgrim Inquiry'}
            </AppText>
            <View style={[styles.slaBadge, { backgroundColor: '#DCFCE7' }]}>
              <AppText variant="micro" weight="700" color="#15803D">
                {isHindi ? '15-30 मिनट त्वरित सेवा' : '15-30 Min SLA Guaranteed'}
              </AppText>
            </View>
          </View>

          {/* Sector Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectorPillsScroll}
          >
            {sectorOptions.map((sec) => {
              const isSelected = selectedSector === sec.id;
              return (
                <StitchPill
                  key={sec.id}
                  label={sec.label}
                  selected={isSelected}
                  onPress={() => setSelectedSector(sec.id)}
                />
              );
            })}
          </ScrollView>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <AppText variant="micro" weight="700" color={colors.navy} style={{ marginBottom: 4 }}>
              {isHindi ? 'यात्री का पूरा नाम *' : "Pilgrim's Full Name *"}
            </AppText>
            <TextInput
              style={[
                styles.inputField,
                {
                  backgroundColor: isDark ? colors.cardAlt : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? colors.border : '#E2E8F0',
                },
              ]}
              placeholder={isHindi ? 'उदा. राजेश शर्मा' : 'e.g., Rajesh Sharma'}
              placeholderTextColor={colors.textSecondary}
              value={pilgrimName}
              onChangeText={setPilgrimName}
            />
          </View>

          <View style={styles.formGroup}>
            <AppText variant="micro" weight="700" color={colors.navy} style={{ marginBottom: 4 }}>
              {isHindi ? 'व्हाट्सएप / मोबाइल नंबर *' : 'WhatsApp / Mobile Number *'}
            </AppText>
            <View
              style={[
                styles.phoneInputWrap,
                {
                  backgroundColor: isDark ? colors.cardAlt : '#F8FAFC',
                  borderColor: isDark ? colors.border : '#E2E8F0',
                },
              ]}
            >
              <AppText variant="caption" weight="700" color={colors.navy} style={{ paddingHorizontal: 10 }}>
                🇮🇳 +91
              </AppText>
              <TextInput
                style={[styles.phoneTextInput, { color: colors.text }]}
                placeholder="10-digit mobile number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <AppText variant="micro" weight="700" color={colors.navy} style={{ marginBottom: 4 }}>
              {isHindi ? 'यात्रियों / वरिष्ठ नागरिकों की संख्या' : 'Number of Devotees / Senior Citizens'}
            </AppText>
            <TextInput
              style={[
                styles.inputField,
                {
                  backgroundColor: isDark ? colors.cardAlt : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? colors.border : '#E2E8F0',
                },
              ]}
              value={devoteesCount}
              onChangeText={setDevoteesCount}
            />
          </View>

          <View style={styles.formGroup}>
            <AppText variant="micro" weight="700" color={colors.navy} style={{ marginBottom: 4 }}>
              {isHindi ? 'सहायता आवश्यकता विवरण' : 'Inquiry / Special Assistance Details'}
            </AppText>
            <TextInput
              style={[
                styles.textAreaField,
                {
                  backgroundColor: isDark ? colors.cardAlt : '#F8FAFC',
                  color: colors.text,
                  borderColor: isDark ? colors.border : '#E2E8F0',
                },
              ]}
              placeholder={
                isHindi
                  ? 'उदा. बांके बिहारी जी प्रातः दर्शन हेतु व्हीलचेयर सहयोग की आवश्यकता...'
                  : 'e.g., Need wheelchair support at Banke Bihari for morning darshan...'
              }
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={inquiryText}
              onChangeText={setInquiryText}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmitInquiry}
            activeOpacity={0.85}
          >
            <AppText variant="body" weight="800" color="#FFFFFF">
              {isHindi ? 'अनुरोध भेजें (Submit Inquiry) →' : 'Submit Inquiry (तुरंत सहायता अनुरोध भेजें) →'}
            </AppText>
          </TouchableOpacity>

          <AppText variant="micro" color={colors.textSecondary} style={{ textAlign: 'center', marginTop: 10 }}>
            {isHindi
              ? 'यह सेवा अनुरोध सीधे मथुरा-वृन्दावन तीर्थ सेवा परिषद द्वारा देखा जाता है। औसत प्रतीक्षा समय 15 मिनट।'
              : 'This seva request is in direct coordination with Mathura-Vrindavan Tourist Seva Parishad. Average response time 15 mins.'}
          </AppText>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <AppText variant="h2" color={colors.navy} style={{ marginBottom: 12 }}>
            💡 {isHindi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Seva Questions'}
          </AppText>

          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <View
                key={index}
                style={[
                  styles.faqCard,
                  {
                    backgroundColor: isDark ? colors.card : '#FFFFFF',
                    borderColor: isDark ? colors.border : '#E5E7EB',
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => setExpandedFaq(isExpanded ? null : index)}
                  activeOpacity={0.8}
                >
                  <AppText variant="body" weight="700" color={colors.navy} style={{ flex: 1 }}>
                    {faq.q}
                  </AppText>
                  <AppText variant="caption" color={colors.primary}>
                    {isExpanded ? '▲' : '▼'}
                  </AppText>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerWrap}>
                    <AppText variant="caption" color={colors.textSecondary} style={{ lineHeight: 19 }}>
                      {faq.a}
                    </AppText>
                  </View>
                )}
              </View>
            );
          })}
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
  helplineCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  helplineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  phoneIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickContactsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contactPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  officeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  facilityTile: {
    width: '48%',
    padding: 10,
    borderRadius: 8,
  },
  officeBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  officeWhiteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officePrimaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inquiryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectorPillsScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 12,
  },
  inputField: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  phoneTextInput: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    fontSize: 14,
  },
  textAreaField: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  faqSection: {
    marginBottom: 20,
  },
  faqCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  faqAnswerWrap: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
});
