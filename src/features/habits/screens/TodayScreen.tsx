import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { spacing, typography } from '../../../shared/constants';
import { habitRepository } from '../../../database/repositories/HabitRepository';
import { Habit } from '../../../shared/types';
import { format } from 'date-fns';
import {
  CreateHabitModal,
  HabitFormData,
} from '../components/CreateHabitModal';
import { HabitCard } from '../components/HabitCard';
import { ProgressRing } from '../../../shared/components';

export const TodayScreen: React.FC = () => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const allHabits = await habitRepository.getAllHabits();
    setHabits(allHabits);
  };

  const handleCompleteHabit = async (habitId: string) => {
    await habitRepository.completeHabit(habitId, new Date());
    setCompletedCount(prev => prev + 1);
    haptic.success();
  };

  const handleCreateHabit = async (habitData: HabitFormData) => {
    await habitRepository.createHabit({
      ...habitData,
      archived: false,
      order: habits.length,
      isPremium: false,
    });
    await loadHabits();
    haptic.success();
  };

  const today = format(new Date(), 'EEEE, MMM d');
  const totalHabits = habits.length;
  const progress = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.dateText, { color: '#FFFFFF' }]}>{today}</Text>

        {/* Summary Card */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: 'rgba(255,255,255,0.2)' },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: '#FFFFFF' }]}>
            Today's Progress
          </Text>
          <View style={styles.progressContainer}>
            <ProgressRing
              progress={progress}
              size={70}
              strokeWidth={6}
              color="#FFFFFF"
              label={`${completedCount}/${totalHabits}`}
            />
            <Text style={[styles.motivationText, { color: '#FFFFFF' }]}>
              {progress === 100
                ? 'Perfect!'
                : progress >= 75
                ? 'Almost done!'
                : progress >= 50
                ? 'Halfway there!'
                : 'Keep going!'}
            </Text>
          </View>
        </View>
      </View>

      {/* Habits List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No Habits Yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Start building better habits today
            </Text>
          </View>
        ) : (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onComplete={handleCompleteHabit}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          haptic.light();
          setModalVisible(true);
        }}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Create Habit Modal */}
      <CreateHabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateHabit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  dateText: {
    ...typography.h1,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    borderRadius: 20,
    padding: spacing.xl,
  },
  summaryTitle: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  motivationText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['6xl'],
  },
  emptyTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
