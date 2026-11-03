import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';
import { ROUTES } from './routes';
import { useTheme } from '../context/ThemeContext';
import CustomDrawer from '../components/navigation/CustomDrawer';
import StitchTabBar from '../components/navigation/StitchTabBar';
import MiniAudioPlayer from '../components/audio/MiniAudioPlayer';

// Primary Destinations
import HomeScreen from '../screens/home/HomeScreen';
import TempleListScreen from '../screens/temples/TempleListScreen';
import PanchangScreen from '../screens/panchang/PanchangScreen';
import YatraScreen from '../screens/yatra/YatraScreen';
import FoodScreen from '../screens/food/FoodScreen';
import EventsScreen from '../screens/events/EventsScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Detail & Utility Screens
import TempleDetailScreen from '../screens/temples/TempleDetailScreen';
import YatraDetailScreen from '../screens/yatra/YatraDetailScreen';
import ParikramaDetailScreen from '../screens/yatra/ParikramaDetailScreen';
import SmartPlannerScreen from '../screens/yatra/SmartPlannerScreen';
import PlacesScreen from '../screens/places/PlacesScreen';
import PlaceDetailScreen from '../screens/places/PlaceDetailScreen';
import AudioPlayerScreen from '../screens/audio/AudioPlayerScreen';
import HelpdeskScreen from '../screens/helpdesk/HelpdeskScreen';
import MapScreen from '../screens/map/MapScreen';
import MoreScreen from '../screens/more/MoreScreen';

// Auth Stack Navigator
import AuthNavigator from './AuthNavigator';

export const navigationRef = createNavigationContainerRef();

const Stack = createNativeStackNavigator();

const TAB_ROUTES = [
  ROUTES.HOME,
  ROUTES.TEMPLES,
  ROUTES.MAP,
  ROUTES.PANCHANG,
  ROUTES.MORE,
];

const TAB_SCREEN_OPTIONS = { animation: 'fade', gestureEnabled: false };
// One instance per tab: navigating to a tab that is already in the stack brings that
// screen to the top (keeping its search and filters) instead of stacking a copy.
const SINGLE_INSTANCE = () => 'tab';

// Lets App tell the navigator when the container is ready, so a restored
// (non-Home) screen shows or hides the tab bar correctly on cold start.
export const routeSync = {
  listener: null,
  notify() {
    if (this.listener) this.listener();
  },
};

export function RootNavigator() {
  const { colors } = useTheme();
  const [currentRoute, setCurrentRoute] = useState(ROUTES.HOME);

  useEffect(() => {
    const sync = () => {
      const activeRouteName = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null;
      if (activeRouteName) {
        setCurrentRoute(activeRouteName);
      }
    };
    routeSync.listener = sync;
    sync();
    const unsubscribe = navigationRef.addListener('state', sync);
    return () => {
      routeSync.listener = null;
      unsubscribe();
    };
  }, []);

  const isTabScreen = TAB_ROUTES.includes(currentRoute);

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <Stack.Navigator
        initialRouteName={ROUTES.HOME}
        screenOptions={{
          headerShown: false,
          // iOS push: new screens slide in from the right and can be swiped back.
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Tab destinations: peers, so they cross-fade and cannot be swiped "back" (HIG tab bars). */}
        <Stack.Screen name={ROUTES.HOME} component={HomeScreen} options={TAB_SCREEN_OPTIONS} getId={SINGLE_INSTANCE} />
        <Stack.Screen name={ROUTES.TEMPLES} component={TempleListScreen} options={TAB_SCREEN_OPTIONS} getId={SINGLE_INSTANCE} />
        <Stack.Screen name={ROUTES.PANCHANG} component={PanchangScreen} options={TAB_SCREEN_OPTIONS} getId={SINGLE_INSTANCE} />
        <Stack.Screen name={ROUTES.MAP} component={MapScreen} options={TAB_SCREEN_OPTIONS} getId={SINGLE_INSTANCE} />
        <Stack.Screen name={ROUTES.MORE} component={MoreScreen} options={TAB_SCREEN_OPTIONS} getId={SINGLE_INSTANCE} />

        {/* Pushed screens */}
        <Stack.Screen name={ROUTES.YATRA} component={YatraScreen} />
        <Stack.Screen name={ROUTES.FOOD} component={FoodScreen} />
        <Stack.Screen name={ROUTES.EVENTS} component={EventsScreen} />
        <Stack.Screen name={ROUTES.FAVORITES} component={WishlistScreen} />
        <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
        <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />

        {/* Detail Screens */}
        <Stack.Screen
          name={ROUTES.TEMPLE_DETAIL}
          component={TempleDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.YATRA_DETAIL}
          component={YatraDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.PARIKRAMA_DETAIL}
          component={ParikramaDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.SMART_PLANNER}
          component={SmartPlannerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.PLACES}
          component={PlacesScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.PLACE_DETAIL}
          component={PlaceDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name={ROUTES.AUDIO_PLAYER}
          component={AudioPlayerScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name={ROUTES.HELPDESK}
          component={HelpdeskScreen}
          options={{ animation: 'slide_from_right' }}
        />

        {/* Auth Stack */}
        <Stack.Screen
          name={ROUTES.AUTH_STACK}
          component={AuthNavigator}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>

      {/* Sticky Devotional Mini Player */}
      <MiniAudioPlayer />

      {/* Stitch 5-Item Tab Bar on Primary Screens */}
      {isTabScreen && (
        <StitchTabBar
          navigation={navigationRef}
          currentRouteName={currentRoute}
        />
      )}

      {/* Slide-out Custom Drawer for Full Directory */}
      <CustomDrawer navigation={navigationRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
  },
});

export default RootNavigator;
