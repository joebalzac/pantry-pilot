import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export type StepperProps = Omit<ComponentPropsWithRef<'div'>, 'role' | 'aria-label'> & {
  /** Names the control group, e.g. "Whole Milk quantity". */
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
  /** Rendered between the buttons, e.g. a typed quantity input. */
  children?: ReactNode;
};

export function Stepper({
  label,
  decreaseLabel,
  increaseLabel,
  onDecrease,
  onIncrease,
  children,
  className,
  ...props
}: StepperProps) {
  return (
    <div {...props} className={cn('stepper', className)} role="group" aria-label={label}>
      <Button variant="outline" size="sm" aria-label={decreaseLabel} onClick={onDecrease}>
        −
      </Button>
      {children}
      <Button variant="outline" size="sm" aria-label={increaseLabel} onClick={onIncrease}>
        +
      </Button>
    </div>
  );
}
