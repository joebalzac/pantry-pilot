import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { ButtonVariant, ControlSize } from '../../lib/tokens';

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
  size?: ControlSize;
  /** Decorative: hidden from assistive tech, so the button still needs a text or aria-label name. */
  leadingIcon?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn('btn', className)}
      data-variant={variant}
      data-size={size}
    >
      {leadingIcon ? (
        <span className="btn__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
