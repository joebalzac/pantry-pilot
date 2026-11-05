import { CATEGORIES } from './categories';
import type { FoodIconName } from './foodIcons';
import { formatQuantity } from './format';
import { displayQuantity, estimatedQuantity, isAmount, restockKind, type PantryItem } from './pantry';
import { MAX_QUANTITY, nextQuantity, purchaseStepForUnit, roundQuantity } from './quantity';
import { CATEGORY_IDS, type CategoryId } from './tokens';

/** A suggested purchase lasts this long past the reorder level. */
const COVER_DAYS = 7;

/** What a check-off changed in the pantry, so unchecking it can put that back. */
export type Restock = {
  amount: number;
  previousQuantity: number;
  previousLastUpdated: string;
  at: string;
};

export type PantryEntry = {
  source: 'pantry';
  /** The pantry item's id. An item is on the list at most once. */
  id: string;
  /** What the person chose to buy. Null follows the live suggestion. */
  amount: number | null;
  note: string;
  addedBy: 'you' | 'auto';
  bought: Restock | null;
};

export type OneOffDetails = {
  name: string;
  category: CategoryId;
  amount: number;
  unit: string;
  note: string;
};

/** Something to buy that the pantry doesn't track, so buying it restocks nothing. */
export type OneOffEntry = OneOffDetails & {
  source: 'one-off';
  id: string;
  bought: boolean;
};

export type ShoppingEntry = PantryEntry | OneOffEntry;

/** The changes a person can make to an entry after adding it. One-offs also take the name fields. */
export type EntryEdit = {
  amount: number | null;
  note: string;
  name?: string;
  category?: CategoryId;
  unit?: string;
};

/** An entry joined with its pantry item and resolved to what to show right now. */
export type ShoppingLine = {
  id: string;
  source: ShoppingEntry['source'];
  name: string;
  category: CategoryId;
  icon: FoodIconName;
  amount: number;
  unit: string;
  note: string;
  bought: boolean;
  /** The amount is the live suggestion rather than one the person chose. */
  suggested: boolean;
  autoAdded: boolean;
};

export type ShoppingGroup = {
  category: CategoryId;
  label: string;
  icon: FoodIconName;
  lines: ShoppingLine[];
};

/**
 * Enough to reach the reorder level and then last COVER_DAYS, rounded up to what a store
 * sells. Never less than one step: an item on the list is there to be bought.
 */
export function suggestedAmount(item: PantryItem, now: number): number {
  const step = purchaseStepForUnit(item.unit);
  const needed = item.reorderAt + item.dailyUse * COVER_DAYS - estimatedQuantity(item, now);
  const steps = Math.max(1, Math.ceil(needed / step - 1e-9));
  return Math.min(MAX_QUANTITY, roundQuantity(steps * step));
}

export function createPantryEntry(id: string, addedBy: PantryEntry['addedBy']): PantryEntry {
  return {source: 'pantry', id, amount: null, note: '', addedBy, bought: null};
}

