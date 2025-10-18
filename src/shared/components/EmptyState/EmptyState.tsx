import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../Button';
import { spacing, typography } from '../../constants';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing['6xl'],
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.lg,
    minWidth: 200,
  },
});
