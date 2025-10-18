import { HabitCompletion } from '../types';
import {
  startOfDay,
  differenceInDays,
  subDays,
  isToday,
  isSameDay,
} from 'date-fns';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
}

export interface SuccessRateData {
  successRate: number;
  totalDays: number;
  completedDays: number;
}

/**
 * Calculate current and longest streak from completions
 */
export const calculateStreak = (completions: HabitCompletion[]): StreakData => {
  if (completions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Sort completions by date (newest first)
  const sortedCompletions = [...completions]
    .filter(c => !c.skipped)
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

  if (sortedCompletions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let expectedDate = startOfDay(new Date());

  // Calculate current streak
  for (const completion of sortedCompletions) {
    const completionDate = startOfDay(completion.completedAt);
    const daysDiff = differenceInDays(expectedDate, completionDate);

    if (daysDiff === 0) {
      tempStreak++;
      expectedDate = subDays(expectedDate, 1);
    } else if (daysDiff === 1) {
      tempStreak++;
      expectedDate = subDays(completionDate, 1);
    } else {
      break;
    }
  }

  currentStreak = tempStreak;

  // Calculate longest streak
  tempStreak = 1;
  let prevDate = startOfDay(sortedCompletions[0].completedAt);

  for (let i = 1; i < sortedCompletions.length; i++) {
    const currentDate = startOfDay(sortedCompletions[i].completedAt);
    const daysDiff = differenceInDays(prevDate, currentDate);

    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }

    prevDate = currentDate;
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: sortedCompletions[0].completedAt,
  };
};

/**
 * Calculate success rate over a period
 */
export const calculateSuccessRate = (
  completions: HabitCompletion[],
  startDate: Date,
  endDate: Date = new Date(),
): SuccessRateData => {
  const totalDays = differenceInDays(endDate, startDate) + 1;

  const completedDays = new Set(
    completions
      .filter(c => !c.skipped)
      .filter(c => c.completedAt >= startDate && c.completedAt <= endDate)
      .map(c => startOfDay(c.completedAt).getTime()),
  ).size;

  const successRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  return {
    successRate: Math.round(successRate),
    totalDays,
    completedDays,
  };
};

/**
 * Get total completions count
 */
export const getTotalCompletions = (completions: HabitCompletion[]): number => {
  return completions.filter(c => !c.skipped).length;
};

/**
 * Check if habit was completed today
 */
export const isCompletedToday = (completions: HabitCompletion[]): boolean => {
  return completions.some(c => !c.skipped && isToday(c.completedAt));
};

/**
 * Get completion dates for calendar heatmap
 */
export const getCompletionDates = (
  completions: HabitCompletion[],
): Map<string, number> => {
  const dateMap = new Map<string, number>();

  completions
    .filter(c => !c.skipped)
    .forEach(completion => {
      const dateKey = startOfDay(completion.completedAt).toISOString();
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    });

  return dateMap;
};

/**
 * Calculate weekly completion rate
 */
export const getWeeklyStats = (
  completions: HabitCompletion[],
): { day: string; count: number }[] => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: startOfDay(date),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: 0,
    };
  });

  completions
    .filter(c => !c.skipped)
    .forEach(completion => {
      const completionDate = startOfDay(completion.completedAt);
      const dayData = last7Days.find(d => isSameDay(d.date, completionDate));
      if (dayData) {
        dayData.count++;
      }
    });

  return last7Days.map(({ day, count }) => ({ day, count }));
};

/**
 * Get best time of day for completions
 */
export const getBestTimeOfDay = (
  completions: HabitCompletion[],
): 'morning' | 'afternoon' | 'evening' | 'night' | null => {
  if (completions.length === 0) return null;

  const timeSlots = {
    morning: 0, // 5am - 12pm
    afternoon: 0, // 12pm - 5pm
    evening: 0, // 5pm - 9pm
    night: 0, // 9pm - 5am
  };

  completions
    .filter(c => !c.skipped)
    .forEach(completion => {
      const hour = completion.completedAt.getHours();
      if (hour >= 5 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
      else if (hour >= 17 && hour < 21) timeSlots.evening++;
      else timeSlots.night++;
    });

  const maxSlot = Object.entries(timeSlots).reduce(
    (max, [slot, count]) => (count > max.count ? { slot, count } : max),
    { slot: 'morning', count: 0 },
  );

  return maxSlot.slot as 'morning' | 'afternoon' | 'evening' | 'night';
};
