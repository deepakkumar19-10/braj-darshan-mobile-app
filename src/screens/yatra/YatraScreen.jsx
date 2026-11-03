/**
 * Braj Darshan - Yatra plans
 * Layout from the redesign (design-input/figma "Light · Yatra plans"): suggested
 * multi-day plans built from the app's own day plans (src/data/yatra.json), the
 * parikrama guides, and a short "make my own plan" form that opens the planner.
 * Plans are suggestions, not bookings; the screen says so.
 */

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import {
  Button,
  Card,
  Chip,
  InfoNote,
  LanguageToggle,
  ListRow,
  Photo,
  SectionHeader,
  TopBar,
  GUTTER,
  useBottomInset,
} from '../../components/ui';
import { getPlaceImage } from '../../utils/imageAssets';
import { ROUTES } from '../../navigation/routes';
import yatraData from '../../data/yatra.json';
import parikramaData from '../../data/parikrama.json';
import { getPlaces } from '../../services/contentService';

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

// Quick choices here pre-fill the planner screen, which builds the plan.
const QUICK_DAYS = [1, 2, 3, 6];
const QUICK_INCLUDE = [
  { id: 'temples', icon: 'temple', hi: 'मंदिर', en: 'Temples', experiences: ['banke_bihari', 'janmabhoomi', 'barsana'] },
  { id: 'ghats', icon: 'ghat', hi: 'घाट', en: 'Ghats', experiences: ['keshi_ghat', 'gokul'] },
  { id: 'food', icon: 'food', hi: 'ब्रज भोग', en: 'Food', experiences: ['food_tour'] },
  { id: 'parikrama', icon: 'parikrama', hi: 'परिक्रमा', en: 'Parikrama', experiences: ['govardhan', 'radha_kund'] },
];

function placeImage(name) {
  return getPlaceImage(getPlaces().find((p) => p.name === name));
}

function PlanCard({ plan, onOpen, isHindi, colors }) {
  const days = plan.dayIds.length;
  const daysLabel = isHindi ? `${days} दिन` : `${days} ${days === 1 ? 'day' : 'days'}`;
  return (
    <Card style={styles.planCard}>
      <Photo
        source={placeImage(plan.place)}
        representative
        style={styles.planPhoto}
        accessibilityLabel={isHindi ? plan.titleHi : plan.titleEn}
      />
      <AppText variant="h3" weight="700" color={colors.navy} style={styles.planTitle}>
        {daysLabel} · {isHindi ? plan.titleHi : plan.titleEn}
      </AppText>
      <AppText variant="body" color={colors.textSecondary}>
        {isHindi ? plan.effortHi : plan.effortEn}
      </AppText>
      <View style={styles.townRow}>
        <Icon name="location" size={18} color={colors.muted} />
        <AppText variant="caption" color={colors.muted} style={styles.flex}>
          {(isHindi ? plan.townsHi : plan.townsEn).join(' · ')}
        </AppText>
      </View>
      <Button
        title={isHindi ? 'योजना देखें' : 'View plan'}
        variant="secondary"
        icon="route"
        onPress={onOpen}
        accessibilityLabel={isHindi ? `${daysLabel} की योजना देखें` : `View ${daysLabel} plan`}
      />
    </Card>
  );
}

