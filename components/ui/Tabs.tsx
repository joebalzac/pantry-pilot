'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useRovingTabs } from '../../hooks/useRovingTabs';
import { cn } from '../../lib/cn';

const tabDomId = (idBase: string, id: string) => `${idBase}-tab-${id}`;
const panelDomId = (idBase: string, id: string) => `${idBase}-panel-${id}`;

export type TabOption<T extends string> = {
  id: T;
  label: ReactNode;
};

export type TabsProps<T extends string> = Omit<
  ComponentPropsWithRef<'div'>,
  'role' | 'aria-label' | 'onChange' | 'children'
> & {
  label: string;
  value: T;
  options: readonly TabOption<T>[];
  onChange: (id: T) => void;
  /** Shared with `TabPanel` to link tabs to panels. Create it with `useId()`. */
  idBase: string;
};

export function Tabs<T extends string>({
  label,
  value,
  options,
  onChange,
  idBase,
  className,
  ...props
}: TabsProps<T>) {
  const {getTabProps} = useRovingTabs({
    ids: options.map((option) => option.id),
    value,
    onChange,
  });

  return (
    <div {...props} className={cn('tabs', className)} role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          {...getTabProps(option.id)}
          type="button"
          className="tabs__tab"
          id={tabDomId(idBase, option.id)}
          // Only the selected panel is rendered, so only its tab can reference one.
          aria-controls={option.id === value ? panelDomId(idBase, option.id) : undefined}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type TabPanelProps<T extends string> = Omit<
  ComponentPropsWithRef<'div'>,
  'role' | 'id' | 'aria-labelledby'
> & {
  idBase: string;
  tabId: T;
};

export function TabPanel<T extends string>({idBase, tabId, ...props}: TabPanelProps<T>) {
  return (
    <div
      tabIndex={0}
      {...props}
      role="tabpanel"
      id={panelDomId(idBase, tabId)}
      aria-labelledby={tabDomId(idBase, tabId)}
    />
  );
}
