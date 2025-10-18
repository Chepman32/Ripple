import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { Button } from '../../../shared/components';
import { spacing, typography } from '../../../shared/constants';
import { settingsRepository } from '../../../database/repositories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to Ripple',
    description:
      'Build better habits, one ripple at a time. Track your progress and watch your life transform.',
    emoji: '🌊',
  },
  {
    id: '2',
    title: 'Every Habit Creates Ripples',
    description:
      'Small, consistent actions compound into meaningful change. Your habits shape your future.',
    emoji: '✨',
  },
  {
    id: '3',
    title: 'Swipe to Complete',
    description:
      'Simply swipe right on any habit to mark it complete. Quick, easy, and satisfying.',
    emoji: '👆',
  },
  {
    id: '4',
    title: 'Track Your Progress',
    description:
      'View detailed statistics, streaks, and insights about your habits. Stay motivated!',
    emoji: '📊',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    haptic.light();
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    haptic.light();
    handleComplete();
  };

  const handleComplete = async () => {
    await settingsRepository.updateSettings({ onboardingCompleted: true });
    onComplete();
  };

  const renderSlide = ({
    item,
    index,
  }: {
    item: OnboardingSlide;
    index: number;
  }) => <OnboardingSlide slide={item} index={index} scrollX={scrollX} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={event => {
          scrollX.value = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            scrollX={scrollX}
            currentIndex={currentIndex}
          />
        ))}
      </View>

      {/* Next Button */}
      <View style={styles.footer}>
        <Button variant="primary" onPress={handleNext} fullWidth>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
};

interface OnboardingSlideProps {
  slide: OnboardingSlide;
  index: number;
  scrollX: Animated.SharedValue<number>;
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  slide,
  index,
  scrollX,
}) => {
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {slide.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {slide.description}
        </Text>
      </Animated.View>
    </View>
  );
};

interface PaginationDotProps {
  index: number;
  scrollX: Animated.SharedValue<number>;
  currentIndex: number;
}

const PaginationDot: React.FC<PaginationDotProps> = ({
  index,
  scrollX,
  currentIndex,
}) => {
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP,
    );

    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: colors.primary }, animatedStyle]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.xl,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
  },
  emoji: {
    fontSize: 120,
    marginBottom: spacing['3xl'],
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 28,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing['3xl'],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
});
