'use client';

import { Check, Pencil, Plus, Search, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { CategoryGlyph } from '../components/CategoryGlyph';
import { FoodIcon } from '../components/icons/FoodIcon';
import { ItemFormDialog, type ItemFormTarget } from '../components/ItemFormDialog';
import { QuantityInput } from '../components/QuantityInput';
import { ShoppingExportDialog, ShoppingPrintSheet } from '../components/shopping/ShoppingExport';
import { ShoppingListPanel } from '../components/shopping/ShoppingListPanel';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Chip,
  ChipGroup,
  EmptyState,
  ItemList,
  ItemRow,
  ItemRowSkeleton,
  SelectField,
  Stamp,
  Stat,
  StatRow,
  Stepper,
  TabPanel,
  Tabs,
  TextField,
  Toast,
} from '../components/ui';
import { usePantry } from '../hooks/usePantry';
import { CATEGORY_LIST } from '../lib/categories';
import { formatDaysAgo, formatDaysLeft, formatQuantity } from '../lib/format';
import {
  categoryLabel,
  daysRemaining,
  displayQuantity,
  filterItems,
  sortItems,
  type CategoryFilter,
  type PantryItem,
  type RecommendationKind,
  type SortKey,
} from '../lib/pantry';
import type { BadgeTone } from '../lib/tokens';

type InventoryTab = 'pantry' | 'list';

const RECOMMENDATION_BADGE: Record<RecommendationKind, {tone: BadgeTone; label: string}> = {
  'below-threshold': {tone: 'warning', label: 'Restock'},
  'running-out': {tone: 'danger', label: 'Soon'},
};

const SORT_OPTIONS: {id: SortKey; label: string}[] = [
  {id: 'department', label: 'Sort by department'},
  {id: 'name', label: 'Sort by name'},
  {id: 'days-left', label: 'Sort by days left'},
];

function pantryMeta(item: PantryItem, now: number): string {
  const summary = `${categoryLabel(item.category)} · ${formatDaysLeft(daysRemaining(item, now))}`;
  if (displayQuantity(item, now) === item.quantity) return summary;
  const counted = formatQuantity(item.quantity, item.unit);
  const elapsed = formatDaysAgo(now - Date.parse(item.lastUpdated));
  return `${summary} · estimated from ${counted} counted ${elapsed}`;
}