export default function YatraScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();

  const [quickDays, setQuickDays] = useState(2);
  const [withElders, setWithElders] = useState(true);
  const [withChildren, setWithChildren] = useState(false);
  const [include, setInclude] = useState(['temples']);

  const openPlan = (plan) => {
    const first = yatraData.find((d) => d.id === plan.dayIds[0]) || yatraData[0];
    navigation.navigate(ROUTES.YATRA_DETAIL, { id: first.id, yatra: first, planDayIds: plan.dayIds });
  };

  const toggleInclude = (id) =>
    setInclude((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const createPlan = () => {
    const experiences = QUICK_INCLUDE.filter((q) => include.includes(q.id)).flatMap((q) => q.experiences);
    navigation.navigate(ROUTES.SMART_PLANNER, {
      days: quickDays,
      elders: withElders,
      children: withChildren,
      experiences,
      autoCreate: true,
    });
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
        <InfoNote>
          {isHindi
            ? 'ये सुझाई गई यात्राएं हैं, बुकिंग नहीं। त्योहारों पर समय बदल सकता है — कृपया स्थानीय पुष्टि करें।'
            : 'Suggested itineraries, not bookings. Timings may change on festivals — confirm locally.'}
        </InfoNote>

        {PLANS.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            isHindi={isHindi}
            colors={colors}
            onOpen={() => openPlan(plan)}
          />
        ))}

        {/* Parikrama guides */}
        <View style={styles.section}>
          <SectionHeader title={isHindi ? 'परिक्रमा मार्गदर्शिका' : 'Parikrama guides'} />
          <Card style={styles.listCard}>
            {parikramaData.map((p, idx) => (
              <View key={p.id}>
                {idx > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                <ListRow
                  icon="parikrama"
                  title={isHindi ? p.title : PARIKRAMA_NAME_EN[p.id] || p.titleEn}
                  subtitle={(PARIKRAMA_LENGTH[p.id] || [p.distance, p.distance])[isHindi ? 0 : 1]}
                  onPress={() => navigation.navigate(ROUTES.PARIKRAMA_DETAIL, { id: p.id, parikrama: p })}
                />
              </View>
            ))}
          </Card>
        </View>

        {/* Make my own plan */}
        <View style={styles.section}>
          <Card>
            <AppText variant="h3" weight="700" color={colors.navy}>
              {isHindi ? 'अपनी योजना बनाएं' : 'Make my own plan'}
            </AppText>
            <AppText variant="body" color={colors.textSecondary} style={styles.gapSmall}>
              {isHindi
                ? 'बताइए आपके समूह के लिए क्या सुविधाजनक है।'
                : 'Tell us what feels comfortable for your group.'}
            </AppText>

            <AppText variant="bodyBold" color={colors.navy} style={styles.question}>
              {isHindi ? 'कितने दिन?' : 'How many days?'}
            </AppText>
            <View style={styles.chipRow}>
              {QUICK_DAYS.map((n) => (
                <Chip
                  key={n}
                  label={isHindi ? `${n} दिन` : `${n} ${n === 1 ? 'day' : 'days'}`}
                  selected={quickDays === n}
                  onPress={() => setQuickDays(n)}
                />
              ))}
            </View>

            <AppText variant="bodyBold" color={colors.navy} style={styles.question}>
              {isHindi ? 'कौन साथ आ रहा है?' : 'Who’s coming?'}
            </AppText>
            <View style={styles.chipRow}>
              <Chip
                label={isHindi ? 'बुज़ुर्ग' : 'Elders'}
                icon="people"
                selected={withElders}
                onPress={() => setWithElders((v) => !v)}
              />
              <Chip
                label={isHindi ? 'बच्चे' : 'Children'}
                icon="people"
                selected={withChildren}
                onPress={() => setWithChildren((v) => !v)}
              />
            </View>

            <AppText variant="bodyBold" color={colors.navy} style={styles.question}>
              {isHindi ? 'क्या शामिल करना चाहेंगे?' : 'What would you like to include?'}
            </AppText>
            <View style={styles.chipRow}>
              {QUICK_INCLUDE.map((q) => (
                <Chip
                  key={q.id}
                  label={isHindi ? q.hi : q.en}
                  icon={q.icon}
                  selected={include.includes(q.id)}
                  onPress={() => toggleInclude(q.id)}
                />
              ))}
            </View>

            <Button
              title={isHindi ? 'मेरी योजना बनाएं' : 'Create my plan'}
              icon="route"
              onPress={createPlan}
              style={styles.createBtn}
            />
            <AppText variant="caption" color={colors.muted} style={styles.gapSmall}>
              {isHindi
                ? 'योजना ऐप की दिन-योजनाओं से बनती है। समय केवल सुझाव हैं।'
                : 'The plan is built from the app’s day plans. Times are suggestions only.'}
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
  planCard: { gap: 8 },
  planPhoto: { height: 168, borderRadius: 14, marginBottom: 6 },
  planTitle: { marginTop: 2 },
  townRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  section: { marginTop: 8 },
  listCard: { paddingVertical: 4 },
  divider: { height: 1 },
  gapSmall: { marginTop: 6 },
  question: { marginTop: 18, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  createBtn: { marginTop: 22 },
});
