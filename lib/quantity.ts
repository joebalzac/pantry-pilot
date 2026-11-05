/** Largest value the inline quantity field can show without overflowing. */
export const MAX_QUANTITY = 99_999;

const DEFAULT_STEP = 1;

/** Stepper increments for units people buy and use in parts. Any other unit steps by 1. */
const UNIT_STEPS: Record<string, number> = {
  gallons: 0.25,
  gallon: 0.25,
  liters: 0.25,
  liter: 0.25,
  lb: 0.25,
  lbs: 0.25,
  kg: 0.25,
  bottles: 0.25,
  bottle: 0.25,
  cups: 0.5,
  cup: 0.5,
  bags: 0.5,
  bag: 0.5,
};

/**
 * What a store sells, where that differs from how the unit is used up. A bottle is
 * counted in quarters at home but bought whole.
 */
const PURCHASE_STEPS: Record<string, number> = {
  gallons: 0.5,
  gallon: 0.5,
  bottles: 1,
  bottle: 1,
  bags: 1,
  bag: 1,
};

/** Suggestions for the unit field. It still accepts any text. */
export const COMMON_UNITS = ['bags', 'bottles', 'boxes', 'cans', 'cups', 'gallons', 'kg', 'lb', 'liters', 'oz', 'packs'];

const VULGAR_FRACTIONS: Record<string, number> = {
  '⅛': 1 / 8,
  '¼': 1 / 4,
  '⅓': 1 / 3,
  '½': 1 / 2,
  '⅔': 2 / 3,
  '¾': 3 / 4,
};

export function roundQuantity(value: number): number {
  return Math.round(value * 100) / 100;
}

export function stepForUnit(unit: string): number {
  return UNIT_STEPS[unit.trim().toLowerCase()] ?? DEFAULT_STEP;
}

export function purchaseStepForUnit(unit: string): number {
  return PURCHASE_STEPS[unit.trim().toLowerCase()] ?? stepForUnit(unit);
}

/** The next multiple of `step` above or below `value`, so 0.4 steps to 0.25 or 0.5. */
export function nextQuantity(value: number, step: number, direction: 1 | -1): number {
  const position = value / step;
  const target = direction > 0 ? Math.floor(position + 1e-9) + 1 : Math.ceil(position - 1e-9) - 1;
  return Math.min(MAX_QUANTITY, Math.max(0, roundQuantity(target * step)));
}

/** Reads "2", "0.5", ".5", "1/2", "1 1/2", "½" or "1½". Returns null for anything else. */
export function parseQuantity(input: string): number | null {
  const text = input.trim();
  let value: number | null = null;

  const mixed = text.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  const vulgar = text.match(/^(\d+)?\s*([⅛¼⅓½⅔¾])$/);

  if (/^(\d+\.?\d*|\.\d+)$/.test(text)) {
    value = Number(text);
  } else if (mixed) {
    const denominator = Number(mixed[3]);
    if (denominator > 0) value = Number(mixed[1] ?? 0) + Number(mixed[2]) / denominator;
  } else if (vulgar) {
    value = Number(vulgar[1] ?? 0) + VULGAR_FRACTIONS[vulgar[2]];
  }

  if (value === null || value > MAX_QUANTITY) return null;
  return roundQuantity(value);
}
