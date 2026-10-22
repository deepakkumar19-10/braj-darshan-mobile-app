import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radii, shadows } from '../theme';
import { ROUTES } from './routes';
import { LotusIcon } from '../components/common';
import MiniAudioPlayer from '../components/audio/MiniAudioPlayer';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import TempleListScreen from '../screens/temples/TempleListScreen';
import PanchangScreen from '../screens/panchang/PanchangScreen';
import YatraScreen from '../screens/yatra/YatraScreen';
import MoreScreen from '../screens/more/MoreScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();

  const tabHeight = 60 + Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 16);

  return (
    <Tab.Navigator
      initialRouteName={ROUTES.TAB_HOME}
      tabBar={(props) => (
        <View>
          <MiniAudioPlayer />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#857F72',
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabHeight,
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 12),
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name={ROUTES.TAB_HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'श्री धाम',
          tabBarIcon: ({ focused }) => (
            <TabEmojiIcon emoji="🏠" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.TAB_TEMPLES}
        component={TempleListScreen}
        options={{
          tabBarLabel: 'मंदिर',
          tabBarIcon: ({ focused }) => (
            <TabEmojiIcon emoji="🛕" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.TAB_PANCHANG}
        component={PanchangScreen}
        options={{
          tabBarLabel: 'पंचांग',
          tabBarIcon: ({ focused }) => (
            <TabEmojiIcon emoji="🗓️" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.TAB_YATRA}
        component={YatraScreen}
        options={{
          tabBarLabel: 'यात्रा',
          tabBarIcon: ({ focused }) => (
            <TabEmojiIcon emoji="🧭" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.TAB_MORE}
        component={MoreScreen}
        options={{
          tabBarLabel: 'अन्य',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <LotusIcon
                size={22}
                color={focused ? colors.primary : '#857F72'}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function TabEmojiIcon({ emoji, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.emoji, focused && styles.emojiFocused]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFDF9',
    borderTopWidth: 1,
    borderTopColor: '#F0E6D2',
    paddingTop: 6,
    elevation: 8,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabBarItem: {
    minHeight: 44, // Apple HIG min touch area
    paddingVertical: 2,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 2,
    includeFontPadding: false,
  },
  iconWrap: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)', // subtle saffron pill
  },
  emoji: {
    fontSize: 19,
    opacity: 0.85,
  },
  emojiFocused: {
    fontSize: 20,
    opacity: 1,
  },
});
