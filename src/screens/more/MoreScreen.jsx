import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radii, shadows } from '../../theme';
import {
  AppText,
  AppHeader,
  LotusIcon,
  MorpankhIcon,
} from '../../components/common';
import { ROUTES } from '../../navigation/routes';

const MORE_LINKS = [
  {
    id: 'places',
    route: ROUTES.PLACES,
    icon: '🏞️',
    title: 'पवित्र कुण्ड एवं घाट',
    subtitle: 'राधा कुंड, कुसुम सरोवर, विश्राम घाट',
  },
  {
    id: 'food',
    route: ROUTES.FOOD,
    icon: '🍯',
    title: 'ब्रज प्रसाद एवं प्रसिद्ध मिष्ठान',
    subtitle: 'मथुरा पेड़ा, रबड़ी, कचौरी व सात्विक भोग',
  },
  {
    id: 'events',
    route: ROUTES.EVENTS,
    icon: '🎉',
    title: 'वार्षिक उत्सव एवं मेले',
    subtitle: 'लठमार होली, जन्माष्टमी, मुड़िया पूनों',
  },
  {
    id: 'audio',
    route: ROUTES.AUDIO_PLAYER,
    icon: '🎵',
    title: 'आरती व भजन संगीत सेवा',
    subtitle: 'बांके बिहारी आरती, यमुनाष्टकम्, चालीसा पाठ',
  },
  {
    id: 'wishlist',
    route: ROUTES.WISHLIST,
    icon: '❤️',
    title: 'मेरी दर्शन सूची (Wishlist)',
    subtitle: 'आपके सहेजे गए मंदिर एवं अनुष्ठान',
  },
];

export default function MoreScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader
        title="अन्य तीर्थ सेवाएं"
        subtitle="श्री ब्रज मण्डल संपूर्ण जानकारी"
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {MORE_LINKS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, shadows.sm]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.iconCircle}>
                <AppText variant="h2">{item.icon}</AppText>
              </View>
              <View style={styles.itemTextWrap}>
                <AppText variant="body" weight="700" color={colors.navy}>
                  {item.title}
                </AppText>
                <AppText variant="caption" color={colors.muted}>
                  {item.subtitle}
                </AppText>
              </View>
              <AppText variant="body" color={colors.primary} weight="700">
                ›
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Devotional Card */}
        <View style={[styles.devotionalCard, shadows.sm]}>
          <LotusIcon size={36} />
          <AppText variant="h3" color={colors.navy} style={styles.devotionalTitle}>
            ॥ राधे राधे ॥
          </AppText>
          <AppText variant="caption" color={colors.charcoal} align="center" style={styles.devotionalQuote}>
            "वृन्दावन सो बन नहीं, नन्दगाँव सो गाँव।{'\n'}
            बंसीवट सो वट नहीं, कृष्ण नाम सो नाम॥"
          </AppText>
          <AppText variant="caption" color={colors.muted} align="center" style={styles.versionText}>
            श्री ब्रज दर्शन मोबाइल ॲप • v1.0.0 (New Architecture)
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  itemTextWrap: {
    flex: 1,
  },
  devotionalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  devotionalTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  devotionalQuote: {
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  versionText: {
    marginTop: spacing.md,
    fontSize: 11,
  },
});
