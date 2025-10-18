import Realm from 'realm';

export class HabitCompletionModel extends Realm.Object<HabitCompletionModel> {
  id!: string;
  habitId!: string;
  completedAt!: Date;
  value?: number;
  note?: string;
  skipped!: boolean;
  mood?: string;
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'HabitCompletion',
    primaryKey: 'id',
    properties: {
      id: 'string',
      habitId: { type: 'string', indexed: true },
      completedAt: { type: 'date', indexed: true },
      value: 'int?',
      note: 'string?',
      skipped: { type: 'bool', default: false },
      mood: 'string?',
      createdAt: 'date',
    },
  };
}
