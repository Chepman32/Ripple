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
import Ionicons from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { isReady, error } = useAppInitialization();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Promise.all([
          Ionicons.loadFont(),
          FeatherIcon.loadFont(),
          MaterialCommunityIcon.loadFont(),
        ]);
      } catch (fontError) {
        console.error('Failed to load icon fonts', fontError);
      } finally {
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

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

  if (!fontsLoaded || !isReady || showSplash) {
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
