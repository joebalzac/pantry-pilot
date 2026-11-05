import { useState } from 'react';
import { parseQuantity } from '../lib/quantity';

export type QuantityInputProps = {
  label: string;
  value: number;
  onCommit: (value: number) => void;
};

/**
 * A text input, not type="number", so people can type fractions like "1/2".
 * Commits on Enter or blur. Escape, or leaving with an unreadable value, restores the amount.
 */
export function QuantityInput({label, value, onCommit}: QuantityInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const parsed = draft === null ? null : parseQuantity(draft);
  const invalid = draft !== null && parsed === null;

  const commit = () => {
    if (parsed !== null && parsed !== value) onCommit(parsed);
    setDraft(null);
  };

  return (
    <input
      className="stepper__input"
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aria-label={label}
      aria-invalid={invalid || undefined}
      value={draft ?? String(value)}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={(event) => event.target.select()}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !invalid) commit();
        if (event.key === 'Escape') setDraft(null);
      }}
    />
  );
}
