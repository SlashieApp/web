import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuLock, LuMail, LuSearch } from 'react-icons/lu'

import { FormField } from '../FormField'
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
 * (`formControlShellInteraction._focusWithin`). The shell meets the 44px touch
 * target. Pair with `FormField` for a persistent `<label>`, helper/error text,
 * and `aria-describedby` wiring -- never rely on the placeholder as the label.
 */
const meta = {
  title: 'Components/Input',
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

export const Playground: Story = {}

/** Default standalone field. */
export const Default: Story = {
  args: { placeholder: 'e.g. Assemble flat-pack wardrobe' },
}

/** With a leading icon inside the bordered shell. */
export const WithStartElement: Story = {
  args: {
    placeholder: 'Search tasks near you...',
    startElement: searchIcon,
  },
}

/** Disabled field -- non-interactive, dimmed via the native control. */
export const Disabled: Story = {
  args: { placeholder: 'Filter by keyword', disabled: true },
}

/** Read-only field -- selectable but not editable. */
export const ReadOnly: Story = {
  args: { defaultValue: 'you@example.com', readOnly: true },
}

/**
 * Focus state. Tab into the field (or click it) to see the SDL focus ring on
 * the shell -- `border.focus` with a 2px ring.
 */
export const Focus: Story = {
  args: { placeholder: 'Tab here to see the focus ring' },
}

/**
 * Wrapped in `FormField` for a persistent label + helper text. The label is a
 * real `<label>`, and helper text is tied to the input via `aria-describedby`.
 */
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

/**
 * Error state via `FormField`. The shell shows the danger border, and the error
 * message is tied to the input through `aria-describedby` (not color alone).
 */
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

/** Overview of the field across its key states (renders in light and dark). */
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
