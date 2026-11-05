/**
 * TypeScript contract for the three-layer token system.
 * CSS custom properties are the source of truth:
 *   1. primitives  — app/styles/tokens/primitives.css
 *   2. semantic    — app/styles/tokens/semantic.css  (intent)
 *   3. component   — app/styles/tokens/component.css (recipes + variants)
 */

export const CATEGORY_IDS = [
  'dairy',
  'produce',
  'meat',
  'seafood',
  'bakery',
  'prepared',
  'pantry',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

/*
 * Variant values live here once. Types are derived from the arrays, so a list
 * rendered in the design system can never drift from what a component accepts.
 * Each value needs a matching [data-*] rule in app/styles/components.css.
 */
export const CONTROL_SIZES = ['sm', 'md', 'lg'] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

export const BUTTON_VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const BADGE_TONES = ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];

export const CARD_PADDINGS = ['sm', 'md', 'lg'] as const;
export type CardPadding = (typeof CARD_PADDINGS)[number];

/** Name of a CSS custom property, e.g. `--color-text-primary`. */
export type CssVar = `--${string}`;
