'use client';

import { ArrowLeft, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ShoppingEntryDialog } from '../../components/shopping/ShoppingEntryDialog';
import { ShoppingGroups } from '../../components/shopping/ShoppingGroups';
import { Button, ButtonLink, EmptyState, ItemRowSkeleton, Toast } from '../../components/ui';
import { usePantry } from '../../hooks/usePantry';

export default function ShoppingPage() {
  const {
    ready,
    lines,
    addOneOff,
    editEntry,
    setEntryAmount,
    stepEntryAmount,
    toggleBought,
    clearBought,
    undoNotice,
    undoLast,
    dismissUndo,
  } = usePantry();
  const [adding, setAdding] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const boughtCount = lines.filter((line) => line.bought).length;
  const allBought = lines.length > 0 && boughtCount === lines.length;

  return (
    <div ref={pageRef} className="shop" tabIndex={-1}>
      <header className="shop-bar">
        <div className="shop-bar__row">
          <Link className="shop-bar__back" href="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Pantry
          </Link>
          <h1 className="shop-bar__title">Shopping</h1>
          <p className="shop-bar__count">
            {ready ? `${boughtCount} of ${lines.length} bought` : ''}
          </p>
        </div>
        <progress
          className="shop-bar__progress"
          aria-label="Items bought"
          value={boughtCount}
          max={Math.max(1, lines.length)}
        />
      </header>

      <main className="shop-list">
        {!ready ? (
          <ItemRowSkeleton rows={6} label="Loading your shopping list" />
        ) : lines.length === 0 ? (
          <EmptyState icon={<ShoppingBag size={22} />} title="Nothing to buy">
            Your list is empty. Add a one-off item below, or head back and add from your pantry.
          </EmptyState>
        ) : (
          <ShoppingGroups
            lines={lines}
            headingAs="h2"
            onToggleBought={toggleBought}
            onStepAmount={stepEntryAmount}
            onSetAmount={setEntryAmount}
          />
        )}
      </main>

      {/* At the bottom of the screen, within reach of the hand holding the phone. */}
      <div className="shop-actions">
        <Button
          variant="outline"
          size="lg"
          className="shop-actions__button"
          leadingIcon={<Plus size={18} />}
          onClick={() => setAdding(true)}
        >
          Add item
        </Button>
        {boughtCount > 0 ? (
          <Button
            variant={allBought ? 'primary' : 'secondary'}
            size="lg"
            className="shop-actions__button"
            onClick={clearBought}
          >
            Clear {boughtCount} bought
          </Button>
        ) : ready && lines.length === 0 ? (
          <ButtonLink href="/" variant="secondary" size="lg" className="shop-actions__button">
            Back to pantry
          </ButtonLink>
        ) : null}
      </div>

      <ShoppingEntryDialog
        target={adding ? {mode: 'add'} : null}
        onAdd={addOneOff}
        onEdit={editEntry}
        onClose={() => setAdding(false)}
      />
      <Toast
        message={undoNotice?.message ?? null}
        updateKey={undoNotice?.seq}
        actionLabel="Undo"
        onAction={undoLast}
        onDismiss={dismissUndo}
        focusAction={undoNotice?.isRemoval}
        returnFocusRef={pageRef}
      />
    </div>
  );
}
