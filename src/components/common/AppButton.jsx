/**
 * Braj Darshan - AppButton
 * Universal Button complying with Apple HIG Touch Targets (Min 44pt)
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { colors, spacing, radii, shadows, touchTargets } from '../../theme';

export function AppButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'md',          // 'sm' | 'md' | 'lg'
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.secondaryContainer, shadows.sm];
      case 'outline':
        return styles.outlineContainer;
      case 'ghost':
        return styles.ghostContainer;
      case 'primary':
      default:
        return [styles.primaryContainer, shadows.saffronGlow];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'md':
      default:
        return styles.sizeMd;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.textSm;
      case 'lg':
        return styles.textLg;
      case 'md':
      default:
        return styles.textMd;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getSizeStyle(),
        getContainerStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.surface : colors.primary}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>
              {typeof icon === 'string' ? (
                <Text style={[styles.iconText, getTextSizeStyle()]}>{icon}</Text>
              ) : (
                icon
              )}
            </View>
          )}
          <Text style={[styles.baseText, getTextSizeStyle(), getTextStyle(), textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>
              {typeof icon === 'string' ? (
                <Text style={[styles.iconText, getTextSizeStyle()]}>{icon}</Text>
              ) : (
                icon
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },

  // Sizing variants
  sizeSm: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sizeMd: {
    minHeight: touchTargets.min, // 44pt Apple HIG
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  sizeLg: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },

  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 16,
  },

  // Container color variants
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.surface,
  },

  secondaryContainer: {
    backgroundColor: colors.gold,
  },
  secondaryText: {
    color: colors.navy,
  },

  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },

  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.navy,
  },
});

export default AppButton;
