import { habitRepository } from './repositories/HabitRepository';
import { FrequencyType } from '../shared/types';

/**
 * Seeds the database with sample habits for development/testing
 */
export const seedSampleHabits = async () => {
  const sampleHabits = [
    {
      name: 'Morning Meditation',
      description: 'Start the day with 10 minutes of mindfulness',
      color: '#10B981',
      icon: '🧘',
      frequency: FrequencyType.DAILY,
      targetValue: 10,
      unit: 'minutes',
      reminderTime: '07:00',
      archived: false,
      order: 0,
      isPremium: false,
    },
    {
      name: 'Read Books',
      description: 'Read at least 20 pages every day',
      color: '#F59E0B',
      icon: '📚',
      frequency: FrequencyType.DAILY,
      targetValue: 20,
      unit: 'pages',
      reminderTime: '20:00',
      archived: false,
      order: 1,
      isPremium: false,
    },
    {
      name: 'Exercise',
      description: 'Stay active and healthy',
      color: '#EF4444',
      icon: '💪',
      frequency: FrequencyType.CUSTOM,
      customFrequency: {
        type: 'specific_days',
        days: [1, 3, 5], // Monday, Wednesday, Friday
      },
      targetValue: 30,
      unit: 'minutes',
      reminderTime: '18:00',
      archived: false,
      order: 2,
      isPremium: false,
    },
    {
      name: 'Drink Water',
      description: 'Stay hydrated throughout the day',
      color: '#06B6D4',
      icon: '💧',
      frequency: FrequencyType.DAILY,
      targetValue: 8,
      unit: 'glasses',
      archived: false,
      order: 3,
      isPremium: false,
    },
    {
      name: 'Learn Spanish',
      description: 'Practice Spanish for 15 minutes',
      color: '#8B5CF6',
      icon: '🗣️',
      frequency: FrequencyType.DAILY,
      targetValue: 15,
      unit: 'minutes',
      reminderTime: '19:00',
      archived: false,
      order: 4,
      isPremium: false,
    },
  ];

  try {
    // Check if habits already exist
    const existingHabits = await habitRepository.getAllHabits();

    if (existingHabits.length === 0) {
      console.log('Seeding sample habits...');

      for (const habit of sampleHabits) {
        await habitRepository.createHabit(habit);
      }

      console.log(
        `✅ Successfully seeded ${sampleHabits.length} sample habits`,
      );
    } else {
      console.log(
        `ℹ️ Database already has ${existingHabits.length} habits, skipping seed`,
      );
    }
  } catch (error) {
    console.error('❌ Failed to seed sample habits:', error);
    throw error;
  }
};

/**
 * Clears all habits from the database (use with caution!)
 */
export const clearAllHabits = async () => {
  try {
    const habits = await habitRepository.getAllHabits();

    for (const habit of habits) {
      await habitRepository.deleteHabit(habit.id);
    }

    console.log(`✅ Cleared ${habits.length} habits from database`);
  } catch (error) {
    console.error('❌ Failed to clear habits:', error);
    throw error;
  }
};
