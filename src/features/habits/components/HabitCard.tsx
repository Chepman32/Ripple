import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { spacing, typography, shadows } from '../../../shared/constants';
import { Habit } from '../../../shared/types';
import { ConfettiAnimation } from '../../../shared/components/ConfettiAnimation';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onEdit?: (habitId: string) => void;
  onPress?: (habitId: string) => void;
  completed?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onComplete,
  onEdit,
  onPress,
  completed = false,
}) => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const translateX = useSharedValue(0);
  const [isCompleted, setIsCompleted] = useState(completed);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    setShowConfetti(true);
    onComplete(habit.id);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const handlePress = () => {
    if (onPress) {
      haptic.light();
      onPress(habit.id);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate(event => {
      if (isCompleted) return;

      // Only allow right swipe for completion
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(event => {
      if (isCompleted) return;

      if (event.translationX > SWIPE_THRESHOLD) {
        // Complete the habit
        translateX.value = withSpring(SCREEN_WIDTH, {
          damping: 15,
          stiffness: 100,
        });
        runOnJS(haptic.success)();
        setTimeout(() => {
          runOnJS(handleComplete)();
          translateX.value = withTiming(0, { duration: 0 });
        }, 300);
      } else {
        // Spring back
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, SCREEN_WIDTH], [1, 0.3]);

    return {
      transform: [{ translateX: translateX.value }],
      opacity: isCompleted ? 0.6 : opacity,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD, SCREEN_WIDTH],
      [0, 0.3, 0.5],
    );

    const backgroundColor = interpolateColor(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      ['rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.3)'],
    );

    return {
      opacity,
      backgroundColor,
    };
  });

  const checkmarkStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.6, SWIPE_THRESHOLD],
      [0, 0.8, 1],
    );

    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
      [0, 0.5, 1],
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handlePress)();
  });

  const combinedGesture = Gesture.Race(gesture, tapGesture);

  return (
    <View style={styles.container}>
      {showConfetti && <ConfettiAnimation />}
      <GestureDetector gesture={combinedGesture}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: isCompleted ? colors.success : colors.border,
            },
            cardStyle,
          ]}
        >
          {/* Swipe Overlay */}
          <Animated.View style={[styles.overlay, overlayStyle]}>
            <Animated.View style={[styles.checkmarkContainer, checkmarkStyle]}>
              <Text style={styles.checkmark}>✓</Text>
            </Animated.View>
          </Animated.View>

          {/* Card Content */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: habit.color + '26' },
            ]}
          >
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>

          <View style={styles.content}>
            <Text
              style={[
                styles.name,
                { color: colors.textPrimary },
                isCompleted && styles.completedText,
              ]}
            >
              {habit.name}
            </Text>
            <Text style={[styles.frequency, { color: colors.textSecondary }]}>
              {habit.frequency}
            </Text>
            {habit.targetValue && (
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: habit.color,
                        width: isCompleted ? '100%' : '0%',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressText, { color: colors.textSecondary }]}
                >
                  {isCompleted ? habit.targetValue : 0} / {habit.targetValue}{' '}
                  {habit.unit}
                </Text>
              </View>
            )}
          </View>

          {isCompleted && (
            <View
              style={[
                styles.completedBadge,
                { backgroundColor: colors.success },
              ]}
            >
              <Text style={styles.completedBadgeText}>✓</Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    ...shadows.md,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingLeft: spacing.xl,
  },
  checkmarkContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  frequency: {
    ...typography.caption,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    ...typography.caption,
    fontSize: 11,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
