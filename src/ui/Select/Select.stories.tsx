import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuChevronsUpDown, LuTag } from 'react-icons/lu'
import { expect, within } from 'storybook/test'

import { FormField } from '../FormField'
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
 * (`formControlShellInteraction._focusWithin`). The shell meets the 44px touch
 * target. Pair with `FormField` for a persistent `<label>`, helper/error text,
 * and `aria-describedby` wiring -- never rely on the first option as the label.
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
