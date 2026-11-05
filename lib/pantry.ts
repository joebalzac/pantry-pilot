import { CATEGORIES } from './categories';
import { FOOD_ICON_CATEGORY, FOOD_ICON_NAMES, type FoodIconName } from './foodIcons';
import { roundQuantity, stepForUnit } from './quantity';
import { CATEGORY_IDS, type CategoryId } from './tokens';

export type PantryItem = {
  id: string;
  name: string;
  category: CategoryId;
  icon: FoodIconName;
  quantity: number;
  unit: string;
  reorderAt: number;
  dailyUse: number;
  lastUpdated: string;
};

export type RecommendationKind = 'below-threshold' | 'running-out';

export type Recommendation = {
  item: PantryItem;
  daysLeft: number;
  kind: RecommendationKind;
};

export type CategoryFilter = 'all' | CategoryId;

export type SortKey = 'department' | 'name' | 'days-left';

/** The fields a person edits directly. Quantity changes go through the row's stepper. */
export type ItemDetails = Pick<PantryItem, 'name' | 'category' | 'unit' | 'reorderAt' | 'dailyUse'>;

const DAY_MS = 24 * 60 * 60 * 1000;

const now = () => new Date().toISOString();

export const initialItems: PantryItem[] = [
  {id: 'milk', name: 'Whole Milk', category: 'dairy', icon: 'milk', quantity: 0.5, unit: 'gallons', reorderAt: 0.75, dailyUse: 0.16, lastUpdated: now()},
  {id: 'butter', name: 'Unsalted Butter', category: 'dairy', icon: 'butter', quantity: 1, unit: 'sticks', reorderAt: 2, dailyUse: 0.22, lastUpdated: now()},
  {id: 'eggs', name: 'Eggs', category: 'dairy', icon: 'eggs', quantity: 9, unit: 'eggs', reorderAt: 6, dailyUse: 1.5, lastUpdated: now()},
  {id: 'yogurt', name: 'Greek Yogurt', category: 'dairy', icon: 'yogurt', quantity: 2, unit: 'cups', reorderAt: 1, dailyUse: 0.4, lastUpdated: now()},
  {id: 'bananas', name: 'Bananas', category: 'produce', icon: 'banana', quantity: 3, unit: 'bananas', reorderAt: 4, dailyUse: 1.2, lastUpdated: now()},
  {id: 'spinach', name: 'Baby Spinach', category: 'produce', icon: 'leafy', quantity: 1, unit: 'bags', reorderAt: 1, dailyUse: 0.35, lastUpdated: now()},
  {id: 'avocados', name: 'Hass Avocados', category: 'produce', icon: 'avocado', quantity: 2, unit: 'avocados', reorderAt: 2, dailyUse: 0.4, lastUpdated: now()},
  {id: 'apples', name: 'Honeycrisp Apples', category: 'produce', icon: 'apple', quantity: 5, unit: 'apples', reorderAt: 3, dailyUse: 0.6, lastUpdated: now()},
  {id: 'carrots', name: 'Carrots', category: 'produce', icon: 'carrot', quantity: 6, unit: 'carrots', reorderAt: 4, dailyUse: 0.5, lastUpdated: now()},
  {id: 'chicken', name: 'Chicken Breast', category: 'meat', icon: 'chicken', quantity: 1, unit: 'lb', reorderAt: 1, dailyUse: 0.35, lastUpdated: now()},
  {id: 'beef', name: 'Ground Beef', category: 'meat', icon: 'steak', quantity: 0.5, unit: 'lb', reorderAt: 1, dailyUse: 0.25, lastUpdated: now()},
  {id: 'salmon', name: 'Atlantic Salmon', category: 'seafood', icon: 'fish', quantity: 0.75, unit: 'lb', reorderAt: 0.5, dailyUse: 0.2, lastUpdated: now()},
  {id: 'bread', name: 'Sandwich Bread', category: 'bakery', icon: 'bread', quantity: 8, unit: 'slices', reorderAt: 5, dailyUse: 2, lastUpdated: now()},
  {id: 'rice', name: 'Jasmine Rice', category: 'pantry', icon: 'grain', quantity: 5, unit: 'cups', reorderAt: 2, dailyUse: 0.3, lastUpdated: now()},
  {id: 'oil', name: 'Extra-Virgin Olive Oil', category: 'pantry', icon: 'oil', quantity: 0.4, unit: 'bottles', reorderAt: 0.25, dailyUse: 0.03, lastUpdated: now()},
  {id: 'soup', name: 'Tomato Basil Soup', category: 'prepared', icon: 'bowl', quantity: 1, unit: 'cups', reorderAt: 1, dailyUse: 0.4, lastUpdated: now()},
];

function isAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function hydrateItem(entry: object): PantryItem | null {
  const saved = entry as Partial<Record<keyof PantryItem, unknown>>;
  if (typeof saved.id !== 'string') return null;
  const seed = initialItems.find((item) => item.id === saved.id);

  const name = typeof saved.name === 'string' && saved.name.trim() ? saved.name : seed?.name;
  if (!name) return null;

  const category = CATEGORY_IDS.find((id) => id === saved.category) ?? seed?.category ?? 'pantry';
  const icon = FOOD_ICON_NAMES.find((id) => id === saved.icon) ?? seed?.icon ?? CATEGORIES[category].icon;
  const lastUpdated =
    typeof saved.lastUpdated === 'string' && !Number.isNaN(Date.parse(saved.lastUpdated))
      ? saved.lastUpdated
      : (seed?.lastUpdated ?? new Date().toISOString());

  return {
    id: saved.id,
    name,
    category,
    icon,
    quantity: isAmount(saved.quantity) ? saved.quantity : (seed?.quantity ?? 0),
    unit: typeof saved.unit === 'string' && saved.unit.trim() ? saved.unit : (seed?.unit ?? 'items'),
    reorderAt: isAmount(saved.reorderAt) ? saved.reorderAt : (seed?.reorderAt ?? 0),
    dailyUse: isAmount(saved.dailyUse) ? saved.dailyUse : (seed?.dailyUse ?? 0),
    lastUpdated,
  };
}

/**
 * The saved list is the inventory: items the user added stay, and seed items they
 * deleted stay deleted. Seed values only fill fields missing from an older save.
 */
export function hydrateInventory(raw: unknown): PantryItem[] {
  if (!Array.isArray(raw)) return initialItems;
  const byId = new Map<string, PantryItem>();

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const item = hydrateItem(entry);
    if (item && !byId.has(item.id)) byId.set(item.id, item);
  }

  return [...byId.values()];
}

/**
 * `item.quantity` is what was last counted. This is the prediction made from it, so
 * pass the time in: a `now` before `lastUpdated` (such as 0 while server rendering) means no depletion.
 */
export function estimatedQuantity(item: PantryItem, now: number): number {
  const elapsed = Math.max(0, now - Date.parse(item.lastUpdated));
  return Math.max(0, item.quantity - item.dailyUse * (elapsed / DAY_MS));
}

/**
 * The amount to show for an item. A count stays exact until the estimate has moved by half
 * a step, then the estimate rounds to the step, because "3.37 eggs" claims false precision.
 */
export function displayQuantity(item: PantryItem, now: number): number {
  const estimate = estimatedQuantity(item, now);
  if (estimate <= 0) return 0;
  const step = stepForUnit(item.unit);
  if (item.quantity - estimate < step / 2) return item.quantity;
  return roundQuantity(Math.round(estimate / step) * step);
}

export function daysRemaining(item: PantryItem, now: number): number {
  return item.dailyUse > 0 ? Math.max(0, Math.round(estimatedQuantity(item, now) / item.dailyUse)) : Infinity;
}

export function restockKind(item: PantryItem, now: number): RecommendationKind | null {
  if (estimatedQuantity(item, now) <= item.reorderAt) return 'below-threshold';
  return daysRemaining(item, now) <= 3 ? 'running-out' : null;
}

/** Items with no usage rate have Infinity days left, and Infinity - Infinity is NaN. */
function compareDays(a: number, b: number): number {
  return a === b ? 0 : a - b;
}

export function recommend(items: PantryItem[], now: number): Recommendation[] {
  return items
    .flatMap((item) => {
      const kind = restockKind(item, now);
      return kind ? [{item, kind, daysLeft: daysRemaining(item, now)}] : [];
    })
    .sort((a, b) => compareDays(a.daysLeft, b.daysLeft));
}

export function filterItems(
  items: PantryItem[],
  {
    query,
    category,
    lowStockOnly = false,
    now,
  }: {query: string; category: CategoryFilter; lowStockOnly?: boolean; now: number},
): PantryItem[] {
  const normalizedQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(normalizedQuery) &&
      (category === 'all' || item.category === category) &&
      (!lowStockOnly || restockKind(item, now) !== null),
  );
}

export function sortItems(items: PantryItem[], sort: SortKey, now: number): PantryItem[] {
  const byName = (a: PantryItem, b: PantryItem) => a.name.localeCompare(b.name);
  const byDepartment = (a: PantryItem, b: PantryItem) =>
    CATEGORY_IDS.indexOf(a.category) - CATEGORY_IDS.indexOf(b.category);
  const byDays = (a: PantryItem, b: PantryItem) =>
    compareDays(daysRemaining(a, now), daysRemaining(b, now));

  const primary = {'days-left': byDays, department: byDepartment, name: byName}[sort];
  return [...items].sort((a, b) => primary(a, b) || byName(a, b));
}

function iconFor(category: CategoryId, current?: FoodIconName): FoodIconName {
  return current && FOOD_ICON_CATEGORY[current] === category ? current : CATEGORIES[category].icon;
}

export function createItem(details: ItemDetails, quantity: number, at: number): PantryItem {
  return {
    ...details,
    id: `item-${at.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    icon: iconFor(details.category),
    quantity,
    lastUpdated: new Date(at).toISOString(),
  };
}

/**
 * A new usage rate only applies from now on. Without re-basing on today's estimate, it
 * would also rewrite how much was used since the last count.
 */
export function applyItemEdit(item: PantryItem, details: ItemDetails, at: number): PantryItem {
  const rebased =
    details.dailyUse === item.dailyUse
      ? {}
      : {quantity: roundQuantity(estimatedQuantity(item, at)), lastUpdated: new Date(at).toISOString()};
  return {...item, ...details, icon: iconFor(details.category, item.icon), ...rebased};
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES[id].label;
}
