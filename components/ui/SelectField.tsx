import { useId, type ComponentPropsWithRef } from 'react';
import { cn } from '../../lib/cn';

export type SelectFieldProps = ComponentPropsWithRef<'select'> & {
  /** Required, so a field can't ship without an accessible name. */
  label: string;
  // `never`, not Omit: TypeScript accepts unknown hyphenated JSX attributes.
  'aria-label'?: never;
  'aria-labelledby'?: never;
  /** Keeps the label for assistive tech while removing it visually. */
  hideLabel?: boolean;
};

export function SelectField({label, hideLabel = false, id, className, ...props}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="field-root">
      <label htmlFor={selectId} className={hideLabel ? 'visually-hidden' : 'field-label'}>
        {label}
      </label>
      <select {...props} id={selectId} className={cn('field', className)} />
    </div>
  );
}
