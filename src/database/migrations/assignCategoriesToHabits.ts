import { habitRepository } from '../repositories/HabitRepository';
import { categoryRepository } from '../repositories/CategoryRepository';

/**
 * Migration script to assign categories to existing habits based on their names/icons
 */
export const assignCategoriesToHabits = async () => {
  try {
    console.log('Starting category assignment migration...');

    // Get all categories
    const categories = await categoryRepository.getAllCategories();
    const healthCategory = categories.find(c => c.name === 'Health');
    const productivityCategory = categories.find(c => c.name === 'Productivity');
    const learningCategory = categories.find(c => c.name === 'Learning');

    if (!healthCategory || !productivityCategory || !learningCategory) {
      console.error('Categories not found. Please initialize categories first.');
      return;
    }

    // Get all habits
    const habits = await habitRepository.getAllHabits();
    console.log(`Found ${habits.length} habits to process`);

    let updatedCount = 0;

    for (const habit of habits) {
      // Skip if already has a category
      if (habit.categoryId) {
        continue;
      }

      // Assign category based on habit name or icon
      let categoryId: string | undefined;

      const habitNameLower = habit.name.toLowerCase();
      const habitIcon = habit.icon.toLowerCase();

      // Health-related keywords
      if (
        habitNameLower.includes('exercise') ||
        habitNameLower.includes('workout') ||
        habitNameLower.includes('meditation') ||
        habitNameLower.includes('yoga') ||
        habitNameLower.includes('water') ||
        habitNameLower.includes('sleep') ||
        habitNameLower.includes('health') ||
        habitIcon.includes('fitness') ||
        habitIcon.includes('barbell') ||
        habitIcon.includes('body') ||
        habitIcon.includes('water') ||
        habitIcon.includes('heart') ||
        habitIcon.includes('moon')
      ) {
        categoryId = healthCategory.id;
      }
      // Learning-related keywords
      else if (
        habitNameLower.includes('learn') ||
        habitNameLower.includes('study') ||
        habitNameLower.includes('read') ||
        habitNameLower.includes('book') ||
        habitNameLower.includes('language') ||
        habitNameLower.includes('spanish') ||
        habitNameLower.includes('course') ||
        habitIcon.includes('book') ||
        habitIcon.includes('school') ||
        habitIcon.includes('language')
      ) {
        categoryId = learningCategory.id;
      }
      // Default to Productivity for everything else
      else {
        categoryId = productivityCategory.id;
      }

      // Update the habit
      await habitRepository.updateHabit(habit.id, { categoryId });
      updatedCount++;
      console.log(`Assigned category to: ${habit.name}`);
    }

    console.log(`Migration complete! Updated ${updatedCount} habits.`);
  } catch (error) {
    console.error('Failed to assign categories to habits:', error);
    throw error;
  }
};
