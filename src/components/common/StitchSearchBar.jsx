import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from './AppText';

export default function StitchSearchBar({
  value,
  onChangeText,
  placeholder,
  onMicPress,
  onClear,
  style,
}) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          borderColor: isDark ? colors.border : colors.border,
        },
        style,
      ]}
    >
      <AppText variant="body" color={colors.muted} style={styles.searchIcon}>
        🔍
      </AppText>

      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search temples, aarti timings, ghats...'}
        placeholderTextColor={colors.subtle}
        returnKeyType="search"
      />

      {Boolean(value) ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            onChangeText?.('');
            onClear?.();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="caption" color={colors.muted}>✕</AppText>
        </TouchableOpacity>
      ) : onMicPress ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onMicPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="caption" color={colors.primary}>🎙️</AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  actionBtn: {
    padding: 4,
    marginLeft: 4,
  },
});
