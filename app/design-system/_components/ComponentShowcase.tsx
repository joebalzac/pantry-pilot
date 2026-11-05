'use client';

import { Search } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { CategoryGlyph } from '../../../components/CategoryGlyph';
import { FoodIcon } from '../../../components/icons/FoodIcon';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Chip,
  ChipGroup,
  Dialog,
  EmptyState,
  ItemList,
  ItemRow,
  SelectField,
  Stamp,
  Stat,
  StatRow,
  Stepper,
  TabPanel,
  Tabs,
  TextField,
  Toast,
} from '../../../components/ui';
import { CATEGORY_LIST } from '../../../lib/categories';
import { FOOD_ICON_CATEGORY, FOOD_ICON_NAMES } from '../../../lib/foodIcons';
import type { CategoryFilter } from '../../../lib/pantry';
import {
  BADGE_TONES,
  BUTTON_VARIANTS,
  CARD_PADDINGS,
  CONTROL_SIZES,
} from '../../../lib/tokens';

type DemoTab = 'pantry' | 'cart';

const DEMO_TABS = [
  {id: 'pantry', label: 'Pantry'},
  {id: 'cart', label: 'Shopping list'},
] as const;

const DEMO_TAB_COPY: Record<DemoTab, string> = {
  pantry: 'Pantry panel. Use the arrow, Home and End keys to switch tabs.',
  cart: 'Shopping list panel. The panel is labelled by its tab.',
};

const noop = () => undefined;

export function ComponentShowcase() {
  const [tab, setTab] = useState<DemoTab>('pantry');
  const [chip, setChip] = useState<CategoryFilter>('all');
  const [qty, setQty] = useState(2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const tabsId = useId();

  const hideToast = useCallback(() => setToastShown(false), []);

  return (
    <>
      <h3 className="ds-subheading">Button</h3>
      {CONTROL_SIZES.map((size) => (
        <div key={size} className="ds-row">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
          <Button variant="primary" size={size} disabled>
            disabled
          </Button>
        </div>
      ))}

      <h3 className="ds-subheading">Badge</h3>
      <div className="ds-row">
        {BADGE_TONES.map((tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
      </div>

      <h3 className="ds-subheading">Chip</h3>
      <ChipGroup label="Example department filter">
        <Chip selected={chip === 'all'} onClick={() => setChip('all')}>
          All
        </Chip>
        {CATEGORY_LIST.map((meta) => (
          <Chip
            key={meta.id}
            category={meta.id}
            selected={chip === meta.id}
            leading={<FoodIcon name={meta.icon} size="sm" />}
            onClick={() => setChip(meta.id)}
          >
            {meta.label}
          </Chip>
        ))}
      </ChipGroup>

      <h3 className="ds-subheading">Tabs, field, stepper</h3>
      <div className="ds-row">
        <Tabs label="Example tabs" idBase={tabsId} value={tab} onChange={setTab} options={DEMO_TABS} />
        <Stepper
          label="Example quantity"
          decreaseLabel="Decrease example"
          increaseLabel="Increase example"
          onDecrease={() => setQty((value) => Math.max(0, value - 1))}
          onIncrease={() => setQty((value) => value + 1)}
        />
        <span className="caption">{qty} items</span>
      </div>
      <TabPanel className="ds-row caption" idBase={tabsId} tabId={tab}>
        {DEMO_TAB_COPY[tab]}
      </TabPanel>
      <div className="ds-field-stack">
        <TextField label="Visible label" placeholder="Search your pantry…" />
        <TextField
          label="Hidden label with icon"
          hideLabel
          type="search"
          placeholder="Search your pantry…"
          leadingIcon={<Search size={18} />}
        />
        <TextField label="With a hint" hint="How much you use per day." />
        <TextField label="With an error" defaultValue="lots" error="Enter a number, like 2, 0.5 or 1/2." />
        <SelectField label="Select">
          {CATEGORY_LIST.map((meta) => (
            <option key={meta.id}>{meta.label}</option>
          ))}
        </SelectField>
      </div>

      <h3 className="ds-subheading">Dialog and toast</h3>
      <div className="ds-row">
        <Button variant="outline" onClick={() => setDialogOpen(true)}>
          Open dialog
        </Button>
        <Button variant="outline" onClick={() => setToastShown(true)}>
          Show toast
        </Button>
      </div>
      <Dialog open={dialogOpen} title="Example dialog" onClose={() => setDialogOpen(false)}>
        <p className="caption">Traps focus, closes on Escape, and returns focus to its trigger.</p>
        <div className="item-form__actions">
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </div>
      </Dialog>
      <Toast
        message={toastShown ? 'Removed Whole Milk from your pantry' : null}
        actionLabel="Undo"
        onAction={hideToast}
        onDismiss={hideToast}
      />

      <h3 className="ds-subheading">Card padding</h3>
      <div className="ds-row ds-row--top">
        {CARD_PADDINGS.map((padding) => (
          <Card key={padding} as="div" padding={padding} className="caption">
            padding {padding}
          </Card>
        ))}
      </div>

      <h3 className="ds-subheading">Icon well size</h3>
      <div className="ds-row">
        {CONTROL_SIZES.map((size) => (
          <CategoryGlyph key={size} category="produce" icon="apple" size={size} />
        ))}
      </div>

      <h3 className="ds-subheading">Card, stats, stamp</h3>
      <StatRow>
        <Stat label="In your pantry" value={16} />
        <Stat label="Restock suggestions" value={8} />
        <Stat label="On shopping list" value={qty} />
      </StatRow>
      <div className="ds-row ds-row--spaced">
        <Stamp value={8} label={<>items need<br />attention</>} />
        <Card padding="md" className="ds-fill">
          <CardHeader eyebrow="Smart replenishment" title="Running low" titleAs="h4" />
          <ItemList>
            <ItemRow
              icon={<CategoryGlyph category="dairy" icon="milk" />}
              title="Whole Milk"
              meta={
                <>
                  <Badge tone="warning">Restock</Badge>
                  ~3 days remaining
                </>
              }
              actions={
                <Button variant="primary" size="sm">
                  Add to list
                </Button>
              }
            />
            <ItemRow
              icon={<CategoryGlyph category="produce" icon="apple" />}
              title="Honeycrisp Apples"
              meta="Produce · 8 days estimated"
              quantity="5 apples"
              actions={
                <Stepper
                  label="Honeycrisp Apples quantity"
                  decreaseLabel="Decrease apples"
                  increaseLabel="Increase apples"
                  onDecrease={noop}
                  onIncrease={noop}
                />
              }
            />
          </ItemList>
        </Card>
      </div>

      <h3 className="ds-subheading">Food icons</h3>
      <ul className="ds-icon-grid">
        {FOOD_ICON_NAMES.map((name) => (
          <li key={name} className="ds-icon-cell">
            <CategoryGlyph category={FOOD_ICON_CATEGORY[name]} icon={name} />
            {name}
          </li>
        ))}
      </ul>

      <EmptyState icon={<Search size={22} />} title="No items match">
        Empty states use the same semantic feedback colors and type roles.
      </EmptyState>
    </>
  );
}
