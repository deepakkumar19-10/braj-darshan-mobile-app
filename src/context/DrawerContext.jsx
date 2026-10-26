import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Animated, Easing, BackHandler, Dimensions } from 'react-native';

const DrawerContext = createContext();

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

export function DrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Home');
  const animValue = useRef(new Animated.Value(0)).current;

  const openDrawer = useCallback(() => {
    setIsOpen(true);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animValue]);

  const closeDrawer = useCallback(() => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsOpen(false);
      }
    });
  }, [animValue]);

  // Handle hardware back button when drawer is open
  React.useEffect(() => {
    if (!isOpen) return;

    const onBackPress = () => {
      closeDrawer();
      return true; // prevent default back action
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isOpen, closeDrawer]);

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        openDrawer,
        closeDrawer,
        animValue,
        drawerWidth: DRAWER_WIDTH,
        currentRoute,
        setCurrentRoute,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    return {
      isOpen: false,
      openDrawer: () => {},
      closeDrawer: () => {},
      drawerWidth: DRAWER_WIDTH,
      currentRoute: 'Home',
      setCurrentRoute: () => {},
    };
  }
  return context;
}

export default DrawerContext;
