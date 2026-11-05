const compact = new Intl.NumberFormat('en-US', {notation: 'compact', maximumFractionDigits: 1});
const whole = new Intl.NumberFormat('en-US');
const quantity = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2});

export function formatCount(value: number): string {
  return whole.format(value);
}

/** Keeps runaway values inside fixed-width UI: 1234567890 becomes 1.2B. */
export function formatCompact(value: number): string {
  return Math.abs(value) < 100_000 ? whole.format(value) : compact.format(value);
}

export function formatQuantity(value: number, unit: string): string {
  const amount = Math.abs(value) < 100_000 ? quantity.format(value) : compact.format(value);
  return `${amount} ${unit}`.trim();
}

export function formatDaysLeft(days: number): string {
  if (days === Infinity) return 'No usage estimate';
  return days === 1 ? '~1 day left' : `~${whole.format(days)} days left`;
}

/** How long ago a count was taken, in whole days. */
export function formatDaysAgo(elapsedMs: number): string {
  const days = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  return days === 1 ? 'yesterday' : `${whole.format(days)} days ago`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
