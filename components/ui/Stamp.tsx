import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type StampProps = Omit<ComponentPropsWithRef<'p'>, 'children'> & {
  value: ReactNode;
  label: ReactNode;
};

export function Stamp({value, label, className, ...props}: StampProps) {
  return (
    <p {...props} className={cn('stamp', className)}>
      <span className="stamp__value">{value}</span>{' '}
      <span className="stamp__label">{label}</span>
    </p>
  );
}
