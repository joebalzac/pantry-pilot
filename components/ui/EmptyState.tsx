import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type EmptyStateProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  icon?: ReactNode;
  title: string;
};

export function EmptyState({icon, title, children, className, ...props}: EmptyStateProps) {
  return (
    <div {...props} className={cn('empty', className)}>
      {icon ? (
        <div className="empty__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <p className="empty__title">{title}</p>
      {children ? <p className="empty__copy">{children}</p> : null}
    </div>
  );
}
