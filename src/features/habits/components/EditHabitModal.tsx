import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { Button, HabitIcon } from '../../../shared/components';
import { spacing, typography, HABIT_ICONS } from '../../../shared/constants';
import { FrequencyType, Habit } from '../../../shared/types';

interface EditHabitModalProps {
  visible: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSave: (habitId: string, updates: Partial<Habit>) => void;
}

const PRESET_COLORS = [
  '#6366F1',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
];

// Icons now use HABIT_ICONS from constants

export const EditHabitModal: React.FC<EditHabitModalProps> = ({
  visible,
  habit,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const translateY = useSharedValue(1000);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [frequency, setFrequency] = useState<FrequencyType>(FrequencyType.DAILY);
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || '');
      setSelectedColor(habit.color);
      // Find the index of the current icon in HABIT_ICONS
      const iconIndex = HABIT_ICONS.findIndex(
        icon => icon.name === habit.icon && icon.type === habit.iconType
      );
      setSelectedIconIndex(iconIndex >= 0 ? iconIndex : 0);
      setFrequency(habit.frequency);
      setTargetValue(habit.targetValue?.toString() || '');
      setUnit(habit.unit || '');
      setSelectedDays(habit.customFrequency?.days || []);
    }
  }, [habit]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      translateY.value = withTiming(1000, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSave = () => {
    if (!name.trim() || !habit) {
      haptic.error();
      return;
    }

    const selectedIcon = HABIT_ICONS[selectedIconIndex];
    const updates: Partial<Habit> = {
      name: name.trim(),
      description: description.trim() || undefined,
      color: selectedColor,
      icon: selectedIcon.name,
      iconType: selectedIcon.type,
      frequency,
      targetValue: targetValue ? parseInt(targetValue) : undefined,
      unit: unit.trim() || undefined,
      updatedAt: new Date(),
    };

    if (frequency === FrequencyType.CUSTOM && selectedDays.length > 0) {
      updates.customFrequency = {
        type: 'specific_days',
        days: selectedDays,
      };
    }

    haptic.success();
    onSave(habit.id, updates);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const toggleDay = (day: number) => {
    haptic.selection();
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (!habit) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: colors.modalOverlay }]}
          activeOpacity={1}
          onPress={handleClose}
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

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Edit Habit
            </Text>

            {/* Name Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Habit Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="e.g., Morning meditation"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {name.length}/50
              </Text>
            </View>

            {/* Description Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Description (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Why is this habit important?"
                placeholderTextColor={colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                maxLength={200}
                multiline
                numberOfLines={3}
              />
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {description.length}/200
              </Text>
            </View>

            {/* Icon Selector */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Icon
              </Text>
              <View style={styles.iconGrid}>
                {HABIT_ICONS.map((iconConfig, index) => (
                  <TouchableOpacity
                    key={`${iconConfig.name}-${iconConfig.type}`}
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor:
                          selectedIconIndex === index
                            ? selectedColor + '26'
                            : colors.background,
                        borderColor:
                          selectedIconIndex === index ? selectedColor : colors.border,
                      },
                    ]}
                    onPress={() => {
                      haptic.selection();
                      setSelectedIconIndex(index);
                    }}
                  >
                    <HabitIcon
                      iconName={iconConfig.name}
                      iconType={iconConfig.type}
                      size={24}
                      color={selectedIconIndex === index ? selectedColor : colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Picker */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Color
              </Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorButtonSelected,
                    ]}
                    onPress={() => {
                      haptic.selection();
                      setSelectedColor(color);
                    }}
                  >
                    {selectedColor === color && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frequency Selector */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Frequency
              </Text>
              <View style={styles.frequencyButtons}>
                {[
                  { label: 'Daily', value: FrequencyType.DAILY },
                  { label: 'Weekly', value: FrequencyType.WEEKLY },
                  { label: 'Custom', value: FrequencyType.CUSTOM },
                ].map(({ label, value }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.frequencyButton,
                      {
                        backgroundColor:
                          frequency === value
                            ? colors.primary
                            : colors.background,
                        borderColor:
                          frequency === value ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      haptic.selection();
                      setFrequency(value);
                    }}
                  >
                    <Text
                      style={[
                        styles.frequencyButtonText,
                        {
                          color:
                            frequency === value
                              ? '#FFFFFF'
                              : colors.textPrimary,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Days Selector */}
            {frequency === FrequencyType.CUSTOM && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Select Days
                </Text>
                <View style={styles.daysGrid}>
                  {dayLabels.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: selectedDays.includes(index)
                            ? selectedColor
                            : colors.background,
                          borderColor: selectedDays.includes(index)
                            ? selectedColor
                            : colors.border,
                        },
                      ]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          {
                            color: selectedDays.includes(index)
                              ? '#FFFFFF'
                              : colors.textPrimary,
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Target Value (Quantifiable) */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Track a Value (optional)
              </Text>
              <View style={styles.row}>
                <TextInput
                  style={[
                    styles.input,
                    styles.smallInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Target"
                  placeholderTextColor={colors.textTertiary}
                  value={targetValue}
                  onChangeText={setTargetValue}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.flexInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Unit (e.g., pages, minutes)"
                  placeholderTextColor={colors.textTertiary}
                  value={unit}
                  onChangeText={setUnit}
                  maxLength={20}
                />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              variant="secondary"
              onPress={handleClose}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={handleSave}
              disabled={!name.trim()}
              style={styles.saveButton}
            >
              Save Changes
            </Button>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
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
    maxHeight: '90%',
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
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  textArea: {
    height: 80,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  frequencyButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  smallInput: {
    width: 100,
  },
  flexInput: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
