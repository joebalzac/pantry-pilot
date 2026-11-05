import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type CheckRowProps = Omit<ComponentPropsWithRef<'li'>, 'title' | 'children' | 'onChange'> & {
  title: ReactNode;
  meta?: ReactNode;
  note?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Sits outside the label, so using these doesn't toggle the row. */
  actions?: ReactNode;
};

/** A list item whose whole label toggles a checkbox: render inside `ItemList`. */
export function CheckRow({
  title,
  meta,
  note,
  checked,
  onCheckedChange,
  actions,
  className,
  ...props
}: CheckRowProps) {
  return (
    <li {...props} className={cn('check-row', className)} data-checked={checked || undefined}>
      <label className="check-row__main">
        <input
          type="checkbox"
          className="check-row__box"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        <span className="check-row__body">
          <span className="check-row__title" dir="auto">
            {title}
          </span>
          {meta ? <span className="check-row__meta">{meta}</span> : null}
          {note ? (
            <span className="check-row__note" dir="auto">
              {note}
            </span>
          ) : null}
        </span>
      </label>
      {actions ? <div className="check-row__actions">{actions}</div> : null}
    </li>
  );
}
