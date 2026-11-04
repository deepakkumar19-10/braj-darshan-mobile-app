/**
 * Braj Darshan - Create account
 * Accounts are not available yet (see src/context/AuthContext.jsx): the gold note says so
 * up front and submitting the form shows the same message after the usual checks.
 * Layout from the Nov 2026 redesign (Claude Design "Register").
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AppText } from '../../components/common/AppText';
import { BackButton, Button, InfoNote } from '../../components/ui';
import { fontFor } from '../../theme/fonts';
import { ROUTES } from '../../navigation/routes';

/** A labelled text field: the label sits above a 52pt input, with an optional hint below. */
function Field({ label, hint, colors, ...inputProps }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" weight="600" color={colors.navy}>
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={colors.muted}
        maxFontSizeMultiplier={1.4}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          fontFor('400'),
        ]}
        {...inputProps}
      />
      {hint ? (
        <AppText variant="small" color={colors.muted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
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
        <BackButton onPress={() => navigation.goBack()} />

        <View style={styles.header}>
          <AppText variant="h1" weight="700" color={colors.navy} accessibilityRole="header">
            {isHindi ? 'नया तीर्थयात्री खाता' : 'Devotee Registration'}
          </AppText>
          <AppText variant="body" color={colors.muted}>
            {isHindi ? 'श्री ब्रज दर्शन में आपका स्वागत है' : 'Welcome to Shri Braj Darshan'}
          </AppText>
        </View>

        <InfoNote tone="warning" icon="info">
          {isHindi
            ? 'खाता सुविधा अभी उपलब्ध नहीं है। आप अतिथि के रूप में ऐप पूरी तरह उपयोग कर सकते हैं।'
            : 'Accounts are not available in the app yet. You can use the full app as a guest.'}
        </InfoNote>

        <View style={styles.form}>
          <Field
            label={t('auth.name', 'पूरा नाम')}
            colors={colors}
            placeholder={isHindi ? 'राधिका शर्मा' : 'Radhika Sharma'}
            autoComplete="name"
            textContentType="name"
            value={name}
            onChangeText={setName}
          />
          <Field
            label={t('auth.email', 'ईमेल पता')}
            colors={colors}
            placeholder="radhika@brajdarshan.org"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label={t('auth.password', 'पासवर्ड')}
            hint={isHindi ? 'कम से कम 6 अक्षर' : 'At least 6 characters'}
            colors={colors}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
          />
          <Field
            label={t('auth.confirmPassword', 'पासवर्ड की पुष्टि करें')}
            colors={colors}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button
            title={
              loading
                ? isHindi ? 'खाता बन रहा है...' : 'Creating Account...'
                : t('auth.signUpBtn', 'नया खाता बनाएं')
            }
            onPress={handleRegister}
            disabled={loading}
            style={styles.submit}
          />
        </View>

        {/* Already have an account */}
        <View style={styles.footer}>
          <AppText variant="body" color={colors.text}>
            {isHindi ? 'पहले से खाता है?' : 'Already have an account?'}
          </AppText>
          <Button
            variant="text"
            title={t('auth.signInBtn', 'साइन इन')}
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, gap: 18 },
  header: { gap: 4 },
  form: { gap: 14 },
  field: { gap: 6 },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 16,
  },
  submit: { marginTop: 4 },
  // Pushed to the bottom of the screen when there is room.
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
});
