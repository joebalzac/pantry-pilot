import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../lib/cn';
import type { BadgeTone } from '../../lib/tokens';

export type BadgeProps = ComponentPropsWithRef<'span'> & {
  tone?: BadgeTone;
};

export function Badge({tone = 'neutral', className, children, ...props}: BadgeProps) {
  return (
    <span {...props} className={cn('badge', className)} data-tone={tone}>
      <span className="badge__label">{children}</span>
    </span>
  );
}
