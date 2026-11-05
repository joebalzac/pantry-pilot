'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

export type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * A modal built on native <dialog>, which provides the focus trap, Escape to close,
 * an inert background, and returning focus to the trigger on close.
 */
export function Dialog({open, title, onClose, children}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="dialog" aria-labelledby={titleId} onClose={onClose}>
      {open ? (
        <>
          <h2 id={titleId} className="dialog__title heading-lg">
            {title}
          </h2>
          {children}
        </>
      ) : null}
    </dialog>
  );
}
