import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuChevronsUpDown, LuTag } from 'react-icons/lu'
import { expect, within } from 'storybook/test'

import {
  expectPhoneWidth,
  phone390,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'

import { FormField } from '../FormField'
import { gapBelow, heightOf } from '../FormField/formGap.testing'
import { FormStack } from '../FormStack/FormStack'
import { Select } from './Select'

const tagIcon = (
  <Box as="span" aria-hidden display="inline-flex">
    <LuTag size={18} strokeWidth={2} />
  </Box>
)

const categoryOptions = (
  <>
    <option value="">Select a category…</option>
    <option value="handyman">Handyman</option>
    <option value="cleaning">Cleaning</option>
    <option value="gardening">Gardening</option>
    <option value="removals">Removals</option>
  </>
)

const sortOptions = (
  <>
    <option value="recommended">Recommended</option>
    <option value="price_low">Price (lowest)</option>
    <option value="price_high">Price (highest)</option>
    <option value="recent">Most recent</option>
  </>
)

/**
 * SDL native `<select>`. The native control is borderless inside a bordered
 * shell; the visible focus ring is expressed on the shell via `border.focus`
 * (`formControlShellInteraction._focusWithin`). Pair with `FormField` for a
 * persistent `<label>`, helper/error text, and `aria-describedby` wiring --
 * never rely on the first option as the label.
 *
 * Spacing (the `formSpace` tokens): a select in a `FormField` is a field. The
 * label sits 8 above the shell, the shell is 48 tall, the helper and the error
 * sit 4 below it, and the next field is 20 away. On its own (no field) it is the
 * 44px touch target. The whole shell is the target, chevron and padding
 * included.
 */
const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    children: { control: false, table: { disable: true } },
    startElement: { control: false, table: { disable: true } },
    endElement: { control: false, table: { disable: true } },
    rootProps: { control: false, table: { disable: true } },
  },
  args: {
    disabled: false,
    required: false,
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/** Playground driven by the Controls panel (disabled, required). */
export const Playground: Story = {
  args: { defaultValue: 'recommended' },
  render: (args) => <Select {...args}>{sortOptions}</Select>,
}

/** Default standalone select with a placeholder option. */
export const Default: Story = {
  render: (args) => (
    <Select {...args} defaultValue="">
      {categoryOptions}
    </Select>
  ),
}

/** With a leading icon inside the bordered shell. */
export const WithStartElement: Story = {
  render: (args) => (
    <Select {...args} defaultValue="" startElement={tagIcon}>
      {categoryOptions}
    </Select>
  ),
}

/** Disabled select -- non-interactive, dimmed via the native control. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Select {...args} defaultValue="handyman">
      {categoryOptions}
    </Select>
  ),
}

/** Focus: the select starts focused, showing the SDL focus ring. */
export const Focus: Story = {
  render: (args) => (
    <Select {...args} defaultValue="">
      {categoryOptions}
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox')
    select.focus()
    await expect(select).toHaveFocus()
  },
}

/** With label: a real `<label>` and helper text tied via `aria-describedby`. */
export const WithLabel: Story = {
  render: (args) => (
    <FormField
      label="Category"
      helperText="Pick the category that best fits the job."
    >
      <Select {...args} defaultValue="" startElement={tagIcon}>
        {categoryOptions}
      </Select>
    </FormField>
  ),
}

/** Error: danger border plus a message tied via `aria-describedby`. */
export const ErrorState: Story = {
  name: 'Error',
  render: (args) => (
    <FormField label="Category" errorText="Please choose a category.">
      <Select {...args} defaultValue="">
        {categoryOptions}
      </Select>
    </FormField>
  ),
}

/** Selected: shows the chosen option instead of the placeholder option. */
export const WithValue: Story = {
  render: (args) => (
    <Select {...args} defaultValue="gardening">
      {categoryOptions}
    </Select>
  ),
}

/** Long option: the selected label truncates inside the shell. */
export const LongOption: Story = {
  render: (args) => (
    <Box maxW="320px">
      <Select {...args} defaultValue="everything">
        {categoryOptions}
        <option value="everything">
          Anything around the house, garden or garage, including awkward jobs
        </option>
      </Select>
    </Box>
  ),
}

/** With end element: a custom icon replaces the default chevron. */
export const WithEndElement: Story = {
  render: (args) => (
    <Select
      {...args}
      defaultValue="recommended"
      endElement={<LuChevronsUpDown size={18} strokeWidth={2} />}
    >
      {sortOptions}
    </Select>
  ),
}

/** Overview of the select across its key states (renders in light and dark). */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={4} maxW="420px">
      <FormField label="Placeholder">
        <Select defaultValue="" startElement={tagIcon}>
          {categoryOptions}
        </Select>
      </FormField>
      <FormField label="With value">
        <Select defaultValue="handyman">{categoryOptions}</Select>
      </FormField>
      <FormField label="Sort order">
        <Select defaultValue="recommended">{sortOptions}</Select>
      </FormField>
      <FormField label="Disabled" disabled>
        <Select defaultValue="handyman">{categoryOptions}</Select>
      </FormField>
      <FormField label="With error" errorText="This field is required.">
        <Select defaultValue="">{categoryOptions}</Select>
      </FormField>
    </Stack>
  ),
}

