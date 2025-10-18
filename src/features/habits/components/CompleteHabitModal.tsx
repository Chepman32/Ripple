import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { Button } from '../../../shared/components';
import { spacing, typography } from '../../../shared/constants';

interface CompleteHabitModalProps {
  visible: boolean;
  habitName: string;
  habitColor: string;
  habitIcon: string;
  hasTargetValue?: boolean;
  targetValue?: number;
  unit?: string;
  onClose: () => void;
  onComplete: (data: {
    value?: number;
    note?: string;
    mood?: 'great' | 'good' | 'okay' | 'bad';
  }) => void;
}

type Mood = 'great' | 'good' | 'okay' | 'bad';

const MOOD_OPTIONS: Array<{ value: Mood; emoji: string; label: string; color: string }> = [
  { value: 'great', emoji: '😊', label: 'Great', color: '#10B981' },
  { value: 'good', emoji: '🙂', label: 'Good', color: '#06B6D4' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: '#F59E0B' },
  { value: 'bad', emoji: '😞', label: 'Bad', color: '#EF4444' },
];

export const CompleteHabitModal: React.FC<CompleteHabitModalProps> = ({
  visible,
  habitName,
  habitColor,
  habitIcon,
  hasTargetValue,
  targetValue,
  unit,
  onClose,
  onComplete,
}) => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const translateY = useSharedValue(1000);

  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(undefined);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      translateY.value = withSpring(1000);
      // Reset form when modal closes
      setValue('');
      setNote('');
      setSelectedMood(undefined);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleComplete = () => {
    haptic.success();
    onComplete({
      value: value ? parseInt(value) : undefined,
      note: note.trim() || undefined,
      mood: selectedMood,
    });
    onClose();
  };

  const handleQuickValue = (quickValue: number) => {
    haptic.light();
    setValue(quickValue.toString());
  };

  const quickValueOptions = targetValue
    ? [
        Math.round(targetValue * 0.25),
        Math.round(targetValue * 0.5),
        Math.round(targetValue * 0.75),
        targetValue,
      ]
    : [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: colors.modalOverlay }]}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.modal,
            { backgroundColor: colors.surface },
            animatedStyle,
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.content}>
            {/* Habit Header */}
            <View style={styles.habitHeader}>
              <View
                style={[
                  styles.habitIconContainer,
                  { backgroundColor: habitColor + '26' },
                ]}
              >
                <Text style={styles.habitIconText}>{habitIcon}</Text>
              </View>
              <Text style={[styles.habitName, { color: colors.textPrimary }]}>
                {habitName}
              </Text>
            </View>

            {/* Value Input (if quantifiable) */}
            {hasTargetValue && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  How much did you do?
                </Text>
                <View style={styles.valueInputRow}>
                  <TextInput
                    style={[
                      styles.valueInput,
                      {
                        backgroundColor: colors.background,
                        color: colors.textPrimary,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    value={value}
                    onChangeText={setValue}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                  <Text style={[styles.unitText, { color: colors.textPrimary }]}>
                    {unit}
                  </Text>
                  {targetValue && (
                    <Text style={[styles.targetText, { color: colors.textSecondary }]}>
                      / {targetValue}
                    </Text>
                  )}
                </View>

                {/* Quick Value Buttons */}
                {quickValueOptions.length > 0 && (
                  <View style={styles.quickValues}>
                    {quickValueOptions.map(qv => (
                      <TouchableOpacity
                        key={qv}
                        style={[
                          styles.quickValueButton,
                          {
                            backgroundColor:
                              value === qv.toString()
                                ? habitColor
                                : colors.background,
                            borderColor:
                              value === qv.toString() ? habitColor : colors.border,
                          },
                        ]}
                        onPress={() => handleQuickValue(qv)}
                      >
                        <Text
                          style={[
                            styles.quickValueText,
                            {
                              color:
                                value === qv.toString()
                                  ? '#FFFFFF'
                                  : colors.textPrimary,
                            },
                          ]}
                        >
                          {qv}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Mood Selector */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                How do you feel?
              </Text>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map(mood => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodButton,
                      {
                        backgroundColor:
                          selectedMood === mood.value
                            ? mood.color + '20'
                            : colors.background,
                        borderColor:
                          selectedMood === mood.value ? mood.color : colors.border,
                      },
                    ]}
                    onPress={() => {
                      haptic.selection();
                      setSelectedMood(mood.value);
                    }}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        {
                          color:
                            selectedMood === mood.value
                              ? mood.color
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Add a note (optional)
              </Text>
              <TextInput
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="How did it go?"
                placeholderTextColor={colors.textTertiary}
                value={note}
                onChangeText={setNote}
                maxLength={100}
                multiline
                numberOfLines={3}
              />
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {note.length}/100
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              variant="secondary"
              onPress={onClose}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={handleComplete}
              style={styles.button}
            >
              Complete
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  habitHeader: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  habitIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  habitIconText: {
    fontSize: 32,
  },
  habitName: {
    ...typography.h3,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  label: {
    ...typography.label,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  valueInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  valueInput: {
    ...typography.h1,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: 120,
    textAlign: 'center',
  },
  unitText: {
    ...typography.h3,
  },
  targetText: {
    ...typography.h3,
  },
  quickValues: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickValueButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  quickValueText: {
    ...typography.body,
    fontWeight: '600',
  },
  moodGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  moodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: spacing.xs,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  noteInput: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
  },
});
