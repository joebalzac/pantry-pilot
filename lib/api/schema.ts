import { FOOD_ICON_NAMES, type FoodIconName } from '../foodIcons';
import { CATEGORY_IDS, type CategoryId } from '../tokens';

export type InventoryRecord = {
  id: string;
  name: string;
  category: CategoryId;
  icon: FoodIconName;
  quantity: number;
  unit: string;
  daysLeft: number;
};

export type InventoryPage = {
  items: InventoryRecord[];
  nextCursor: string | null;
  total: number;
};

export type ThreadMessage = {
  id: string;
  author: string;
  body: string;
  sentAt: string;
};

export type ThreadPage = {
  messages: ThreadMessage[];
  prevCursor: string | null;
  total: number;
};

export class SchemaError extends Error {}

type Fields = Record<string, unknown>;

function asObject(value: unknown, path: string): Fields {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new SchemaError(`${path}: expected an object`);
  }
  return value as Fields;
}

function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new SchemaError(`${path}: expected an array`);
  return value;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== 'string') throw new SchemaError(`${path}: expected a string`);
  return value;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new SchemaError(`${path}: expected a finite number`);
  }
  return value;
}

function asCursor(value: unknown, path: string): string | null {
  return value === null ? null : asString(value, path);
}

function asOneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new SchemaError(`${path}: unexpected value ${JSON.stringify(value)}`);
  }
  return value as T;
}

export function parseInventoryPage(raw: unknown): InventoryPage {
  const page = asObject(raw, 'page');
  return {
    items: asArray(page.items, 'items').map((entry, index) => {
      const path = `items[${index}]`;
      const item = asObject(entry, path);
      return {
        id: asString(item.id, `${path}.id`),
        name: asString(item.name, `${path}.name`),
        category: asOneOf(item.category, CATEGORY_IDS, `${path}.category`),
        icon: asOneOf(item.icon, FOOD_ICON_NAMES, `${path}.icon`),
        quantity: asNumber(item.quantity, `${path}.quantity`),
        unit: asString(item.unit, `${path}.unit`),
        daysLeft: asNumber(item.daysLeft, `${path}.daysLeft`),
      };
    }),
    nextCursor: asCursor(page.nextCursor, 'nextCursor'),
    total: asNumber(page.total, 'total'),
  };
}

export function parseThreadPage(raw: unknown): ThreadPage {
  const page = asObject(raw, 'page');
  return {
    messages: asArray(page.messages, 'messages').map((entry, index) => {
      const path = `messages[${index}]`;
      const message = asObject(entry, path);
      return {
        id: asString(message.id, `${path}.id`),
        author: asString(message.author, `${path}.author`),
        body: asString(message.body, `${path}.body`),
        sentAt: asString(message.sentAt, `${path}.sentAt`),
      };
    }),
    prevCursor: asCursor(page.prevCursor, 'prevCursor'),
    total: asNumber(page.total, 'total'),
  };
}
