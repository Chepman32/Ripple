import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { spacing, typography } from '../../../shared/constants';
import { habitRepository } from '../../../database/repositories/HabitRepository';
import { Habit, HabitCompletion } from '../../../shared/types';
import {
  calculateStreak,
  calculateSuccessRate,
  getCompletionDates,
} from '../../../shared/utils';
import { LineChart } from '../../statistics/components/LineChart';
import { CalendarHeatmap } from '../../statistics/components/CalendarHeatmap';
import { Card, Button } from '../../../shared/components';
import { format, subDays } from 'date-fns';
import { EditHabitModal } from '../components/EditHabitModal';

export const HabitDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { habitId } = (route.params as { habitId: string }) || {};
  const { colors } = useTheme();
  const haptic = useHaptic();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    successRate: 0,
    totalCompletions: 0,
  });

  useEffect(() => {
    loadHabitData();
  }, [habitId]);

  const loadHabitData = async () => {
    const habitData = await habitRepository.getHabitById(habitId);
    if (habitData) {
      setHabit(habitData);
      const completionData = await habitRepository.getCompletions(habitId);
      setCompletions(completionData);

      const streakData = calculateStreak(completionData);
      const successData = calculateSuccessRate(
        completionData,
        subDays(new Date(), 30),
        new Date(),
      );

      setStats({
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        successRate: successData.successRate,
        totalCompletions: completionData.filter(c => !c.skipped).length,
      });
    }
  };

  const handleDelete = () => {
    haptic.warning();
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await habitRepository.deleteHabit(habitId);
            haptic.success();
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    haptic.light();
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (id: string, updates: Partial<Habit>) => {
    await habitRepository.updateHabit(id, updates);
    await loadHabitData();
    haptic.success();
  };

  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  const chartData = completions
    .slice(0, 7)
    .reverse()
    .map(c => ({
      x: format(c.completedAt, 'EEE'),
      y: c.skipped ? 0 : 1,
    }));

  const completionDatesMap = getCompletionDates(completions);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: habit.color }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.habitIcon}>{habit.icon}</Text>
          <Text style={styles.habitName}>{habit.name}</Text>
          {habit.description && (
            <Text style={styles.habitDescription}>{habit.description}</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.currentStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Current Streak
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.longestStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Longest Streak
            </Text>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.successRate}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Success Rate
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.totalCompletions}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total
            </Text>
          </Card>
        </View>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Last 7 Days
          </Text>
          <LineChart data={chartData} color={habit.color} />
        </Card>

        {/* Calendar Heatmap */}
        <Card style={styles.chartCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            This Month
          </Text>
          <CalendarHeatmap completionDates={completionDatesMap} />
        </Card>

        {/* Recent Completions */}
        <Card style={styles.chartCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recent Activity
          </Text>
          {completions.slice(0, 10).map(completion => (
            <View
              key={completion.id}
              style={[
                styles.completionItem,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text
                style={[styles.completionDate, { color: colors.textPrimary }]}
              >
                {format(completion.completedAt, 'MMM d, yyyy')}
              </Text>
              <Text
                style={[
                  styles.completionStatus,
                  {
                    color: completion.skipped ? colors.warning : colors.success,
                  },
                ]}
              >
                {completion.skipped ? 'Skipped' : 'Completed'}
              </Text>
            </View>
          ))}
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="danger" onPress={handleDelete} fullWidth>
            Delete Habit
          </Button>
        </View>
      </ScrollView>

      <EditHabitModal
        visible={editModalVisible}
        habit={habit}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveEdit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    ...typography.body,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  editIcon: {
    fontSize: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  habitIcon: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  habitName: {
    ...typography.h1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  habitDescription: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  statValue: {
    ...typography.display,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  completionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  completionDate: {
    ...typography.body,
  },
  completionStatus: {
    ...typography.body,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing['4xl'],
  },
});
