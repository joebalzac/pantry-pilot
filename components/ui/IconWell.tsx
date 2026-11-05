import type { ComponentPropsWithRef } from 'react';
import { cn } from '../../lib/cn';
import type { CategoryId, ControlSize } from '../../lib/tokens';

export type IconWellProps = ComponentPropsWithRef<'span'> & {
  category: CategoryId;
  size?: ControlSize;
};

export function IconWell({category, size = 'md', className, ...props}: IconWellProps) {
  return (
    <span
      {...props}
      className={cn('icon-well', className)}
      data-category={category}
      data-size={size}
    />
  );
}
