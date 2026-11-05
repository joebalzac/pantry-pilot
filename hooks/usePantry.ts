import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { formatQuantity } from '../lib/format';
import {
  applyItemEdit,
  createItem,
  displayQuantity,
  hydrateInventory,
  initialItems,
  recommend,
  type ItemDetails,
  type PantryItem,
} from '../lib/pantry';
import { nextQuantity, stepForUnit } from '../lib/quantity';
import {
  applyEntryEdit,
  createOneOffEntry,
  createPantryEntry,
  hydrateShoppingList,
  lineAmountAfterStep,
  restockItem,
  revertRestock,
  shoppingLines,
  suggestedAmount,
  syncAutoAdd,
  type EntryEdit,
  type OneOffDetails,
  type ShoppingEntry,
} from '../lib/shopping';

const STORAGE_KEY = 'pantrypilot:v1';
const CLOCK_TICK_MS = 60_000;

/**
 * Undo reverses only the change it describes, not the whole state, so it can't
 * discard an item added or edited while the toast was showing.
 */
type UndoAction =
  | {kind: 'quantity'; id: string; quantity: number; lastUpdated: string}
  | {kind: 'item'; item: PantryItem; index: number; removedEntry: RemovedEntry | null}
  | {kind: 'list'; removed: RemovedEntry[]};

type RemovedEntry = {entry: ShoppingEntry; index: number};

type UndoEntry = {message: string; action: UndoAction};

type PantryState = {
  items: PantryItem[];
  list: ShoppingEntry[];
  /** Optional: keep the list in step with what's running low. */
  autoAdd: boolean;
  /** Low items taken off the list, which auto-add must leave off until they recover. */
  autoDismissed: string[];
  undo: UndoEntry | null;
  /** Counts undoable changes, so a repeated change restarts the toast's timer. */
  undoSeq: number;
};

type PantryAction =
  | {type: 'hydrate'; items?: PantryItem[]; list: ShoppingEntry[]; autoAdd: boolean; autoDismissed: string[]}
  | {type: 'add'; item: PantryItem}
  | {type: 'edit'; id: string; details: ItemDetails; at: number}
  | {type: 'set-quantity'; id: string; quantity: number; at: number}
  | {type: 'step-quantity'; id: string; direction: 1 | -1; at: number}
  | {type: 'remove'; id: string}
  | {type: 'add-to-list'; id: string}
  | {type: 'add-one-off'; details: OneOffDetails; at: number}
  | {type: 'remove-from-list'; id: string}
  | {type: 'edit-entry'; id: string; edit: EntryEdit}
  | {type: 'set-entry-amount'; id: string; amount: number}
  | {type: 'step-entry-amount'; id: string; direction: 1 | -1; at: number}
  | {type: 'toggle-bought'; id: string; at: number}
  | {type: 'clear-bought'}
  | {type: 'set-auto-add'; enabled: boolean}
  | {type: 'sync-auto-add'; at: number}
  | {type: 'undo'}
  | {type: 'dismiss-undo'};

function withUndo(state: PantryState, changes: Partial<PantryState>, undo: UndoEntry): PantryState {
  return {...state, ...changes, undo, undoSeq: state.undoSeq + 1};
}

function insertAt<T>(list: T[], index: number, value: T): T[] {
  return [...list.slice(0, index), value, ...list.slice(index)];
}

function changeQuantity(state: PantryState, item: PantryItem, quantity: number, at: number): PantryState {
  if (quantity === displayQuantity(item, at)) return state;

  // Taps in a row share one undo, which returns to the value before the first tap.
  const previous = state.undo?.action;
  const action: UndoAction =
    previous?.kind === 'quantity' && previous.id === item.id
      ? previous
      : {kind: 'quantity', id: item.id, quantity: item.quantity, lastUpdated: item.lastUpdated};

  const updated = {...item, quantity, lastUpdated: new Date(at).toISOString()};
  return withUndo(
    state,
    {items: state.items.map((entry) => (entry.id === item.id ? updated : entry))},
    {message: `${item.name} set to ${formatQuantity(quantity, item.unit)}`, action},
  );
}

/** Removed entries stay off the list while auto-add is on. Undo takes them back out of `autoDismissed`. */
function removeEntries(state: PantryState, removed: RemovedEntry[]): Partial<PantryState> {
  const ids = removed.map(({entry}) => entry.id);
  return {
    list: state.list.filter((entry) => !ids.includes(entry.id)),
    autoDismissed: state.autoAdd ? [...state.autoDismissed, ...ids] : state.autoDismissed,
  };
}

function replaceEntry(state: PantryState, id: string, entry: ShoppingEntry): PantryState {
  return {...state, list: state.list.map((current) => (current.id === id ? entry : current))};
}

function setEntryAmount(state: PantryState, id: string, amount: number): PantryState {
  const entry = state.list.find((current) => current.id === id);
  if (!entry || entry.bought || amount <= 0) return state;
  return replaceEntry(state, id, {...entry, amount});
}

