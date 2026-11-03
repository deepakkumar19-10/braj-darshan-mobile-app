/**
 * Braj Darshan - EventCard
 * One celebration of Braj from data/events.json, built from the UI kit.
 * Photos are illustrative (not of a particular year's event), so they carry the
 * "Representative photo" tag. Dates are given as the traditional lunar tithi.
 * Every line is in the reader's language (see utils/eventText); a line that has
 * no text in that language is left out.
 */

import React from 'react';
import { StyleSheet, View, Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';
import { Icon } from '../common/Icon';
import { Card, Photo, Button } from '../ui';
import { getEventImage } from '../../utils/imageAssets';
import {
  eventTitle,
  eventPlace,
  eventCategoryLabel,
  eventLunarDate,
  eventSeason,
  eventDescription,
} from '../../utils/eventText';

function openOnMap(event) {
  const query =
    event.latitude && event.longitude
      ? `${event.latitude},${event.longitude}`
      : encodeURIComponent(`${event.titleEn || event.title} ${event.locationEn || event.location} Braj`);
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
}

function InfoLine({ icon, children, colors }) {
  return (
    <View style={styles.infoLine}>
      <Icon name={icon} size={18} color={colors.muted} />
      <AppText variant="caption" color={colors.text} style={styles.flex}>
        {children}
      </AppText>
    </View>
  );
}

export default function EventCard({ event, style }) {
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const image = getEventImage(event);

  const title = eventTitle(event, isHindi);
  const otherTitle = eventTitle(event, !isHindi);
  const place = eventPlace(event, isHindi);
  const categoryLabel = eventCategoryLabel(event, isHindi);
  const lunarDate = eventLunarDate(event, isHindi);
  const season = eventSeason(event, isHindi);
  const desc = eventDescription(event, isHindi);

  return (
    <Card padded={false} style={[styles.card, style]}>
      {image ? (
        <Photo source={image} representative style={styles.photo} accessibilityLabel={title} />
      ) : null}
      <View style={styles.body}>
        {categoryLabel ? (
          // Always has a background: on Android a View without one loses its rounded corners.
          <View style={[styles.category, { backgroundColor: colors.primaryLight }]}>
            <Icon name="festival" size={16} color={colors.primary} />
            <AppText variant="small" weight="700" color={colors.primary}>
              {categoryLabel}
            </AppText>
          </View>
        ) : null}

        <View>
          <AppText variant="h3" weight="700" color={colors.navy}>
            {title}
          </AppText>
          {otherTitle && otherTitle !== title ? (
            <AppText variant="caption" color={colors.muted}>
              {otherTitle}
            </AppText>
          ) : null}
        </View>

        {place ? (
          <InfoLine icon="location" colors={colors}>
            {place}
          </InfoLine>
        ) : null}

        {lunarDate ? (
          <InfoLine icon="tithi" colors={colors}>
            {isHindi ? `तिथि: ${lunarDate}` : `Lunar date (tithi): ${lunarDate}`}
          </InfoLine>
        ) : null}

        {season ? (
          <InfoLine icon="calendar" colors={colors}>
            {isHindi ? `माह: ${season}` : `Month: ${season}`}
          </InfoLine>
        ) : null}

        {desc ? (
          <AppText variant="body" color={colors.textSecondary}>
            {desc}
          </AppText>
        ) : null}

        <Button
          variant="secondary"
          icon="location"
          title={isHindi ? 'स्थान नक्शे पर देखें' : 'See the place on a map'}
          accessibilityLabel={isHindi ? `${title} का स्थान Google Maps में देखें` : `Open ${title} location in Google Maps`}
          onPress={() => openOnMap(event)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginBottom: 16 },
  photo: { height: 168 },
  body: { padding: 16, gap: 10 },
  category: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  infoLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
});
