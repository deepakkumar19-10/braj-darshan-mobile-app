import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { AppText } from '../common/AppText';
import { ROUTES } from '../../navigation/routes';
import { getTempleImage } from '../../utils/imageAssets';
import { getTempleStatus } from '../../utils/templeHours';
import templesData from '../../data/temples.json';

export default function DivineDarshanCarousel() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const featured = templesData.slice(0, 5);

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <AppText variant="h2" weight="700" color={colors.navy} style={styles.heading}>
            {isHindi ? 'निकटवर्ती दिव्य दर्शन' : 'Divine Darshan Near You'}
          </AppText>
          <AppText variant="caption" color={colors.muted}>
            {isHindi ? 'सटीक पट समय एवं लाइव भीड़ अलर्ट' : 'Live sanctum timings & crowd alerts'}
          </AppText>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.TEMPLES)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="caption" weight="700" color={colors.primary}>
            {isHindi ? 'सभी देखें (४२) >' : 'View All (42) >'}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Horizontal Cards Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
      >
        {featured.map((temple) => {
          const img = getTempleImage(temple);
          const status = getTempleStatus(temple);
          const fav = isFavorite(temple.id);

          return (
            <TouchableOpacity
              key={temple.id}
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                  borderColor: isDark ? colors.border : colors.border,
                },
              ]}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate(ROUTES.TEMPLE_DETAIL, {
                  id: temple.id,
                  temple,
                })
              }
            >
              {/* Image & Scrim Header */}
              <View style={styles.imageWrap}>
                {Boolean(img) ? (
                  <Image source={img} style={styles.templeImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.templeImage, { backgroundColor: colors.cardAlt }]} />
                )}

                {/* Dark Gradient / Scrim Overlay */}
                <View style={styles.scrimOverlay} />

                {/* Top Status Pill */}
                <View style={styles.topStatusPill}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: status.isOpen ? '#22C55E' : '#DC2626' },
                    ]}
                  />
                  <AppText variant="small" weight="700" color="#FFFFFF">
                    {status.isOpen
                      ? isHindi
                        ? 'दर्शन खुला है'
                        : 'DARSHAN OPEN NOW'
                      : isHindi
                        ? 'पट बंद'
                        : 'PAT CLOSED'}
                  </AppText>
                </View>

                {/* Bookmark Heart Button */}
                <TouchableOpacity
                  style={styles.bookmarkBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    toggleFavorite(temple);
                  }}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <AppText variant="caption">{fav ? '❤️' : '🤍'}</AppText>
                </TouchableOpacity>

                {/* Title & Distance Overlay */}
                <View style={styles.imageBottomText}>
                  <AppText variant="small" weight="600" color="#FDE68A" style={styles.distanceTag}>
                    {isHindi ? temple.cityHindi : temple.city} • 1.2 km
                  </AppText>
                  <AppText
                    variant="h3"
                    weight="700"
                    color="#FFFFFF"
                    numberOfLines={1}
                    style={styles.cardTitle}
                  >
                    {isHindi ? temple.nameHindi : temple.name}
                  </AppText>
                </View>
              </View>

              {/* Card Meta Content */}
              <View style={styles.cardContent}>
                <View style={styles.metaRow}>
                  <AppText variant="caption" weight="600" color={colors.primary}>
                    ✧ {isHindi ? 'आरती समय:' : 'Next Aarti:'}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
                    {isHindi ? 'शयन 09:15 PM' : 'Shayan 09:15 PM'}
                  </AppText>
                </View>

                <View style={styles.metaRow}>
                  <AppText variant="small" color={colors.muted}>
                    👥 {isHindi ? 'सामान्य भीड़ (15m दर्शन समय)' : 'Moderate Rush (15m wait)'}
                  </AppText>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleWrap: {
    flex: 1,
    marginRight: 8,
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 2,
  },
  carousel: {
    gap: 14,
    paddingRight: 16,
  },
  card: {
    width: 270,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageWrap: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  templeImage: {
    width: '100%',
    height: '100%',
  },
  scrimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 28, 42, 0.45)',
  },
  topStatusPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBottomText: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
  },
  distanceTag: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 1,
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
