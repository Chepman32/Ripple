import Realm from 'realm';

export class CategoryModel extends Realm.Object<CategoryModel> {
  id!: string;
  name!: string;
  color!: string;
  icon!: string;
  order!: number;
  isCustom!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Category',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      color: 'string',
      icon: 'string',
      order: { type: 'int', default: 0 },
      isCustom: { type: 'bool', default: false },
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}
