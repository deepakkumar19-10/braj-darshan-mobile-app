/**
 * Braj Darshan - Help & essentials
 * Layout from the redesign (design-input/figma "Light · Help"): the national
 * emergency numbers as one calm list (tap a row to call), practical tips,
 * travel basics and the app's contact email.
 *
 * Honesty rules: only India's national numbers (112, 108) are shown. No office
 * addresses, local helplines, live chat, request forms or "dispatch" features,
 * because the app does not run any of those.
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Linking, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  TopBar,
  LanguageToggle,
  Card,
  InfoNote,
  SectionHeader,
  ListRow,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';

const CONTACT_EMAIL = 'divyabraj.darshan@gmail.com';

const EMERGENCY = [
  {
    number: '112',
    icon: 'emergency',
    urgent: true,
    titleHi: 'आपातकाल',
    titleEn: 'Emergency',
    descHi: 'पुलिस, आग और किसी भी आपात सहायता के लिए',
    descEn: 'Police, fire and urgent assistance',
  },
  {
    number: '108',
    icon: 'ambulance',
    titleHi: 'एंबुलेंस',
    titleEn: 'Ambulance',
    descHi: 'तुरंत चिकित्सा सहायता के लिए',
    descEn: 'For urgent medical help',
  },
];

const GROUP_TIPS = [
  {
    id: 'lost',
    icon: 'people',
    titleHi: 'खोया-पाया',
    titleEn: 'Lost & found',
    textHi:
      'भीड़ में बिछड़ने पर मिलने की एक जगह पहले से तय कर लें। कोई लापता हो तो स्थानीय पुलिस या मंदिर कर्मचारियों से संपर्क करें। आपात स्थिति में 112 पर कॉल करें।',
    textEn:
      'Agree on a meeting point before you enter a crowd. If someone is missing, approach local police or temple staff. Call 112 for an emergency.',
  },
  {
    id: 'women',
    icon: 'safety',
    titleHi: 'महिलाओं की सुरक्षा',
    titleEn: "Women's safety",
    textHi:
      'अनजान इलाकों में समूह के साथ रहें। रोशनी वाले सार्वजनिक रास्तों का उपयोग करें और असुरक्षित लगे तो 112 पर कॉल करें।',
    textEn:
      'Stay with your group in unfamiliar areas. Use well-lit public routes and call 112 if you feel unsafe.',
  },
  {
    id: 'seniors',
    icon: 'parikrama',
    titleHi: 'बुज़ुर्गों के साथ यात्रा',
    titleEn: 'Travelling with seniors',
    textHi:
      'दवाइयाँ, पानी और किसी परिजन का नंबर काग़ज़ पर लिखकर साथ रखें। बीच-बीच में बैठने का समय रखें और जल्दबाज़ी न करें।',
    textEn:
      'Keep medicines, water and an emergency contact written on paper. Build in seating breaks and avoid rushing.',
  },
];

const PLACE_TIPS = [
  {
    id: 'phones',
    icon: 'noPhoto',
    titleHi: 'फ़ोन, कैमरा और सामान',
    titleEn: 'Phones, cameras and bags',
    textHi:
      'कुछ मंदिरों में फ़ोन, कैमरा या बैग अंदर ले जाने की अनुमति नहीं होती। जहाँ उपलब्ध हो, मंदिर का सामान घर उपयोग करें और नियम गेट पर ही पूछ लें।',
    textEn:
      "Some temples do not allow phones, cameras or bags inside. Use the temple's cloakroom where there is one, and check the rules at the gate.",
  },
  {
    id: 'crowds',
    icon: 'water',
    titleHi: 'भीड़ और गर्मी',
    titleEn: 'Crowds and heat',
    textHi:
      'त्योहारों और छुट्टियों पर भीड़ बहुत होती है। पानी पीते रहें, धूप से बचें और भीड़ में बच्चों का हाथ पकड़े रखें।',
    textEn:
      'Festivals and holidays bring very large crowds. Drink water often, avoid the midday sun and hold children by the hand in crowds.',
  },
  {
    id: 'yamuna',
    icon: 'ghat',
    titleHi: 'यमुना घाट पर',
    titleEn: 'At the Yamuna ghats',
    textHi:
      'वहीं स्नान करें जहाँ स्थानीय लोग स्नान करते हैं और सीढ़ियों के पास रहें। धारा और गहराई बदलती रहती है।',
    textEn:
      'Bathe only where local people bathe and stay near the steps. The current and depth can change.',
  },
];

const TRAVEL = [
  {
    id: 'train',
    icon: 'train',
    titleHi: 'ट्रेन से',
    titleEn: 'By train',
    textHi:
      'मथुरा जंक्शन एक प्रमुख पहुँच स्टेशन है। मौजूदा मार्ग और समय-सारिणी के लिए रेलवे से पुष्टि करें।',
    textEn:
      'Mathura Junction is a common arrival point. Check with the railway for current routes and schedules.',
  },
  {
    id: 'bus',
    icon: 'bus',
    titleHi: 'बस से',
    titleEn: 'By bus',
    textHi: 'चढ़ने की जगह, गंतव्य और वापसी की बस ऑपरेटर से पक्का कर लें।',
    textEn: 'Confirm your boarding point, destination and return service with the operator.',
  },
  {
    id: 'road',
    icon: 'car',
    titleHi: 'सड़क से',
    titleEn: 'By road',
    textHi:
      'रास्ते में आराम के ठिकाने तय करें। मंदिरों के आस-पास और त्योहारों पर वाहन के नियम बदल सकते हैं।',
    textEn:
      'Plan rest stops. Local vehicle access rules can change around temples and during festivals.',
  },
];

function callNumber(number) {
  Linking.openURL(`tel:${number}`).catch(() => {});
}

/**
 * One helpline in the list: small neutral icon, service name, the number and a
 * quiet call glyph. The whole row is the button (opens the phone dialler).
 */