export function createOneOffEntry(details: OneOffDetails, at: number): OneOffEntry {
  return {
    ...details,
    source: 'one-off',
    id: `list-${at.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    bought: false,
  };
}

export function applyEntryEdit(entry: ShoppingEntry, edit: EntryEdit): ShoppingEntry {
  if (entry.source === 'pantry') {
    // A bought amount is already in the pantry. Changing it starts with unchecking.
    return {...entry, note: edit.note, amount: entry.bought ? entry.amount : edit.amount};
  }
  return {
    ...entry,
    note: edit.note,
    amount: edit.amount ?? entry.amount,
    name: edit.name ?? entry.name,
    category: edit.category ?? entry.category,
    unit: edit.unit ?? entry.unit,
  };
}

function toLine(entry: ShoppingEntry, item: PantryItem | undefined, now: number): ShoppingLine | null {
  const shared = {id: entry.id, source: entry.source, note: entry.note, bought: Boolean(entry.bought)};
  if (entry.source === 'one-off') {
    return {
      ...shared,
      name: entry.name,
      category: entry.category,
      icon: CATEGORIES[entry.category].icon,
      amount: entry.amount,
      unit: entry.unit,
      suggested: false,
      autoAdded: false,
    };
  }
  if (!item) return null;
  return {
    ...shared,
    name: item.name,
    category: item.category,
    icon: item.icon,
    amount: entry.bought?.amount ?? entry.amount ?? suggestedAmount(item, now),
    unit: item.unit,
    suggested: !entry.bought && entry.amount === null,
    autoAdded: entry.addedBy === 'auto',
  };
}

export function shoppingLines(entries: ShoppingEntry[], items: PantryItem[], now: number): ShoppingLine[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return entries.flatMap((entry) => toLine(entry, byId.get(entry.id), now) ?? []);
}

export function lineAmountAfterStep(line: ShoppingLine, direction: 1 | -1): number {
  const step = purchaseStepForUnit(line.unit);
  // Stops at one step, or at a smaller amount someone typed, rather than reaching zero.
  return Math.max(Math.min(line.amount, step), nextQuantity(line.amount, step, direction));
}

/** Store departments in walking order, names alphabetical within each. */
export function groupByDepartment(lines: ShoppingLine[]): ShoppingGroup[] {
  return CATEGORY_IDS.flatMap((category) => {
    const inDepartment = lines
      .filter((line) => line.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (inDepartment.length === 0) return [];
    const {label, icon} = CATEGORIES[category];
    return [{category, label, icon, lines: inDepartment}];
  });
}

/** Adds to what the person currently sees, and counts as a fresh count from now. */
export function restockItem(item: PantryItem, amount: number, at: number): {item: PantryItem; restock: Restock} {
  const timestamp = new Date(at).toISOString();
  return {
    item: {
      ...item,
      quantity: Math.min(MAX_QUANTITY, roundQuantity(displayQuantity(item, at) + amount)),
      lastUpdated: timestamp,
    },
    restock: {
      amount,
      previousQuantity: item.quantity,
      previousLastUpdated: item.lastUpdated,
      at: timestamp,
    },
  };
}

/**
 * Puts the count back, unless the item has been recounted since the check-off. That
 * later count is the better information, so it stays.
 */
export function revertRestock(item: PantryItem, restock: Restock): PantryItem {
  return item.lastUpdated === restock.at
    ? {...item, quantity: restock.previousQuantity, lastUpdated: restock.previousLastUpdated}
    : item;
}

function isUntouchedAutoEntry(entry: ShoppingEntry): boolean {
  return (
    entry.source === 'pantry' &&
    entry.addedBy === 'auto' &&
    !entry.bought &&
    entry.amount === null &&
    !entry.note
  );
}

/**
 * Keeps the list in step with what's low. `dismissed` holds items taken off the list while
 * low, which stay off until they recover: without it, removing one would re-add it instantly.
 * Returns the same arrays when nothing changed.
 */
export function syncAutoAdd(
  entries: ShoppingEntry[],
  dismissed: string[],
  items: PantryItem[],
  now: number,
): {entries: ShoppingEntry[]; dismissed: string[]} {
  const low = new Set(items.filter((item) => restockKind(item, now)).map((item) => item.id));
  const stillDismissed = dismissed.filter((id) => low.has(id));
  const kept = entries.filter((entry) => !isUntouchedAutoEntry(entry) || low.has(entry.id));
  const onList = new Set(kept.map((entry) => entry.id));
  const added = items
    .filter((item) => low.has(item.id) && !onList.has(item.id) && !stillDismissed.includes(item.id))
    .map((item) => createPantryEntry(item.id, 'auto'));

  return {
    entries: added.length > 0 || kept.length !== entries.length ? [...kept, ...added] : entries,
    dismissed: stillDismissed.length !== dismissed.length ? stillDismissed : dismissed,
  };
}

export function formatLineAmount(line: ShoppingLine): string {
  return formatQuantity(line.amount, line.unit);
}

/** Plain text that reads well pasted into a message or a notes app. */
export function formatShoppingText(lines: ShoppingLine[]): string {
  const sections = groupByDepartment(lines).map(({label, lines: inDepartment}) => {
    const rows = inDepartment.map((line) => {
      const note = line.note ? ` (${line.note})` : '';
      return `- ${line.name}: ${formatLineAmount(line)}${note}`;
    });
    return [label, ...rows].join('\n');
  });
  return ['Shopping list', ...sections].join('\n\n');
}

function hydrateRestock(raw: unknown): Restock | null {
  if (!raw || typeof raw !== 'object') return null;
  const saved = raw as Partial<Record<keyof Restock, unknown>>;
  return isAmount(saved.amount) &&
    isAmount(saved.previousQuantity) &&
    typeof saved.previousLastUpdated === 'string' &&
    typeof saved.at === 'string'
    ? {
        amount: saved.amount,
        previousQuantity: saved.previousQuantity,
        previousLastUpdated: saved.previousLastUpdated,
        at: saved.at,
      }
    : null;
}

function hydrateEntry(raw: unknown, itemIds: Set<string>): ShoppingEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const saved = raw as Record<string, unknown>;
  if (typeof saved.id !== 'string') return null;
  const note = typeof saved.note === 'string' ? saved.note : '';
  const amount = isAmount(saved.amount) && saved.amount > 0 ? saved.amount : null;

  if (saved.source === 'one-off') {
    if (typeof saved.name !== 'string' || !saved.name.trim()) return null;
    return {
      source: 'one-off',
      id: saved.id,
      name: saved.name,
      category: CATEGORY_IDS.find((id) => id === saved.category) ?? 'pantry',
      amount: amount ?? 1,
      unit: typeof saved.unit === 'string' ? saved.unit : '',
      note,
      bought: saved.bought === true,
    };
  }

  if (!itemIds.has(saved.id)) return null;
  return {
    source: 'pantry',
    id: saved.id,
    amount,
    note,
    addedBy: saved.addedBy === 'auto' ? 'auto' : 'you',
    bought: hydrateRestock(saved.bought),
  };
}

/**
 * Reads a saved list. Saves from before quantities hold `cart`, an array of pantry item
 * ids, and those become entries that follow the suggestion.
 */
export function hydrateShoppingList(list: unknown, legacyCart: unknown, items: PantryItem[]): ShoppingEntry[] {
  const raw: unknown[] = Array.isArray(list)
    ? list
    : Array.isArray(legacyCart)
      ? legacyCart.map((id) => ({id}))
      : [];
  const itemIds = new Set(items.map((item) => item.id));
  const byId = new Map<string, ShoppingEntry>();

  for (const candidate of raw) {
    const entry = hydrateEntry(candidate, itemIds);
    if (entry && !byId.has(entry.id)) byId.set(entry.id, entry);
  }

  return [...byId.values()];
}
