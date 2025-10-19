import { getRealmInstance } from '../realm';
import { CategoryModel } from '../models';
import { Category } from '../../shared/types';

export class CategoryRepository {
  async getAllCategories(): Promise<Category[]> {
    const realm = await getRealmInstance();
    const categories = realm.objects<CategoryModel>('Category').sorted('order');
    return Array.from(categories).map(this.mapToCategory);
  }

  async createCategory(
    data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Category> {
    const realm = await getRealmInstance();
    const id = this.generateId();
    const now = new Date();

    let category: CategoryModel;
    realm.write(() => {
      category = realm.create<CategoryModel>('Category', {
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    });

    return this.mapToCategory(category!);
  }

  async initializeDefaultCategories(): Promise<void> {
    const realm = await getRealmInstance();
    const existingCategories = realm.objects<CategoryModel>('Category');

    if (existingCategories.length === 0) {
      const defaultCategories = [
        {
          name: 'Health',
          color: '#10B981',
          icon: 'heart',
          iconType: 'Ionicons',
          order: 0,
          isCustom: false,
        },
        {
          name: 'Productivity',
          color: '#6366F1',
          icon: 'trending-up',
          iconType: 'Feather',
          order: 1,
          isCustom: false,
        },
        {
          name: 'Learning',
          color: '#F59E0B',
          icon: 'book',
          iconType: 'Ionicons',
          order: 2,
          isCustom: false,
        },
      ];

      for (const category of defaultCategories) {
        await this.createCategory(category);
      }
    }
  }

  private mapToCategory(model: CategoryModel): Category {
    return {
      id: model.id,
      name: model.name,
      color: model.color,
      icon: model.icon,
      iconType: model.iconType,
      order: model.order,
      isCustom: model.isCustom,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const categoryRepository = new CategoryRepository();
