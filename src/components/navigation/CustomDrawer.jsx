import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDrawer } from '../../context/DrawerContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { MorpankhIcon, LotusIcon, Badge } from '../common';
import { ROUTES } from '../../navigation/routes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CustomDrawer({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isOpen, closeDrawer, animValue, drawerWidth, currentRoute, setCurrentRoute } = useDrawer();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, isHindi, toggleLanguage } = useLanguage();
  const { user, isGuest, logout } = useAuth();
  const { favorites } = useFavorites();

  if (!isOpen) return null;

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const handleNavigate = (routeName) => {
    setCurrentRoute(routeName);
    closeDrawer();
    navigation.navigate(routeName);
  };

  const handleSignOutOrIn = async () => {
    closeDrawer();
    if (isGuest) {
      navigation.navigate(ROUTES.AUTH_STACK);
    } else {
      await logout();
      setCurrentRoute(ROUTES.HOME);
      navigation.navigate(ROUTES.HOME);
    }
  };

  const navItems = [
    {
      route: ROUTES.HOME,
      icon: '🏠',
      label: t('drawer.home', 'श्री धाम (होम)'),
      subtitle: isHindi ? 'मुख्य पृष्ठ व दर्शन' : 'Main Sanctuary',
    },
    {
      route: ROUTES.TEMPLES,
      icon: '🛕',
      label: t('drawer.temples', 'मंदिर (प्रमुख देवालय)'),
      subtitle: isHindi ? 'आरती समय व दर्शन' : 'Aarti & Darshan',
    },
    {
      route: ROUTES.PANCHANG,
      icon: '🗓️',
      label: t('drawer.panchang', 'पंचांग (तिथि व मुहूर्त)'),
      subtitle: isHindi ? 'अभिजीत व शुभ योग' : 'Tithi & Muhurat',
    },
    {
      route: ROUTES.YATRA,
      icon: '🧭',
      label: t('drawer.yatra', 'यात्रा व परिक्रमा गाइड'),
      subtitle: isHindi ? 'गोवर्धन व चौरासी कोस' : 'Parikrama & Routes',
    },
    {
      route: ROUTES.FOOD,
      icon: '🍯',
      label: t('drawer.food', 'ब्रज प्रसाद व भोजन'),
      subtitle: isHindi ? 'मथुरा पेड़ा, कचौरी व भोग' : 'Prasad & Delicacies',
    },
    {
      route: ROUTES.EVENTS,
      icon: '🎉',
      label: t('drawer.events', 'वार्षिक उत्सव व मेले'),
      subtitle: isHindi ? 'जन्माष्टमी, होली व उत्सव' : 'Festivals & Utsav',
    },
    {
      route: ROUTES.FAVORITES,
      icon: '❤️',
      label: t('drawer.favorites', 'मेरी दर्शन सूची'),
      badge: favorites.length > 0 ? String(favorites.length) : null,
      subtitle: isHindi ? 'सहेजे गए मंदिर' : 'Saved Sanctuary',
    },
    {
      route: ROUTES.PLACES,
      icon: '🌊',
      label: isHindi ? 'पवित्र कुंड व घाट' : 'Kunds & Ghats',
      subtitle: isHindi ? 'राधा कुंड व विश्राम घाट' : 'Sacred Waters',
    },
    {
      route: ROUTES.HELPDESK,
      icon: '🛟',
      label: isHindi ? 'तीर्थ सेवा केंद्र' : 'Pilgrim Helpdesk',
      subtitle: isHindi ? '24x7 हेल्पलाइन व सेवा' : '24x7 Emergency Seva',
    },
    {
      route: ROUTES.PROFILE,
      icon: '👤',
      label: t('drawer.profile', 'मेरी प्रोफ़ाइल'),
      subtitle: isHindi ? 'तीर्थ प्राथमिकताएं' : 'Account & Prefs',
    },
    {
      route: ROUTES.SETTINGS,
      icon: '⚙️',
      label: t('drawer.settings', 'सेटिंग्स व डेटा'),
      subtitle: isHindi ? 'सूचनाएं व ऑफलाइन कैश' : 'App & Offline Data',
    },
  ];

  return (
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      {/* Dimmed Scrim / Backdrop */}
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Sliding Drawer Container */}
      <Animated.View
        style={[
          styles.drawerPanel,
          {
            width: drawerWidth,
            backgroundColor: colors.drawerBg,
            borderRightColor: colors.drawerBorder,
            transform: [{ translateX }],
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        {/* Header: Devotee Profile & Aura */}
        <View style={[styles.headerCard, { backgroundColor: colors.drawerHeaderBg, borderColor: colors.border }]}>
          <View style={styles.headerTopRow}>
            <View style={[styles.avatarWrap, { backgroundColor: colors.primaryLight, borderColor: colors.gold }]}>
              <Text style={styles.avatarEmoji}>{user?.avatar || (isGuest ? '🪷' : '🦚')}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.userName, { color: colors.navy }]} numberOfLines={1}>
                {user?.name || (isHindi ? 'अतिथि तीर्थयात्री' : 'Guest Pilgrim')}
              </Text>
              <Text style={[styles.userStatus, { color: colors.muted }]} numberOfLines={1}>
                {isGuest
                  ? (isHindi ? 'अतिथि तीर्थयात्री' : 'Guest Pilgrim')
                  : (user?.email || 'devotee@brajdarshan.org')}
              </Text>
            </View>
          </View>

          {/* Quick Controls: Language & Theme Switchers */}
          <View style={styles.quickBar}>
            <TouchableOpacity
              style={[
                styles.quickToggle,
                { backgroundColor: isDark ? colors.cardAlt : colors.borderLight, borderColor: colors.border },
              ]}
              onPress={toggleLanguage}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={[styles.quickToggleText, { color: colors.primary }]}>
                {isHindi ? '🇬🇧 English' : '🇮🇳 हिन्दी'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickToggle,
                { backgroundColor: isDark ? colors.cardAlt : colors.borderLight, borderColor: colors.border },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={[styles.quickToggleText, { color: colors.goldDark }]}>
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Destination List */}
        <ScrollView
          style={styles.menuScroll}
          contentContainerStyle={styles.menuContent}
          showsVerticalScrollIndicator={false}
        >
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[
                  styles.navItem,
                  isActive && {
                    backgroundColor: colors.drawerActiveBg,
                  },
                ]}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.75}
              >
                {/* Active Accent Bar on Left */}
                {isActive && (
                  <View style={[styles.activeAccentBar, { backgroundColor: colors.primary }]} />
                )}

                <Text style={styles.itemIcon}>{item.icon}</Text>

                <View style={styles.itemTextWrap}>
                  <Text
                    style={[
                      styles.itemLabel,
                      {
                        color: isActive ? colors.drawerActiveText : colors.drawerInactiveText,
                        fontWeight: isActive ? '700' : '600',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.muted }]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>

                {item.badge && (
                  <View style={[styles.badgePill, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgePillText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Divider */}
          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

          {/* Sign In / Sign Out Item */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={handleSignOutOrIn}
            activeOpacity={0.75}
          >
            <Text style={styles.itemIcon}>{isGuest ? '🔑' : '🚪'}</Text>
            <View style={styles.itemTextWrap}>
              <Text
                style={[
                  styles.itemLabel,
                  { color: isGuest ? colors.primary : colors.warning, fontWeight: '700' },
                ]}
              >
                {isGuest
                  ? t('drawer.signIn', 'साइन इन / नया खाता')
                  : t('drawer.signOut', 'लॉग आउट (Sign Out)')}
              </Text>
              <Text style={[styles.itemSub, { color: colors.muted }]}>
                {isGuest
                  ? (isHindi ? 'डेटा सिंक व बैकअप' : 'Sync wishlist & notes')
                  : (isHindi ? 'अतिथि मोड में वापस' : 'Return to guest mode')}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer: Sacred Branding */}
        <View style={[styles.drawerFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerMantra, { color: colors.primary }]}>॥ राधे राधे ॥</Text>
          <Text style={[styles.footerVersion, { color: colors.muted }]}>
            {isHindi ? 'श्री ब्रज दर्शन' : 'Braj Darshan'} • v1.0.0
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  headerCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
  },
  quickBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickToggle: {
    flex: 1,
    height: 36, // Min touch area with hitSlop
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
    minHeight: 48, // Apple HIG min 44pt touch target
    position: 'relative',
  },
  activeAccentBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 4,
    borderRadius: 2,
  },
  itemIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
    marginRight: 10,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  itemSub: {
    fontSize: 11,
    marginTop: 1,
    lineHeight: 14,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 12,
  },
  drawerFooter: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerMantra: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 2,
  },
  footerVersion: {
    fontSize: 11,
  },
});
