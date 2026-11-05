import type { FoodIconName } from './foodIcons';
import type { CategoryId } from './tokens';

export type CategoryMeta = {
  id: CategoryId;
  label: string;
  icon: FoodIconName;
  description: string;
};

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  dairy: {
    id: 'dairy',
    label: 'Dairy',
    icon: 'milk',
    description: 'Milk, butter, eggs, yogurt',
  },
  produce: {
    id: 'produce',
    label: 'Produce',
    icon: 'apple',
    description: 'Fruits and vegetables',
  },
  meat: {
    id: 'meat',
    label: 'Meat',
    icon: 'steak',
    description: 'Beef, chicken, and more',
  },
  seafood: {
    id: 'seafood',
    label: 'Seafood',
    icon: 'fish',
    description: 'Fish and shellfish',
  },
  bakery: {
    id: 'bakery',
    label: 'Bakery',
    icon: 'bread',
    description: 'Bread and baked goods',
  },
  prepared: {
    id: 'prepared',
    label: 'Prepared',
    icon: 'bowl',
    description: 'Ready-to-eat meals',
  },
  pantry: {
    id: 'pantry',
    label: 'Pantry',
    icon: 'grain',
    description: 'Dry goods and staples',
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES);
