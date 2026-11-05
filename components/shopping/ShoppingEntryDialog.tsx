import { useId, useRef, useState, type FormEvent } from 'react';
import { CATEGORY_LIST } from '../../lib/categories';
import { COMMON_UNITS, parseQuantity } from '../../lib/quantity';
import type { EntryEdit, OneOffDetails, ShoppingLine } from '../../lib/shopping';
import type { CategoryId } from '../../lib/tokens';
import { Button, Dialog, SelectField, TextField } from '../ui';

/** `add` creates a one-off. `edit` changes a line, and a pantry line only offers amount and note. */
export type ShoppingEntryTarget = {mode: 'add'} | {mode: 'edit'; line: ShoppingLine};

export type ShoppingEntryDialogProps = {
  /** The dialog is open while this is set. */
  target: ShoppingEntryTarget | null;
  onAdd: (details: OneOffDetails) => void;
  onEdit: (id: string, edit: EntryEdit) => void;
  onClose: () => void;
};

export function ShoppingEntryDialog({target, onAdd, onEdit, onClose}: ShoppingEntryDialogProps) {
  const title = target?.mode === 'edit' ? `Edit ${target.line.name}` : 'Add a one-off item';
  return (
    <Dialog open={target !== null} title={title} onClose={onClose}>
      {target ? (
        <EntryForm
          line={target.mode === 'edit' ? target.line : null}
          onAdd={onAdd}
          onEdit={onEdit}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  );
}

function EntryForm({
  line,
  onAdd,
  onEdit,
  onClose,
}: {
  line: ShoppingLine | null;
  onAdd: (details: OneOffDetails) => void;
  onEdit: (id: string, edit: EntryEdit) => void;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const unitListId = useId();
  const isPantryLine = line?.source === 'pantry';
  const amountLocked = isPantryLine && line.bought;

  const [name, setName] = useState(line?.name ?? '');
  const [category, setCategory] = useState<CategoryId>(line?.category ?? 'pantry');
  const [amount, setAmount] = useState(line && !line.suggested ? String(line.amount) : '');
  const [unit, setUnit] = useState(line?.unit ?? '');
  const [note, setNote] = useState(line?.note ?? '');
  const [nameError, setNameError] = useState<string>();
  const [amountError, setAmountError] = useState<string>();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = amount.trim() ? parseQuantity(amount) : null;
    const nextAmountError =
      amount.trim() && (parsedAmount === null || parsedAmount <= 0)
        ? 'Enter an amount above 0, like 2, 0.5 or 1/2.'
        : undefined;
    const nextNameError = !isPantryLine && !name.trim() ? 'Enter a name.' : undefined;
    setNameError(nextNameError);
    setAmountError(nextAmountError);

    if (nextNameError || nextAmountError) {
      const firstInvalid = nextNameError ? 'name' : 'amount';
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    if (isPantryLine) {
      onEdit(line.id, {amount: parsedAmount, note: note.trim()});
    } else {
      const details = {
        name: name.trim(),
        category,
        amount: parsedAmount ?? 1,
        unit: unit.trim(),
        note: note.trim(),
      };
      if (line) onEdit(line.id, details);
      else onAdd(details);
    }
    onClose();
  };

  return (
    <form ref={formRef} className="item-form" noValidate onSubmit={handleSubmit}>
      {isPantryLine ? null : (
        <>
          <TextField
            label="Name"
            name="name"
            autoComplete="off"
            value={name}
            error={nameError}
            onChange={(event) => {
              setName(event.target.value);
              setNameError(undefined);
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
        </>
      )}
      {amountLocked ? null : (
        <div className="item-form__pair">
          <TextField
            label={isPantryLine ? `Amount to buy (${line.unit})` : 'Amount'}
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder={isPantryLine ? 'Suggested' : '1'}
            hint={isPantryLine ? 'Leave blank to use the suggestion.' : undefined}
            value={amount}
            error={amountError}
            onChange={(event) => {
              setAmount(event.target.value);
              setAmountError(undefined);
            }}
          />
          {isPantryLine ? null : (
            <>
              <TextField
                label="Unit (optional)"
                name="unit"
                list={unitListId}
                autoComplete="off"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              />
              <datalist id={unitListId}>
                {COMMON_UNITS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </>
          )}
        </div>
      )}
      <TextField
        label="Note (optional)"
        name="note"
        autoComplete="off"
        placeholder="Brand, size, or anything else to remember"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="item-form__actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{line ? 'Save changes' : 'Add to list'}</Button>
      </div>
    </form>
  );
}