/** The parts of the select field labelled `label`: root, label, shell, native control, helper, error. */
function selectField(canvas: ReturnType<typeof within>, label: string) {
  const labelEl = canvas.getByText(label, { selector: 'label' })
  const root = labelEl.parentElement as HTMLElement
  const select = canvas.getByLabelText(label) as HTMLSelectElement
  return {
    root,
    labelEl,
    select,
    shell: select.parentElement as HTMLElement,
    helper: root.querySelector('[id$="-helper"]'),
    error: root.querySelector('[id$="-error"]'),
  }
}

const SPACING_LABELS = [
  'Helper only',
  'Error only',
  'Helper and error',
  'With start element',
  'Label only',
] as const

function SpacingFields() {
  return (
    <FormStack maxW="420px">
      <FormField label="Helper only" helperText="Pick the closest match.">
        <Select defaultValue="">{categoryOptions}</Select>
      </FormField>
      <FormField label="Error only" errorText="Please choose a category.">
        <Select defaultValue="">{categoryOptions}</Select>
      </FormField>
      <FormField
        label="Helper and error"
        helperText="Pick the closest match."
        errorText="Please choose a category."
      >
        <Select defaultValue="">{categoryOptions}</Select>
      </FormField>
      <FormField label="With start element">
        <Select defaultValue="" startElement={tagIcon}>
          {categoryOptions}
        </Select>
      </FormField>
      <FormField label="Label only">
        <Select defaultValue="handyman">{categoryOptions}</Select>
      </FormField>
    </FormStack>
  )
}

/** The spec, read between visible edges: 8, 48, 4, 4 and 4, and 20 to the next field. */
async function expectSelectSpacing(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const fields = SPACING_LABELS.map((label) => selectField(canvas, label))
  const [helperOnly, errorOnly, both, , labelOnly] = fields

  for (const field of fields) {
    // Label to the control: 8. The shell is 48; the native control fills it
    // inside its 1px border, so the whole height is the target.
    await expect(gapBelow(field.labelEl, field.shell)).toBe(
      formSpace.labelToControl,
    )
    await expect(heightOf(field.shell)).toBe(formSpace.controlHeight)
    await expect(heightOf(field.select)).toBe(formSpace.controlHeight - 2)
  }

  // Control to helper or error: 4. Helper to error: 4.
  await expect(gapBelow(helperOnly.shell, helperOnly.helper as Element)).toBe(
    formSpace.controlToHelper,
  )
  await expect(gapBelow(errorOnly.shell, errorOnly.error as Element)).toBe(
    formSpace.controlToHelper,
  )
  await expect(gapBelow(both.shell, both.helper as Element)).toBe(
    formSpace.controlToHelper,
  )
  await expect(gapBelow(both.helper as Element, both.error as Element)).toBe(
    formSpace.helperGap,
  )

  // One field to the next: 20, whatever the field holds.
  for (let i = 0; i < fields.length - 1; i += 1) {
    await expect(gapBelow(fields[i].root, fields[i + 1].root)).toBe(
      formSpace.fieldGap,
    )
  }

  // A field with only a label is the label line, 8 and the 48 control.
  await expect(heightOf(labelOnly.root)).toBe(
    20 + formSpace.labelToControl + formSpace.controlHeight,
  )
}

/** Desktop: label 8 above, 48 tall, helper and error 4 below, 20 to the next field. */
export const Spacing: Story = {
  render: () => <SpacingFields />,
  play: ({ canvasElement }) => expectSelectSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const SpacingPhone: Story = {
  ...phone390,
  render: () => <SpacingFields />,
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectSelectSpacing(canvasElement)
  },
}

/**
 * The whole shell is the target: a tap on the chevron, the padding or the strip
 * above and below the text lands on the select, not on dead border. (A
 * `startElement` is a decorative prefix and is not part of the target.)
 */
export const WholeShellIsTheTarget: Story = {
  render: () => (
    <FormStack maxW="420px">
      <FormField label="Category">
        <Select defaultValue="">{categoryOptions}</Select>
      </FormField>
    </FormStack>
  ),
  play: async ({ canvasElement }) => {
    const { select, shell } = selectField(within(canvasElement), 'Category')
    const box = shell.getBoundingClientRect()
    const doc = canvasElement.ownerDocument
    const middle = box.top + box.height / 2
    const points: Array<[string, number, number]> = [
      ['the middle', box.left + box.width / 2, middle],
      ['just under the top border', box.left + box.width / 2, box.top + 3],
      [
        'just above the bottom border',
        box.left + box.width / 2,
        box.bottom - 3,
      ],
      ['the left padding', box.left + 6, middle],
      ['the chevron', box.right - 19, middle],
      ['the right padding', box.right - 4, middle],
    ]
    for (const [where, x, y] of points) {
      await expect(doc.elementFromPoint(x, y), where).toBe(select)
    }
  },
}

/** Heights: 48 in a field (a form), the 44 touch target on its own. */
export const Heights: Story = {
  render: () => (
    <Stack gap={6} maxW="420px">
      <FormField label="In a field">
        <Select defaultValue="">{categoryOptions}</Select>
      </FormField>
      <Select aria-label="On its own" defaultValue="">
        {categoryOptions}
      </Select>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(heightOf(selectField(canvas, 'In a field').shell)).toBe(
      formSpace.controlHeight,
    )
    const alone = canvas.getByLabelText('On its own') as HTMLElement
    await expect(heightOf(alone.parentElement as HTMLElement)).toBe(44)
  },
}
