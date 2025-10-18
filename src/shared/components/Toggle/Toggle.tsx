import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useHaptic } from '../../hooks/useHaptic';
import { spacing, typography } from '../../constants';

interface ToggleProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
  description,
}) => {
  const { colors } = useTheme();
  const haptic = useHaptic();

  const handleToggle = (newValue: boolean) => {
    haptic.light();
    onValueChange(newValue);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => !disabled && handleToggle(!value)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {label && (
          <Text
            style={[
              styles.label,
              { color: colors.textPrimary },
              disabled && styles.disabled,
            ]}
          >
            {label}
          </Text>
        )}
        {description && (
          <Text
            style={[
              styles.description,
              { color: colors.textSecondary },
              disabled && styles.disabled,
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.border}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  content: {
    flex: 1,
    marginRight: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
  },
  disabled: {
    opacity: 0.5,
  },
});