function HelplineRow({ item, isHindi, colors }) {
  const title = isHindi ? item.titleHi : item.titleEn;
  const call = usePressGuard(() => callNumber(item.number));
  return (
    <Pressable
      onPress={call}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? `${title}, ${item.number} पर कॉल करें` : `Call ${item.number}, ${title}`}
      accessibilityHint={isHindi ? 'फ़ोन का डायलर खुलेगा' : 'Opens the phone dialler'}
      style={({ pressed }) => [
        styles.helpRow,
        // Background set in both states (Android drops the radius of conditional backgrounds).
        { backgroundColor: pressed ? colors.surfaceContainerLow : colors.card },
      ]}
    >
      <View style={[styles.helpIcon, { backgroundColor: colors.surfaceContainer }]}>
        {/* Only 112 keeps a touch of red, on its small icon. */}
        <Icon name={item.icon} size={18} color={item.urgent ? colors.warning : colors.muted} />
      </View>
      <View style={styles.flex}>
        <AppText variant="body" weight="600" color={colors.navy}>
          {title}
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          {isHindi ? item.descHi : item.descEn}
        </AppText>
      </View>
      <AppText variant="h3" weight="700" color={colors.navy} style={styles.helpNumber}>
        {item.number}
      </AppText>
      <View style={[styles.callGlyph, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon name="phone" size={18} color={colors.primary} />
      </View>
    </Pressable>
  );
}

function HelplineList({ isHindi, colors }) {
  return (
    <Card padded={false}>
      {EMERGENCY.map((item, index) => (
        <View key={item.number}>
          {index > 0 ? <View style={[styles.helpDivider, { backgroundColor: colors.border }]} /> : null}
          <HelplineRow item={item} isHindi={isHindi} colors={colors} />
        </View>
      ))}
    </Card>
  );
}

function TipCard({ tip, isHindi, colors }) {
  return (
    <Card>
      <View style={styles.inlineTop}>
        <View style={[styles.tipIcon, { backgroundColor: colors.primaryLight }]}>
          <Icon name={tip.icon} size={22} color={colors.primary} />
        </View>
        <AppText variant="h4" weight="700" color={colors.navy} style={styles.flex}>
          {isHindi ? tip.titleHi : tip.titleEn}
        </AppText>
      </View>
      <AppText variant="body" color={colors.text} style={styles.tipText}>
        {isHindi ? tip.textHi : tip.textEn}
      </AppText>
    </Card>
  );
}

export default function HelpdeskScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title={isHindi ? 'सहायता व ज़रूरी बातें' : 'Help & essentials'}
          subtitle={isHindi ? 'ज़रूरी जानकारी पास रखें' : 'Keep important details close'}
          onBack={() => navigation.goBack()}
          right={<LanguageToggle />}
        />

        <View style={styles.content}>
          <View style={styles.section}>
            <SectionHeader
              title={isHindi ? 'सरकारी हेल्पलाइन नंबर' : 'Government helplines'}
              style={styles.sectionHeader}
            />
            <AppText variant="caption" color={colors.muted}>
              {isHindi ? 'नंबर दबाते ही फ़ोन का डायलर खुलेगा' : 'Tap a number to open your phone dialler'}
            </AppText>
            <HelplineList isHindi={isHindi} colors={colors} />
          </View>

          <InfoNote>
            {isHindi
              ? 'तुरंत ख़तरा हो तो 112 पर कॉल करें। अपने पास का कोई पहचान-चिह्न बताएँ और ऑपरेटर के निर्देश मानें।'
              : "If you are in immediate danger, call 112. Share your nearest landmark and follow the operator's instructions."}
          </InfoNote>

          <View style={styles.section}>
            <SectionHeader
              title={isHindi ? 'अपने साथियों का ध्यान' : 'Care for your group'}
              style={styles.sectionHeader}
            />
            {GROUP_TIPS.map((tip) => (
              <TipCard key={tip.id} tip={tip} isHindi={isHindi} colors={colors} />
            ))}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title={isHindi ? 'मंदिर और घाट पर' : 'At temples and ghats'}
              style={styles.sectionHeader}
            />
            {PLACE_TIPS.map((tip) => (
              <TipCard key={tip.id} tip={tip} isHindi={isHindi} colors={colors} />
            ))}
          </View>

          <Card>
            <AppText variant="h4" weight="700" color={colors.navy}>
              {isHindi ? 'ट्रेन, बस और सड़क' : 'Train, bus & road'}
            </AppText>
            {TRAVEL.map((t) => (
              <View key={t.id} style={[styles.inlineTop, styles.travelRow]}>
                <View style={[styles.tipIcon, { backgroundColor: colors.purnimaLight }]}>
                  <Icon name={t.icon} size={22} color={colors.purnima} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyBold" color={colors.navy}>
                    {isHindi ? t.titleHi : t.titleEn}
                  </AppText>
                  <AppText variant="body" color={colors.text}>
                    {isHindi ? t.textHi : t.textEn}
                  </AppText>
                </View>
              </View>
            ))}
          </Card>

          <Card>
            <AppText variant="h4" weight="700" color={colors.navy}>
              {isHindi ? 'DIVYABRAJ को लिखें' : 'Write to DIVYABRAJ'}
            </AppText>
            <AppText variant="body" color={colors.text} style={styles.tipText}>
              {isHindi
                ? 'ऐप के बारे में सुझाव या जानकारी में सुधार के लिए ईमेल करें:'
                : 'For app feedback and content corrections, email:'}
            </AppText>
            <ListRow
              icon="mail"
              title={CONTACT_EMAIL}
              subtitle={isHindi ? 'ईमेल ऐप खोलें' : 'Opens your email app'}
              onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})}
            />
            <AppText variant="small" color={colors.muted}>
              {isHindi ? 'यह आपातकालीन सेवा नहीं है।' : 'Not an emergency service.'}
            </AppText>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 16 },
  section: { gap: 12, marginTop: 8 },
  sectionHeader: { marginBottom: 0 },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  helpIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  helpNumber: { minWidth: 40, textAlign: 'right' },
  callGlyph: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Inset to line up with the service name, not the icon.
  helpDivider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  inlineTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tipText: { marginTop: 10 },
  travelRow: { marginTop: 14, alignItems: 'flex-start' },
});
