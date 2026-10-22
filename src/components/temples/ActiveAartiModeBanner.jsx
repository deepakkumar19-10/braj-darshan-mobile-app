import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';
import audioService from '../../services/audioService';

export default function ActiveAartiModeBanner({ onBellPress, onShankhPress }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();
  const [activeSound, setActiveSound] = useState(null);

  const handleBell = () => {
    try {
      Vibration.vibrate([0, 80, 60, 80]);
      audioService.speakChant('घंटी नाद, जय श्री राधे');
    } catch (e) {}
    setActiveSound('bell');
    setTimeout(() => setActiveSound(null), 1200);
    onBellPress?.();
  };

  const handleShankh = () => {
    try {
      Vibration.vibrate([0, 150, 100, 200]);
      audioService.speakChant('दिव्य शंख नाद, ॐ');
    } catch (e) {}
    setActiveSound('shankh');
    setTimeout(() => setActiveSound(null), 1500);
    onShankhPress?.();
  };

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isDark ? '#3D2010' : '#FEF3C7',
          borderColor: isDark ? colors.border : '#FDE68A',
        },
      ]}
    >
      {/* Top Status */}
      <View style={styles.topRow}>
        <View style={styles.livePill}>
          <AppText variant="caption">🪔</AppText>
          <AppText variant="small" weight="700" color="#FFFFFF" style={styles.liveText}>
            {isHindi ? 'लाइव दर्शन' : 'LIVE DARSHAN'}
          </AppText>
        </View>

        <AppText variant="caption" weight="700" color={colors.primary}>
          {isHindi ? 'सक्रिय आरती मोड (Active Aarti Mode)' : 'Active Aarti Mode'}
        </AppText>
      </View>

      {/* 2 Sound Buttons */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[
            styles.soundBtn,
            {
              backgroundColor: activeSound === 'bell' ? colors.primary : '#FFFFFF',
              borderColor: colors.gold,
            },
          ]}
          onPress={handleBell}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText
            variant="caption"
            weight="700"
            color={activeSound === 'bell' ? '#FFFFFF' : colors.navy}
          >
            🔔 {isHindi ? 'घंटी बजाएं (Bell)' : 'Bell (घंटी)'}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.soundBtn,
            {
              backgroundColor: activeSound === 'shankh' ? colors.primary : '#FFFFFF',
              borderColor: colors.gold,
            },
          ]}
          onPress={handleShankh}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText
            variant="caption"
            weight="700"
            color={activeSound === 'shankh' ? '#FFFFFF' : colors.navy}
          >
            🐚 {isHindi ? 'शंख नाद (Blow Shankh)' : 'Blow Shankh (शंख)'}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginVertical: 10,
    shadowColor: '#A43700',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    gap: 4,
  },
  liveText: {
    fontSize: 9,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  soundBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
