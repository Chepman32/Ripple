import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { spacing, typography } from '../../../shared/constants';
import { Card, HabitIcon } from '../../../shared/components';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { habitRepository, settingsRepository } from '../../../database/repositories';
import {
  calculateStreak,
  calculateSuccessRate,
  getTotalCompletions,
} from '../../../shared/utils/statisticsCalculator';
import { subDays, subMonths, subYears, format } from 'date-fns';
import { Habit, HabitCompletion } from '../../../shared/types';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { BarChart } from '../components/BarChart';

type TimeRange = 'week' | 'month' | 'year' | 'all';

export const StatisticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [isPremium, setIsPremium] = useState(false);
  const [stats, setStats] = useState({
    successRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalHabits: 0,
  });
  const [habitPerformance, setHabitPerformance] = useState<Array<{
    habit: Habit;
    successRate: number;
    streak: number;
    completions: HabitCompletion[];
  }>>([]);
  const [timeAnalysis, setTimeAnalysis] = useState({
    morning: 0,
    afternoon: 0,
    evening: 0,
  });

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    const settings = await settingsRepository.getSettings();
    setIsPremium(settings.premiumUnlocked);

    const habits = await habitRepository.getAllHabits();

    const now = new Date();
    const startDate = getStartDate(timeRange);

    let totalCurrentStreak = 0;
    let maxLongestStreak = 0;
    let totalCompletionsCount = 0;
    let totalSuccessRate = 0;

    const performanceData = [];
    const timeData = { morning: 0, afternoon: 0, evening: 0 };

    for (const habit of habits) {
      const completions = await habitRepository.getCompletions(habit.id);

      const streakData = calculateStreak(completions);
      totalCurrentStreak += streakData.currentStreak;
      maxLongestStreak = Math.max(maxLongestStreak, streakData.longestStreak);

      const successData = calculateSuccessRate(completions, startDate, now);
      totalSuccessRate += successData.successRate;

      totalCompletionsCount += getTotalCompletions(completions);

      performanceData.push({
        habit,
        successRate: successData.successRate,
        streak: streakData.currentStreak,
        completions: completions.filter(c => c.completedAt >= startDate),
      });

      // Time analysis
      completions.forEach(completion => {
        const hour = new Date(completion.completedAt).getHours();
        if (hour < 12) timeData.morning++;
        else if (hour < 18) timeData.afternoon++;
        else timeData.evening++;
      });
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

    setHabitPerformance(
      performanceData.sort((a, b) => b.successRate - a.successRate),
    );
    setTimeAnalysis(timeData);
  };

  const getStartDate = (range: TimeRange): Date => {
    const now = new Date();
    switch (range) {
      case 'week':
        return subDays(now, 7);
      case 'month':
        return subMonths(now, 1);
      case 'year':
        return subYears(now, 1);
      case 'all':
        return new Date(0);
    }
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    if ((range === 'year' || range === 'all') && !isPremium) {
      // Show premium upsell
      return;
    }
    haptic.selection();
    setTimeRange(range);
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

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['week', 'month', 'year', 'all'] as TimeRange[]).map(range => {
            const isLocked = (range === 'year' || range === 'all') && !isPremium;
            const isSelected = timeRange === range;
            return (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleTimeRangeChange(range)}
                disabled={isLocked}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      opacity: isLocked ? 0.5 : 1,
                    },
                  ]}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
                {isLocked && (
                  <FeatherIcon
                    name="lock"
                    size={12}
                    color={colors.textSecondary}
                    style={styles.lockIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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

        {/* Habit Performance List */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Habit Performance
          </Text>
          {habitPerformance.slice(0, 5).map(({ habit, successRate, streak }) => (
            <View
              key={habit.id}
              style={[
                styles.performanceItem,
                { borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.habitIconSmall, { backgroundColor: habit.color + '26' }]}>
                <HabitIcon
                  iconName={habit.icon}
                  iconType={habit.iconType}
                  size={18}
                  color={habit.color}
                />
              </View>
              <View style={styles.performanceInfo}>
                <Text style={[styles.habitNameText, { color: colors.textPrimary }]}>
                  {habit.name}
                </Text>
                <Text style={[styles.performanceStats, { color: colors.textSecondary }]}>
                  {successRate}% - {streak} day streak
                </Text>
              </View>
              <View style={styles.miniHeatmap}>
                {/* Mini 7-day heatmap would go here */}
                <Text style={[styles.successBadge, { color: colors.success }]}>
                  {successRate}%
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Premium Insights */}
        {isPremium && (
          <>
            <Card style={[styles.card, styles.insightsCard]}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionIcon}>
                  <HabitIcon iconName="sparkles" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Insights</Text>
              </View>
              <Text style={[styles.insightsSubtitle, { color: colors.textSecondary }]}>
                Best Time of Day
              </Text>
              <BarChart
                data={[
                  { label: 'Morning', value: timeAnalysis.morning, color: '#F59E0B' },
                  { label: 'Afternoon', value: timeAnalysis.afternoon, color: '#06B6D4' },
                  { label: 'Evening', value: timeAnalysis.evening, color: '#A855F7' },
                ]}
              />
              <Text style={[styles.insightText, { color: colors.textPrimary }]}>
                You complete most habits in the{' '}
                {timeAnalysis.morning > timeAnalysis.afternoon && timeAnalysis.morning > timeAnalysis.evening
                  ? 'morning'
                  : timeAnalysis.afternoon > timeAnalysis.evening
                  ? 'afternoon'
                  : 'evening'}
              </Text>
            </Card>
          </>
        )}

        {!isPremium && (
          <Card style={[styles.card, styles.premiumCard]}>
            <View style={[styles.premiumBadge, { borderColor: colors.primary }]}> 
              <HabitIcon iconName="ribbon" size={16} color={colors.primary} />
              <Text style={[styles.premiumBadgeText, { color: colors.primary }]}>Premium</Text>
            </View>
            <Text style={[styles.premiumTitle, { color: colors.textPrimary }]}>
              Unlock Advanced Insights
            </Text>
            <Text style={[styles.premiumSubtitle, { color: colors.textSecondary }]}>
              Get detailed time analysis, habit correlations, and personalized predictions
            </Text>
            <TouchableOpacity
              style={[styles.premiumButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                haptic.light();
                // Navigate to premium purchase
              }}
            >
              <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </Card>
        )}
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
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRangeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  lockIcon: {
    marginTop: spacing.xs,
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
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  habitIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  performanceInfo: {
    flex: 1,
  },
  habitNameText: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  performanceStats: {
    ...typography.caption,
  },
  miniHeatmap: {
    marginLeft: spacing.sm,
  },
  successBadge: {
    ...typography.caption,
    fontWeight: '700',
  },
  insightsCard: {
    backgroundColor: '#F0F9FF',
  },
  insightsSubtitle: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  insightText: {
    ...typography.body,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  premiumCard: {
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  premiumBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginLeft: spacing.xs,
  },
  premiumTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  premiumSubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  premiumButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: 12,
  },
  premiumButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
