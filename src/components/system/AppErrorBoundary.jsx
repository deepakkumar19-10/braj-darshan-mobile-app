/**
 * Last line of defence: if a screen throws while rendering, show a calm recovery
 * screen instead of a white screen or a crash. "Try again" clears the saved
 * navigation state (the usual culprit after an update) and remounts the app.
 */

import React from 'react';
import { StyleSheet, View, Pressable, Text, useColorScheme } from 'react-native';
import { clearNavigationState } from '../../navigation/persistence';

function Fallback({ onRetry }) {
  const dark = useColorScheme() === 'dark';
  const bg = dark ? '#121212' : '#FFF9ED';
  const fg = dark ? '#F5EBDD' : '#17324D';
  const muted = dark ? '#B8A99A' : '#786A5D';
  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: fg }]}>कुछ गड़बड़ हो गई</Text>
      <Text style={[styles.body, { color: muted }]}>
        इस स्क्रीन में कुछ गड़बड़ हुई। आपके सहेजे मंदिर सुरक्षित हैं।{'\n'}
        Something went wrong on this screen. Your saved temples are safe.
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, { backgroundColor: dark ? '#F59E0B' : '#A85A06', opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={[styles.buttonText, { color: dark ? '#1E1B18' : '#FFFFFF' }]}>फिर से खोलें · Try again</Text>
      </Pressable>
    </View>
  );
}

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: 0 };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.warn('AppErrorBoundary caught:', error, info?.componentStack);
  }

  async handleRetry() {
    await clearNavigationState();
    this.setState((s) => ({ error: null, resetKey: s.resetKey + 1 }));
  }

  render() {
    if (this.state.error) {
      return <Fallback onRetry={this.handleRetry} />;
    }
    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  button: { marginTop: 12, minHeight: 52, paddingHorizontal: 24, borderRadius: 14, justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
