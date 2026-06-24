import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { PhoneInput } from './PhoneInput'

/**
 * SDL PhoneInput — a UK (+44) phone field. A non-interactive dialling-code
 * prefix sits beside the national-number {@link Input}, which carries the SDL
 * focus ring and the 44px touch target via the shared bordered shell.
 *
 * Pass `label` to wrap the field in a `FormField`: a persistent `<label>` plus
 * helper/error text tied to the input via `aria-describedby` (the placeholder is
 * never used as the label). Without `label`, the field falls back to `aria-label`
 * so existing call sites keep working. All stories render in light and dark via
 * the global theme toolbar.
 */
const meta = {
  title: 'Components/PhoneInput',
  component: PhoneInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: 'text' },
    nationalPlaceholder: { control: 'text' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorText: { control: 'text' },
    disabled: { control: 'boolean' },
    onChange: { control: false, table: { disable: true } },
    id: { control: false, table: { disable: true } },
    name: { control: false, table: { disable: true } },
  },
  args: {
    value: '',
    onChange: () => {},
    nationalPlaceholder: '7700 900123',
    disabled: false,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <PhoneInput {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof PhoneInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Bare field — relies on `aria-label` (no visible label). */
export const Default: Story = {}

/** With a value pre-filled. */
export const WithValue: Story = {
  args: { value: '+447700900123' },
}

/** Wrapped in `FormField` for a persistent `<label>` and helper text. */
export const WithLabel: Story = {
  args: {
    label: 'Mobile number',
    helperText: "We'll only text you about your tasks.",
  },
}

/** Disabled — both the prefix and the field are non-interactive and dimmed. */
export const Disabled: Story = {
  args: { label: 'Mobile number', value: '+447700900123', disabled: true },
}

/**
 * Error state via `FormField`. The shell shows the danger border and the error
 * message is tied to the input through `aria-describedby` (not colour alone).
 */
export const ErrorState: Story = {
  name: 'Error',
  args: {
    label: 'Mobile number',
    value: '+44770',
    errorText: 'Enter a valid UK mobile number.',
  },
}

/**
 * Focus state. Tab into the field (or click it) to see the SDL focus ring on
 * the bordered shell — `border.focus` with a 2px ring.
 */
export const Focus: Story = {
  args: { label: 'Mobile number' },
}

/** Overview across the field's key states (renders in light and dark). */
export const AllVariants: Story = {
  render: () => {
    const [a, setA] = useState('')
    const [b, setB] = useState('+447700900123')
    const [c, setC] = useState('+447700900123')
    const [d, setD] = useState('+44770')
    return (
      <Stack gap={5} maxW="420px">
        <PhoneInput label="Default (empty)" value={a} onChange={setA} />
        <PhoneInput
          label="With value"
          helperText="We'll only text you about your tasks."
          value={b}
          onChange={setB}
        />
        <PhoneInput label="Disabled" value={c} onChange={setC} disabled />
        <PhoneInput
          label="With error"
          value={d}
          onChange={setD}
          errorText="Enter a valid UK mobile number."
        />
      </Stack>
    )
  },
}
