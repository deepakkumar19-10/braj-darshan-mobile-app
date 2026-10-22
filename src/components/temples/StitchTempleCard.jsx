import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Share,
  Linking,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { AppText } from '../common/AppText';
import StitchButton from '../common/StitchButton';
import { getTempleImage } from '../../utils/imageAssets';
import { getTempleStatus } from '../../utils/templeHours';

export default function StitchTempleCard({ temple, onPress }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const fav = isFavorite(temple.id);
  const status = getTempleStatus(temple);
  const img = getTempleImage(temple);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${temple.nameHindi || temple.name} - ${temple.city}\nदर्शन व आरती समय: ${temple.timings?.summer || ''}\n॥ राधे राधे ॥`,
      });
    } catch (e) {}
  };

  const handleMap = () => {
    if (temple.latitude && temple.longitude) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${temple.latitude},${temple.longitude}`);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          borderColor: isDark ? colors.border : colors.border,
        },
      ]}
    >
      {/* 1. Hero Image & Overlays */}
      <TouchableOpacity
        style={styles.imageWrap}
        onPress={onPress}
        activeOpacity={0.92}
      >
        {Boolean(img) ? (
          <Image source={img} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.cardAlt }]} />
        )}

        <View style={styles.scrim} />

        {/* Status Pill */}
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: status.isOpen ? '#22C55E' : '#DC2626' },
            ]}
          />
          <AppText variant="small" weight="700" color="#FFFFFF">
            {status.isOpen
              ? isHindi
                ? 'पट खुला है (Open Now)'
                : 'Open Now (Closes 12:30 PM)'
              : isHindi
                ? 'पट विश्राम (Closed)'
                : 'Closed (Reopens 04:30 PM)'}
          </AppText>
        </View>

        {/* Favorite Bookmark Button */}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => toggleFavorite(temple)}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="caption">{fav ? '❤️' : '🤍'}</AppText>
        </TouchableOpacity>

        {/* Bottom Location & Title */}
        <View style={styles.bottomMeta}>
          <AppText variant="small" weight="700" color="#FDE68A" style={styles.cityTag}>
            {(isHindi ? temple.cityHindi : temple.city)?.toUpperCase()} • 0.8 KM
          </AppText>
          <AppText
            variant="h2"
            weight="700"
            color="#FFFFFF"
            numberOfLines={1}
            style={styles.templeName}
          >
            {isHindi ? temple.nameHindi : temple.name}
          </AppText>
          {Boolean(isHindi ? temple.name : temple.nameHindi) && (
            <AppText variant="small" color="#E2E8F0" numberOfLines={1}>
              {isHindi ? temple.name : temple.nameHindi}
            </AppText>
          )}
        </View>
      </TouchableOpacity>

      {/* 2. Card Content Body */}
      <View style={styles.body}>
        {/* Deity Row */}
        <View style={styles.deityRow}>
          <View style={[styles.deityIconWrap, { backgroundColor: colors.ekadashiLight }]}>
            <AppText variant="caption">🕉️</AppText>
          </View>
          <AppText variant="caption" weight="600" color={colors.textSecondary} style={styles.deityText}>
            {isHindi ? 'ईष्ट देव: ' : 'Deity: '}
            <AppText variant="caption" weight="700" color={colors.navy}>
              {isHindi ? (temple.deityHindi || temple.deity) : temple.deity}
            </AppText>
          </AppText>
        </View>

        {/* 2-Column Darshan Pat Timings Box */}
        <View
          style={[
            styles.patBox,
            {
              backgroundColor: isDark ? colors.cardAlt : colors.surfaceContainerLow,
              borderColor: isDark ? colors.border : colors.surfaceContainerHigh,
            },
          ]}
        >
          <View style={styles.patBoxHeader}>
            <AppText variant="caption" weight="700" color={colors.primary}>
              🕒 {isHindi ? 'दर्शन पट समय (Darshan Pat Timings)' : 'Darshan Pat Timings'}
            </AppText>
            <AppText variant="small" color={colors.muted}>
              {isHindi ? 'सारणी' : 'Schedule'}
            </AppText>
          </View>

          <View style={styles.patColumns}>
            <View style={styles.patCol}>
              <AppText variant="small" weight="700" color={colors.navy}>
                {isHindi ? 'ग्रीष्मकालीन (Summer):' : 'Summer Hours:'}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                05:00 AM - 12:00 PM
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                04:00 PM - 09:30 PM
              </AppText>
            </View>

            <View style={styles.patCol}>
              <AppText variant="small" weight="700" color={colors.navy}>
                {isHindi ? 'शीतकालीन (Winter):' : 'Winter Hours:'}
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                05:30 AM - 12:00 PM
              </AppText>
              <AppText variant="small" color={colors.textSecondary}>
                03:00 PM - 08:30 PM
              </AppText>
            </View>
          </View>
        </View>

        {/* Next Aarti Strip */}
        <View
          style={[
            styles.aartiStrip,
            {
              backgroundColor: isDark ? '#382806' : colors.goldLight,
              borderColor: isDark ? colors.border : '#FDE68A',
            },
          ]}
        >
          <View style={styles.aartiLeft}>
            <AppText variant="caption" weight="700" color={colors.goldDark}>
              🔔 {isHindi ? 'आगामी आरती:' : 'Next Aarti:'}{' '}
              <AppText variant="caption" weight="600" color={colors.navy}>
                {temple.timings?.aarti?.split(',')[0] || (isHindi ? 'संध्या आरती 06:30 PM' : 'Sandhya Aarti 06:30 PM')}
              </AppText>
            </AppText>
          </View>
          <View style={styles.aartiTag}>
            <AppText variant="small" weight="700" color={colors.goldDark}>
              {isHindi ? 'शीघ्र' : 'Upcoming'}
            </AppText>
          </View>
        </View>

        {/* Live Crowd Meter (if featured or high crowd) */}
        {temple.featured && (
          <View
            style={[
              styles.crowdStrip,
              {
                backgroundColor: isDark ? '#451A1A' : '#FEE2E2',
                borderColor: isDark ? colors.border : '#FECACA',
              },
            ]}
          >
            <AppText variant="caption">👥</AppText>
            <View style={styles.crowdMeta}>
              <AppText variant="small" weight="700" color="#DC2626">
                {isHindi ? 'लाइव भीड़ मीटर: अधिक भीड़ (High Rush)' : 'Live Crowd Meter: High Rush'}
              </AppText>
              <AppText variant="small" color="#991B1B">
                {isHindi ? 'गली में लगभग ४५ मिनट की दर्शन पंक्ति' : 'Approx 45m darshan line in gali'}
              </AppText>
            </View>
          </View>
        )}

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          <StitchButton
            title={isHindi ? 'मंदिर दर्शन गाइड देखें' : 'View Temple Guide'}
            showArrow={true}
            variant="primary"
            size="md"
            onPress={onPress}
            style={styles.guideBtn}
          />

          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? colors.cardAlt : colors.borderLight,
                borderColor: colors.border,
              },
            ]}
            onPress={handleMap}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption">🗺️</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? colors.cardAlt : colors.borderLight,
                borderColor: colors.border,
              },
            ]}
            onPress={handleShare}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption">↗️</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrap: {
    height: 185,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 28, 42, 0.45)',
  },
  statusPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
  favBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomMeta: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  cityTag: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
  templeName: {
    fontSize: 18,
    lineHeight: 24,
    marginTop: 1,
  },
  body: {
    padding: 14,
    gap: 10,
  },
  deityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deityIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deityText: {
    flex: 1,
  },
  patBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    gap: 6,
  },
  patBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patCol: {
    flex: 1,
  },
  aartiStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  aartiLeft: {
    flex: 1,
    marginRight: 6,
  },
  aartiTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  crowdStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  crowdMeta: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  guideBtn: {
    flex: 1,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
