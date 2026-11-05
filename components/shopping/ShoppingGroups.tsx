import { useState, type ReactNode } from 'react';
import { formatLineAmount, groupByDepartment, type ShoppingLine } from '../../lib/shopping';
import { CategoryGlyph } from '../CategoryGlyph';
import { QuantityInput } from '../QuantityInput';
import { Badge, CheckRow, ItemList, Stepper } from '../ui';

export type ShoppingGroupsProps = {
  lines: ShoppingLine[];
  /** Match the surrounding document outline. */
  headingAs?: 'h2' | 'h3';
  onToggleBought: (id: string) => void;
  onStepAmount: (id: string, direction: 1 | -1) => void;
  onSetAmount: (id: string, amount: number) => void;
  /** Extra controls for each row, after the amount. */
  rowActions?: (line: ShoppingLine) => ReactNode;
};

function lineMeta(line: ShoppingLine): ReactNode {
  if (line.bought) {
    const amount = formatLineAmount(line);
    return line.source === 'pantry' ? `Added ${amount} to your pantry` : `Bought ${amount}`;
  }
  const summary = [line.unit, line.suggested ? 'suggested' : ''].filter(Boolean).join(' · ');
  if (!line.autoAdded) return summary;
  return (
    <>
      {summary}
      <Badge tone="info">Auto</Badge>
    </>
  );
}

/** The list by store department. Rows stay put when checked, so the next tap lands where it's aimed. */
export function ShoppingGroups({
  lines,
  headingAs: Heading = 'h3',
  onToggleBought,
  onStepAmount,
  onSetAmount,
  rowActions,
}: ShoppingGroupsProps) {
  const [announcement, setAnnouncement] = useState('');

  const toggle = (line: ShoppingLine) => {
    onToggleBought(line.id);
    setAnnouncement(
      line.bought
        ? `${line.name} is back on your list`
        : line.source === 'pantry'
          ? `Bought ${line.name}. Added ${formatLineAmount(line)} to your pantry`
          : `Bought ${line.name}`,
    );
  };

  return (
    <>
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
      {groupByDepartment(lines).map(({category, label, icon, lines: inDepartment}) => {
        const left = inDepartment.filter((line) => !line.bought).length;
        return (
          <section key={category} className="shopping-group">
            <Heading className="shopping-group__heading">
              <CategoryGlyph category={category} icon={icon} size="sm" />
              {label}
              <span className="shopping-group__left">{left === 0 ? 'Done' : `${left} left`}</span>
            </Heading>
            <ItemList>
              {inDepartment.map((line) => (
                <CheckRow
                  key={line.id}
                  title={line.name}
                  meta={lineMeta(line)}
                  note={line.note}
                  checked={line.bought}
                  onCheckedChange={() => toggle(line)}
                  actions={
                    <>
                      {line.bought ? null : (
                        <Stepper
                          label={`${line.name} amount to buy`}
                          decreaseLabel={`Buy less ${line.name}`}
                          increaseLabel={`Buy more ${line.name}`}
                          onDecrease={() => onStepAmount(line.id, -1)}
                          onIncrease={() => onStepAmount(line.id, 1)}
                        >
                          <QuantityInput
                            label={line.unit ? `${line.name} amount in ${line.unit}` : `${line.name} amount`}
                            value={line.amount}
                            onCommit={(amount) => onSetAmount(line.id, amount)}
                          />
                        </Stepper>
                      )}
                      {rowActions?.(line)}
                    </>
                  }
                />
              ))}
            </ItemList>
          </section>
        );
      })}
    </>
  );
}