function toggleBought(state: PantryState, id: string, at: number): PantryState {
  const entry = state.list.find((current) => current.id === id);
  if (!entry) return state;
  if (entry.source === 'one-off') return replaceEntry(state, id, {...entry, bought: !entry.bought});

  const item = state.items.find((current) => current.id === id);
  if (!item) return state;

  const withItem = (updated: PantryItem): PantryItem[] =>
    state.items.map((current) => (current.id === id ? updated : current));
  // An open undo for this item's count would overwrite the restock, while the row still says bought.
  const pending = state.undo?.action;
  const undo = pending?.kind === 'quantity' && pending.id === id ? null : state.undo;

  if (entry.bought) {
    return {
      ...replaceEntry(state, id, {...entry, bought: null}),
      items: withItem(revertRestock(item, entry.bought)),
      undo,
    };
  }
  const amount = entry.amount ?? suggestedAmount(item, at);
  const {item: restocked, restock} = restockItem(item, amount, at);
  return {...replaceEntry(state, id, {...entry, bought: restock}), items: withItem(restocked), undo};
}

function applyUndo(state: PantryState, action: UndoAction): PantryState {
  switch (action.kind) {
    case 'quantity':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? {...item, quantity: action.quantity, lastUpdated: action.lastUpdated}
            : item,
        ),
      };
    case 'item':
      return {
        ...state,
        items: insertAt(state.items, action.index, action.item),
        list: action.removedEntry
          ? insertAt(state.list, action.removedEntry.index, action.removedEntry.entry)
          : state.list,
      };
    case 'list': {
      const ids = action.removed.map(({entry}) => entry.id);
      // Each entry was recorded at its index in the full list, so restore in ascending order.
      const list = action.removed.reduce(
        (current, {entry, index}) =>
          current.some(({id}) => id === entry.id) ? current : insertAt(current, index, entry),
        state.list,
      );
      return {...state, list, autoDismissed: state.autoDismissed.filter((id) => !ids.includes(id))};
    }
  }
}

function reducer(state: PantryState, action: PantryAction): PantryState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        items: action.items ?? state.items,
        list: action.list,
        autoAdd: action.autoAdd,
        autoDismissed: action.autoDismissed,
      };
    case 'add':
      return {...state, items: [...state.items, action.item]};
    case 'edit':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? applyItemEdit(item, action.details, action.at) : item,
        ),
      };
    case 'set-quantity': {
      const item = state.items.find((entry) => entry.id === action.id);
      return item ? changeQuantity(state, item, action.quantity, action.at) : state;
    }
    case 'step-quantity': {
      const item = state.items.find((entry) => entry.id === action.id);
      if (!item) return state;
      const quantity = nextQuantity(
        displayQuantity(item, action.at),
        stepForUnit(item.unit),
        action.direction,
      );
      return changeQuantity(state, item, quantity, action.at);
    }
    case 'remove': {
      const index = state.items.findIndex((entry) => entry.id === action.id);
      if (index === -1) return state;
      const item = state.items[index];
      const entryIndex = state.list.findIndex((entry) => entry.id === action.id);
      return withUndo(
        state,
        {
          items: state.items.filter((entry) => entry.id !== action.id),
          list: state.list.filter((entry) => entry.id !== action.id),
        },
        {
          message: `Removed ${item.name} from your pantry`,
          action: {
            kind: 'item',
            item,
            index,
            removedEntry: entryIndex === -1 ? null : {entry: state.list[entryIndex], index: entryIndex},
          },
        },
      );
    }
    case 'add-to-list':
      return state.list.some((entry) => entry.id === action.id)
        ? state
        : {
            ...state,
            list: [...state.list, createPantryEntry(action.id, 'you')],
            autoDismissed: state.autoDismissed.filter((id) => id !== action.id),
          };
    case 'add-one-off':
      return {...state, list: [...state.list, createOneOffEntry(action.details, action.at)]};
    case 'remove-from-list': {
      const index = state.list.findIndex((entry) => entry.id === action.id);
      if (index === -1) return state;
      const entry = state.list[index];
      const name =
        entry.source === 'one-off'
          ? entry.name
          : (state.items.find((item) => item.id === action.id)?.name ?? 'Item');
      const removed = [{entry, index}];
      return withUndo(state, removeEntries(state, removed), {
        message: `Removed ${name} from your shopping list`,
        action: {kind: 'list', removed},
      });
    }
    case 'edit-entry': {
      const entry = state.list.find((current) => current.id === action.id);
      return entry ? replaceEntry(state, action.id, applyEntryEdit(entry, action.edit)) : state;
    }
    case 'set-entry-amount':
      return setEntryAmount(state, action.id, action.amount);
    case 'step-entry-amount': {
      const line = shoppingLines(state.list, state.items, action.at).find(({id}) => id === action.id);
      return line ? setEntryAmount(state, action.id, lineAmountAfterStep(line, action.direction)) : state;
    }
    case 'toggle-bought':
      return toggleBought(state, action.id, action.at);
    case 'clear-bought': {
      const removed = state.list.flatMap((entry, index) => (entry.bought ? [{entry, index}] : []));
      if (removed.length === 0) return state;
      return withUndo(state, removeEntries(state, removed), {
        message: removed.length === 1 ? 'Cleared 1 bought item' : `Cleared ${removed.length} bought items`,
        action: {kind: 'list', removed},
      });
    }
    case 'set-auto-add':
      return {...state, autoAdd: action.enabled, autoDismissed: []};
    case 'sync-auto-add': {
      if (!state.autoAdd) return state;
      const {entries, dismissed} = syncAutoAdd(state.list, state.autoDismissed, state.items, action.at);
      return entries === state.list && dismissed === state.autoDismissed
        ? state
        : {...state, list: entries, autoDismissed: dismissed};
    }
    case 'undo':
      return state.undo ? {...applyUndo(state, state.undo.action), undo: null} : state;
    case 'dismiss-undo':
      return {...state, undo: null};
  }
}

