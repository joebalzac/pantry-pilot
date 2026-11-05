'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { formatCompact, formatCount, formatQuantity } from '../../lib/format';
import { CategoryGlyph } from '../CategoryGlyph';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Chip,
  ChipGroup,
  ItemList,
  ItemRow,
  Stat,
  StatRow,
  Stepper,
  TabPanel,
  Tabs,
} from '../ui';

const LONG_TITLE = 'Weekly household inventory across every kitchen, garage freezer and vacation-home pantry location';
const LONG_NAME =
  'Riverbend Farms Organic Cold-Pressed Extra-Virgin Olive Oil with Lemon and Rosemary, Family Reserve, Limited Regional Availability, Resealable Tin';
const UNBROKEN_SKU = 'SKU8842991002771638842991002771638842991002771638842991002771638842991002';
const LONG_BADGE = 'Recalled by manufacturer, check lot number before using this product';
const LONG_UNIT = 'individually-wrapped multipack cartons';
const RTL_NAME = 'زيت الزيتون البكر الممتاز من مزارع العائلة في الجنوب 🫒👨‍👩‍👧‍👦';
const HUGE_COUNT = 1_234_567_890_123;

const MIN_WIDTH = 280;
const MAX_WIDTH = 1000;

/** The rendered extent of an element's text, leaving out text it deliberately truncates. */
function visibleTextBox(element: HTMLElement) {
  if (getComputedStyle(element).overflowX !== 'visible') {
    const {left, right} = element.getBoundingClientRect();
    return {left, right};
  }
  let left = Infinity;
  let right = -Infinity;
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const parent = walker.currentNode.parentElement;
    if (parent && parent !== element && getComputedStyle(parent).overflowX !== 'visible') {
      const box = parent.getBoundingClientRect();
      left = Math.min(left, box.left);
      right = Math.max(right, box.right);
      continue;
    }
    range.selectNodeContents(walker.currentNode);
    const box = range.getBoundingClientRect();
    left = Math.min(left, box.left);
    right = Math.max(right, box.right);
  }
  return {left, right};
}

/** Finds text that escapes the box that should contain it, which is what a person sees as broken. */
function countEscapes(root: HTMLElement) {
  let count = 0;
  let worst = 0;
  root
    .querySelectorAll<HTMLElement>(
      '.item-row__title, .item-row__meta, .item-row__qty, .item-row__actions, .badge__label, .chip__label, .stat__label, .stat__value, .card__title',
    )
    .forEach((element) => {
      const boundary = element.parentElement?.closest('.item-row__body, .stat-row, .card');
      if (!boundary) return;
      const limit = boundary.getBoundingClientRect();
      const box = visibleTextBox(element);
      const excess = Math.max(box.right - limit.right, limit.left - box.left);
      if (excess > 1) {
        count += 1;
        worst = Math.max(worst, Math.round(excess));
      }
    });
  return {count, worst};
}

export function LongTextLab() {
  const [mode, setMode] = useState<'hardened' | 'original'>('original');
  const [width, setWidth] = useState(MAX_WIDTH);
  const [escapes, setEscapes] = useState({count: 0, worst: 0});
  const frameRef = useRef<HTMLDivElement>(null);
  const tabsId = useId();
  const hardened = mode === 'hardened';

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setEscapes(countEscapes(frame));
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    // Web fonts change text metrics after first paint.
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [mode]);

  return (
    <div>
      <div className="prod-stress-controls">
        <Tabs
          label="CSS version"
          idBase={tabsId}
          value={mode}
          onChange={setMode}
          options={[
            {id: 'original', label: 'Prototype CSS'},
            {id: 'hardened', label: 'Hardened CSS'},
          ]}
        />
        <label className="prod-range">
          <span className="caption">Container width: {width}px</span>
          <input
            type="range"
            min={MIN_WIDTH}
            max={MAX_WIDTH}
            step={10}
            value={width}
            onChange={(event) => setWidth(Number(event.target.value))}
          />
        </label>
        <p className="prod-escapes" data-clean={escapes.count === 0} role="status">
          {escapes.count === 0
            ? '0 text escapes detected'
            : `${escapes.count} text ${escapes.count === 1 ? 'escape' : 'escapes'}, worst ${escapes.worst}px`}
        </p>
      </div>

      <TabPanel
        idBase={tabsId}
        tabId={mode}
        ref={frameRef}
        className="prod-stress"
        data-hardening={hardened ? 'on' : 'off'}
        style={{maxWidth: width}}
      >
        <StatRow>
          <Stat label="Tracked locations" value={3} />
          <Stat label="Restock suggestions" value={42} />
          <Stat
            label="Units across all households"
            value={hardened ? formatCompact(HUGE_COUNT) : formatCount(HUGE_COUNT)}
          />
        </StatRow>

        <Card>
          <CardHeader eyebrow="Real components, hostile data" title={LONG_TITLE} />
          <ChipGroup label="Example filters">
            <Chip selected title="All">All</Chip>
            <Chip title="Seasonal and regional specialty imports from participating family farms">
              Seasonal and regional specialty imports from participating family farms
            </Chip>
          </ChipGroup>
          <ItemList>
            <ItemRow
              icon={<CategoryGlyph category="pantry" icon="oil" />}
              title={LONG_NAME}
              meta={
                <>
                  <Badge tone="danger" title={LONG_BADGE}>{LONG_BADGE}</Badge>
                  ~3 days remaining
                </>
              }
              quantity={`2 ${LONG_UNIT}`}
              actions={<Button size="sm">Add to list</Button>}
            />
            <ItemRow
              icon={<CategoryGlyph category="dairy" icon="milk" />}
              title={UNBROKEN_SKU}
              meta="A pasted SKU has no spaces for the browser to wrap at"
              quantity={hardened ? formatQuantity(987654321.123, 'gallons') : '987654321.123 gallons'}
              actions={
                <Stepper
                  label="Example item quantity"
                  decreaseLabel="Decrease example item"
                  increaseLabel="Increase example item"
                  onDecrease={() => undefined}
                  onIncrease={() => undefined}
                />
              }
            />
            <ItemRow
              icon={<CategoryGlyph category="pantry" icon="grain" />}
              title={RTL_NAME}
              meta="Right-to-left text and multi-part emoji"
              quantity="4 cups"
              actions={<Button size="sm" variant="secondary">Add to list</Button>}
            />
          </ItemList>
        </Card>
      </TabPanel>
    </div>
  );
}
