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
    schemaVersion: 1,
    migration: (oldRealm, newRealm) => {
      // Handle migrations here when schema changes
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
