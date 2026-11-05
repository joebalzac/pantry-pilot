/** Token names by layer — used by the design-system inventory. CSS remains source of truth. */
import type { CssVar } from './tokens';

export const PRIMITIVE_COLOR_RAMPS = {
  green: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  sage: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  lime: [50, 100, 200, 300, 400, 500, 600, 700],
  cream: [50, 100, 200, 300, 400],
  ink: [50, 100, 200, 800, 900, 950],
  yellow: [50, 100, 400, 500, 700, 800],
  orange: [50, 100, 400, 500, 700],
  red: [50, 100, 400, 500, 700],
  blue: [50, 100, 400, 500, 700],
  tan: [50, 100, 300, 400, 700],
} as const;

export const SEMANTIC_COLOR_GROUPS = {
  Surfaces: [
    '--color-bg-canvas',
    '--color-bg-canvas-subtle',
    '--color-bg-surface',
    '--color-bg-sunken',
    '--color-bg-brand',
    '--color-bg-brand-strong',
    '--color-bg-inverse',
  ],
  Text: [
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-tertiary',
    '--color-text-brand',
    '--color-text-on-brand',
    '--color-text-on-action',
    '--color-text-accent',
  ],
  Border: [
    '--color-border-subtle',
    '--color-border-default',
    '--color-border-strong',
    '--color-border-brand',
    '--color-border-focus',
    '--color-focus-ring',
  ],
  Action: [
    '--color-action-primary',
    '--color-action-primary-hover',
    '--color-action-secondary',
    '--color-action-secondary-text',
    '--color-action-danger',
    '--color-action-danger-soft',
  ],
  Feedback: [
    '--color-feedback-success',
    '--color-feedback-success-soft',
    '--color-feedback-warning',
    '--color-feedback-warning-soft',
    '--color-feedback-danger',
    '--color-feedback-danger-soft',
    '--color-feedback-info',
    '--color-feedback-info-soft',
  ],
} as const satisfies Record<string, readonly CssVar[]>;

export const SPACE_TOKENS = [
  '--space-gap-2xs',
  '--space-gap-xs',
  '--space-gap-sm',
  '--space-gap-md',
  '--space-gap-lg',
  '--space-gap-xl',
  '--space-inset-xs',
  '--space-inset-sm',
  '--space-inset-md',
  '--space-inset-lg',
  '--space-inset-xl',
] as const satisfies readonly CssVar[];

export const RADIUS_TOKENS = [
  '--radius-control-sm',
  '--radius-control',
  '--radius-control-lg',
  '--radius-container',
  '--radius-container-lg',
  '--radius-full',
] as const satisfies readonly CssVar[];

export const ELEVATION_TOKENS = [
  '--elevation-surface',
  '--elevation-raised',
  '--elevation-overlay',
  '--elevation-focus',
] as const satisfies readonly CssVar[];

export const TYPE_ROLES = [
  {token: '--font-size-label', label: 'Label', sample: 'SMART REPLENISHMENT', className: 'eyebrow'},
  {token: '--font-size-caption', label: 'Caption', sample: 'Based on thresholds', className: 'caption'},
  {token: '--font-size-body', label: 'Body', sample: 'Track what you have at home.', className: ''},
  {token: '--font-size-body-lg', label: 'Body large', sample: 'Anticipate what you need next.', className: 'body-lg'},
  {token: '--font-size-heading-md', label: 'Heading', sample: 'Running low', className: 'heading-lg'},
  {token: '--font-size-heading-lg', label: 'Display', sample: 'the essentials.', className: 'heading-xl'},
] as const satisfies ReadonlyArray<{token: CssVar; label: string; sample: string; className: string}>;
