import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, radii, shadows } from '../../theme';
import { AppText, Badge } from '../common';
import { getEventImage } from '../../utils/imageAssets';

export default function EventCard({ event }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const eventImg = getEventImage(event);

  const handleOpenMap = () => {
    if (event.latitude && event.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
      Linking.openURL(url);
    } else {
      const query = encodeURIComponent(`${event.title} ${event.location} Braj`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.border : colors.goldLight,
        },
        shadows.sm,
      ]}
    >
      {Boolean(eventImg) && (
        <View style={styles.imageContainer}>
          <Image source={eventImg} style={styles.cardImage} resizeMode="cover" />
        </View>
      )}

      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.badgeCluster}>
          <Badge label={event.location} variant="gold" icon="📍" />
          <Badge
            label={event.month?.split('(')[0]?.trim() || (isHindi ? 'वार्षिक पर्व' : 'Festival')}
            variant="purple"
          />
        </View>

        <Badge label={event.category} variant="success" />
      </View>

      {/* Event Title */}
      <AppText variant="h2" color={colors.navy} style={styles.title}>
        {isHindi ? event.title : (event.titleEn || event.title)}
      </AppText>
      {Boolean(event.titleEn && isHindi) && (
        <AppText variant="caption" color={colors.muted} style={styles.subtitle}>
          {event.titleEn}
        </AppText>
      )}

      {/* Tithi Highlight Box */}
      <View
        style={[
          styles.tithiBox,
          {
            backgroundColor: isDark ? colors.cardAlt : colors.primaryLight,
            borderColor: isDark ? colors.border : colors.goldLight,
          },
        ]}
      >
        <AppText variant="caption" weight="700" color={colors.primary}>
          {isHindi ? '🗓️ पावन तिथि:' : '🗓️ Sacred Date:'}
        </AppText>
        <AppText
          variant="caption"
          weight="700"
          color={colors.text}
          style={styles.tithiValue}
        >
          {event.date}
        </AppText>
      </View>

      {/* Description */}
      <AppText variant="body" color={colors.textSecondary} style={styles.desc}>
        {event.desc}
      </AppText>

      {/* Footer Action */}
      <View style={styles.footerRow}>
        <AppText variant="caption" color={colors.muted}>
          {isHindi ? 'पारंपरिक ब्रज उत्सव एवं संकीर्तन' : 'Traditional Braj Celebration'}
        </AppText>

        <TouchableOpacity
          style={[styles.directionsBtn, { backgroundColor: colors.primary }]}
          onPress={handleOpenMap}
          activeOpacity={0.8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <AppText variant="caption" weight="700" color="#FFFFFF">
            {isHindi ? '🗺️ उत्सव स्थल देखें' : '🗺️ View on Map'}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    marginTop: -spacing.base,
    marginHorizontal: -spacing.base,
    marginBottom: spacing.xs,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeCluster: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  title: {
    marginTop: spacing.xxs,
    marginBottom: 2,
    lineHeight: 28,
  },
  subtitle: {
    marginBottom: spacing.xs,
  },
  tithiBox: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginVertical: spacing.xs,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tithiValue: {
    flex: 1,
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xxs,
  },
  directionsBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
