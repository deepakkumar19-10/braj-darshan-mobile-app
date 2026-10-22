import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from './AppText';

export default function StitchTag({ text, icon, variant = 'saffron' }) {
  const { colors, isDark } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'amber':
        return {
          bg: isDark ? colors.cardAlt : colors.goldLight,
          text: isDark ? colors.gold : colors.goldDark,
          border: isDark ? colors.border : 'rgba(245, 158, 11, 0.25)',
        };
      case 'purple':
        return {
          bg: isDark ? colors.cardAlt : colors.ekadashiLight,
          text: colors.ekadashi,
          border: isDark ? colors.border : 'rgba(124, 58, 237, 0.25)',
        };
      case 'saffron':
      default:
        return {
          bg: isDark ? colors.primaryFixed : colors.primaryLight,
          text: colors.primary,
          border: isDark ? colors.border : 'rgba(164, 55, 0, 0.2)',
        };
    }
  };

  const scheme = getColors();

  return (
    <View style={[styles.container, { backgroundColor: scheme.bg, borderColor: scheme.border }]}>
      {Boolean(icon) && <AppText variant="caption" style={styles.icon}>{icon}</AppText>}
      <AppText variant="small" weight="700" color={scheme.text} style={styles.text}>
        {text?.toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 6,
  },
  icon: {
    marginRight: 5,
    fontSize: 12,
  },
  text: {
    letterSpacing: 0.8,
    fontSize: 10,
    fontWeight: '700',
  },
});
