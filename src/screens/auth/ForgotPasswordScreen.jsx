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
import { MorpankhIcon } from '../../components/common';
import { ROUTES } from '../../navigation/routes';

export default function ForgotPasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t, isHindi } = useLanguage();

  const [email, setEmail] = useState('');
  const [submitted] = useState(false);

  const handleReset = () => {
    if (!email.trim()) {
      Alert.alert(
        isHindi ? 'सूचना' : 'Notice',
        isHindi ? 'कृपया अपना ईमेल पता दर्ज करें।' : 'Please enter your email.'
      );
      return;
    }
    Alert.alert(
      isHindi ? 'सूचना' : 'Notice',
      isHindi ? 'ऐप में खाता (लॉगिन) सुविधा अभी उपलब्ध नहीं है। आप अतिथि के रूप में ऐप पूरी तरह उपयोग कर सकते हैं।' : 'Accounts are not available in the app yet. You can use the full app as a guest.'
    );
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.backArrow, { color: colors.navy }]}>← {isHindi ? 'वापस' : 'Back'}</Text>
        </TouchableOpacity>

        <View style={styles.brandHeader}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight, borderColor: colors.gold }]}>
            <MorpankhIcon size={36} />
          </View>
          <Text style={[styles.appTitle, { color: colors.navy }]}>
            {t('auth.resetPassword', 'पासवर्ड रीसेट करें')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('auth.resetSubtitle', 'पासवर्ड रीसेट लिंक पाने के लिए अपना ईमेल दर्ज करें')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {submitted ? (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={[styles.successTitle, { color: colors.navy }]}>
                {isHindi ? 'लिंक प्रेषित किया गया' : 'Reset Link Sent'}
              </Text>
              <Text style={[styles.successMsg, { color: colors.textSecondary }]}>
                {isHindi
                  ? `${email} पर पासवर्ड रीसेट निर्देश भेज दिए गए हैं।`
                  : `Password reset instructions have been sent to ${email}.`}
              </Text>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 20 }]}
                onPress={() => navigation.navigate(ROUTES.LOGIN)}
              >
                <Text style={styles.primaryButtonText}>
                  {t('auth.backToLogin', 'साइन इन पर वापस जाएं')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={handleReset}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>
                  {t('auth.sendResetLink', 'रीसेट लिंक भेजें')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelLink}
                onPress={() => navigation.navigate(ROUTES.LOGIN)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  {t('auth.backToLogin', 'साइन इन पर वापस जाएं')}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 24,
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 12,
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
  inputGroup: {
    marginBottom: 18,
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
  cancelLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIcon: {
    fontSize: 40,
    color: '#16A34A',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  successMsg: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