/** Inventory and shopping-list state, persisted to localStorage. No UI concerns. */
export function usePantry() {
  const [state, dispatch] = useReducer(reducer, {
    items: initialItems,
    list: [],
    autoAdd: false,
    autoDismissed: [],
    undo: null,
    undoSeq: 0,
  });
  const {items, list, autoAdd, autoDismissed, undo, undoSeq} = state;
  const [ready, setReady] = useState(false);
  // Starts at 0 so the server and first client render agree: no depletion until mounted.
  const [now, setNow] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedItems = Array.isArray(parsed.items) ? hydrateInventory(parsed.items) : undefined;
        dispatch({
          type: 'hydrate',
          items: savedItems,
          list: hydrateShoppingList(parsed.list, parsed.cart, savedItems ?? initialItems),
          autoAdd: parsed.autoAdd === true,
          autoDismissed: Array.isArray(parsed.autoDismissed)
            ? parsed.autoDismissed.filter((id: unknown): id is string => typeof id === 'string')
            : [],
        });
      }
    } catch {
      /* corrupt storage: use demo defaults */
    }
    setNow(Date.now());
    setReady(true);
  }, []);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    const timer = setInterval(tick, CLOCK_TICK_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({items, list, autoAdd, autoDismissed}));
    } catch {
      /* storage may be unavailable */
    }
  }, [items, list, autoAdd, autoDismissed, ready]);

  useEffect(() => {
    if (ready) dispatch({type: 'sync-auto-add', at: now});
  }, [ready, autoAdd, items, now]);

  const recommendations = useMemo(() => recommend(items, now), [items, now]);

  const lines = useMemo(() => shoppingLines(list, items, now), [list, items, now]);

  const undoLast = useCallback(() => dispatch({type: 'undo'}), []);
  const dismissUndo = useCallback(() => dispatch({type: 'dismiss-undo'}), []);

  return {
    ready,
    now,
    items,
    recommendations,
    lines,
    autoAdd,
    undoNotice: undo
      ? {
          message: undo.message,
          seq: undoSeq,
          isRemoval: undo.action.kind !== 'quantity',
        }
      : null,
    undoLast,
    dismissUndo,
    setAutoAdd: (enabled: boolean) => dispatch({type: 'set-auto-add', enabled}),
    isOnList: (id: string) => list.some((entry) => entry.id === id),
    addToList: (id: string) => dispatch({type: 'add-to-list', id}),
    addOneOff: (details: OneOffDetails) => dispatch({type: 'add-one-off', details, at: Date.now()}),
    removeFromList: (id: string) => dispatch({type: 'remove-from-list', id}),
    editEntry: (id: string, edit: EntryEdit) => dispatch({type: 'edit-entry', id, edit}),
    setEntryAmount: (id: string, amount: number) => dispatch({type: 'set-entry-amount', id, amount}),
    stepEntryAmount: (id: string, direction: 1 | -1) =>
      dispatch({type: 'step-entry-amount', id, direction, at: Date.now()}),
    toggleBought: (id: string) => dispatch({type: 'toggle-bought', id, at: Date.now()}),
    clearBought: () => dispatch({type: 'clear-bought'}),
    addItem: (details: ItemDetails, quantity: number) =>
      dispatch({type: 'add', item: createItem(details, quantity, Date.now())}),
    editItem: (id: string, details: ItemDetails) =>
      dispatch({type: 'edit', id, details, at: Date.now()}),
    removeItem: (id: string) => dispatch({type: 'remove', id}),
    setQuantity: (id: string, quantity: number) =>
      dispatch({type: 'set-quantity', id, quantity, at: Date.now()}),
    stepQuantity: (id: string, direction: 1 | -1) =>
      dispatch({type: 'step-quantity', id, direction, at: Date.now()}),
  };
}
