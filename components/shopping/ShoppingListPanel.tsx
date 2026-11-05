import { Pencil, Plus, Share2, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { EntryEdit, OneOffDetails, ShoppingLine } from '../../lib/shopping';
import { Button, ButtonLink, EmptyState, ItemRowSkeleton } from '../ui';
import { ShoppingEntryDialog, type ShoppingEntryTarget } from './ShoppingEntryDialog';
import { ShoppingGroups } from './ShoppingGroups';

export type ShoppingListPanelProps = {
  ready: boolean;
  lines: ShoppingLine[];
  onExport: () => void;
  onAddOneOff: (details: OneOffDetails) => void;
  onEdit: (id: string, edit: EntryEdit) => void;
  onRemove: (id: string) => void;
  onToggleBought: (id: string) => void;
  onStepAmount: (id: string, direction: 1 | -1) => void;
  onSetAmount: (id: string, amount: number) => void;
  onClearBought: () => void;
};

/** The shopping list on the home page, for planning. `/shopping` is the version for the store. */
export function ShoppingListPanel({
  ready,
  lines,
  onExport,
  onAddOneOff,
  onEdit,
  onRemove,
  onToggleBought,
  onStepAmount,
  onSetAmount,
  onClearBought,
}: ShoppingListPanelProps) {
  const [target, setTarget] = useState<ShoppingEntryTarget | null>(null);
  const boughtCount = lines.filter((line) => line.bought).length;
  const toBuyCount = lines.length - boughtCount;

  if (!ready) return <ItemRowSkeleton rows={3} label="Loading your shopping list" />;

  return (
    <>
      <div className="shopping-toolbar">
        {lines.length > 0 ? (
          <ButtonLink href="/shopping" leadingIcon={<ShoppingCart size={16} />}>
            Start shopping
          </ButtonLink>
        ) : null}
        <Button
          variant="outline"
          leadingIcon={<Plus size={16} />}
          onClick={() => setTarget({mode: 'add'})}
        >
          Add one-off item
        </Button>
        {lines.length > 0 ? (
          <Button
            variant="outline"
            leadingIcon={<Share2 size={16} />}
            disabled={toBuyCount === 0}
            onClick={onExport}
          >
            Export
          </Button>
        ) : null}
        {boughtCount > 0 ? (
          <Button variant="ghost" onClick={onClearBought}>
            Clear {boughtCount} bought
          </Button>
        ) : null}
      </div>
      {lines.length === 0 ? (
        <EmptyState icon={<ShoppingBag size={22} />} title="Your shopping list is empty">
          Add a recommended item above, turn on auto-add, or add a one-off item.
        </EmptyState>
      ) : (
        <>
          <p className="caption shopping-hint">
            Suggested amounts get you back to your reorder level plus about a week of use. Checking
            an item off adds it to your pantry.
          </p>
          <ShoppingGroups
            lines={lines}
            onToggleBought={onToggleBought}
            onStepAmount={onStepAmount}
            onSetAmount={onSetAmount}
            rowActions={(line) => (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="icon-button"
                  aria-label={`Edit ${line.name}`}
                  leadingIcon={<Pencil size={16} />}
                  onClick={() => setTarget({mode: 'edit', line})}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="icon-button"
                  aria-label={`Remove ${line.name} from list`}
                  leadingIcon={<Trash2 size={16} />}
                  onClick={() => onRemove(line.id)}
                />
              </>
            )}
          />
        </>
      )}
      <ShoppingEntryDialog
        target={target}
        onAdd={onAddOneOff}
        onEdit={onEdit}
        onClose={() => setTarget(null)}
      />
    </>
  );
}
