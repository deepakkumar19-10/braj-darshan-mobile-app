/**
 * Braj Darshan - Reset password
 * Accounts are not available yet, so no reset link is ever sent: the gold note says so up
 * front and "Send reset link" shows the same message once an email is typed.
 * Layout from the Nov 2026 redesign (Claude Design "ForgotPassword").
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
import { AppText } from '../../components/common/AppText';
import { Icon } from '../../components/common/Icon';
import { BackButton, Button, InfoNote } from '../../components/ui';
import { fontFor } from '../../theme/fonts';
import { ROUTES } from '../../navigation/routes';

export default function ForgotPasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isHindi } = useLanguage();

  const [email, setEmail] = useState('');

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

  const emailLabel = t('auth.email', 'ईमेल पता');

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

        <View style={[styles.iconTile, { backgroundColor: colors.primaryLight }]}>
          <Icon name="safety" size={30} color={colors.primary} />
        </View>
        <View style={styles.header}>
          <AppText variant="h1" weight="700" color={colors.navy} accessibilityRole="header">
            {t('auth.resetPassword', 'पासवर्ड रीसेट करें')}
          </AppText>
          <AppText variant="body" color={colors.muted}>
            {t('auth.resetSubtitle', 'पासवर्ड रीसेट लिंक पाने के लिए अपना ईमेल दर्ज करें')}
          </AppText>
        </View>

        <InfoNote tone="warning" icon="info">
          {isHindi
            ? 'खाता सुविधा अभी उपलब्ध नहीं है। आप अतिथि के रूप में ऐप पूरी तरह उपयोग कर सकते हैं।'
            : 'Accounts are not available in the app yet. You can use the full app as a guest.'}
        </InfoNote>

        <View style={styles.form}>
          <View style={styles.field}>
            <AppText variant="caption" weight="600" color={colors.navy}>
              {emailLabel}
            </AppText>
            <TextInput
              accessibilityLabel={emailLabel}
              style={[
                styles.input,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                fontFor('400'),
              ]}
              placeholder="radhe@brajdarshan.org"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              maxFontSizeMultiplier={1.4}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Button title={t('auth.sendResetLink', 'रीसेट लिंक भेजें')} onPress={handleReset} />
        </View>

        <Button
          variant="text"
          title={t('auth.backToLogin', 'साइन इन पर वापस जाएं')}
          onPress={() => navigation.navigate(ROUTES.LOGIN)}
          style={styles.backLink}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  iconTile: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  // Pushed to the bottom of the screen when there is room.
  backLink: { marginTop: 'auto', alignSelf: 'center' },
});
