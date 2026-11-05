import type { CategoryId } from './tokens';

export const FOOD_ICON_NAMES = [
  'milk',
  'butter',
  'eggs',
  'yogurt',
  'apple',
  'banana',
  'carrot',
  'leafy',
  'avocado',
  'steak',
  'chicken',
  'fish',
  'bread',
  'grain',
  'oil',
  'bowl',
] as const;

export type FoodIconName = (typeof FOOD_ICON_NAMES)[number];

/** Department tint for each icon. A new icon name won't compile until it is mapped here. */
export const FOOD_ICON_CATEGORY: Record<FoodIconName, CategoryId> = {
  milk: 'dairy',
  butter: 'dairy',
  eggs: 'dairy',
  yogurt: 'dairy',
  apple: 'produce',
  banana: 'produce',
  carrot: 'produce',
  leafy: 'produce',
  avocado: 'produce',
  steak: 'meat',
  chicken: 'meat',
  fish: 'seafood',
  bread: 'bakery',
  grain: 'pantry',
  oil: 'pantry',
  bowl: 'prepared',
};
