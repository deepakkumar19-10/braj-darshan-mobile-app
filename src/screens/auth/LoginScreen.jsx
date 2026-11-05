/**
 * Braj Darshan - Sign in
 * Accounts are not available yet (see src/context/AuthContext.jsx): the gold note says so
 * up front, signing in shows the same message, and "Continue as guest" opens the full app.
 * Layout from the Nov 2026 redesign (Claude Design "Login").
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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AppText } from '../../components/common/AppText';
import { Button, InfoNote } from '../../components/ui';
import { fontFor } from '../../theme/fonts';
import { ROUTES } from '../../navigation/routes';

// The divyabraj.com logo, as on Home and More.
const LOGO = require('../../assets/images/brand/braj-logo.png');

/** A labelled text field: the label sits above a 52pt input. */
function Field({ label, colors, ...inputProps }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" weight="600" color={colors.navy}>
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        maxFontSizeMultiplier={1.4}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          fontFor('400'),
        ]}
        {...inputProps}
      />
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
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
      Alert.alert(isHindi ? 'सूचना' : 'Notice', isHindi ? 'ऐप में खाता (लॉगिन) सुविधा अभी उपलब्ध नहीं है। आप अतिथि के रूप में ऐप पूरी तरह उपयोग कर सकते हैं।' : 'Accounts are not available in the app yet. You can use the full app as a guest.');
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
        {/* Brand header */}
        <View style={styles.brandHeader}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="cover"
            fadeDuration={0}
            accessibilityLabel="DivyaBraj"
          />
          <AppText variant="h1" weight="700" color={colors.navy} align="center" accessibilityRole="header">
            {isHindi ? 'दिव्यब्रज' : 'DivyaBraj'}
          </AppText>
          <AppText variant="body" color={colors.muted} align="center">
            {t('auth.loginSubtitle', 'अपनी पावन यात्रा जारी रखने के लिए साइन इन करें')}
          </AppText>
        </View>

        <InfoNote tone="warning" icon="info">
          {isHindi
            ? 'खाता (लॉगिन) सुविधा अभी उपलब्ध नहीं है। आप अतिथि के रूप में ऐप पूरी तरह उपयोग कर सकते हैं।'
            : 'Accounts are not available in the app yet. You can use the full app as a guest.'}
        </InfoNote>

        {/* Form */}
        <View style={styles.form}>
          <Field
            label={t('auth.email', 'ईमेल पता')}
            colors={colors}
            placeholder="radhe@brajdarshan.org"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
          />
          <View>
            <Field
              label={t('auth.password', 'पासवर्ड')}
              colors={colors}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
            />
            <Button
              variant="text"
              title={t('auth.forgotPassword', 'पासवर्ड भूल गए?')}
              onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
              style={styles.forgot}
            />
          </View>

          <Button
            title={
              loading
                ? isHindi ? 'सत्यापन हो रहा है...' : 'Signing In...'
                : t('auth.signInBtn', 'साइन इन करें')
            }
            onPress={handleLogin}
            disabled={loading}
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <AppText variant="small" color={colors.muted}>
            {isHindi ? 'अथवा' : 'OR'}
          </AppText>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <Button
          variant="secondary"
          title={t('auth.continueGuest', 'अतिथि तीर्थयात्री के रूप में जारी रखें')}
          onPress={handleGuest}
        />

        {/* Link to Register */}
        <View style={styles.footer}>
          <AppText variant="body" color={colors.text}>
            {isHindi ? 'खाता नहीं है?' : "Don't have an account?"}
          </AppText>
          <Button
            variant="text"
            title={t('auth.signUpBtn', 'नया खाता बनाएं')}
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 32, gap: 18 },
  brandHeader: { alignItems: 'center', gap: 8 },
  logo: { width: 72, height: 72, borderRadius: 22 },
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
  forgot: { alignSelf: 'flex-end', minHeight: 44, paddingHorizontal: 0 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1 },
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
