import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { MorpankhIcon, LotusIcon } from '../../components/common';
import { ROUTES } from '../../navigation/routes';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t, isHindi } = useLanguage();
  const { login, loginAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(
        isHindi ? 'कृपया ध्यान दें' : 'Attention',
        isHindi ? 'कृपया अपना ईमेल पता दर्ज करें।' : 'Please enter your email address.'
      );
      return;
    }
    if (!password.trim()) {
      Alert.alert(
        isHindi ? 'कृपया ध्यान दें' : 'Attention',
        isHindi ? 'कृपया अपना पासवर्ड दर्ज करें।' : 'Please enter your password.'
      );
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Auth change will automatically transition to AppStack or navigate to Home
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate(ROUTES.DRAWER_HOME);
      }
    } catch (err) {
      Alert.alert(isHindi ? 'त्रुटि' : 'Error', isHindi ? 'लॉग इन करने में विफल।' : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await loginAsGuest();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(ROUTES.DRAWER_HOME);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight, borderColor: colors.gold }]}>
            <MorpankhIcon size={40} />
          </View>
          <Text style={[styles.appTitle, { color: colors.navy }]}>
            {isHindi ? 'श्री ब्रज दर्शन' : 'Braj Darshan'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('auth.loginSubtitle', 'अपनी पावन यात्रा जारी रखने के लिए साइन इन करें')}
          </Text>
        </View>

        {/* Card Form */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.navy }]}>
            {t('auth.loginTitle', 'साइन इन करें')}
          </Text>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('auth.email', 'ईमेल पता')}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? colors.cardAlt : '#FAF8F5',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="radhe@brajdarshan.org"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordRow}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t('auth.password', 'पासवर्ड')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.forgotText, { color: colors.primary }]}>
                  {t('auth.forgotPassword', 'पासवर्ड भूल गए?')}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? colors.cardAlt : '#FAF8F5',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? (isHindi ? 'सत्यापन हो रहा है...' : 'Signing In...') : t('auth.signInBtn', 'साइन इन करें')}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.muted }]}>
              {isHindi ? 'अथवा' : 'OR'}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Guest Button */}
          <TouchableOpacity
            style={[
              styles.guestButton,
              {
                backgroundColor: isDark ? colors.cardAlt : colors.primaryLight,
                borderColor: colors.gold,
              },
            ]}
            onPress={handleGuest}
            activeOpacity={0.85}
          >
            <LotusIcon size={18} color={colors.primary} />
            <Text style={[styles.guestButtonText, { color: colors.primary }]}>
              {t('auth.continueGuest', 'अतिथि तीर्थयात्री के रूप में जारी रखें')}
            </Text>
          </TouchableOpacity>

          {/* Link to Register */}
          <View style={styles.footerLinkWrap}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('auth.noAccount', 'खाता नहीं है?')}{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.REGISTER)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                {t('auth.signUpBtn', 'नया खाता बनाएं')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    height: 48, // Apple HIG min 44pt touch target
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  guestButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
