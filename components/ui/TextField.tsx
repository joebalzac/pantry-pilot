import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type TextFieldType = 'text' | 'search' | 'email' | 'tel' | 'url' | 'password' | 'number';

export type TextFieldProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  /** Required, so a field can't ship without an accessible name. */
  label: string;
  // `never`, not Omit: TypeScript accepts unknown hyphenated JSX attributes.
  'aria-label'?: never;
  'aria-labelledby'?: never;
  /** Keeps the label for assistive tech while removing it visually. */
  hideLabel?: boolean;
  type?: TextFieldType;
  leadingIcon?: ReactNode;
  /** Supporting text under the field. An `error` replaces it. */
  hint?: string;
  /** Marks the field invalid and tells assistive tech why. */
  error?: string;
};

export function TextField({
  label,
  hideLabel = false,
  type = 'text',
  leadingIcon,
  hint,
  error,
  id,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const message = error ?? hint;
  const messageId = `${inputId}-message`;

  return (
    <div className="field-root">
      <label htmlFor={inputId} className={hideLabel ? 'visually-hidden' : 'field-label'}>
        {label}
      </label>
      <div className="field-wrap">
        {leadingIcon ? (
          <span className="field-wrap__icon" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}
        <input
          {...props}
          id={inputId}
          type={type}
          className={cn('field', className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
        />
      </div>
      {message ? (
        <p id={messageId} className="field-message" data-tone={error ? 'error' : undefined}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
