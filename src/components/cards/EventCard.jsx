/**
 * Braj Darshan - EventCard
 * One celebration of Braj from data/events.json, built from the UI kit
 * (Nov 2026 redesign look: category as a saffron label above the title).
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
        <View>
          {categoryLabel ? (
            <AppText variant="small" weight="600" color={colors.primary}>
              {categoryLabel}
            </AppText>
          ) : null}
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
  // Spacing between cards comes from the list (EventsScreen); radius matches the redesign's photo cards.
  card: { borderRadius: 20 },
  photo: { height: 168 },
  body: { padding: 16, gap: 10 },
  infoLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
});
