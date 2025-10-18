import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, shadows } from '../../constants';

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = spacing.xl,
  onPress,
  children,
  style,
}) => {
  const { colors } = useTheme();

  const cardStyles = [
    styles.base,
    { backgroundColor: colors.surface, padding },
    variant === 'elevated' && shadows.md,
    variant === 'outlined' && { borderWidth: 1, borderColor: colors.border },
    variant === 'default' && {
      ...shadows.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
  },
});
