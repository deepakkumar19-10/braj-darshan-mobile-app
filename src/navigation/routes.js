/**
 * Braj Darshan - Centralized Navigation Routes
 * High-order Drawer and Stack Navigation architecture
 */

export const ROUTES = {
  // Auth Stack
  AUTH_STACK: 'AuthStack',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Primary Drawer Destinations
  HOME: 'Home',
  DRAWER_HOME: 'Home',
  TEMPLES: 'Temples',
  PANCHANG: 'Panchang',
  YATRA: 'Yatra',
  FOOD: 'Food',
  EVENTS: 'Events',
  FAVORITES: 'Favorites',
  WISHLIST: 'Favorites', // Alias for favorites/wishlist
  PROFILE: 'Profile',
  SETTINGS: 'Settings',

  // Detail & Utility Screens
  TEMPLE_DETAIL: 'TempleDetail',
  YATRA_DETAIL: 'YatraDetail',
  PARIKRAMA_DETAIL: 'ParikramaDetail',
  SMART_PLANNER: 'SmartPlanner',
  PLACES: 'Places',
  AUDIO_PLAYER: 'AudioPlayer',
  HELPDESK: 'Helpdesk',

  // Legacy tab aliases for backward compatibility
  TAB_HOME: 'Home',
  TAB_TEMPLES: 'Temples',
  TAB_PANCHANG: 'Panchang',
  TAB_YATRA: 'Yatra',
  TAB_MORE: 'Settings',
  MAIN_TABS: 'Home',
};

export default ROUTES;