export default function Home() {
  const {
    ready,
    now,
    items,
    recommendations,
    lines,
    autoAdd,
    setAutoAdd,
    undoNotice,
    undoLast,
    dismissUndo,
    isOnList,
    addToList,
    addOneOff,
    removeFromList,
    editEntry,
    setEntryAmount,
    stepEntryAmount,
    toggleBought,
    clearBought,
    addItem,
    editItem,
    removeItem,
    setQuantity,
    stepQuantity,
  } = usePantry();
  const [tab, setTab] = useState<InventoryTab>('pantry');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortKey>('department');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [formTarget, setFormTarget] = useState<ItemFormTarget | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const inventoryRef = useRef<HTMLDivElement>(null);
  const tabsId = useId();

  const visible = sortItems(filterItems(items, {query, category, lowStockOnly, now}), sort, now);
  const count = (value: number) => (ready ? value : '–');
  const toBuy = lines.filter((line) => !line.bought);

  return (
    <>
      <AppHeader current="home" />
      <main className="shell">
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">Your household, one step ahead</p>
            <h1 className="heading-xl">
              Never run out of
              <br />
              <em>the essentials.</em>
            </h1>
            <p className="body-lg">
              Track what you have, anticipate what you need, and build your next grocery list
              automatically — with the freshness of a market run.
            </p>
          </div>
          <Stamp
            value={count(recommendations.length)}
            label={<>items need<br />attention</>}
          />
        </section>

        <div className="stack">
          <StatRow>
            <Stat label="In your pantry" value={count(items.length)} />
            <Stat label="Restock suggestions" value={count(recommendations.length)} />
            <Stat label="On shopping list" value={count(toBuy.length)} />
          </StatRow>

          <Card>
            <CardHeader
              eyebrow="Smart replenishment"
              title="Running low"
              action={
                <div className="card__header-actions">
                  <span className="caption">Based on thresholds & estimated daily use</span>
                  <Chip selected={autoAdd} onClick={() => setAutoAdd(!autoAdd)}>
                    Auto-add to list
                  </Chip>
                </div>
              }
            />
            {!ready ? (
              <ItemRowSkeleton rows={3} label="Loading restock suggestions" />
            ) : recommendations.length === 0 ? (
              <EmptyState
                icon={<Sparkles size={22} />}
                title={items.length === 0 ? 'Nothing to track yet' : 'All stocked up'}
              >
                {items.length === 0
                  ? 'Add items to your pantry to get restock suggestions.'
                  : 'Your pantry is looking good. Nothing needs attention right now.'}
              </EmptyState>
            ) : (
              <ItemList>
                {recommendations.map(({item, daysLeft, kind}) => {
                  const added = isOnList(item.id);
                  const badge = RECOMMENDATION_BADGE[kind];
                  return (
                    <ItemRow
                      key={item.id}
                      icon={<CategoryGlyph category={item.category} icon={item.icon} />}
                      title={item.name}
                      meta={
                        <>
                          <Badge tone={badge.tone}>{badge.label}</Badge>
                          {formatDaysLeft(daysLeft)}
                        </>
                      }
                      actions={
                        <Button
                          variant={added ? 'secondary' : 'primary'}
                          size="sm"
                          disabled={added}
                          leadingIcon={added ? <Check size={14} /> : undefined}
                          onClick={() => addToList(item.id)}
                        >
                          {added ? 'Added' : 'Add to list'}
                        </Button>
                      }
                    />
                  );
                })}
              </ItemList>
            )}
          </Card>

          <Card>
            <CardHeader
              eyebrow="Inventory management"
              title="Your household"
              action={
                <Tabs
                  label="Inventory views"
                  idBase={tabsId}
                  value={tab}
                  onChange={setTab}
                  options={[
                    {id: 'pantry', label: 'Pantry'},
                    {id: 'list', label: `Shopping list (${toBuy.length})`},
                  ]}
                />
              }
            />

            <div ref={inventoryRef} className="inventory-body" tabIndex={-1}>
              {tab === 'pantry' ? (
                <TabPanel idBase={tabsId} tabId="pantry">
                  <div className="inventory-toolbar">
                    <TextField
                      label="Search pantry items"
                      hideLabel
                      type="search"
                      placeholder="Search your pantry…"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      leadingIcon={<Search size={18} />}
                    />
                    <ChipGroup label="Filter by department">
                      <Chip selected={category === 'all'} onClick={() => setCategory('all')}>
                        All
                      </Chip>
                      {CATEGORY_LIST.map((meta) => (
                        <Chip
                          key={meta.id}
                          category={meta.id}
                          selected={category === meta.id}
                          leading={<FoodIcon name={meta.icon} size="sm" />}
                          onClick={() => setCategory(meta.id)}
                        >
                          {meta.label}
                        </Chip>
                      ))}
                    </ChipGroup>
                    <div className="inventory-toolbar__row">
                      <div className="inventory-toolbar__sort">
                        <SelectField
                          label="Sort pantry items"
                          hideLabel
                          value={sort}
                          onChange={(event) => setSort(event.target.value as SortKey)}
                        >
                          {SORT_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </SelectField>
                      </div>
                      <Chip selected={lowStockOnly} onClick={() => setLowStockOnly((on) => !on)}>
                        Low stock only ({count(recommendations.length)})
                      </Chip>
                      <Button
                        className="inventory-toolbar__add"
                        leadingIcon={<Plus size={16} />}
                        onClick={() => setFormTarget({mode: 'add'})}
                      >
                        Add item
                      </Button>
                    </div>
                  </div>
                  {!ready ? (
                    <ItemRowSkeleton rows={6} label="Loading your pantry" />
                  ) : items.length === 0 ? (
                    <EmptyState icon={<ShoppingBag size={22} />} title="Your pantry is empty">
                      Add your first item to start tracking what you have.
                    </EmptyState>
                  ) : visible.length === 0 ? (
                    <EmptyState icon={<Search size={22} />} title="No items match">
                      Try a different search or filter.
                    </EmptyState>
                  ) : (
                    <ItemList>
                      {visible.map((item) => (
                        <ItemRow
                          key={item.id}
                          icon={<CategoryGlyph category={item.category} icon={item.icon} />}
                          title={item.name}
                          meta={pantryMeta(item, now)}
                          quantity={item.unit}
                          actions={
                            <>
                              <Stepper
                                label={`${item.name} quantity`}
                                decreaseLabel={`Decrease ${item.name}`}
                                increaseLabel={`Increase ${item.name}`}
                                onDecrease={() => stepQuantity(item.id, -1)}
                                onIncrease={() => stepQuantity(item.id, 1)}
                              >
                                <QuantityInput
                                  label={`${item.name} amount in ${item.unit}`}
                                  value={displayQuantity(item, now)}
                                  onCommit={(value) => setQuantity(item.id, value)}
                                />
                              </Stepper>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="icon-button"
                                aria-label={`Edit ${item.name}`}
                                leadingIcon={<Pencil size={16} />}
                                onClick={() => setFormTarget({mode: 'edit', item})}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="icon-button"
                                aria-label={`Delete ${item.name}`}
                                leadingIcon={<Trash2 size={16} />}
                                onClick={() => removeItem(item.id)}
                              />
                            </>
                          }
                        />
                      ))}
                    </ItemList>
                  )}
                </TabPanel>
              ) : (
                <TabPanel idBase={tabsId} tabId="list">
                  <ShoppingListPanel
                    ready={ready}
                    lines={lines}
                    onExport={() => setExportOpen(true)}
                    onAddOneOff={addOneOff}
                    onEdit={editEntry}
                    onRemove={removeFromList}
                    onToggleBought={toggleBought}
                    onStepAmount={stepEntryAmount}
                    onSetAmount={setEntryAmount}
                    onClearBought={clearBought}
                  />
                  <p className="disclaimer">
                    Cart integration is not connected. This is a local shopping list only.
                  </p>
                </TabPanel>
              )}
            </div>
          </Card>
        </div>
      </main>
      <ItemFormDialog
        target={formTarget}
        onAdd={addItem}
        onEdit={editItem}
        onClose={() => setFormTarget(null)}
      />
      <ShoppingExportDialog open={exportOpen} lines={toBuy} onClose={() => setExportOpen(false)} />
      <ShoppingPrintSheet lines={toBuy} />
      <Toast
        message={undoNotice?.message ?? null}
        updateKey={undoNotice?.seq}
        actionLabel="Undo"
        onAction={undoLast}
        onDismiss={dismissUndo}
        focusAction={undoNotice?.isRemoval}
        returnFocusRef={inventoryRef}
      />
      <footer className="site-footer">
        PantryPilot · Prototype v0.1 · Data stays in this browser
        <br />
        Visual language inspired by Whole Foods Market · Not affiliated
      </footer>
    </>
  );
}
