import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppText } from '../common/AppText';
import StitchTag from '../common/StitchTag';
import StitchButton from '../common/StitchButton';

// Target: Shri Krishna Janmashtami 2026 (Bhadrapada Krishna Ashtami)
const TARGET_DATE = new Date('2026-09-04T00:00:00+05:30');

export default function MahotsavCountdownCard({ onExplorePress }) {
  const { colors, isDark } = useTheme();
  const { isHindi } = useLanguage();

  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 16,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = TARGET_DATE - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const format2 = (n) => String(n).padStart(2, '0');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.card : colors.peach,
          borderColor: isDark ? colors.border : 'rgba(164, 55, 0, 0.18)',
        },
      ]}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <StitchTag
          icon="🪔"
          text={isHindi ? 'आगामी पावन जन्मोत्सव' : 'Upcoming Sacred Mahotsav'}
          variant="saffron"
        />

        <View style={styles.liveTithiBadge}>
          <View style={styles.liveDot} />
          <AppText variant="small" weight="700" color={colors.primary}>
            {isHindi ? 'लाइव तिथि' : 'Live Tithi'}
          </AppText>
        </View>
      </View>

      {/* Festival Title */}
      <AppText
        variant="h1"
        weight="700"
        color={colors.navy}
        style={styles.title}
      >
        {isHindi ? 'श्री कृष्ण जन्माष्टमी २०२६' : 'Shri Krishna Janmashtami 2026'}
      </AppText>

      <AppText variant="caption" color={colors.muted} style={styles.subtitle}>
        {isHindi
          ? 'महा जन्मोत्सव • श्री कृष्ण जन्मस्थान, मथुरा'
          : 'Maha Janmotsav • Shri Krishna Janmabhoomi, Mathura'}
      </AppText>

      {/* 4 Elevated White Countdown Boxes */}
      <View style={styles.boxesRow}>
        <View style={[styles.box, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <AppText variant="h1" weight="700" color={colors.primary} style={styles.num}>
            {format2(timeLeft.days)}
          </AppText>
          <AppText variant="small" weight="700" color={colors.muted} style={styles.unit}>
            {isHindi ? 'दिन' : 'DAYS'}
          </AppText>
        </View>

        <View style={[styles.box, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <AppText variant="h1" weight="700" color={colors.primary} style={styles.num}>
            {format2(timeLeft.hours)}
          </AppText>
          <AppText variant="small" weight="700" color={colors.muted} style={styles.unit}>
            {isHindi ? 'घंटे' : 'HOURS'}
          </AppText>
        </View>

        <View style={[styles.box, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <AppText variant="h1" weight="700" color={colors.primary} style={styles.num}>
            {format2(timeLeft.minutes)}
          </AppText>
          <AppText variant="small" weight="700" color={colors.muted} style={styles.unit}>
            {isHindi ? 'मिनट' : 'MINS'}
          </AppText>
        </View>

        <View style={[styles.box, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <AppText variant="h1" weight="700" color={colors.primary} style={styles.num}>
            {format2(timeLeft.seconds)}
          </AppText>
          <AppText variant="small" weight="700" color={colors.muted} style={styles.unit}>
            {isHindi ? 'सेकंड' : 'SECS'}
          </AppText>
        </View>
      </View>

      {/* Narrative Snippet */}
      <AppText
        variant="caption"
        color={colors.textSecondary}
        style={styles.narrative}
      >
        {isHindi
          ? 'पवित्र कारागार गर्भगृह में भगवान श्री कृष्ण का मध्यरात्रि अलौकिक प्राकट्य दर्शन व मंगला महाआरती।'
          : 'Divine midnight advent of Lord Krishna at the sacred garbha griha prison cell.'}
      </AppText>

      {/* Primary Terracotta CTA */}
      <StitchButton
        title={
          isHindi
            ? 'उत्सव समय सारणी व दर्शन नियम देखें'
            : 'Explore Festival Schedule & Entry Guidelines'
        }
        showArrow={true}
        variant="primary"
        size="md"
        fullWidth={true}
        onPress={onExplorePress}
        style={styles.ctaButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#A43700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveTithiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 6,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginTop: 2,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#121C2A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  num: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  unit: {
    fontSize: 9,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  narrative: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  ctaButton: {
    marginTop: 2,
  },
});
