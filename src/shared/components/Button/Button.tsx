import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';
import { spacing, typography, shadows } from '../../constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  children,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
    haptic.light();
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonStyles = [
    styles.base,
    variant === 'primary' && {
      ...styles.primary,
      backgroundColor: colors.primary,
    },
    variant === 'secondary' && {
      ...styles.secondary,
      borderColor: colors.primary,
    },
    variant === 'text' && styles.text,
    variant === 'danger' && { ...styles.danger, backgroundColor: colors.error },
    size === 'small' && styles.small,
    size === 'medium' && styles.medium,
    size === 'large' && styles.large,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    variant === 'primary' && { color: '#FFFFFF' },
    variant === 'secondary' && { color: colors.primary },
    variant === 'text' && { color: colors.primary },
    variant === 'danger' && { color: '#FFFFFF' },
    size === 'small' && styles.smallText,
    size === 'medium' && styles.mediumText,
    size === 'large' && styles.largeText,
    disabled && { opacity: 0.5 },
    textStyle,
  ];

  return (
    <AnimatedTouchable
      style={[buttonStyles, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    ...shadows.sm,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  text: {
    backgroundColor: 'transparent',
  },
  danger: {
    ...shadows.sm,
  },
  small: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  medium: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  large: {
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  baseText: {
    ...typography.body,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
