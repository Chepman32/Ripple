import { getRealmInstance } from '../realm';
import { AppSettingsModel } from '../models';
import { AppSettings } from '../../shared/types';

export class SettingsRepository {
  async getSettings(): Promise<AppSettings> {
    const realm = await getRealmInstance();
    let settings = realm.objectForPrimaryKey<AppSettingsModel>(
      'AppSettings',
      'default',
    );

    if (!settings) {
      settings = await this.createDefaultSettings();
    }

    return this.mapToSettings(settings);
  }

  async updateSettings(data: Partial<AppSettings>): Promise<void> {
    const realm = await getRealmInstance();
    realm.write(() => {
      const settings = realm.objectForPrimaryKey<AppSettingsModel>(
        'AppSettings',
        'default',
      );
      if (settings) {
        Object.assign(settings, {
          ...data,
          updatedAt: new Date(),
        });
      }
    });
  }

  private async createDefaultSettings(): Promise<AppSettingsModel> {
    const realm = await getRealmInstance();
    const now = new Date();

    let settings: AppSettingsModel;
    realm.write(() => {
      settings = realm.create<AppSettingsModel>('AppSettings', {
        id: 'default',
        theme: 'auto',
        accentColor: '#6366F1',
        firstDayOfWeek: 0,
        notificationsEnabled: true,
        hapticFeedbackEnabled: true,
        animationsEnabled: true,
        premiumUnlocked: false,
        premiumPlusActive: false,
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
      });
    });

    return settings!;
  }

  private mapToSettings(model: AppSettingsModel): AppSettings {
    return {
      id: model.id,
      theme: model.theme as any,
      accentColor: model.accentColor,
      firstDayOfWeek: model.firstDayOfWeek as any,
      notificationsEnabled: model.notificationsEnabled,
      hapticFeedbackEnabled: model.hapticFeedbackEnabled,
      animationsEnabled: model.animationsEnabled,
      premiumUnlocked: model.premiumUnlocked,
      premiumPlusActive: model.premiumPlusActive,
      onboardingCompleted: model.onboardingCompleted,
      lastBackupDate: model.lastBackupDate,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}

export const settingsRepository = new SettingsRepository();
