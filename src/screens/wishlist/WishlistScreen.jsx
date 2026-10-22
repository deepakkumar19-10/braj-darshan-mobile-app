import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, radii, shadows } from '../../theme';
import {
  AppText,
  AppHeader,
  Badge,
  EmptyState,
} from '../../components/common';
import { ROUTES } from '../../navigation/routes';
import { useFavorites } from '../../context/FavoritesContext';
import { getTempleStatus } from '../../utils/templeHours';

export default function WishlistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t, isHindi } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();

  const canGoBack = navigation.canGoBack();

  const renderWishlistItem = ({ item }) => {
    const status = getTempleStatus(item);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadows.sm,
        ]}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(ROUTES.TEMPLE_DETAIL, {
            id: item.id,
            temple: item,
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.badgeCluster}>
            <Badge
              label={isHindi ? item.cityHindi : item.city}
              variant="gold"
              icon="📍"
            />
            <Badge label={status.label} variant={status.variant} />
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(item)}
            style={styles.removeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppText variant="body">❤️</AppText>
          </TouchableOpacity>
        </View>

        <AppText variant="h3" color={colors.navy} style={styles.title}>
          {isHindi ? item.nameHindi : item.name}
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          {isHindi ? item.deityHindi : item.deity}
        </AppText>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <AppText variant="caption" color={colors.primary} weight="600">
            ⏰ {item.timings?.summer || 'समय सारणी'}
          </AppText>
          <AppText variant="caption" color={colors.primary} weight="700">
            {isHindi ? 'दर्शन विवरण ›' : 'View Darshan ›'}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AppHeader
        title={isHindi ? 'मेरी दर्शन सूची' : 'My Sacred Wishlist'}
        subtitle={
          isHindi
            ? `${favorites.length} मंदिर सहेजे गए`
            : `${favorites.length} temples saved`
        }
        showBack={canGoBack}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderWishlistItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title={isHindi ? 'आपकी दर्शन सूची खाली है' : 'Your Wishlist is Empty'}
            description={
              isHindi
                ? 'मंदिर विवरण पृष्ठ अथवा मंदिर सूची पर जाकर ❤️ आइकन दबाकर अपनी व्यक्तिगत दर्शन सूची बनाएं।'
                : 'Browse temples and tap the ❤️ icon to save your personal pilgrimage list.'
            }
            actionTitle={isHindi ? 'मंदिर देखें' : 'Explore Temples'}
            onAction={() => navigation.navigate(ROUTES.TEMPLES)}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
  },
  card: {
    borderRadius: radii.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  badgeCluster: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  removeBtn: {
    minWidth: 44, // 44pt touch target
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.xxs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
  },
});
