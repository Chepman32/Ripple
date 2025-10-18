/**
 * Ripple - Habit Tracking App
 * Every habit creates ripples
 */

import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  useColorScheme,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/app/navigation/AppNavigator';
import { useAppInitialization } from './src/shared/hooks/useAppInitialization';
import { SplashScreen } from './src/features/onboarding/screens/SplashScreen';
import { OnboardingScreen } from './src/features/onboarding/screens/OnboardingScreen';
import { settingsRepository } from './src/database/repositories';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { isReady, error } = useAppInitialization();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (isReady) {
      checkOnboardingStatus();
    }
  }, [isReady]);

  const checkOnboardingStatus = async () => {
    const settings = await settingsRepository.getSettings();
    setOnboardingCompleted(settings.onboardingCompleted);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorDetails}>{error.message}</Text>
      </View>
    );
  }

  if (!isReady || showSplash) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <SplashScreen onComplete={handleSplashComplete} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
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
