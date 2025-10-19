import { useEffect, useState } from 'react';
import { getRealmInstance } from '../../database/realm';
import {
  categoryRepository,
  settingsRepository,
} from '../../database/repositories';
import { seedSampleHabits } from '../../database/seedData';
import { assignCategoriesToHabits } from '../../database/migrations/assignCategoriesToHabits';

export const useAppInitialization = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize Realm database
      await getRealmInstance();

      // Initialize default categories
      await categoryRepository.initializeDefaultCategories();

      // Run migration to assign categories to existing habits (one-time)
      const settings = await settingsRepository.getSettings();
      if (!settings.categoryMigrationDone) {
        await assignCategoriesToHabits();
        await settingsRepository.updateSettings({ categoryMigrationDone: true });
      }

      // Seed sample habits for development (only if database is empty)
      if (__DEV__) {
        await seedSampleHabits();
      }

      setIsReady(true);
    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError(err as Error);
    }
  };

  return { isReady, error };
};
