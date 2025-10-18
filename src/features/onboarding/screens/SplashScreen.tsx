import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../../shared/hooks/useTheme';
import { typography } from '../../../shared/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { colors } = useTheme();

  // Logo animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);

  // Ripple animation values
  const ripple1Scale = useSharedValue(0);
  const ripple1Opacity = useSharedValue(0);
  const ripple2Scale = useSharedValue(0);
  const ripple2Opacity = useSharedValue(0);
  const ripple3Scale = useSharedValue(0);
  const ripple3Opacity = useSharedValue(0);

  // Text animation values
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  useEffect(() => {
    // Phase 1: Logo appears (0-800ms)
    logoOpacity.value = withTiming(1, { duration: 300 });
    logoScale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
      overshootClamping: false,
    });
    logoRotation.value = withSequence(
      withTiming(360, { duration: 800, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 0 }),
    );

    // Phase 2: Ripple effects (800-1400ms)
    setTimeout(() => {
      ripple1Opacity.value = withTiming(0.6, { duration: 200 });
      ripple1Scale.value = withTiming(2, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
      ripple1Opacity.value = withDelay(200, withTiming(0, { duration: 400 }));
    }, 800);

    setTimeout(() => {
      ripple2Opacity.value = withTiming(0.5, { duration: 200 });
      ripple2Scale.value = withTiming(2.5, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
      ripple2Opacity.value = withDelay(200, withTiming(0, { duration: 400 }));
    }, 1000);

    setTimeout(() => {
      ripple3Opacity.value = withTiming(0.4, { duration: 200 });
      ripple3Scale.value = withTiming(3, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
      ripple3Opacity.value = withDelay(200, withTiming(0, { duration: 400 }));
    }, 1200);

    // Phase 3: Text reveal (1200-1800ms)
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 400 });
      textTranslateY.value = withSpring(0, { damping: 15 });
    }, 1200);

    setTimeout(() => {
      taglineOpacity.value = withTiming(1, { duration: 400 });
      taglineTranslateY.value = withSpring(0, { damping: 15 });
    }, 1400);

    // Phase 4: Transition out (1800-2200ms)
    setTimeout(() => {
      logoScale.value = withTiming(1.2, { duration: 400 });
      logoOpacity.value = withTiming(0, { duration: 400 });
      textOpacity.value = withTiming(0, { duration: 400 });
      taglineOpacity.value = withTiming(0, { duration: 400 });

      setTimeout(() => {
        runOnJS(onComplete)();
      }, 400);
    }, 1800);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const ripple1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple1Scale.value }],
    opacity: ripple1Opacity.value,
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple2Scale.value }],
    opacity: ripple2Opacity.value,
  }));

  const ripple3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple3Scale.value }],
    opacity: ripple3Opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      {/* Ripple Effects */}
      <Animated.View style={[styles.ripple, ripple1Style]} />
      <Animated.View style={[styles.ripple, ripple2Style]} />
      <Animated.View style={[styles.ripple, ripple3Style]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop' }}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Text */}
      <Animated.Text style={[styles.title, textStyle]}>Ripple</Animated.Text>
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        Every habit creates ripples
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.9,
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  title: {
    ...typography.display,
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
