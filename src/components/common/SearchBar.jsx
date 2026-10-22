/**
 * Braj Darshan - SearchBar
 * Mobile Instant Search Component with Clear Button and Focus Styling
 * Apple HIG Compliant & Semantic Theme Reactive
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, radii, touchTargets } from '../../theme';

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'मंदिर, ईष्ट देव या शहर खोजें...',
  style,
}) {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onClear) onClear();
    else if (onChangeText) onChangeText('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isFocused ? colors.primary : colors.border,
        },
        isFocused && {
          backgroundColor: isDark ? colors.cardAlt : colors.surface,
        },
        style,
      ]}
    >
      <Text style={styles.searchIcon}>🔍</Text>

      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        clearButtonMode="never"
      />

      {Boolean(value && value.length > 0) && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: isDark ? colors.cardAlt : 'rgba(120, 106, 93, 0.2)' }]}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Text style={[styles.clearIcon, { color: colors.navy }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: touchTargets.inputHeight,
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    borderWidth: 1.5,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  clearIcon: {
    fontSize: 11,
    fontWeight: '800',
  },
});

export default SearchBar;
