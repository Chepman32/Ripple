import Realm from 'realm';

export class AppSettingsModel extends Realm.Object<AppSettingsModel> {
  id!: string;
  theme!: string;
  accentColor!: string;
  firstDayOfWeek!: number;
  notificationsEnabled!: boolean;
  hapticFeedbackEnabled!: boolean;
  animationsEnabled!: boolean;
  premiumUnlocked!: boolean;
  premiumPlusActive!: boolean;
  onboardingCompleted!: boolean;
  lastBackupDate?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'AppSettings',
    primaryKey: 'id',
    properties: {
      id: 'string',
      theme: { type: 'string', default: 'auto' },
      accentColor: { type: 'string', default: '#6366F1' },
      firstDayOfWeek: { type: 'int', default: 0 },
      notificationsEnabled: { type: 'bool', default: true },
      hapticFeedbackEnabled: { type: 'bool', default: true },
      animationsEnabled: { type: 'bool', default: true },
      premiumUnlocked: { type: 'bool', default: false },
      premiumPlusActive: { type: 'bool', default: false },
      onboardingCompleted: { type: 'bool', default: false },
      lastBackupDate: 'date?',
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}
