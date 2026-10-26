import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { AppText } from '../../components/common/AppText';
import StitchButton from '../../components/common/StitchButton';
import StitchPill from '../../components/common/StitchPill';
import SacredHighlightsGrid from '../../components/temples/SacredHighlightsGrid';
import AartiScheduleTable from '../../components/temples/AartiScheduleTable';
import { getTempleImage } from '../../utils/imageAssets';
import { getTempleStatus } from '../../utils/templeHours';
import templesData from '../../data/temples.json';

export default function TempleDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { id, temple: initialTemple } = route.params || {};
  const temple =
    initialTemple ||
    templesData.find((t) => t.id === id || String(t.id) === String(id)) ||
    templesData[0];

  const fav = isFavorite(temple.id);
  const status = getTempleStatus(temple);
  const img = getTempleImage(temple);

  const [expandedHistory, setExpandedHistory] = useState(false);
  const [stamped, setStamped] = useState(false);

  // Nearby temples in the same city or defined nearby IDs
  const nearbyTemples = (temple.nearbyTempleIds || [])
    .map((nearbyId) => templesData.find((t) => t.id === nearbyId))
    .filter(Boolean);
  const displayNearby =
    nearbyTemples.length > 0
      ? nearbyTemples
      : templesData.filter((t) => t.id !== temple.id && t.city === temple.city).slice(0, 3);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${temple.nameHindi || temple.name} - ${temple.city}\nदर्शन व आरती समय: ${temple.timings?.summer || ''}\n॥ राधे राधे ॥`,
      });
    } catch (e) {}
  };

  const handleOpenMaps = () => {
    if (temple.latitude && temple.longitude) {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`
      );
    }
  };

  const handlePlayAarti = () => {
    if (navigation && temple.audioTrackId) {
      navigation.navigate('AudioPlayer', { trackId: temple.audioTrackId });
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
      {/* 1. Detail Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppText variant="h3" color={colors.navy}>←</AppText>
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <AppText variant="h3" weight="700" color={colors.primary}>
            {isHindi ? 'मंदिर दर्शन' : 'Temple Details'}
          </AppText>
          <AppText variant="small" color={colors.muted}>
            {isHindi ? 'दर्शन स्मृति • पावन महात्म्य' : 'Darshan Smriti • Sacred Guide'}
          </AppText>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption">↗️</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.avatarBtn,
              { backgroundColor: colors.primary, borderColor: colors.goldLight },
            ]}
            onPress={() => {}}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption" color="#FFFFFF">👤</AppText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Pills Row */}
        <View style={styles.pillRow}>
          <StitchPill label={isHindi ? 'प्रथम स्थल' : 'Pratham Sthal'} size="sm" active={true} />
          <StitchPill label={isHindi ? 'तीर्थ केंद्र' : 'Teertha Kendra'} size="sm" />
          <View style={styles.pillSpacer} />
          <TouchableOpacity
            style={[styles.smallIconBtn, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
            onPress={() => toggleFavorite(temple)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption">{fav ? '❤️' : '🤍'}</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallIconBtn, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption">📤</AppText>
          </TouchableOpacity>
        </View>

        {/* 2. Hero Image Banner */}
        <View style={styles.heroCard}>
          {Boolean(img) ? (
            <Image source={img} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.cardAlt }]} />
          )}

          <View style={styles.heroScrim} />

          {/* Top Badges with Real-time IST Status */}
          <View style={styles.heroTopBadges}>
            <View
              style={[
                styles.patBadge,
                {
                  backgroundColor: status.isOpen
                    ? 'rgba(6, 78, 59, 0.92)'
                    : 'rgba(127, 29, 29, 0.92)',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: status.isOpen ? '#34D399' : '#F87171' },
                ]}
              />
              <AppText variant="small" weight="700" color="#FFFFFF">
                {isHindi ? status.badgeHi : status.badgeEn}
              </AppText>
            </View>

            <View style={styles.ratingBadge}>
              <AppText variant="small" weight="700" color="#FDE68A">
                ★ 4.9 (12.4k)
              </AppText>
            </View>
          </View>

          {/* Bottom Overlay Text */}
          <View style={styles.heroBottomText}>
            <View style={styles.locationPill}>
              <AppText variant="small" weight="600" color="#FFFFFF">
                📍 {temple.location || `${temple.city} धाम`}
              </AppText>
            </View>

            <AppText variant="h1" weight="700" color="#FFFFFF" style={styles.heroTitle}>
              {isHindi ? temple.nameHindi : temple.name}
            </AppText>
            <AppText variant="caption" color="#FDE68A" style={styles.heroSub}>
              {temple.taglineHindi || temple.tagline || temple.shortDescription}
            </AppText>
          </View>
        </View>

        {/* 3. Real-Time Awastha Alert Ribbon */}
        <View
          style={[
            styles.awasthaRibbon,
            {
              backgroundColor: isDark ? '#3D2010' : '#FEF3C7',
              borderColor: isDark ? colors.border : '#FDE68A',
            },
          ]}
        >
          <View style={styles.awasthaLeft}>
            <AppText variant="caption">🔔</AppText>
            <View style={{ flex: 1 }}>
              <AppText variant="small" weight="700" color={colors.primary}>
                {isHindi ? status.subtextHi : status.subtextEn}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                {isHindi ? 'दैनिक सेवायत एवं ट्रस्ट परंपरा अनुसार' : 'Official Temple Tradition'}
              </AppText>
            </View>
          </View>

          <View style={[styles.timePill, { backgroundColor: colors.primary }]}>
            <AppText variant="small" weight="700" color="#FFFFFF">
              {status.isOpen ? (isHindi ? 'दर्शन खुले' : 'OPEN') : (isHindi ? 'पट बंद' : 'CLOSED')}
            </AppText>
          </View>
        </View>

        {/* 4. Contextual Devotional Audio Card (OSADHO Inspired) */}
        {Boolean(temple.audioTrackId) && (
          <View
            style={[
              styles.audioCard,
              {
                backgroundColor: isDark ? colors.cardAlt : '#FFF9ED',
                borderColor: isDark ? colors.border : '#FDE68A',
              },
            ]}
          >
            <View style={styles.audioCardHeader}>
              <AppText variant="small" weight="700" color={colors.primary}>
                🪔 {isHindi ? 'मंदिर पावन आरती श्रवण' : 'Sacred Aarti Audio'}
              </AppText>
              <AppText variant="small" color={colors.muted}>
                {isHindi ? 'पूज्य रसिक संतों के पावन स्वर में' : 'Traditional Braj Audio'}
              </AppText>
            </View>
            <View style={styles.audioRow}>
              <View style={[styles.audioPlayIconWrap, { backgroundColor: colors.primary }]}>
                <AppText variant="h3" color="#FFFFFF">▶️</AppText>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="caption" weight="700" color={colors.navy}>
                  {temple.audioTrackId === 'banke_bihari_aarti'
                    ? isHindi
                      ? 'श्री बांके बिहारी जी की आरती'
                      : 'Shri Banke Bihari Aarti'
                    : temple.audioTrackId === 'radhe_radhe_rasbarsane'
                    ? isHindi
                      ? 'राधे राधे बरसाने वाली राधे'
                      : 'Radhe Radhe Barsane Wali'
                    : isHindi
                    ? 'श्री यमुनाष्टकम् स्तोत्रम्'
                    : 'Shri Yamunashtakam Stotram'}
                </AppText>
                <AppText variant="small" color={colors.textSecondary}>
                  {isHindi ? 'पूज्य संतों के सानिध्य में दैनिक मंगल गान' : 'Daily Devotional Chants'}
                </AppText>
              </View>
              <TouchableOpacity
                style={[styles.listenBtn, { backgroundColor: colors.primary }]}
                onPress={handlePlayAarti}
                activeOpacity={0.8}
              >
                <AppText variant="small" weight="700" color="#FFFFFF">
                  {isHindi ? 'सुनें 🔊' : 'Listen'}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 5. Sacred Highlights 2x2 Grid */}
        <View style={styles.sectionWrap}>
          <AppText variant="h3" weight="700" color={colors.navy} style={styles.sectionHeading}>
            {isHindi ? 'पावन देवालय वैशिष्ट्य' : 'Sacred Highlights'}
          </AppText>
          <SacredHighlightsGrid temple={temple} />
        </View>

        {/* 6. Daily Aarti Schedule Table (with Summer/Winter toggle & Trust seal) */}
        <AartiScheduleTable temple={temple} />

        {/* 7. Devotee Pilgrimage Guidelines (2x2 Structured Grid) */}
        {temple.guidelines && temple.guidelines.length > 0 && (
          <View style={styles.sectionWrap}>
            <AppText variant="h3" weight="700" color={colors.navy} style={styles.sectionHeading}>
              {isHindi ? 'श्रद्धालु मर्यादा एवं सावधानियां' : 'Devotee Guidelines & Tips'}
            </AppText>
            <View style={styles.guidelinesGrid}>
              {temple.guidelines.map((guide, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.guidelineTile,
                    {
                      backgroundColor: isDark ? colors.cardAlt : colors.surface,
                      borderColor: isDark ? colors.border : '#F3E8D0',
                    },
                  ]}
                >
                  <AppText variant="h3">{guide.icon}</AppText>
                  <AppText variant="caption" weight="700" color={colors.primary}>
                    {isHindi ? guide.labelHi : guide.labelEn || guide.labelHi}
                  </AppText>
                  <AppText variant="small" color={colors.textSecondary} numberOfLines={2}>
                    {guide.descHi}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 8. Sacred Mahatmya & History */}
        <View
          style={[
            styles.historyCard,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.surface,
              borderColor: isDark ? colors.border : '#F3E8D0',
            },
          ]}
        >
          <View style={styles.historyHeader}>
            <AppText variant="h3" weight="700" color={colors.navy}>
              {isHindi ? 'पावन महात्म्य एवं इतिहास' : 'Sacred Mahatmya & History'}
            </AppText>
            <AppText variant="caption">📜</AppText>
          </View>

          <AppText
            variant="body"
            color={colors.textSecondary}
            numberOfLines={expandedHistory ? undefined : 3}
            style={styles.historyText}
          >
            {temple.history ||
              (isHindi
                ? 'यह पवित्र देवालय ब्रज की प्राचीन धार्मिक एवं रसिक परंपरा का पावन केंद्र है।'
                : 'This sacred temple stands as a venerable sanctuary of divine devotion in the holy Braj Dham.')}
          </AppText>

          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => setExpandedHistory(!expandedHistory)}
            activeOpacity={0.8}
          >
            <AppText variant="caption" weight="700" color={colors.primary}>
              {expandedHistory
                ? (isHindi ? 'कम देखें ∧' : 'Show Less ∧')
                : (isHindi ? 'संपूर्ण इतिहास पढ़ें ∨' : 'Read Full Chronicle ∨')}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* 9. Nearby Sacred Temples */}
        {displayNearby.length > 0 && (
          <View style={styles.sectionWrap}>
            <AppText variant="h3" weight="700" color={colors.navy} style={styles.sectionHeading}>
              {isHindi ? `${temple.city} के अन्य पावन मंदिर` : `Nearby Temples in ${temple.city}`}
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.nearbyScroll}
            >
              {displayNearby.map((near) => (
                <TouchableOpacity
                  key={near.id}
                  style={[
                    styles.nearbyCard,
                    {
                      backgroundColor: isDark ? colors.cardAlt : colors.surface,
                      borderColor: isDark ? colors.border : '#F3E8D0',
                    },
                  ]}
                  onPress={() => navigation.push('TempleDetail', { id: near.id, temple: near })}
                  activeOpacity={0.85}
                >
                  <Image source={getTempleImage(near)} style={styles.nearbyImg} resizeMode="cover" />
                  <View style={styles.nearbyMeta}>
                    <AppText variant="caption" weight="700" color={colors.navy} numberOfLines={1}>
                      {isHindi ? near.nameHindi : near.name}
                    </AppText>
                    <AppText variant="small" color={colors.primary}>
                      📍 {near.city} ➔
                    </AppText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 10. Braj Parikrama Stamp Card */}
        <View
          style={[
            styles.stampCard,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.surfaceContainerLow,
              borderColor: isDark ? colors.border : colors.surfaceContainerHigh,
            },
          ]}
        >
          <View style={styles.stampLeft}>
            <View
              style={[
                styles.stampIconWrap,
                { backgroundColor: stamped ? colors.success : colors.primary },
              ]}
            >
              <AppText variant="body" color="#FFFFFF">
                {stamped ? '✓' : '🏛️'}
              </AppText>
            </View>

            <View style={styles.stampMeta}>
              <AppText variant="caption" weight="700" color={colors.navy}>
                {isHindi ? 'ब्रज परिक्रमा डिजिटल मोहर (Stamp)' : 'Braj Parikrama Stamp'}
              </AppText>
              <AppText variant="small" color={colors.muted}>
                {stamped
                  ? isHindi
                    ? 'आपकी दर्शन हाजिरी दर्ज हो चुकी है!'
                    : 'Darshan verified in your pilgrim passport!'
                  : isHindi
                  ? 'अपनी मंदिर दर्शन हाजिरी दर्ज करें'
                  : 'Record your holy darshan passport'}
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.stampBtn,
              { backgroundColor: stamped ? colors.success : colors.primary },
            ]}
            onPress={() => setStamped(true)}
            activeOpacity={0.8}
            disabled={stamped}
          >
            <AppText variant="small" weight="700" color="#FFFFFF">
              {stamped ? (isHindi ? 'हाजिरी पूर्ण' : 'STAMPED') : (isHindi ? 'हाजिरी लगाएं' : 'STAMP IN')}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* 11. Sticky Bottom CTA */}
        <StitchButton
          title={isHindi ? '🗺️ संपूर्ण गूगल मैप्स मार्ग देखें' : '🗺️ Get Step-by-Step Directions'}
          variant="primary"
          size="lg"
          fullWidth={true}
          onPress={handleOpenMaps}
          style={styles.directionsCta}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  pillSpacer: {
    flex: 1,
  },
  smallIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    height: 230,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 6,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 28, 42, 0.45)',
  },
  heroTopBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  ratingBadge: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  heroBottomText: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  locationPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  heroSub: {
    fontSize: 12,
    marginTop: 2,
  },
  awasthaRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 10,
  },
  awasthaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  timePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  audioCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginVertical: 8,
  },
  audioCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioPlayIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  sectionWrap: {
    marginVertical: 8,
  },
  sectionHeading: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  guidelinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  guidelineTile: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  historyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginVertical: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyText: {
    lineHeight: 22,
  },
  expandBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  nearbyScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  nearbyCard: {
    width: 140,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  nearbyImg: {
    width: '100%',
    height: 90,
  },
  nearbyMeta: {
    padding: 8,
  },
  stampCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginVertical: 10,
  },
  stampLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 10,
  },
  stampIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampMeta: {
    flex: 1,
  },
  stampBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  directionsCta: {
    marginTop: 10,
  },
});
