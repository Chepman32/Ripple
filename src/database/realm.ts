import Realm from 'realm';
import {
  HabitModel,
  HabitCompletionModel,
  CategoryModel,
  AppSettingsModel,
} from './models';

let realmInstance: Realm | null = null;

export const getRealmInstance = async (): Promise<Realm> => {
  if (realmInstance) {
    return realmInstance;
  }

  realmInstance = await Realm.open({
    schema: [HabitModel, HabitCompletionModel, CategoryModel, AppSettingsModel],
    schemaVersion: 2,
    migration: (oldRealm, newRealm) => {
      // Handle migrations here when schema changes
      if (oldRealm.schemaVersion < 2) {
        // Migration for adding categoryMigrationDone field to AppSettings
        const oldSettings = oldRealm.objects('AppSettings');
        const newSettings = newRealm.objects('AppSettings');

        for (let i = 0; i < oldSettings.length; i++) {
          newSettings[i].categoryMigrationDone = false;
        }
      }
    },
  });

  return realmInstance;
};

export const closeRealm = () => {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
};
