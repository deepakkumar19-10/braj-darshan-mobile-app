import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import StitchHeader from '../../components/common/StitchHeader';
import StitchSearchBar from '../../components/common/StitchSearchBar';
import StitchTag from '../../components/common/StitchTag';
import StitchPill from '../../components/common/StitchPill';
import StitchTempleCard from '../../components/temples/StitchTempleCard';
import ActiveAartiModeBanner from '../../components/temples/ActiveAartiModeBanner';
import { ROUTES } from '../../navigation/routes';
import templesData from '../../data/temples.json';

const CITIES = [
  { id: 'All', hi: 'सभी', en: 'All' },
  { id: 'Vrindavan', hi: 'वृंदावन', en: 'Vrindavan' },
  { id: 'Mathura', hi: 'मथुरा', en: 'Mathura' },
  { id: 'Govardhan', hi: 'गोवर्धन', en: 'Govardhan' },
  { id: 'Barsana', hi: 'बरसाना', en: 'Barsana' },
  { id: 'Gokul', hi: 'गोकुल', en: 'Gokul' },
  { id: 'Nandgaon', hi: 'नंदगांव', en: 'Nandgaon' },
];

export default function TempleListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();

  const [searchQuery, setSearchQuery] = useState(route?.params?.search || '');
  const [selectedCity, setSelectedCity] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [selectedMapTemple, setSelectedMapTemple] = useState(templesData[0]);

  // Filtering
  const filteredTemples = templesData.filter((temple) => {
    const matchesCity =
      selectedCity === 'All' ||
      temple.city.toLowerCase() === selectedCity.toLowerCase();

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCity;

    const matchesSearch =
      temple.name.toLowerCase().includes(q) ||
      temple.nameHindi.includes(q) ||
      temple.deity.toLowerCase().includes(q) ||
      temple.city.toLowerCase().includes(q) ||
      temple.shortDescription.toLowerCase().includes(q);

    return matchesCity && matchesSearch;
  });

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* 1. Universal Stitch Header */}
      <StitchHeader
        title={isHindi ? 'श्री धाम मंदिर दर्शन' : 'Braj Temple Darshan'}
        subtitle={isHindi ? 'प्रमुख देवालय व आरती' : 'Verified Aarti & Timings'}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Dhamic Directory Heading */}
        <View style={styles.titleSection}>
          <StitchTag
            icon="🛕"
            text={isHindi ? 'धामिक मंदिर डायरेक्टरी' : 'Dhamic Directory'}
            variant="saffron"
          />

          <AppText variant="h1" weight="700" color={colors.navy} style={styles.mainTitle}>
            {isHindi ? 'ब्रज मंदिर दर्शन (देवालय)' : 'Braj Temple Darshan (मंदिर दर्शन)'}
          </AppText>

          <AppText variant="caption" color={colors.textSecondary} style={styles.subtitle}>
            {isHindi
              ? '८४ कोस ब्रज मण्डल के सभी प्रमुख देवालयों की प्रमाणित आरती समय सारणी व दर्शन गाइड।'
              : 'Verified opening hours, live aarti schedule & GPS navigation across the 84 Kos Braj Mandal.'}
          </AppText>
        </View>

        {/* 3. Search Bar */}
        <StitchSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={
            isHindi
              ? 'मंदिर का नाम, ईष्ट देव या शहर खोजें...'
              : 'Search by deity, temple name, or city...'
          }
        />

        {/* 4. City Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityFilterScroll}
        >
          {CITIES.map((c) => {
            const isActive = selectedCity === c.id;
            return (
              <StitchPill
                key={c.id}
                label={isHindi ? c.hi : c.en}
                active={isActive}
                onPress={() => setSelectedCity(c.id)}
                size="sm"
              />
            );
          })}
        </ScrollView>

        {/* 5. View Mode Toggle (List View vs Map View) */}
        <View style={styles.toggleRow}>
          <View
            style={[
              styles.viewToggleGroup,
              {
                backgroundColor: isDark ? colors.cardAlt : colors.surfaceContainer,
                borderColor: isDark ? colors.border : colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.viewBtn,
                viewMode === 'list' && [styles.viewBtnActive, { backgroundColor: colors.primary }],
              ]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.8}
            >
              <AppText
                variant="small"
                weight="700"
                color={viewMode === 'list' ? '#FFFFFF' : colors.textSecondary}
              >
                📑 {isHindi ? 'सूची (List View)' : 'List View'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.viewBtn,
                viewMode === 'map' && [styles.viewBtnActive, { backgroundColor: colors.primary }],
              ]}
              onPress={() => setViewMode('map')}
              activeOpacity={0.8}
            >
              <AppText
                variant="small"
                weight="700"
                color={viewMode === 'map' ? '#FFFFFF' : colors.textSecondary}
              >
                🗺️ {isHindi ? 'मानचित्र (Map View)' : 'Map View'}
              </AppText>
            </TouchableOpacity>
          </View>

          <StitchPill
            label={isHindi ? 'समीपता' : 'Proximity'}
            icon="🧭"
            count={filteredTemples.length}
            size="sm"
            onPress={() => {}}
          />
        </View>

        {/* 6. Active Aarti Mode in Map View */}
        {viewMode === 'map' ? (
          <View style={styles.mapSection}>
            <ActiveAartiModeBanner
              onBellPress={() => {}}
              onShankhPress={() => {}}
            />

            {/* Interactive Dham Map View Simulation */}
            <View
              style={[
                styles.mapCanvas,
                {
                  backgroundColor: isDark ? '#1C2833' : '#F1F8E9',
                  borderColor: isDark ? colors.border : '#C8E6C9',
                },
              ]}
            >
              <View style={styles.yamunaRiver}>
                <AppText variant="small" weight="700" color="#0284C7">
                  〜 यमुना नदी पावन प्रवाह 〜
                </AppText>
              </View>

              {/* Pin 1: Banke Bihari */}
              <TouchableOpacity
                style={[
                  styles.mapPin,
                  { top: 50, left: 30 },
                  selectedMapTemple?.id === 1 && styles.mapPinActive,
                ]}
                onPress={() => setSelectedMapTemple(templesData[0])}
                activeOpacity={0.8}
              >
                <AppText variant="small" weight="700" color="#FFFFFF">
                  🛕 बांके बिहारी (In 15m)
                </AppText>
              </TouchableOpacity>

              {/* Pin 2: Krishna Janmasthan */}
              <TouchableOpacity
                style={[
                  styles.mapPin,
                  { top: 120, right: 30 },
                  selectedMapTemple?.id === 2 && styles.mapPinActive,
                ]}
                onPress={() => setSelectedMapTemple(templesData[1])}
                activeOpacity={0.8}
              >
                <AppText variant="small" weight="700" color="#FFFFFF">
                  🛕 जन्मस्थान (In 42m)
                </AppText>
              </TouchableOpacity>

              {/* Pin 3: Radha Rani Barsana */}
              <TouchableOpacity
                style={[
                  styles.mapPin,
                  { bottom: 30, left: 50 },
                  selectedMapTemple?.id === 5 && styles.mapPinActive,
                ]}
                onPress={() => setSelectedMapTemple(templesData[4])}
                activeOpacity={0.8}
              >
                <AppText variant="small" weight="700" color="#FFFFFF">
                  🛕 श्रीजी मंदिर
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Selected Temple Preview Card in Map View */}
            {selectedMapTemple && (
              <StitchTempleCard
                temple={selectedMapTemple}
                onPress={() =>
                  navigation.navigate(ROUTES.TEMPLE_DETAIL, {
                    id: selectedMapTemple.id,
                    temple: selectedMapTemple,
                  })
                }
              />
            )}
          </View>
        ) : (
          /* List of Temples */
          <View style={styles.listContainer}>
            {filteredTemples.map((temple) => (
              <StitchTempleCard
                key={temple.id}
                temple={temple}
                onPress={() =>
                  navigation.navigate(ROUTES.TEMPLE_DETAIL, {
                    id: temple.id,
                    temple,
                  })
                }
              />
            ))}
          </View>
        )}

        {/* 7. Pilgrim's Note on Darshan Etiquette */}
        <View
          style={[
            styles.etiquetteCard,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.peach,
              borderColor: isDark ? colors.border : 'rgba(164, 55, 0, 0.18)',
            },
          ]}
        >
          <AppText variant="caption" weight="700" color={colors.primary}>
            🛕 {isHindi ? 'तीर्थयात्री दर्शन शिष्टाचार (Pilgrim Etiquette)' : "Pilgrim's Note • Darshan Etiquette"}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.etiquetteText}>
            {isHindi
              ? 'वृंदावन व मथुरा के अधिकांश देवालयों में दोपहर १२:३० से सायं ०४:३० बजे तक पट विश्राम (शयन) रहता है। कृपया अपनी यात्रा प्रातः मंगला आरती अथवा सायं संध्या आरती के अनुसार नियोजित करें।'
              : 'Most temple sanctums in Vrindavan strictly follow midday afternoon closure (Pat Shayan) between 12:30 PM & 04:30 PM. Plan your journey around early Mangla or evening Sandhya Aartis.'}
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
    paddingTop: 8,
  },
  titleSection: {
    marginVertical: 8,
  },
  mainTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginTop: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  cityFilterScroll: {
    gap: 8,
    paddingVertical: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    borderRadius: 9999,
    padding: 3,
    borderWidth: 1,
  },
  viewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  viewBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  mapSection: {
    marginBottom: 10,
  },
  mapCanvas: {
    height: 240,
    borderRadius: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yamunaRiver: {
    position: 'absolute',
    transform: [{ rotate: '-25deg' }],
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  mapPin: {
    position: 'absolute',
    backgroundColor: '#A43700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapPinActive: {
    backgroundColor: '#CD4700',
    borderWidth: 2,
    borderColor: '#FDE68A',
    transform: [{ scale: 1.08 }],
  },
  listContainer: {
    marginVertical: 4,
  },
  etiquetteCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginVertical: 8,
  },
  etiquetteText: {
    marginTop: 4,
    lineHeight: 18,
  },
});
