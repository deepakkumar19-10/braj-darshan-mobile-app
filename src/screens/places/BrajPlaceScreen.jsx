/**
 * Braj Darshan - one place of Braj from the website's data (data/brajPlaces.json): photo with
 * its credit, town and kind, today's darshan windows where the data has timings, the summary,
 * directions and a link to the full page on divyabraj.com (sources, history, access).
 * Route params: { id }. Major temples with an app temple page open that page instead (see
 * BrajPlacesScreen), so this screen covers the other places.
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Linking, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import { BackButton, Button, Card, Photo } from '../../components/ui';
import { useNow } from '../../hooks/useNow';
import { BRAJ_TOWNS, findBrajPlace, kindLabel, placeImage, placeOpenStatus, placeWebUrl } from '../../utils/brajPlaces';

const HERO = 300;

function minutesText(range, isHindi) {
  if (!Array.isArray(range) || range.length !== 2) return null;
  // Under two hours reads better in minutes ("60–90 minutes"), longer in hours ("2–3 hours").
  if (range[1] < 120) return isHindi ? `लगभग ${range[0]}–${range[1]} मिनट` : `About ${range[0]}–${range[1]} minutes`;
  const [a, b] = range.map((m) => Math.round((m / 60) * 10) / 10);
  return isHindi ? `लगभग ${a}–${b} घंटे` : `About ${a}–${b} hours`;
}

export default function BrajPlaceScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isHindi } = useLanguage();
  const now = useNow();
  const place = findBrajPlace(route?.params?.id);

  if (!place) {
    return (
      <View style={[styles.root, styles.missing, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <AppText variant="h3" weight="700" color={colors.navy}>
          {isHindi ? 'यह स्थल नहीं मिला' : 'Place not found'}
        </AppText>
      </View>
    );
  }

  const town = BRAJ_TOWNS.find((t) => t.id === place.region);
  const status = placeOpenStatus(place, now);
  const name = isHindi ? place.nameHi : place.nameEn;
  const summary = isHindi ? place.summaryHi || place.summaryEn : place.summaryEn || place.summaryHi;
  const visit = minutesText(place.visitMinutes, isHindi);
  const webUrl = placeWebUrl(place);
  const note = isHindi ? place.timings?.noteHi : place.timings?.noteEn || place.timings?.noteHi;
  const credit = place.photo?.author ? `${isHindi ? 'फ़ोटो' : 'Photo'}: ${place.photo.author}${place.photo.license ? ` · ${place.photo.license}` : ''}` : null;
  const directions = () => {
    const dest = place.geo ? `${place.geo.lat},${place.geo.lng}` : encodeURIComponent(`${place.nameEn}, Braj`);
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}`).catch(() => {});
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {/* The representative-photo note goes in the credit line below, not over the title. */}
        <Photo source={placeImage(place)} scrim style={{ height: HERO + insets.top }} accessibilityLabel={name}>
          <View style={[styles.heroTop, { top: insets.top + 8 }]}>
            <BackButton onPress={() => navigation.goBack()} />
          </View>
          <View style={styles.heroText}>
            <AppText variant="h1" weight="700" color="#FFFFFF" numberOfLines={3}>
              {name}
            </AppText>
            <AppText variant="body" weight="600" color="rgba(255,255,255,0.9)">
              {[isHindi ? town?.hi : town?.en, kindLabel(place.category, isHindi)].filter(Boolean).join(' · ')}
            </AppText>
          </View>
        </Photo>

        <View style={styles.sheet}>
          {credit || place.photo?.representative ? (
            <Pressable
              onPress={() => place.photo.page && Linking.openURL(place.photo.page).catch(() => {})}
              accessibilityRole={place.photo.page ? 'link' : 'text'}
            >
              <AppText variant="small" color={colors.muted}>
                {[credit, place.photo.representative ? (isHindi ? 'प्रतीकात्मक चित्र' : 'Representative image') : null].filter(Boolean).join(' · ')}
              </AppText>
            </Pressable>
          ) : null}

          {status ? (
            <Card>
              <View style={styles.row}>
                <Icon name={status.isOpen ? 'open' : 'closed'} size={22} color={status.isOpen ? colors.success : colors.muted} />
                <AppText variant="body" weight="700" color={status.isOpen ? colors.success : colors.navy} style={styles.flex}>
                  {status.isOpen
                    ? isHindi
                      ? `अभी दर्शन खुले · ${status.until} तक`
                      : `Open now · until ${status.until}`
                    : status.opensAt
                      ? isHindi
                        ? `अभी बंद · ${status.opensAt} खुलेगा`
                        : `Closed now · opens ${status.opensAt}`
                      : isHindi
                        ? 'आज के दर्शन पूरे हो चुके'
                        : "Today's darshan is over"}
                </AppText>
              </View>
              <AppText variant="caption" color={colors.muted} style={styles.windows}>
                {(isHindi ? 'आज: ' : 'Today: ') + status.windows.join(', ')}
              </AppText>
              {note ? (
                <AppText variant="small" color={colors.muted} style={styles.windows}>
                  {note}
                </AppText>
              ) : null}
              <AppText variant="small" color={colors.muted} style={styles.windows}>
                {isHindi ? 'त्योहारों पर समय बदल सकता है — मंदिर से पुष्टि करें।' : 'Timings change on festivals — please confirm at the temple.'}
              </AppText>
            </Card>
          ) : null}

          {summary ? (
            <AppText variant="bodyLarge" color={colors.text}>
              {summary}
            </AppText>
          ) : null}

          {visit ? (
            <View style={styles.row}>
              <Icon name="timer" size={20} color={colors.primary} />
              <AppText variant="body" color={colors.text}>
                {isHindi ? `घूमने का समय: ${visit}` : `Time to visit: ${visit}`}
              </AppText>
            </View>
          ) : null}

          <Button title={isHindi ? 'रास्ता देखें' : 'Get directions'} icon="directions" onPress={directions} />
          {webUrl ? (
            <Button
              title={isHindi ? 'वेबसाइट पर पूरी जानकारी' : 'Full details on the website'}
              icon="externalLink"
              variant="secondary"
              onPress={() => Linking.openURL(webUrl).catch(() => {})}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  missing: { paddingHorizontal: 16, gap: 12 },
  flex: { flex: 1 },
  heroTop: { position: 'absolute', left: 16 },
  heroText: { position: 'absolute', left: 16, right: 16, bottom: 18, gap: 4 },
  sheet: { padding: 16, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  windows: { marginTop: 6 },
});
