import { useRef, type KeyboardEvent } from 'react';

/** Target index for a tablist key press, or null when the key isn't a tab command. */
export function nextTabIndex(key: string, current: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/**
 * Tab behavior with no markup or styling: only the selected tab is in the page
 * tab order, and arrow/Home/End keys move focus and selection together.
 */
export function useRovingTabs<T extends string>({
  ids,
  value,
  onChange,
}: {
  ids: readonly T[];
  value: T;
  onChange: (id: T) => void;
}) {
  const tabs = useRef(new Map<T, HTMLButtonElement>());

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = nextTabIndex(event.key, ids.indexOf(value), ids.length);
    if (index === null) return;
    event.preventDefault();
    onChange(ids[index]);
    tabs.current.get(ids[index])?.focus();
  };

  const getTabProps = (id: T) => ({
    ref: (node: HTMLButtonElement | null) => {
      if (node) tabs.current.set(id, node);
      else tabs.current.delete(id);
    },
    role: 'tab' as const,
    tabIndex: id === value ? 0 : -1,
    'aria-selected': id === value,
    onClick: () => onChange(id),
    onKeyDown,
  });

  return {getTabProps};
}
