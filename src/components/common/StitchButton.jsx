import React from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from './AppText';

export default function StitchButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  showArrow = false,
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}) {
  const { colors, isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: isDark ? colors.cardAlt : colors.primaryLight,
          border: isDark ? colors.border : 'rgba(164,55,0,0.15)',
          text: colors.primary,
        };
      case 'outline':
        return {
          bg: isDark ? colors.surface : '#FFFFFF',
          border: isDark ? colors.border : colors.border,
          text: colors.navy,
        };
      case 'accent':
        return {
          bg: colors.gold,
          border: colors.gold,
          text: '#FFFFFF',
        };
      case 'primary':
      default:
        return {
          bg: colors.primary,
          border: colors.primary,
          text: '#FFFFFF',
        };
    }
  };

  const vStyle = getVariantStyles();

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 14,
          paddingVertical: 8,
          minHeight: 36,
          fontSize: 'caption',
        };
      case 'lg':
        return {
          paddingHorizontal: 24,
          paddingVertical: 14,
          minHeight: 52,
          fontSize: 'bodyLarge',
        };
      case 'md':
      default:
        return {
          paddingHorizontal: 20,
          paddingVertical: 12,
          minHeight: 46,
          fontSize: 'body',
        };
    }
  };

  const sStyle = getSizeStyle();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? (isDark ? '#2A2A2A' : '#E5E7EB') : vStyle.bg,
          borderColor: disabled ? (isDark ? '#333333' : '#D1D5DB') : vStyle.border,
          paddingHorizontal: sStyle.paddingHorizontal,
          paddingVertical: sStyle.paddingVertical,
          minHeight: sStyle.minHeight,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {Boolean(icon) && <View style={styles.iconWrap}>{icon}</View>}

          <AppText
            variant={sStyle.fontSize}
            weight="700"
            color={disabled ? colors.muted : vStyle.text}
            style={styles.btnText}
          >
            {title}
          </AppText>

          {showArrow && (
            <AppText
              variant="body"
              weight="700"
              color={disabled ? colors.muted : vStyle.text}
              style={styles.arrow}
            >
              →
            </AppText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginRight: 8,
  },
  btnText: {
    textAlign: 'center',
  },
  arrow: {
    marginLeft: 8,
    fontSize: 16,
  },
});
