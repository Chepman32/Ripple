import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { spacing, typography } from '../../../shared/constants';
import { Card } from '../../../shared/components';
import { habitRepository } from '../../../database/repositories/HabitRepository';
import {
  calculateStreak,
  calculateSuccessRate,
  getTotalCompletions,
} from '../../../shared/utils/statisticsCalculator';
import { subDays } from 'date-fns';

export const StatisticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [stats, setStats] = useState({
    successRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalHabits: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    const habits = await habitRepository.getAllHabits();

    let totalCurrentStreak = 0;
    let maxLongestStreak = 0;
    let totalCompletionsCount = 0;
    let totalSuccessRate = 0;

    for (const habit of habits) {
      const completions = await habitRepository.getCompletions(habit.id);

      const streakData = calculateStreak(completions);
      totalCurrentStreak += streakData.currentStreak;
      maxLongestStreak = Math.max(maxLongestStreak, streakData.longestStreak);

      const successData = calculateSuccessRate(
        completions,
        subDays(new Date(), 30),
        new Date(),
      );
      totalSuccessRate += successData.successRate;

      totalCompletionsCount += getTotalCompletions(completions);
    }

    const avgSuccessRate =
      habits.length > 0 ? Math.round(totalSuccessRate / habits.length) : 0;
    const avgCurrentStreak =
      habits.length > 0 ? Math.round(totalCurrentStreak / habits.length) : 0;

    setStats({
      successRate: avgSuccessRate,
      currentStreak: avgCurrentStreak,
      longestStreak: maxLongestStreak,
      totalCompletions: totalCompletionsCount,
      totalHabits: habits.length,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Statistics
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your habit insights
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Success Rate
          </Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>
            {stats.successRate}%
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Last 30 days average
          </Text>
        </Card>

        <View style={styles.row}>
          <Card style={[styles.card, styles.halfCard]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Current Streak
            </Text>
            <Text style={[styles.cardValue, { color: colors.primary }]}>
              {stats.currentStreak}
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.textSecondary }]}
            >
              days average
            </Text>
          </Card>

          <Card style={[styles.card, styles.halfCard]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Longest Streak
            </Text>
            <Text style={[styles.cardValue, { color: colors.primary }]}>
              {stats.longestStreak}
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.textSecondary }]}
            >
              days
            </Text>
          </Card>
        </View>

        <View style={styles.row}>
          <Card style={[styles.card, styles.halfCard]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Total Habits
            </Text>
            <Text style={[styles.cardValue, { color: colors.primary }]}>
              {stats.totalHabits}
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.textSecondary }]}
            >
              active
            </Text>
          </Card>

          <Card style={[styles.card, styles.halfCard]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Completions
            </Text>
            <Text style={[styles.cardValue, { color: colors.primary }]}>
              {stats.totalCompletions}
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.textSecondary }]}
            >
              all time
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
  },
  content: {
    padding: spacing.xl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  halfCard: {
    flex: 1,
  },
  cardTitle: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  cardValue: {
    ...typography.display,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
  },
});
