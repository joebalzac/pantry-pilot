import type { InventoryRecord, ThreadMessage } from '../api/schema';
import { initialItems } from '../pantry';

const BRANDS = ['Riverbend', 'Hearth & Field', 'Morning Harvest', 'Blue Ridge', 'Copper Kettle', 'Tidewater', 'Old Orchard'];
const VARIANTS = ['Organic', 'Family Size', 'Small Batch', 'Local', 'Value Pack', 'Reserve'];

export const INVENTORY_TOTAL = 10_000;
export const THREAD_TOTAL = 2_400;

function buildInventory(): InventoryRecord[] {
  return Array.from({length: INVENTORY_TOTAL}, (_, index) => {
    const seed = initialItems[index % initialItems.length];
    const brand = BRANDS[index % BRANDS.length];
    const variant = VARIANTS[index % VARIANTS.length];
    const quantity = ((index * 37) % 240) / 10;
    // Roughly one record in 40 has the over-long name real catalog feeds produce.
    const name =
      index % 40 === 7
        ? `${brand} ${variant} ${seed.name} with Extra Long Retailer Catalog Description, Limited Regional Availability, Resealable Packaging`
        : `${brand} ${variant} ${seed.name}`;
    return {
      id: `inv-${String(index + 1).padStart(5, '0')}`,
      name,
      category: seed.category,
      icon: seed.icon,
      quantity,
      unit: seed.unit,
      daysLeft: Math.round(quantity / seed.dailyUse),
    };
  });
}

const AUTHORS = ['You', 'Sam', 'Priya', 'Theo'];
const LINES = [
  'We’re almost out of whole milk. Can someone grab a gallon?',
  'Picked up eggs on the way home.',
  'Who finished the Greek yogurt?',
  'Bananas are going fast this week. Should we raise the restock level?',
  'Added olive oil to the shopping list.',
  'Dinner tonight is salmon, so no need for chicken.',
  'Rice is fine for now, we have about a week left.',
  'Spinach went bad, moving it to the list.',
  'The store was out of Honeycrisp, so I got Fuji instead.',
  'Thanks! That covers everything for the weekend.',
];
const LONG_MESSAGE =
  'Here’s the plan for next week so nobody has to ask twice. Monday is the big market run for produce and dairy, and I’ll cover that on my way back from work. Tuesday we use up the spinach and whatever is left of the chicken. Wednesday is leftovers, so please don’t buy anything extra for that night. Thursday the kids have practice, so soup and sandwiches, which means we need bread and a couple of cartons of tomato basil. Friday is open. If anyone wants something specific, add it to the list by Sunday night so I can check it against what we already have, because last week we ended up with three bottles of olive oil and no butter at all.';
const LONG_LINK =
  'Recipe we talked about: https://recipes.example.com/collections/weeknight-dinners/one-pan-lemon-herb-salmon-with-spinach-and-jasmine-rice?utm_source=household_share&utm_medium=message&utm_campaign=weeknight_rotation_autumn&ref=9f8a7b6c5d4e3f2a1b0c';

const THREAD_END = Date.UTC(2026, 10, 4, 18, 0);
const THREAD_GAP_MS = 4 * 60 * 60 * 1000;

function buildThread(): ThreadMessage[] {
  return Array.from({length: THREAD_TOTAL}, (_, index) => {
    const body = index % 11 === 5 ? LONG_MESSAGE : index % 17 === 3 ? LONG_LINK : LINES[(index * 7) % LINES.length];
    return {
      id: `msg-${String(index + 1).padStart(5, '0')}`,
      author: AUTHORS[(index * 3 + (index % 5)) % AUTHORS.length],
      body,
      sentAt: new Date(THREAD_END - (THREAD_TOTAL - 1 - index) * THREAD_GAP_MS).toISOString(),
    };
  });
}

export const inventory = buildInventory();
export const thread = buildThread();
