import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, typography } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.background,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.primary
              : colors.border,
          },
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {leftIcon && <Text style={styles.icon}>{leftIcon}</Text>}
        <TextInput
          style={[styles.input, { color: colors.textPrimary }, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Text style={styles.icon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  input: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.md,
  },
  icon: {
    fontSize: 20,
    marginHorizontal: spacing.sm,
  },
  error: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
