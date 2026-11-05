/**
 * Compile-time contract for components/ui, checked by `npm run typecheck`.
 * Each @ts-expect-error fails the build if that misuse ever starts compiling.
 */
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  CheckRow,
  Chip,
  ChipGroup,
  Dialog,
  SelectField,
  Stepper,
  TabPanel,
  Tabs,
  TextField,
  Toast,
} from '../components/ui';

const noop = () => undefined;

export const validUsage = (
  <>
    <Button variant="danger" size="lg" />
    <ButtonLink href="/" variant="outline" size="lg" />
    <CheckRow title="Milk" meta="gallons" note="2%" checked onCheckedChange={noop} />
    <Badge tone="info" />
    <Card as="article" padding="lg" />
    <CardHeader title="Title" titleAs="h3" />
    <TextField label="Search" hideLabel type="search" />
    <Tabs<'a' | 'b'>
      label="Views"
      idBase="id"
      value="a"
      onChange={noop}
      options={[{id: 'a', label: 'A'}]}
    />
    <TabPanel idBase="id" tabId="a" />
    <TextField label="Amount" hint="Per day" error="Enter a number" />
    <SelectField label="Sort" hideLabel />
    <Stepper label="Qty" decreaseLabel="-" increaseLabel="+" onDecrease={noop} onIncrease={noop}>
      <input aria-label="Amount" />
    </Stepper>
    <Dialog open title="Edit" onClose={noop}>
      Body
    </Dialog>
    <Toast message="Removed" actionLabel="Undo" onAction={noop} onDismiss={noop} />
  </>
);

export const invalidUsage = (
  <>
    {/* @ts-expect-error unknown variant */}
    <Button variant="tertiary" />
    {/* @ts-expect-error unknown size */}
    <Button size="xl" />
    {/* @ts-expect-error a link needs somewhere to go */}
    <ButtonLink variant="outline" />
    {/* @ts-expect-error the row owns the checkbox, so its state is required */}
    <CheckRow title="Milk" onCheckedChange={noop} />
    {/* @ts-expect-error unknown tone */}
    <Badge tone="purple" />
    {/* @ts-expect-error unknown padding */}
    <Card padding="xl" />
    {/* @ts-expect-error headings stop at the levels the outline uses */}
    <CardHeader title="Title" titleAs="h1" />
    {/* @ts-expect-error unknown category */}
    <Chip category="candy" />
    {/* @ts-expect-error selected state is set with `selected` */}
    <Chip aria-pressed />
    {/* @ts-expect-error a group needs a name */}
    <ChipGroup />
    {/* @ts-expect-error a field needs a label */}
    <TextField />
    {/* @ts-expect-error aria-label would override the label */}
    <TextField label="Search" aria-label="Find" />
    {/* @ts-expect-error not a text-like input */}
    <TextField label="Agree" type="checkbox" />
    {/* @ts-expect-error a field needs a label */}
    <SelectField />
    {/* @ts-expect-error aria-label would override the label */}
    <SelectField label="Sort" aria-label="Order" />
    {/* @ts-expect-error a dialog needs a title */}
    <Dialog open onClose={noop} />
    {/* @ts-expect-error a toast needs an action label */}
    <Toast message="Removed" onAction={noop} onDismiss={noop} />
    {/* @ts-expect-error a stepper group needs a name */}
    <Stepper decreaseLabel="-" increaseLabel="+" onDecrease={noop} onIncrease={noop} />
    {/* @ts-expect-error tabs need idBase to link to panels */}
    <Tabs label="Views" value="a" onChange={noop} options={[{id: 'a', label: 'A'}]} />
    {/* @ts-expect-error value must be one of the option ids */}
    <Tabs<'a' | 'b'> label="Views" idBase="id" value="c" onChange={noop} options={[]} />
  </>
);
