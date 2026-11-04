/**
 * Braj Darshan - Yatra plans
 * Layout from the Nov 2026 redesign (Yatra artboard): a navy "make my own plan"
 * card that opens the planner (days, who is coming, pace, places), suggested
 * multi-day plans built from the app's own day plans (src/data/yatra.json), and
 * the parikrama guides with their approximate lengths.
 * Plans are suggestions, not bookings; the screen says so.
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Card,
  LanguageToggle,
  Photo,
  SectionHeader,
  TopBar,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { usePressGuard } from '../../hooks/usePressGuard';
import { getPlaceImage } from '../../utils/imageAssets';
import { ROUTES } from '../../navigation/routes';
import yatraData from '../../data/yatra.json';
import parikramaData from '../../data/parikrama.json';
import { getPlaces } from '../../services/contentService';

// The navy call-to-action is a fixed dark panel in both themes (as the Home hero cards).
const HERO_NAVY = '#17324D';
const HERO_TEXT = '#FFFFFF';
const HERO_SUB = '#E6E9EE';
const HERO_ACCENT = '#F4D9A8';

// Each plan is a set of the day plans in yatra.json, in travel order.
const PLANS = [
  {
    key: 'one-day',
    dayIds: [3],
    place: 'Vrindavan',
    titleHi: 'वृंदावन में एक दिन',
    titleEn: 'A day in Vrindavan',
    effortHi: 'अनुमानित श्रम: धीमी गति · दर्शनों के बीच थोड़ा पैदल चलना।',
    effortEn: 'Approx. effort: gentle pace · short walks between visits.',
    townsHi: ['वृंदावन'],
    townsEn: ['Vrindavan'],
  },
  {
    key: 'two-days',
    dayIds: [1, 3],
    place: 'Mathura',
    titleHi: 'ब्रज का हृदय',
    titleEn: 'The heart of Braj',
    effortHi: 'अनुमानित श्रम: मध्यम पैदल चलना · शहरों के बीच सड़क से जाना।',
    effortEn: 'Approx. effort: moderate walking · one road transfer between towns.',
    townsHi: ['मथुरा', 'वृंदावन'],
    townsEn: ['Mathura', 'Vrindavan'],
  },
  {
    key: 'three-days',
    dayIds: [1, 3, 4],
    place: 'Govardhan',
    titleHi: 'राधा-कृष्ण के पदचिह्नों पर',
    titleEn: 'In Radha–Krishna’s footsteps',
    effortHi: 'अनुमानित श्रम: मध्यम · गोवर्धन परिक्रमा का दिन लंबा है, चाहें तो छोटा करें।',
    effortEn: 'Approx. effort: moderate · the Govardhan parikrama day is long; shorten it if needed.',
    townsHi: ['मथुरा', 'वृंदावन', 'गोवर्धन'],
    townsEn: ['Mathura', 'Vrindavan', 'Govardhan'],
  },
  {
    key: 'six-days',
    dayIds: [1, 2, 3, 4, 5, 6],
    place: 'Barsana',
    titleHi: 'ब्रज, धीरे और गहराई से',
    titleEn: 'Braj, slowly and deeply',
    effortHi: 'अनुमानित श्रम: अपनी गति से · लंबी पैदल यात्राएं वैकल्पिक हैं।',
    effortEn: 'Approx. effort: flexible pace · longer walks are optional.',
    townsHi: ['मथुरा', 'गोकुल', 'वृंदावन', 'गोवर्धन', 'बरसाना', 'बलदेव'],
    townsEn: ['Mathura', 'Gokul', 'Vrindavan', 'Govardhan', 'Barsana', 'Baldev'],
  },
];

// Approximate length shown in the parikrama list (from parikrama.json, rounded).
const PARIKRAMA_LENGTH = {
  govardhan: ['लगभग 21 किमी', 'About 21 km'],
  vrindavan: ['लगभग 11–12 किमी', 'About 11–12 km'],
  chaurasi_kos: ['लगभग 268 किमी (84 कोस)', 'About 268 km (84 kos)'],
  barsana: ['लगभग 4 किमी', 'About 4 km'],
  mathura: ['लगभग 10 किमी', 'About 10 km'],
};

const PARIKRAMA_NAME_EN = {
  govardhan: 'Govardhan Parikrama',
  vrindavan: 'Vrindavan Parikrama',
  chaurasi_kos: 'Chaurasi Kos Braj Parikrama',
  barsana: 'Barsana Parikrama',
  mathura: 'Mathura Parikrama',
};

function placeImage(name) {
  return getPlaceImage(getPlaces().find((p) => p.name === name));
}

function PlannerCta({ onPress, isHindi }) {
  const guarded = usePressGuard(onPress);
  const title = isHindi ? 'अपनी योजना बनाएं' : 'Make my own plan';
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={styles.ctaText}>
        <AppText variant="h3" weight="700" color={HERO_TEXT}>
          {title}
        </AppText>
        <AppText variant="caption" color={HERO_SUB}>
          {isHindi
            ? 'कितने दिन, कौन साथ है, क्या देखना है — बताइए, योजना हम सुझाएँगे।'
            : 'How many days, who is coming, what to see — tell us and we’ll suggest a plan.'}
        </AppText>
      </View>
      <View style={styles.ctaArrow}>
        <Icon name="chevronRight" size={24} color={HERO_NAVY} />
      </View>
    </Pressable>
  );
}

function PlanCard({ plan, onOpen, isHindi, colors }) {
  const days = plan.dayIds.length;
  const daysLabel = isHindi ? `${days} दिन` : `${days} ${days === 1 ? 'day' : 'days'}`;
  const title = isHindi ? plan.titleHi : plan.titleEn;
  return (
    <Card
      onPress={onOpen}
      accessibilityLabel={isHindi ? `${daysLabel} की योजना देखें: ${title}` : `View ${daysLabel} plan: ${title}`}
      style={styles.planCard}
    >
      <View style={styles.planRow}>
        <Photo source={placeImage(plan.place)} style={styles.planPhoto} />
        <View style={styles.planText}>
          <View style={[styles.dayPill, { backgroundColor: colors.primaryLight }]}>
            <AppText variant="small" weight="700" color={colors.primary}>
              {daysLabel}
            </AppText>
          </View>
          <AppText variant="h4" weight="700" color={colors.navy}>
            {title}
          </AppText>
          <AppText variant="small" color={colors.text}>
            {(isHindi ? plan.townsHi : plan.townsEn).join(' · ')}
          </AppText>
          <AppText variant="small" color={colors.muted}>
            {isHindi ? plan.effortHi : plan.effortEn}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

function ParikramaRow({ title, length, onPress, first, colors }) {
  const guarded = usePressGuard(onPress);
  return (
    <Pressable
      onPress={guarded}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${length}`}
      style={({ pressed }) => [
        styles.pkRow,
        !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.pkIcon, { backgroundColor: colors.primaryLight }]}>
        <Icon name="parikrama" size={22} color={colors.primary} />
      </View>
      <AppText variant="body" weight="600" color={colors.navy} style={styles.flex}>
        {title}
      </AppText>
      <AppText variant="small" color={colors.muted} align="right" style={styles.pkLength}>
        {length}
      </AppText>
    </Pressable>
  );
}

export default function YatraScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  const openPlan = (plan) => {
    const first = yatraData.find((d) => d.id === plan.dayIds[0]) || yatraData[0];
    navigation.navigate(ROUTES.YATRA_DETAIL, { id: first.id, yatra: first, planDayIds: plan.dayIds });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <TopBar
        title={isHindi ? 'यात्रा योजनाएं' : 'Yatra plans'}
        subtitle={isHindi ? 'भक्ति के लिए समय निकालें' : 'Make space for devotion'}
        onBack={() => navigation.goBack()}
        right={<LanguageToggle />}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <PlannerCta isHindi={isHindi} onPress={() => navigation.navigate(ROUTES.SMART_PLANNER)} />

        {/* Suggested plans */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <AppText variant="h3" weight="700" color={colors.navy} style={styles.flex}>
              {isHindi ? 'सुझाई गई यात्राएं' : 'Suggested plans'}
            </AppText>
            <View style={styles.repNote}>
              <Icon name="camera" size={16} color={colors.muted} />
              <AppText variant="small" color={colors.muted}>
                {isHindi ? 'प्रतीकात्मक चित्र' : 'Representative photos'}
              </AppText>
            </View>
          </View>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              isHindi={isHindi}
              colors={colors}
              onOpen={() => openPlan(plan)}
            />
          ))}
        </View>

        {/* Parikrama guides */}
        <View>
          <SectionHeader title={isHindi ? 'परिक्रमा मार्गदर्शिका' : 'Parikrama guides'} />
          <Card style={styles.listCard}>
            {parikramaData.map((p, idx) => (
              <ParikramaRow
                key={p.id}
                first={idx === 0}
                colors={colors}
                title={isHindi ? p.title : PARIKRAMA_NAME_EN[p.id] || p.titleEn}
                length={(PARIKRAMA_LENGTH[p.id] || [p.distance, p.distance])[isHindi ? 0 : 1]}
                onPress={() => navigation.navigate(ROUTES.PARIKRAMA_DETAIL, { id: p.id, parikrama: p })}
              />
            ))}
          </Card>
        </View>

        <AppText variant="small" color={colors.muted}>
          {isHindi
            ? 'ये सुझाई गई यात्राएं हैं, बुकिंग नहीं। त्योहारों पर समय बदल सकता है — कृपया स्थानीय पुष्टि करें।'
            : 'Suggested itineraries, not bookings. Timings may change on festivals — confirm locally.'}
        </AppText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4, gap: 20 },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: HERO_NAVY,
  },
  ctaText: { flex: 1, gap: 4 },
  ctaArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: HERO_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  repNote: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  planCard: { padding: 12 },
  planRow: { flexDirection: 'row', gap: 14 },
  planPhoto: { width: 84, height: 84, borderRadius: 14 },
  planText: { flex: 1, gap: 4 },
  dayPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 1, borderRadius: 999 },

  listCard: { paddingVertical: 0, paddingHorizontal: 14 },
  pkRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingVertical: 8 },
  pkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pkLength: { maxWidth: '40%' },
});
