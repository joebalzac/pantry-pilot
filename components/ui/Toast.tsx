'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Button } from './Button';

const DEFAULT_DURATION_MS = 6000;

export type ToastProps = {
  /** The toast shows while this is set. */
  message: string | null;
  /** Change it to restart the timer when a new change replaces the message. */
  updateKey?: number;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  /**
   * Moves focus to the action when the toast appears. Use it when the change removed
   * the control that had focus, so keyboard users aren't left at the top of the page.
   */
  focusAction?: boolean;
  /** Receives focus when the toast closes while it holds focus. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  durationMs?: number;
};

/** The live region stays mounted, because screen readers can miss one added with its content. */
export function Toast({message, ...props}: ToastProps) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {message ? <ToastCard message={message} {...props} /> : null}
    </div>
  );
}

function ToastCard({
  message,
  updateKey,
  actionLabel,
  onAction,
  onDismiss,
  focusAction = false,
  returnFocusRef,
  durationMs = DEFAULT_DURATION_MS,
}: Omit<ToastProps, 'message'> & {message: string}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [paused, updateKey, durationMs, onDismiss]);

  useEffect(() => {
    if (focusAction) actionRef.current?.focus();
  }, [focusAction, updateKey]);

  const close = (handler: () => void) => {
    if (cardRef.current?.contains(document.activeElement)) returnFocusRef?.current?.focus();
    handler();
  };

  return (
    <div
      ref={cardRef}
      className="toast"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Only visible focus pauses: focus moved here after a mouse click must not hold the toast open.
      onFocus={(event) => setFocused(event.target.matches(':focus-visible'))}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close(onDismiss);
      }}
    >
      <span className="toast__message">{message}</span>
      <Button ref={actionRef} variant="secondary" size="sm" onClick={() => close(onAction)}>
        {actionLabel}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="icon-button"
        aria-label="Dismiss"
        leadingIcon={<X size={16} />}
        onClick={() => close(onDismiss)}
      />
    </div>
  );
}
