import { useId, useRef, useState } from 'react';
import {
  formatLineAmount,
  formatShoppingText,
  groupByDepartment,
  type ShoppingLine,
} from '../../lib/shopping';
import { Button, Dialog } from '../ui';

const SHARE_TITLE = 'Shopping list';

export type ShoppingExportDialogProps = {
  open: boolean;
  /** What's still to buy. */
  lines: ShoppingLine[];
  onClose: () => void;
};

export function ShoppingExportDialog({open, lines, onClose}: ShoppingExportDialogProps) {
  return (
    <Dialog open={open} title="Export your list" onClose={onClose}>
      {open ? <ExportBody lines={lines} onClose={onClose} /> : null}
    </Dialog>
  );
}

function printList() {
  const root = document.documentElement;
  root.dataset.print = 'shopping-list';
  window.addEventListener('afterprint', () => delete root.dataset.print, {once: true});
  window.print();
}

function ExportBody({lines, onClose}: {lines: ShoppingLine[]; onClose: () => void}) {
  const textId = useId();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState('');
  const text = formatShoppingText(lines);
  const canShare = typeof navigator.share === 'function';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied to your clipboard.');
    } catch {
      // The API is missing outside secure contexts, and can be blocked inside them.
      textRef.current?.select();
      setStatus('Your browser blocked copying. The text above is selected, so copy it from there.');
    }
  };

  const share = async () => {
    try {
      await navigator.share({title: SHARE_TITLE, text});
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === 'AbortError';
      if (!cancelled) setStatus('Sharing didn’t work on this device. Copy the list instead.');
    }
  };

  return (
    <div className="item-form">
      <div className="field-root">
        <label htmlFor={textId} className="field-label">
          Items still to buy
        </label>
        <textarea
          id={textId}
          ref={textRef}
          className="field export-text"
          readOnly
          rows={Math.min(14, text.split('\n').length)}
          value={text}
        />
        <p className="field-message" role="status">
          {status}
        </p>
      </div>
      <div className="export-actions">
        <Button onClick={copy}>Copy</Button>
        <Button variant="outline" onClick={printList}>
          Print
        </Button>
        {canShare ? (
          <Button variant="outline" onClick={share}>
            Share
          </Button>
        ) : null}
        <Button variant="ghost" className="export-actions__close" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

/**
 * Only the print stylesheet shows this. It must be a direct child of <body>, because that
 * stylesheet hides the body's other children for the print job.
 */
export function ShoppingPrintSheet({lines}: {lines: ShoppingLine[]}) {
  return (
    <div className="print-sheet">
      <h1>{SHARE_TITLE}</h1>
      {groupByDepartment(lines).map(({category, label, lines: inDepartment}) => (
        <section key={category}>
          <h2>{label}</h2>
          <ul>
            {inDepartment.map((line) => (
              <li key={line.id}>
                <span>
                  {line.name}: {formatLineAmount(line)}
                  {line.note ? ` (${line.note})` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
