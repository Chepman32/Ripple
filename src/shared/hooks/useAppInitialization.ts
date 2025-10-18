import { useEffect, useState } from 'react';
import { getRealmInstance } from '../../database/realm';
import {
  categoryRepository,
  settingsRepository,
} from '../../database/repositories';
import { seedSampleHabits } from '../../database/seedData';

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

      // Initialize settings
      await settingsRepository.getSettings();

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
