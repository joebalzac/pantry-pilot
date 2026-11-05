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

const STORAGE_KEY = 'pantrypilot:v1';
const CLOCK_TICK_MS = 60_000;

/**
 * Undo reverses only the change it describes, not the whole state, so it can't
 * discard an item added or edited while the toast was showing.
 */
type UndoAction =
  | {kind: 'quantity'; id: string; quantity: number; lastUpdated: string}
  | {kind: 'item'; item: PantryItem; index: number; cartIndex: number}
  | {kind: 'cart'; id: string; index: number};

type UndoEntry = {message: string; action: UndoAction};

type PantryState = {
  items: PantryItem[];
  cartIds: string[];
  undo: UndoEntry | null;
  /** Counts undoable changes, so a repeated change restarts the toast's timer. */
  undoSeq: number;
};

type PantryAction =
  | {type: 'hydrate'; items?: PantryItem[]; cartIds?: string[]}
  | {type: 'add'; item: PantryItem}
  | {type: 'edit'; id: string; details: ItemDetails; at: number}
  | {type: 'set-quantity'; id: string; quantity: number; at: number}
  | {type: 'step-quantity'; id: string; direction: 1 | -1; at: number}
  | {type: 'remove'; id: string}
  | {type: 'add-to-cart'; id: string}
  | {type: 'remove-from-cart'; id: string}
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
        cartIds:
          action.cartIndex === -1
            ? state.cartIds
            : insertAt(state.cartIds, action.cartIndex, action.item.id),
      };
    case 'cart':
      return state.cartIds.includes(action.id)
        ? state
        : {...state, cartIds: insertAt(state.cartIds, action.index, action.id)};
  }
}

function reducer(state: PantryState, action: PantryAction): PantryState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        items: action.items ?? state.items,
        cartIds: action.cartIds ?? state.cartIds,
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
      return withUndo(
        state,
        {
          items: state.items.filter((entry) => entry.id !== action.id),
          cartIds: state.cartIds.filter((id) => id !== action.id),
        },
        {
          message: `Removed ${item.name} from your pantry`,
          action: {kind: 'item', item, index, cartIndex: state.cartIds.indexOf(action.id)},
        },
      );
    }
    case 'add-to-cart':
      return state.cartIds.includes(action.id)
        ? state
        : {...state, cartIds: [...state.cartIds, action.id]};
    case 'remove-from-cart': {
      const index = state.cartIds.indexOf(action.id);
      if (index === -1) return state;
      const name = state.items.find((item) => item.id === action.id)?.name ?? 'Item';
      return withUndo(
        state,
        {cartIds: state.cartIds.filter((id) => id !== action.id)},
        {
          message: `Removed ${name} from your shopping list`,
          action: {kind: 'cart', id: action.id, index},
        },
      );
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
    cartIds: [],
    undo: null,
    undoSeq: 0,
  });
  const {items, cartIds, undo, undoSeq} = state;
  const [ready, setReady] = useState(false);
  // Starts at 0 so the server and first client render agree: no depletion until mounted.
  const [now, setNow] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedIds: unknown = parsed.cart;
        dispatch({
          type: 'hydrate',
          items: Array.isArray(parsed.items) ? hydrateInventory(parsed.items) : undefined,
          cartIds: Array.isArray(savedIds)
            ? savedIds.filter((id: unknown): id is string => typeof id === 'string')
            : undefined,
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({items, cart: cartIds}));
    } catch {
      /* storage may be unavailable */
    }
  }, [items, cartIds, ready]);

  const recommendations = useMemo(() => recommend(items, now), [items, now]);

  const cartItems = useMemo(
    () => cartIds.flatMap((id) => items.find((item) => item.id === id) ?? []),
    [cartIds, items],
  );

  const undoLast = useCallback(() => dispatch({type: 'undo'}), []);
  const dismissUndo = useCallback(() => dispatch({type: 'dismiss-undo'}), []);

  return {
    ready,
    now,
    items,
    recommendations,
    cartItems,
    undoNotice: undo
      ? {
          message: undo.message,
          seq: undoSeq,
          isRemoval: undo.action.kind !== 'quantity',
        }
      : null,
    undoLast,
    dismissUndo,
    isInCart: (id: string) => cartIds.includes(id),
    addToCart: (id: string) => dispatch({type: 'add-to-cart', id}),
    removeFromCart: (id: string) => dispatch({type: 'remove-from-cart', id}),
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
