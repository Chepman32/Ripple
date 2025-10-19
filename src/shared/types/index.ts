export enum FrequencyType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  CUSTOM = 'custom',
}

export interface CustomFrequency {
  type: 'specific_days' | 'interval' | 'flexible';
  days?: number[];
  interval?: number;
  targetCount?: number;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  iconType?: string;
  categoryId?: string;
  frequency: FrequencyType;
  customFrequency?: CustomFrequency;
  targetValue?: number;
  unit?: string;
  reminderTime?: string;
  reminderDays?: number[];
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  isPremium: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: Date;
  value?: number;
  note?: string;
  skipped: boolean;
  mood?: 'great' | 'good' | 'okay' | 'bad';
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  iconType?: string;
  order: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  firstDayOfWeek: 0 | 1;
  notificationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  animationsEnabled: boolean;
  premiumUnlocked: boolean;
  premiumPlusActive: boolean;
  onboardingCompleted: boolean;
  categoryMigrationDone: boolean;
  lastBackupDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Streak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  successRate: number;
  lastCompletedDate?: Date;
}
