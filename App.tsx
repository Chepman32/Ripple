/**
 * Ripple - Habit Tracking App
 * Every habit creates ripples
 */

import React from 'react';
import {
  StatusBar,
  useColorScheme,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/app/navigation/AppNavigator';
import { useAppInitialization } from './src/shared/hooks/useAppInitialization';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { isReady, error } = useAppInitialization();

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorDetails}>{error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: '#6366F1' }]}>
        <Text style={styles.splashTitle}>Ripple</Text>
        <Text style={styles.splashSubtitle}>Every habit creates ripples</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F43F5E',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default App;
