import Link from 'next/link';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { CategoryId } from '../../lib/tokens';

export type ChipProps = ComponentPropsWithRef<'button'> & {
  /** Rendered as `aria-pressed`, which is also the styling hook. */
  selected?: boolean;
  // `never`, not Omit: TypeScript accepts unknown hyphenated JSX attributes.
  'aria-pressed'?: never;
  category?: CategoryId;
  leading?: ReactNode;
};

export function Chip({
  selected = false,
  category,
  leading,
  className,
  children,
  type = 'button',
  ...props
}: ChipProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn('chip', className)}
      aria-pressed={selected}
      data-category={category}
    >
      {leading}
      <span className="chip__label">{children}</span>
    </button>
  );
}

export type ChipLinkProps = ComponentPropsWithRef<typeof Link> & {
  category?: CategoryId;
};

/** A chip that navigates. Use `Chip` for one that changes state on this page. */
export function ChipLink({category, className, children, ...props}: ChipLinkProps) {
  return (
    <Link {...props} className={cn('chip', className)} data-category={category}>
      <span className="chip__label">{children}</span>
    </Link>
  );
}

export type ChipGroupProps = Omit<ComponentPropsWithRef<'div'>, 'role' | 'aria-label'> & {
  /** Names the group for assistive tech, e.g. "Filter by department". */
  label: string;
};

export function ChipGroup({label, className, ...props}: ChipGroupProps) {
  return <div {...props} className={cn('chip-row', className)} role="group" aria-label={label} />;
}
