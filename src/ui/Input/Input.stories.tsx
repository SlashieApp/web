import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuEye, LuLock, LuMail, LuSearch } from 'react-icons/lu'
import { expect, within } from 'storybook/test'

import { FormField } from '../FormField'
import { IconButton } from '../IconButton/IconButton'
import { Input } from './Input'

const searchIcon = (
  <Box as="span" aria-hidden display="inline-flex">
    <LuSearch size={18} strokeWidth={2} />
  </Box>
)

const mailIcon = (
  <Box as="span" aria-hidden display="inline-flex">
    <LuMail size={18} strokeWidth={2} />
  </Box>
)

const lockIcon = (
  <Box as="span" aria-hidden display="inline-flex">
    <LuLock size={18} strokeWidth={2} />
  </Box>
)

/**
 * SDL bordered text field. The native control is borderless inside a bordered
 * shell; the visible focus ring is expressed on the shell via `border.focus`
 * (`formControlShellInteraction._focusWithin`). The shell is 48px tall inside a
 * `FormField` (the form control height) and 44px on its own, so both meet the
 * touch target. Pair with `FormField` for a persistent `<label>`, helper/error
 * text, and `aria-describedby` wiring -- never rely on the placeholder as the
 * label.
 */
const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    type: {
      control: 'inline-radio',
      options: ['text', 'email', 'password', 'search', 'tel'],
    },
    startElement: { control: false, table: { disable: true } },
    endElement: { control: false, table: { disable: true } },
    rootProps: { control: false, table: { disable: true } },
  },
  args: {
    placeholder: 'Search tasks near you...',
    type: 'text',
    disabled: false,
    required: false,
    readOnly: false,
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/** Playground: drive placeholder, type and state from Controls. */
export const Playground: Story = {}

/** Default: standalone field with a placeholder. */
export const Default: Story = {
  args: { placeholder: 'e.g. Assemble flat-pack wardrobe' },
}

/** With start element: a leading icon inside the bordered shell. */
export const WithStartElement: Story = {
  args: { placeholder: 'Search tasks near you...' },
  render: (args) => <Input {...args} startElement={searchIcon} />,
}

/** Disabled: the shell dims to `bg.subtle` and the text mutes to `text.subtle`. */
export const Disabled: Story = {
  args: { placeholder: 'Filter by keyword', disabled: true },
}

/** Read only: selectable but not editable. */
export const ReadOnly: Story = {
  args: { defaultValue: 'you@example.com', readOnly: true },
}

/** With value: a filled field. */
export const WithValue: Story = {
  args: { defaultValue: 'Assemble flat-pack wardrobe' },
}

/** With end element: trailing control inside the shell, here a show-password toggle. */
export const WithEndElement: Story = {
  args: { type: 'password', defaultValue: 'not-a-real-password' },
  render: (args) => (
    <Input
      {...args}
      startElement={lockIcon}
      endElement={
        <IconButton aria-label="Show password" variant="ghost" size="xs">
          <LuEye size={18} aria-hidden />
        </IconButton>
      }
    />
  ),
}

/** Password: typed characters are masked. */
export const Password: Story = {
  args: { type: 'password', defaultValue: 'not-a-real-password' },
}

/** Long value: the text stays on one line and scrolls inside the field. */
export const LongValue: Story = {
  args: {
    defaultValue:
      'Assemble the flat-pack wardrobe, fit the shelves and hang both doors in the spare bedroom',
  },
  render: (args) => (
    <Box maxW="320px">
      <Input {...args} />
    </Box>
  ),
}

/** Disabled with value: a locked, filled field with muted text. */
export const DisabledWithValue: Story = {
  args: { defaultValue: 'you@example.com', disabled: true },
}

/** Focus: Tab into the field (or click it) to see the `border.focus` ring on the shell. */
export const Focus: Story = {
  args: { placeholder: 'Tab here to see the focus ring' },
}

/** With label: inside `FormField`, a real `<label>` plus helper text tied by `aria-describedby`. */
export const WithLabel: Story = {
  render: (args) => (
    <FormField label="Email address" helperText="We'll never share this.">
      <Input
        {...args}
        type="email"
        placeholder="you@example.com"
        startElement={mailIcon}
      />
    </FormField>
  ),
}

/** Error: via `FormField`, a danger border plus a message tied by `aria-describedby`. */
export const ErrorState: Story = {
  name: 'Error',
  render: (args) => (
    <FormField
      label="Password"
      errorText="Password must be at least 8 characters."
    >
      <Input
        {...args}
        type="password"
        placeholder="Enter a password"
        startElement={lockIcon}
      />
    </FormField>
  ),
}

/** Shape: a field has 8px corners and a 1px `border.strong` hairline on white; a search field (`pill`) is a pill. */
export const Shape: Story = {
  render: () => (
    <Stack gap={3} maxW="320px">
      <Input aria-label="Name" placeholder="Name" />
      <Input pill aria-label="Search" placeholder="Search" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByLabelText('Name').parentElement
    const search = canvas.getByLabelText('Search').parentElement
    if (!field || !search) throw new Error('No field shell')
    const style = getComputedStyle(field)
    await expect(style.borderTopLeftRadius).toBe('8px')
    await expect(style.borderTopWidth).toBe('1px')
    await expect(style.borderTopColor).toBe('rgb(212, 212, 216)')
    await expect(style.backgroundColor).toBe('rgb(255, 255, 255)')
    await expect(getComputedStyle(search).borderTopLeftRadius).toBe('9999px')
  },
}

/** Overview: the field across its key states. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={4} maxW="420px">
      <FormField label="Default">
        <Input
          placeholder="Search tasks near you..."
          startElement={searchIcon}
        />
      </FormField>
      <FormField label="With value">
        <Input defaultValue="Assemble flat-pack wardrobe" />
      </FormField>
      <FormField label="Disabled" disabled>
        <Input placeholder="Filter by keyword" />
      </FormField>
      <FormField label="Read only">
        <Input defaultValue="you@example.com" readOnly />
      </FormField>
      <FormField label="With error" errorText="This field is required.">
        <Input placeholder="Enter a value" />
      </FormField>
    </Stack>
  ),
}
