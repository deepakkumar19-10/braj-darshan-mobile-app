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
import { MorpankhIcon } from '../../components/common';
import { ROUTES } from '../../navigation/routes';

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t, isHindi } = useLanguage();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert(isHindi ? 'सूचना' : 'Notice', isHindi ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert(isHindi ? 'सूचना' : 'Notice', isHindi ? 'कृपया अपना ईमेल पता दर्ज करें।' : 'Please enter your email.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert(
        isHindi ? 'सूचना' : 'Notice',
        isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(isHindi ? 'सूचना' : 'Notice', isHindi ? 'पासवर्ड मेल नहीं खा रहे हैं।' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate(ROUTES.DRAWER_HOME);
      }
    } catch (e) {
      Alert.alert(isHindi ? 'सूचना' : 'Notice', isHindi ? 'ऐप में खाता (लॉगिन) सुविधा अभी उपलब्ध नहीं है। आप अतिथि के रूप में ऐप पूरी तरह उपयोग कर सकते हैं।' : 'Accounts are not available in the app yet. You can use the full app as a guest.');
    } finally {
      setLoading(false);
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
        {/* Back Link */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.backArrow, { color: colors.navy }]}>← {isHindi ? 'वापस' : 'Back'}</Text>
        </TouchableOpacity>

        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight, borderColor: colors.gold }]}>
            <MorpankhIcon size={36} />
          </View>
          <Text style={[styles.appTitle, { color: colors.navy }]}>
            {isHindi ? 'नया तीर्थयात्री खाता' : 'Devotee Registration'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('auth.loginSubtitle', 'श्री ब्रज दर्शन में आपका स्वागत है')}
          </Text>
        </View>

        {/* Card Form */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('auth.name', 'पूरा नाम')}
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
              placeholder={isHindi ? 'राधिका शर्मा' : 'Radhika Sharma'}
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

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
              placeholder="radhika@brajdarshan.org"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('auth.password', 'पासवर्ड')}
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
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('auth.confirmPassword', 'पासवर्ड की पुष्टि करें')}
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
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? (isHindi ? 'खाता बन रहा है...' : 'Creating Account...') : t('auth.signUpBtn', 'नया खाता बनाएं')}
            </Text>
          </TouchableOpacity>

          {/* Already have account */}
          <View style={styles.footerLinkWrap}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('auth.alreadyAccount', 'पहले से खाता है?')}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.LOGIN)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                {' '}{t('auth.signInBtn', 'साइन इन')}
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
    paddingTop: 12,
  },
  backButton: {
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 15,
    fontWeight: '700',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    height: 48,
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
  footerLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
