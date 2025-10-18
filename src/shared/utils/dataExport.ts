import { Share } from 'react-native';
import {
  habitRepository,
  categoryRepository,
  settingsRepository,
} from '../../database/repositories';
import { Habit, HabitCompletion, Category, AppSettings } from '../types';

export interface ExportData {
  version: string;
  exportDate: string;
  habits: Habit[];
  completions: { [habitId: string]: HabitCompletion[] };
  categories: Category[];
  settings: AppSettings;
}

/**
 * Export all app data to JSON
 */
export const exportDataToJSON = async (): Promise<string> => {
  try {
    const habits = await habitRepository.getAllHabits();
    const categories = await categoryRepository.getAllCategories();
    const settings = await settingsRepository.getSettings();

    const completions: { [habitId: string]: HabitCompletion[] } = {};
    for (const habit of habits) {
      completions[habit.id] = await habitRepository.getCompletions(habit.id);
    }

    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      habits,
      completions,
      categories,
      settings,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Export data to CSV format
 */
export const exportDataToCSV = async (): Promise<string> => {
  try {
    const habits = await habitRepository.getAllHabits();

    let csv =
      'Habit Name,Frequency,Target Value,Unit,Created Date,Completed Count\n';

    for (const habit of habits) {
      const completions = await habitRepository.getCompletions(habit.id);
      const completedCount = completions.filter(c => !c.skipped).length;

      csv += `"${habit.name}","${habit.frequency}","${
        habit.targetValue || ''
      }","${
        habit.unit || ''
      }","${habit.createdAt.toISOString()}","${completedCount}"\n`;
    }

    return csv;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export to CSV');
  }
};

/**
 * Share exported data
 */
export const shareExportedData = async (
  data: string,
  format: 'json' | 'csv',
): Promise<void> => {
  try {
    const fileName = `ripple-export-${Date.now()}.${format}`;

    await Share.share({
      message: data,
      title: `Ripple Data Export (${format.toUpperCase()})`,
    });
  } catch (error) {
    console.error('Error sharing data:', error);
    throw new Error('Failed to share data');
  }
};

/**
 * Import data from JSON (placeholder for future implementation)
 */
export const importDataFromJSON = async (jsonString: string): Promise<void> => {
  try {
    const data: ExportData = JSON.parse(jsonString);

    // Validate data structure
    if (!data.version || !data.habits || !data.categories) {
      throw new Error('Invalid data format');
    }

    // In a real implementation, this would:
    // 1. Validate all data
    // 2. Ask user if they want to merge or replace
    // 3. Import habits, completions, categories
    // 4. Update settings

    console.log('Import data:', data);
    throw new Error('Import functionality not yet implemented');
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data');
  }
};

/**
 * Create a backup of all data
 */
export const createBackup = async (): Promise<string> => {
  try {
    const jsonData = await exportDataToJSON();

    // Update last backup date
    await settingsRepository.updateSettings({
      lastBackupDate: new Date(),
    });

    return jsonData;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create backup');
  }
};

/**
 * Restore from backup (placeholder)
 */
export const restoreFromBackup = async (backupData: string): Promise<void> => {
  try {
    await importDataFromJSON(backupData);
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw new Error('Failed to restore backup');
  }
};
