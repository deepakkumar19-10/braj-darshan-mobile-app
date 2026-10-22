import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useDrawer } from '../../context/DrawerContext';
import { AppText } from './AppText';
import { LotusIcon } from './LotusIcon';
import { ROUTES } from '../../navigation/routes';

export default function StitchHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightActions,
}) {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { isHindi, toggleLanguage } = useLanguage();
  const { favorites } = useFavorites();
  const { openDrawer } = useDrawer();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(ROUTES.HOME);
    }
  };

  const favCount = favorites?.length || 0;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      {/* Left Brand / Back Area */}
      <View style={styles.leftCol}>
        {showBack ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: isDark ? colors.surface : colors.surface }]}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Back"
          >
            <AppText variant="h3" color={colors.navy}>←</AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.brandRow}
            onPress={openDrawer}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View
              style={[
                styles.logoWrap,
                {
                  backgroundColor: isDark ? colors.cardAlt : colors.primaryLight,
                  borderColor: isDark ? colors.border : 'rgba(164,55,0,0.25)',
                },
              ]}
            >
              <LotusIcon size={22} color={colors.primary} />
            </View>

            <View style={styles.titleColumn}>
              <AppText variant="h3" weight="700" color={colors.primary} style={styles.brandTitle}>
                {title || (isHindi ? 'श्री ब्रज दर्शन' : 'Shri Braj Darshan')}
              </AppText>
              {Boolean(subtitle) && (
                <AppText variant="small" color={colors.muted} numberOfLines={1}>
                  {subtitle}
                </AppText>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Right Controls */}
      <View style={styles.rightCol}>
        {rightActions ? (
          rightActions
        ) : (
          <>
            {/* 1-Tap Language Toggle Switch (EN / हि) */}
            <TouchableOpacity
              style={[
                styles.langToggle,
                {
                  backgroundColor: isDark ? colors.cardAlt : colors.surfaceContainerHigh || '#E6EEFF',
                  borderColor: isDark ? colors.border : colors.border,
                },
              ]}
              onPress={toggleLanguage}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityLabel="Switch Language"
            >
              <View
                style={[
                  styles.langCircle,
                  !isHindi && [styles.langActiveCircle, { backgroundColor: colors.primary }],
                ]}
              >
                <AppText
                  variant="small"
                  weight="700"
                  color={!isHindi ? '#FFFFFF' : colors.textSecondary}
                  style={styles.langText}
                >
                  EN
                </AppText>
              </View>

              <View
                style={[
                  styles.langCircle,
                  isHindi && [styles.langActiveCircle, { backgroundColor: colors.primary }],
                ]}
              >
                <AppText
                  variant="small"
                  weight="700"
                  color={isHindi ? '#FFFFFF' : colors.textSecondary}
                  style={styles.langText}
                >
                  हि
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Wishlist Heart Icon with Count Badge */}
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
              onPress={() => navigation.navigate(ROUTES.FAVORITES)}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityLabel="Wishlist"
            >
              <AppText variant="body">🤍</AppText>
              {favCount > 0 && (
                <View style={[styles.favBadge, { backgroundColor: colors.warning }]}>
                  <AppText variant="small" weight="700" color="#FFFFFF" style={styles.badgeText}>
                    {favCount > 99 ? '99+' : favCount}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>

            {/* Devotee Profile Avatar */}
            <TouchableOpacity
              style={[
                styles.avatarBtn,
                {
                  backgroundColor: isDark ? colors.primaryDark : colors.primary,
                  borderColor: colors.goldLight,
                },
              ]}
              onPress={() => navigation.navigate(ROUTES.PROFILE)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityLabel="Profile"
            >
              <AppText variant="caption" weight="700" color="#FFFFFF">
                👤
              </AppText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    padding: 2,
    borderWidth: 1,
  },
  langCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langActiveCircle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  langText: {
    fontSize: 10,
    lineHeight: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    position: 'relative',
  },
  favBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
