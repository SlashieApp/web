import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { FormField } from '../FormField'
import { OtpInput, type OtpInputProps } from './OtpInput'

const meta = {
  title: 'UI/OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['md', 'lg'],
      description: 'Cell size. Both meet the 44px min touch target.',
    },
    length: {
      control: { type: 'number', min: 3, max: 8, step: 1 },
      description: 'Number of digit cells.',
    },
    disabled: { control: 'boolean' },
    autoFocus: { control: 'boolean' },
    value: { control: false },
    onChange: { control: false },
    onEnter: { control: false },
    onComplete: { control: false },
  },
  args: {
    value: '',
    onChange: () => {},
    length: 6,
    size: 'md',
    disabled: false,
    autoFocus: false,
  },
} satisfies Meta<typeof OtpInput>

export default meta

type Story = StoryObj<typeof meta>

/** Playground: toggle size, length and disabled in the Controls panel. */
export const Playground: Story = {
  render: function PlaygroundStory(args) {
    const [value, setValue] = useState('')
    return <OtpInput {...args} value={value} onChange={setValue} />
  },
}

/** Real verification flow with persistent label + helper text via FormField. */
export const VerifySmsCode: Story = {
  render: function VerifySmsCodeStory(args) {
    const [value, setValue] = useState('')
    return (
      <Stack gap={3} maxW="400px">
        <FormField
          label="Verification code"
          helperText="Enter the 6-digit code from your SMS."
        >
          <OtpInput {...args} value={value} onChange={setValue} />
        </FormField>
      </Stack>
    )
  },
}

/** Default empty state. */
export const Default: Story = {
  render: function DefaultStory(args) {
    const [value, setValue] = useState('')
    return <OtpInput {...args} value={value} onChange={setValue} />
  },
}

/** Filled / complete state. */
export const Filled: Story = {
  render: function FilledStory(args) {
    const [value, setValue] = useState('123456')
    return <OtpInput {...args} value={value} onChange={setValue} />
  },
}

/** Disabled: cells are non-interactive and use the subtle surface. */
export const Disabled: Story = {
  args: { disabled: true },
  render: function DisabledStory(args) {
    const [value, setValue] = useState('1234')
    return <OtpInput {...args} value={value} onChange={setValue} />
  },
}

/** Error: danger border on the cells plus a message under the field. */
export const ErrorState: Story = {
  name: 'Error',
  render: function ErrorStory(args) {
    const [value, setValue] = useState('1234')
    return (
      <Stack gap={3} maxW="400px">
        <FormField
          label="Verification code"
          errorText="That code is incorrect or has expired."
        >
          <OtpInput {...args} value={value} onChange={setValue} />
        </FormField>
      </Stack>
    )
  },
}

/** Large cells for prominent, single-purpose verification screens. */
export const Large: Story = {
  args: { size: 'lg' },
  render: function LargeStory(args) {
    const [value, setValue] = useState('12')
    return <OtpInput {...args} value={value} onChange={setValue} />
  },
}

/** Story-only wrapper that owns the value so typing and paste work. */
function ControlledOtp({
  initial = '',
  ...args
}: Omit<OtpInputProps, 'value' | 'onChange'> & { initial?: string }) {
  const [value, setValue] = useState(initial)
  return <OtpInput {...args} value={value} onChange={setValue} />
}

/** Partially filled: three of six digits entered, the rest still empty. */
export const PartiallyFilled: Story = {
  render: (args) => <ControlledOtp {...args} initial="123" />,
}

/** Large and complete: all six digits in the lg cells. */
export const LargeFilled: Story = {
  args: { size: 'lg' },
  render: (args) => <ControlledOtp {...args} initial="123456" />,
}

/** Auto focus: the first cell takes focus on mount and shows the focus ring. */
export const AutoFocus: Story = {
  args: { autoFocus: true },
  render: (args) => <ControlledOtp {...args} />,
  play: async ({ canvasElement }) => {
    const first = within(canvasElement).getByLabelText('Digit 1 of 6')
    await waitFor(() => expect(first).toHaveFocus(), { timeout: 3000 })
  },
}

/** Typing: each digit moves focus on, and the last one fires `onComplete`. */
export const TypeCode: Story = {
  args: { autoFocus: true, onComplete: fn() },
  render: (args) => <ControlledOtp {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.keyboard('123456')
    await waitFor(
      () => expect(args.onComplete).toHaveBeenCalledWith('123456'),
      { timeout: 3000 },
    )
    for (const [index, digit] of [...'123456'].entries()) {
      await expect(
        canvas.getByLabelText(`Digit ${index + 1} of 6`),
      ).toHaveValue(digit)
    }
  },
}

/** Paste: a pasted code (spaces ignored) fills every cell and completes. */
export const PasteCode: Story = {
  args: { onComplete: fn() },
  render: (args) => <ControlledOtp {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByLabelText('Digit 1 of 6'))
    await userEvent.paste('654 321')
    await waitFor(
      () => expect(args.onComplete).toHaveBeenCalledWith('654321'),
      { timeout: 3000 },
    )
    await expect(canvas.getByLabelText('Digit 6 of 6')).toHaveValue('1')
  },
}

/** Overview of every size + state, rendered together for visual review. */
export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const [empty, setEmpty] = useState('')
    const [filled, setFilled] = useState('123456')
    const [large, setLarge] = useState('12')
    const [errored, setErrored] = useState('1234')
    return (
      <Stack gap={6} maxW="520px">
        <Stack gap={2}>
          <Text fontSize="sm" color="text.muted">
            Default (md)
          </Text>
          <OtpInput value={empty} onChange={setEmpty} />
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" color="text.muted">
            Filled
          </Text>
          <OtpInput value={filled} onChange={setFilled} />
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" color="text.muted">
            Disabled
          </Text>
          <OtpInput value="1234" onChange={() => {}} disabled />
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" color="text.muted">
            Error
          </Text>
          <FormField
            label="Verification code"
            errorText="That code is incorrect or has expired."
          >
            <OtpInput value={errored} onChange={setErrored} />
          </FormField>
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" color="text.muted">
            Large (lg)
          </Text>
          <OtpInput value={large} onChange={setLarge} size="lg" />
        </Stack>
      </Stack>
    )
  },
}
