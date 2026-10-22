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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${temple.nameHindi || temple.name} - ${temple.city}\nदर्शन व आरती समय: ${temple.timings?.summer || ''}\n॥ राधे राधे ॥`,
      });
    } catch (e) {}
  };

  const handleOpenMaps = () => {
    if (temple.latitude && temple.longitude) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${temple.latitude},${temple.longitude}`);
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
            onPress={() => {}}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption">🔔</AppText>
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

          {/* Top Badges */}
          <View style={styles.heroTopBadges}>
            <View style={styles.patBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: status.isOpen ? '#22C55E' : '#DC2626' },
                ]}
              />
              <AppText variant="small" weight="700" color="#FFFFFF">
                {status.isOpen
                  ? isHindi
                    ? 'पट खुला है • 12:30 PM तक'
                    : 'PAT OPEN • CLOSING 12:30 PM'
                  : isHindi
                    ? 'पट बंद • 04:30 PM पर खुलेंगे'
                    : 'PAT CLOSED • OPENS 04:30 PM'}
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
                📍 {temple.location || `${temple.city} • 1.4 km from Station`}
              </AppText>
            </View>

            <AppText variant="h1" weight="700" color="#FFFFFF" style={styles.heroTitle}>
              {isHindi ? temple.nameHindi : temple.name}
            </AppText>
            <AppText variant="caption" color="#FDE68A" style={styles.heroSub}>
              {temple.shortDescriptionEn || temple.shortDescription}
            </AppText>
          </View>
        </View>

        {/* 3. Current Awastha Alert Ribbon */}
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
            <View>
              <AppText variant="small" weight="700" color={colors.primary}>
                {isHindi ? 'वर्तमान अवस्था: राजभोग दर्शन / भोग' : 'CURRENT AWASTHA: Rajbhog Darshan / Bhog'}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                {isHindi ? 'पट बंद होने में १ घंटा २० मिनट शेष' : 'Next Pat closure in 1h 20m'}
              </AppText>
            </View>
          </View>

          <View style={[styles.timePill, { backgroundColor: colors.primary }]}>
            <AppText variant="small" weight="700" color="#FFFFFF">
              {isHindi ? '१ घं. २० मि.' : 'IN 1h 20m'}
            </AppText>
          </View>
        </View>

        {/* 4. Sacred Highlights 2x2 Grid */}
        <View style={styles.sectionWrap}>
          <AppText variant="h3" weight="700" color={colors.navy} style={styles.sectionHeading}>
            {isHindi ? 'पावन देवालय वैशिष्ट्य' : 'Sacred Highlights'}
          </AppText>
          <SacredHighlightsGrid temple={temple} />
        </View>

        {/* 5. Daily Aarti Schedule Table */}
        <AartiScheduleTable temple={temple} />

        {/* 6. Pilgrim Security & Electronics Advisory */}
        <View
          style={[
            styles.advisoryCard,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.peach,
              borderColor: isDark ? colors.border : 'rgba(164, 55, 0, 0.18)',
            },
          ]}
        >
          <View style={styles.advisoryHeader}>
            <AppText variant="caption">🛡️</AppText>
            <AppText variant="caption" weight="700" color={colors.primary}>
              {isHindi ? 'तीर्थयात्री सुरक्षा व सुविधा निर्देश' : 'Pilgrim Security Advisory'}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textSecondary} style={styles.advisoryBody}>
            {isHindi
              ? 'मुख्य प्रवेश द्वार पर सघन सुरक्षा जांच की जाती है। मंदिर परिसर में स्मार्टफ़ोन, इलेक्ट्रॉनिक घड़ियां, चमड़े के बेल्ट व पर्स ले जाना पूर्णतः प्रतिबंधित है। प्रवेश से पूर्व काउंटर संख्या ३ पर निःशुल्क क्लॉक रूम में सामग्री जमा कराएं। वृद्धजनों व दिव्यांगों हेतु व्हीलचेयर उपलब्ध है।'
              : 'Rigorous security screening operates at Gate No. 1. Devotees must deposit all smartphones, electronic smartwatches, and leather accessories at Counter #3 prior to entry. A dedicated ramp corridor is provided for senior citizens and differently-abled yatris.'}
          </AppText>
        </View>

        {/* 7. Sacred Mahatmya & History */}
        <View
          style={[
            styles.historyCard,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.surface,
              borderColor: isDark ? colors.border : colors.border,
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
                ? 'द्वापर युग में भाद्रपद कृष्ण अष्टमी की मध्यरात्रि को कंस के कारागार में भगवान श्री कृष्ण का चतुर्भुज रूप में प्राकट्य हुआ था। यह पवित्र स्थल समस्त विश्व के भक्तों का परम श्रद्धा केंद्र है।'
                : 'Deep beneath the main sanctum sanctorum lies the venerable subterranean chamber revered as the original prison cell (Kara-griha) of King Kamsa. It was within these stone walls on the eighth day of the dark fortnight in Bhadrapada month that Supreme Lord manifested in divine four-armed Vishnu form.')}
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

        {/* 8. Temple Location & Access Card */}
        <View
          style={[
            styles.accessCard,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.surface,
              borderColor: isDark ? colors.border : colors.border,
            },
          ]}
        >
          <View style={styles.accessHeader}>
            <View>
              <AppText variant="h3" weight="700" color={colors.navy}>
                {isHindi ? 'स्थान एवं सुगम आवागमन' : 'Temple Location & Access'}
              </AppText>
              <AppText variant="small" color={colors.muted}>
                {temple.latitude && temple.longitude
                  ? `Coordinates: ${temple.latitude}° N, ${temple.longitude}° E`
                  : 'Mathura-Vrindavan Central Circuit'}
              </AppText>
            </View>
            <AppText variant="caption">🧭</AppText>
          </View>

          {/* Travel Mode Estimates */}
          <View style={styles.commuteRow}>
            <View style={styles.commuteItem}>
              <AppText variant="caption">🛺</AppText>
              <AppText variant="small" weight="700" color={colors.navy}>
                {isHindi ? 'ई-रिक्शा' : 'E-Rickshaw'}
              </AppText>
              <AppText variant="small" color={colors.primary}>
                ₹20-30
              </AppText>
            </View>

            <View style={styles.commuteItem}>
              <AppText variant="caption">🚶</AppText>
              <AppText variant="small" weight="700" color={colors.navy}>
                {isHindi ? 'पैदल मार्ग' : 'On Foot'}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                {isHindi ? '१५ मिनट' : '15 min'}
              </AppText>
            </View>

            <View style={styles.commuteItem}>
              <AppText variant="caption">🅿</AppText>
              <AppText variant="small" weight="700" color={colors.navy}>
                {isHindi ? 'पार्किंग' : 'Parking'}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                Gate 3
              </AppText>
            </View>
          </View>
        </View>

        {/* 9. Braj Parikrama Stamp Card */}
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
                  ? (isHindi ? 'आपकी दर्शन हाजिरी दर्ज हो चुकी है!' : 'Darshan verified in your pilgrim passport!')
                  : (isHindi ? 'अपनी जन्मस्थान दर्शन हाजिरी दर्ज करें' : 'Record your holy darshan passport')}
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

        {/* 10. Sticky Bottom CTA */}
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
    backgroundColor: 'rgba(0,0,0,0.68)',
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
  sectionWrap: {
    marginVertical: 6,
  },
  sectionHeading: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  advisoryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginVertical: 8,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  advisoryBody: {
    lineHeight: 18,
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
  accessCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginVertical: 8,
  },
  accessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commuteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  commuteItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
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
