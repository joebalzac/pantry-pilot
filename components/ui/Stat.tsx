import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type StatRowProps = ComponentPropsWithRef<'dl'>;

export function StatRow({className, ...props}: StatRowProps) {
  return <dl {...props} className={cn('stat-row', className)} />;
}

export type StatProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  label: string;
  value: ReactNode;
};

/** A term/value pair: render inside `StatRow`. */
export function Stat({label, value, className, ...props}: StatProps) {
  return (
    <div {...props} className={cn('stat', className)}>
      <dt className="stat__label">{label}</dt>
      <dd className="stat__value">{value}</dd>
    </div>
  );
}
