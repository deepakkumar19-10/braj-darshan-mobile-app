/**
 * Braj Darshan - Help & essentials
 * Layout from the Nov 2026 redesign (Claude Design "Help"): a red emergency panel
 * with the two national numbers as big call buttons (112 filled, 108 outlined),
 * "safe travel" tips as an accordion, how to reach Braj, and the app's contact email.
 *
 * Honesty rules: only India's national numbers (112, 108) are shown. No office
 * addresses, local helplines, live chat, request forms or "dispatch" features,
 * because the app does not run any of those.
 */

import React, { useState } from 'react';
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

// Shown together as one "safe travel" accordion.
const SAFETY_TIPS = [...GROUP_TIPS, ...PLACE_TIPS];

function callNumber(number) {
  Linking.openURL(`tel:${number}`).catch(() => {});
}

/**
 * One big call button in the emergency panel. 112 is filled red, 108 is outlined, so the
 * number for "any emergency" is the first thing the eye lands on. Opens the phone dialler.
 */
function CallButton({ item, isHindi, colors, isDark }) {
  const title = isHindi ? item.titleHi : item.titleEn;
  const desc = isHindi ? item.descHi : item.descEn;
  const call = usePressGuard(() => callNumber(item.number));
  const filled = Boolean(item.urgent);
  // On the filled (red) button text is white in light mode and near-black in dark mode,
  // where the red is lighter; the outlined one uses the theme's red and the panel's text tone.
  const onRed = isDark ? '#1E1B18' : '#FFFFFF';
  const fg = filled ? onRed : colors.warning;
  const sub = filled ? onRed : isDark ? colors.text : '#6A2A22';
  return (
    <Pressable
      onPress={call}
      accessibilityRole="button"
      accessibilityLabel={isHindi ? `${title}, ${item.number} पर कॉल करें` : `Call ${item.number}, ${title}`}
      accessibilityHint={isHindi ? 'फ़ोन का डायलर खुलेगा' : 'Opens the phone dialler'}
      style={({ pressed }) => [
        styles.callButton,
        filled
          ? { backgroundColor: colors.warning }
          : { backgroundColor: colors.surface, borderColor: `${colors.warning}55` },
        !filled && styles.callButtonOutlined,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Icon name="phone" size={26} color={fg} />
      <View style={styles.flex}>
        <AppText variant="h2" weight="700" color={fg} style={styles.callNumber}>
          {item.number}
        </AppText>
        {/* 112 says what it is for; 108 also names the service. */}
        <AppText variant="small" color={sub}>
          {filled ? desc : `${title} — ${desc}`}
        </AppText>
      </View>
    </Pressable>
  );
}

function EmergencyPanel({ isHindi, colors, isDark }) {
  const strong = isDark ? colors.warning : '#8E1B12';
  const soft = isDark ? colors.text : '#6A2A22';
  return (
    <View style={[styles.sos, { backgroundColor: colors.warningBg }]}>
      <View>
        <AppText variant="h4" weight="700" color={strong} accessibilityRole="header">
          {isHindi ? 'तुरंत ख़तरा हो तो 112 पर कॉल करें' : 'If you are in immediate danger, call 112'}
        </AppText>
        <AppText variant="small" color={soft}>
          {isHindi
            ? 'अपने पास का कोई पहचान-चिह्न बताएँ और ऑपरेटर के निर्देश मानें।'
            : "Share your nearest landmark and follow the operator's instructions."}
        </AppText>
      </View>
      {EMERGENCY.map((item) => (
        <CallButton key={item.number} item={item} isHindi={isHindi} colors={colors} isDark={isDark} />
      ))}
      <AppText variant="small" color={soft}>
        {isHindi
          ? 'सरकारी हेल्पलाइन नंबर · नंबर दबाते ही फ़ोन का डायलर खुलेगा'
          : 'Government helplines · Tap a number to open your phone dialler'}
      </AppText>
    </View>
  );
}

function TipRow({ tip, open, onToggle, isHindi, colors }) {
  const title = isHindi ? tip.titleHi : tip.titleEn;
  return (
    <View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
        style={({ pressed }) => [
          styles.tipHead,
          // Background set in both states (Android drops the radius of conditional backgrounds).
          { backgroundColor: pressed ? colors.surfaceContainerLow : colors.card },
        ]}
      >
        <AppText variant="body" weight="600" color={colors.navy} style={styles.flex}>
          {title}
        </AppText>
        <View style={open ? styles.chevronOpen : null}>
          <Icon name="chevronDown" size={20} color={colors.muted} />
        </View>
      </Pressable>
      {open ? (
        <AppText variant="body" color={colors.text} style={styles.tipBody}>
          {isHindi ? tip.textHi : tip.textEn}
        </AppText>
      ) : null}
    </View>
  );
}

export default function HelpdeskScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  // One tip open at a time; the first starts open.
  const [openTip, setOpenTip] = useState(SAFETY_TIPS[0].id);

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
          <EmergencyPanel isHindi={isHindi} colors={colors} isDark={isDark} />

          <View style={styles.section}>
            <SectionHeader title={isHindi ? 'सुरक्षित यात्रा' : 'Travel safely'} style={styles.sectionHeader} />
            <Card padded={false}>
              {SAFETY_TIPS.map((tip, index) => (
                <View key={tip.id}>
                  {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                  <TipRow
                    tip={tip}
                    open={openTip === tip.id}
                    onToggle={() => setOpenTip((cur) => (cur === tip.id ? null : tip.id))}
                    isHindi={isHindi}
                    colors={colors}
                  />
                </View>
              ))}
            </Card>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title={isHindi ? 'ब्रज कैसे पहुँचें' : 'How to reach Braj'}
              style={styles.sectionHeader}
            />
            <View style={styles.travelList}>
              {TRAVEL.map((t) => (
                <Card key={t.id} style={styles.travelRow}>
                  <AppText variant="body" weight="700" color={colors.navy} style={styles.travelLabel}>
                    {isHindi ? t.titleHi : t.titleEn}
                  </AppText>
                  <AppText variant="caption" color={colors.text} style={styles.flex}>
                    {isHindi ? t.textHi : t.textEn}
                  </AppText>
                </Card>
              ))}
            </View>
          </View>

          <Card>
            <AppText variant="h4" weight="700" color={colors.navy}>
              {isHindi ? 'DIVYABRAJ को लिखें' : 'Write to DIVYABRAJ'}
            </AppText>
            <AppText variant="caption" color={colors.text} style={styles.contactText}>
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
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 20 },
  section: { gap: 10 },
  sectionHeader: { marginBottom: 0 },
  sos: { borderRadius: 20, padding: 18, gap: 12 },
  callButton: {
    minHeight: 64,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  callButtonOutlined: { borderWidth: 1 },
  callNumber: { fontSize: 24, lineHeight: 30 },
  divider: { height: StyleSheet.hairlineWidth },
  tipHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  tipBody: { paddingHorizontal: 14, paddingBottom: 14 },
  travelList: { gap: 8 },
  travelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  travelLabel: { width: 76 },
  contactText: { marginTop: 6 },
});
