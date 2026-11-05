import { useId, useRef, useState, type FormEvent } from 'react';
import { CATEGORY_LIST } from '../lib/categories';
import type { ItemDetails, PantryItem } from '../lib/pantry';
import { COMMON_UNITS, parseQuantity } from '../lib/quantity';
import type { CategoryId } from '../lib/tokens';
import { Button, Dialog, SelectField, TextField } from './ui';

const AMOUNT_ERROR = 'Enter a number, like 2, 0.5 or 1/2.';

type FieldName = 'name' | 'unit' | 'quantity' | 'reorderAt' | 'dailyUse';
type FieldErrors = Partial<Record<FieldName, string>>;

/** Which item the dialog is working on. `add` creates one; `edit` changes an existing one. */
export type ItemFormTarget = {mode: 'add'} | {mode: 'edit'; item: PantryItem};

export type ItemFormDialogProps = {
  /** The dialog is open while this is set. */
  target: ItemFormTarget | null;
  onAdd: (details: ItemDetails, quantity: number) => void;
  onEdit: (id: string, details: ItemDetails) => void;
  onClose: () => void;
};

export function ItemFormDialog({target, onAdd, onEdit, onClose}: ItemFormDialogProps) {
  const title = target?.mode === 'edit' ? `Edit ${target.item.name}` : 'Add an item';
  return (
    <Dialog open={target !== null} title={title} onClose={onClose}>
      {target ? (
        <ItemForm
          item={target.mode === 'edit' ? target.item : null}
          onCancel={onClose}
          onSubmit={(details, quantity) => {
            if (target.mode === 'edit') onEdit(target.item.id, details);
            else onAdd(details, quantity);
            onClose();
          }}
        />
      ) : null}
    </Dialog>
  );
}

function ItemForm({
  item,
  onSubmit,
  onCancel,
}: {
  item: PantryItem | null;
  onSubmit: (details: ItemDetails, quantity: number) => void;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const unitListId = useId();
  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState<CategoryId>(item?.category ?? 'pantry');
  const [unit, setUnit] = useState(item?.unit ?? '');
  const [quantity, setQuantity] = useState('');
  const [reorderAt, setReorderAt] = useState(item ? String(item.reorderAt) : '');
  const [dailyUse, setDailyUse] = useState(item ? String(item.dailyUse) : '');
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: FieldName) =>
    setErrors((old) => (old[field] ? {...old, [field]: undefined} : old));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedQuantity = item ? item.quantity : parseQuantity(quantity);
    const parsedReorderAt = parseQuantity(reorderAt);
    const parsedDailyUse = parseQuantity(dailyUse);

    const nextErrors: FieldErrors = {
      name: name.trim() ? undefined : 'Enter a name.',
      unit: unit.trim() ? undefined : 'Enter a unit, like cups or lb.',
      quantity: parsedQuantity === null ? AMOUNT_ERROR : undefined,
      reorderAt: parsedReorderAt === null ? AMOUNT_ERROR : undefined,
      dailyUse: parsedDailyUse === null ? AMOUNT_ERROR : undefined,
    };
    setErrors(nextErrors);

    if (parsedQuantity === null || parsedReorderAt === null || parsedDailyUse === null || !name.trim() || !unit.trim()) {
      const firstInvalid = (['name', 'unit', 'quantity', 'reorderAt', 'dailyUse'] as const).find(
        (field) => nextErrors[field],
      );
      if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    onSubmit(
      {
        name: name.trim(),
        category,
        unit: unit.trim(),
        reorderAt: parsedReorderAt,
        dailyUse: parsedDailyUse,
      },
      parsedQuantity,
    );
  };

  return (
    <form ref={formRef} className="item-form" noValidate onSubmit={handleSubmit}>
      <TextField
        label="Name"
        name="name"
        autoComplete="off"
        value={name}
        error={errors.name}
        onChange={(event) => {
          setName(event.target.value);
          clearError('name');
        }}
      />
      <SelectField
        label="Department"
        value={category}
        onChange={(event) => setCategory(event.target.value as CategoryId)}
      >
        {CATEGORY_LIST.map((meta) => (
          <option key={meta.id} value={meta.id}>
            {meta.label}
          </option>
        ))}
      </SelectField>
      <div className="item-form__pair">
        {item ? null : (
          <TextField
            label="Quantity on hand"
            name="quantity"
            inputMode="decimal"
            autoComplete="off"
            value={quantity}
            error={errors.quantity}
            onChange={(event) => {
          setQuantity(event.target.value);
          clearError('quantity');
        }}
          />
        )}
        <TextField
          label="Unit"
          name="unit"
          list={unitListId}
          autoComplete="off"
          value={unit}
          error={errors.unit}
          onChange={(event) => {
          setUnit(event.target.value);
          clearError('unit');
        }}
        />
        <datalist id={unitListId}>
          {COMMON_UNITS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
      <TextField
        label="Reorder at"
        name="reorderAt"
        inputMode="decimal"
        autoComplete="off"
        value={reorderAt}
        hint="Suggest a restock at or below this amount."
        error={errors.reorderAt}
        onChange={(event) => {
          setReorderAt(event.target.value);
          clearError('reorderAt');
        }}
      />
      <TextField
        label="Daily use"
        name="dailyUse"
        inputMode="decimal"
        autoComplete="off"
        value={dailyUse}
        hint="How much you use per day. Enter 0 to skip the estimate."
        error={errors.dailyUse}
        onChange={(event) => {
          setDailyUse(event.target.value);
          clearError('dailyUse');
        }}
      />
      <div className="item-form__actions">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{item ? 'Save changes' : 'Add item'}</Button>
      </div>
    </form>
  );
}
