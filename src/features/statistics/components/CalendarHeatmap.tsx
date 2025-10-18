import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { spacing, typography } from '../../../shared/constants';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

interface CalendarHeatmapProps {
  completionDates: Map<string, number>;
  onDayPress?: (date: Date) => void;
  month?: Date;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  completionDates,
  onDayPress,
  month = new Date(),
}) => {
  const { colors } = useTheme();

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks: Date[][] = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getIntensity = (date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return completionDates.get(dateKey) || 0;
  };

  const getColor = (intensity: number): string => {
    if (intensity === 0) return colors.border;
    if (intensity === 1) return colors.primary + '40';
    if (intensity === 2) return colors.primary + '80';
    return colors.primary;
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Day labels */}
        <View style={styles.dayLabelsRow}>
          <View style={styles.monthLabel} />
          {dayLabels.map((label, index) => (
            <Text
              key={index}
              style={[styles.dayLabel, { color: colors.textSecondary }]}
            >
              {label}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            <Text style={[styles.weekNumber, { color: colors.textTertiary }]}>
              {format(week[0], 'w')}
            </Text>
            {week.map((day, dayIndex) => {
              const intensity = getIntensity(day);
              const isCurrentMonth = day.getMonth() === month.getMonth();
              const isToday = isSameDay(day, new Date());

              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.day,
                    { backgroundColor: getColor(intensity) },
                    !isCurrentMonth && styles.otherMonth,
                    isToday && { borderWidth: 2, borderColor: colors.primary },
                  ]}
                  onPress={() => onDayPress?.(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: intensity > 0 ? '#FFFFFF' : colors.textTertiary,
                      },
                      !isCurrentMonth && { opacity: 0.3 },
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  monthLabel: {
    width: 30,
  },
  dayLabel: {
    ...typography.caption,
    width: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  week: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekNumber: {
    ...typography.caption,
    width: 30,
    textAlign: 'center',
    lineHeight: 40,
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  otherMonth: {
    opacity: 0.3,
  },
  dayText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
