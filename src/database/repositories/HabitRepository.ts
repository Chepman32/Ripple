import { getRealmInstance } from '../realm';
import { HabitModel, HabitCompletionModel } from '../models';
import { Habit, HabitCompletion } from '../../shared/types';

export class HabitRepository {
  async getAllHabits(): Promise<Habit[]> {
    const realm = await getRealmInstance();
    const habits = realm
      .objects<HabitModel>('Habit')
      .filtered('archived = false');
    return Array.from(habits).map(this.mapToHabit);
  }

  async getHabitById(id: string): Promise<Habit | null> {
    const realm = await getRealmInstance();
    const habit = realm.objectForPrimaryKey<HabitModel>('Habit', id);
    return habit ? this.mapToHabit(habit) : null;
  }

  async createHabit(
    data: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Habit> {
    const realm = await getRealmInstance();
    const id = this.generateId();
    const now = new Date();

    let habit: HabitModel;
    realm.write(() => {
      habit = realm.create<HabitModel>('Habit', {
        id,
        ...data,
        customFrequency: data.customFrequency
          ? JSON.stringify(data.customFrequency)
          : undefined,
        reminderDays: data.reminderDays
          ? JSON.stringify(data.reminderDays)
          : undefined,
        createdAt: now,
        updatedAt: now,
      });
    });

    return this.mapToHabit(habit!);
  }

  async updateHabit(id: string, data: Partial<Habit>): Promise<void> {
    const realm = await getRealmInstance();
    realm.write(() => {
      const habit = realm.objectForPrimaryKey<HabitModel>('Habit', id);
      if (habit) {
        Object.assign(habit, {
          ...data,
          customFrequency: data.customFrequency
            ? JSON.stringify(data.customFrequency)
            : habit.customFrequency,
          reminderDays: data.reminderDays
            ? JSON.stringify(data.reminderDays)
            : habit.reminderDays,
          updatedAt: new Date(),
        });
      }
    });
  }

  async deleteHabit(id: string): Promise<void> {
    const realm = await getRealmInstance();
    realm.write(() => {
      const habit = realm.objectForPrimaryKey<HabitModel>('Habit', id);
      if (habit) {
        realm.delete(habit);
      }
    });
  }

  async archiveHabit(id: string): Promise<void> {
    await this.updateHabit(id, {
      archived: true,
      archivedAt: new Date(),
    } as Partial<Habit>);
  }

  async completeHabit(
    habitId: string,
    date: Date,
    value?: number,
    note?: string,
  ): Promise<HabitCompletion> {
    const realm = await getRealmInstance();
    const id = this.generateId();
    const now = new Date();

    let completion: HabitCompletionModel;
    realm.write(() => {
      completion = realm.create<HabitCompletionModel>('HabitCompletion', {
        id,
        habitId,
        completedAt: date,
        value,
        note,
        skipped: false,
        createdAt: now,
      });
    });

    return this.mapToCompletion(completion!);
  }

  async getCompletions(
    habitId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<HabitCompletion[]> {
    const realm = await getRealmInstance();
    let query = `habitId = "${habitId}"`;

    if (startDate) {
      query += ` AND completedAt >= $0`;
    }
    if (endDate) {
      query += ` AND completedAt <= $1`;
    }

    const completions = realm
      .objects<HabitCompletionModel>('HabitCompletion')
      .filtered(query, startDate, endDate)
      .sorted('completedAt', true);

    return Array.from(completions).map(this.mapToCompletion);
  }

  private mapToHabit(model: HabitModel): Habit {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      color: model.color,
      icon: model.icon,
      categoryId: model.categoryId,
      frequency: model.frequency as any,
      customFrequency: model.customFrequency
        ? JSON.parse(model.customFrequency)
        : undefined,
      targetValue: model.targetValue,
      unit: model.unit,
      reminderTime: model.reminderTime,
      reminderDays: model.reminderDays
        ? JSON.parse(model.reminderDays)
        : undefined,
      archived: model.archived,
      archivedAt: model.archivedAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      order: model.order,
      isPremium: model.isPremium,
    };
  }

  private mapToCompletion(model: HabitCompletionModel): HabitCompletion {
    return {
      id: model.id,
      habitId: model.habitId,
      completedAt: model.completedAt,
      value: model.value,
      note: model.note,
      skipped: model.skipped,
      mood: model.mood as any,
      createdAt: model.createdAt,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const habitRepository = new HabitRepository();
