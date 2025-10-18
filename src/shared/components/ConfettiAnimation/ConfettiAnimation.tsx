import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
}

interface ConfettiAnimationProps {
  count?: number;
  colors?: string[];
  duration?: number;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  count = 30,
  colors = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  duration = 2000,
}) => {
  const particles: ConfettiParticle[] = Array.from(
    { length: count },
    (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: -20,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 8,
    }),
  );

  return (
    <Animated.View style={styles.container} pointerEvents="none">
      {particles.map(particle => (
        <ConfettiParticle
          key={particle.id}
          particle={particle}
          duration={duration}
        />
      ))}
    </Animated.View>
  );
};

interface ConfettiParticleProps {
  particle: ConfettiParticle;
  duration: number;
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = ({
  particle,
  duration,
}) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(particle.rotation);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const angle = (Math.random() - 0.5) * Math.PI * 0.5;
    const velocity = 50 + Math.random() * 100;

    translateY.value = withTiming(SCREEN_HEIGHT + 50, {
      duration: duration + Math.random() * 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    translateX.value = withTiming(Math.cos(angle) * velocity, {
      duration: duration,
      easing: Easing.out(Easing.quad),
    });

    rotation.value = withTiming(particle.rotation + 360 + Math.random() * 720, {
      duration: duration,
      easing: Easing.linear,
    });

    opacity.value = withDelay(
      duration * 0.6,
      withTiming(0, { duration: duration * 0.4 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});
