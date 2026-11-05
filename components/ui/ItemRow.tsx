import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ItemListProps = ComponentPropsWithRef<'ul'>;

export function ItemList({className, ...props}: ItemListProps) {
  return <ul {...props} className={cn('item-list', className)} />;
}

export type ItemRowProps = Omit<ComponentPropsWithRef<'li'>, 'title' | 'children'> & {
  icon?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  quantity?: ReactNode;
  actions?: ReactNode;
};

/** A list item: render inside `ItemList`. */
export function ItemRow({icon, title, meta, quantity, actions, className, ...props}: ItemRowProps) {
  return (
    <li {...props} className={cn('item-row', className)}>
      {icon}
      <div className="item-row__body">
        <div
          className="item-row__title"
          dir="auto"
          title={typeof title === 'string' ? title : undefined}
        >
          {title}
        </div>
        {meta ? <div className="item-row__meta">{meta}</div> : null}
      </div>
      {quantity ? <span className="item-row__qty">{quantity}</span> : null}
      {actions ? <div className="item-row__actions">{actions}</div> : null}
    </li>
  );
}
