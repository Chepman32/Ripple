import Realm from 'realm';

export class HabitModel extends Realm.Object<HabitModel> {
  id!: string;
  name!: string;
  description?: string;
  color!: string;
  icon!: string;
  iconType?: string;
  categoryId?: string;
  frequency!: string;
  customFrequency?: string;
  targetValue?: number;
  unit?: string;
  reminderTime?: string;
  reminderDays?: string;
  archived!: boolean;
  archivedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
  order!: number;
  isPremium!: boolean;

  static schema: Realm.ObjectSchema = {
    name: 'Habit',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      description: 'string?',
      color: 'string',
      icon: 'string',
      iconType: 'string?',
      categoryId: 'string?',
      frequency: 'string',
      customFrequency: 'string?',
      targetValue: 'int?',
      unit: 'string?',
      reminderTime: 'string?',
      reminderDays: 'string?',
      archived: { type: 'bool', default: false },
      archivedAt: 'date?',
      createdAt: 'date',
      updatedAt: 'date',
      order: { type: 'int', default: 0 },
      isPremium: { type: 'bool', default: false },
    },
  };
}
