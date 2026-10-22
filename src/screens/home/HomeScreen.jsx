import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import StitchHeader from '../../components/common/StitchHeader';
import StitchSearchBar from '../../components/common/StitchSearchBar';
import MahotsavCountdownCard from '../../components/home/MahotsavCountdownCard';
import ServiceNodeCluster from '../../components/home/ServiceNodeCluster';
import DivineDarshanCarousel from '../../components/home/DivineDarshanCarousel';
import DevotionalAudioBar from '../../components/home/DevotionalAudioBar';
import { ROUTES } from '../../navigation/routes';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.navigate(ROUTES.TEMPLES, { search: searchQuery.trim() });
    }
  };

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
      {/* 1. Stitch Top Header */}
      <StitchHeader
        title={isHindi ? 'श्री ब्रज दर्शन' : 'Shri Braj Darshan'}
        subtitle={isHindi ? 'दिव्य धाम' : 'Home'}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Stitch Search Bar */}
        <View style={styles.searchSection}>
          <StitchSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              isHindi
                ? 'मंदिर, आरती समय, घाट या भोग खोजें...'
                : 'Search temples, aarti timings, ghats, prasad...'
            }
            onMicPress={() => {
              navigation.navigate(ROUTES.TEMPLES);
            }}
          />
        </View>

        {/* 3. Weather / Location Ribbon */}
        <View style={styles.ribbonSection}>
          <AppText variant="small" color={colors.muted} numberOfLines={1}>
            🧭 {isHindi ? 'वृंदावन धाम • ३२°C धूप • यमुना जल: पावन' : 'Vrindavan Dham • 32°C Sunny • Yamuna Jal: Auspicious'}
          </AppText>
        </View>

        {/* 4. Hero Festival Countdown Card */}
        <MahotsavCountdownCard
          onExplorePress={() =>
            navigation.navigate(ROUTES.TEMPLE_DETAIL, { id: 2 })
          }
        />

        {/* 5. Panchang Tithi Strip */}
        <TouchableOpacity
          style={[
            styles.tithiStrip,
            {
              backgroundColor: isDark ? colors.cardAlt : '#FAF5FF',
              borderColor: isDark ? colors.border : '#E9D5FF',
            },
          ]}
          onPress={() => navigation.navigate(ROUTES.PANCHANG)}
          activeOpacity={0.8}
        >
          <View style={styles.tithiLeft}>
            <AppText variant="caption" weight="700" color={colors.ekadashi}>
              🪷 {isHindi ? 'श्रावण शुक्ल एकादशी • पवित्रा एकादशी व्रत' : 'Shravana Shukla Ekadashi • Pavitra Ekadashi Vrat'}
            </AppText>
          </View>
          <View style={styles.tithiRight}>
            <AppText variant="small" color={colors.muted}>
              ☀️ {isHindi ? 'सूर्योदय ०६:१२ AM' : 'Sunrise 06:12 AM'}
            </AppText>
          </View>
        </TouchableOpacity>

        {/* 6. Quick Service Nodes Cluster */}
        <ServiceNodeCluster />

        {/* 7. Divine Darshan Near You Carousel */}
        <DivineDarshanCarousel />

        {/* 8. Yamuna Maha Aarti & Boats Card */}
        <View
          style={[
            styles.boatCard,
            {
              backgroundColor: isDark ? colors.cardAlt : '#EFF6FF',
              borderColor: isDark ? colors.border : '#BFDBFE',
            },
          ]}
        >
          <View style={styles.boatLeft}>
            <View
              style={[
                styles.flameIconWrap,
                {
                  backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE',
                },
              ]}
            >
              <AppText variant="body">🪔</AppText>
            </View>

            <View style={styles.boatMeta}>
              <AppText variant="body" weight="700" color={colors.navy}>
                {isHindi ? 'यमुना महाआरती व नौका विहार' : 'Yamuna Maha Aarti & Boats'}
              </AppText>
              <AppText variant="small" color={colors.muted}>
                {isHindi
                  ? 'केशी घाट सूर्यास्त दर्शन स्लॉट उपलब्ध'
                  : 'Keshi Ghat sunset darshan slots open'}
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: '#FFFFFF', borderColor: '#BFDBFE' }]}
            onPress={() => navigation.navigate(ROUTES.PLACES)}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="small" weight="700" color={colors.primary}>
              {isHindi ? 'घाट दर्शन' : 'Book Boat'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* 9. Devotional Audio & Soundscape Strip */}
        <DevotionalAudioBar />
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
  searchSection: {
    marginVertical: 6,
  },
  ribbonSection: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  tithiStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    marginVertical: 8,
  },
  tithiLeft: {
    flex: 1,
    marginRight: 6,
  },
  tithiRight: {
    flexShrink: 0,
  },
  boatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 8,
  },
  boatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  flameIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  boatMeta: {
    flex: 1,
  },
  bookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
