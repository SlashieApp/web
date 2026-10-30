import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'

import { FormField } from '../FormField'
import { gapBelow, heightOf } from '../FormField/formGap.testing'
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
      description:
        'Cell size. `md` is 44 wide and 48 tall (the form control height); `lg` is for hero screens. Both meet the 44px min touch target.',
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

/**
 * In a field the boxes are 48 tall like every field in a form, 8 under the
 * label and 4 above the helper. The focus-ring padding around them takes no
 * room, so the gaps are measured from the boxes' own edges.
 */
export const FormSpacing: Story = {
  render: function FormSpacingStory() {
    const [value, setValue] = useState('')
    return (
      <FormField label="Verification code" helperText="Codes last 10 minutes.">
        <OtpInput value={value} onChange={setValue} />
      </FormField>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const label = canvas.getByText('Verification code', { selector: 'label' })
    const first = canvas.getByLabelText('Digit 1 of 6')
    const last = canvas.getByLabelText('Digit 6 of 6')
    const helper = canvas.getByText('Codes last 10 minutes.')

    await expect(gapBelow(label, first)).toBe(formSpace.labelToControl)
    for (const cell of [first, last]) {
      await expect(heightOf(cell)).toBe(formSpace.controlHeight)
    }
    await expect(first.getBoundingClientRect().width).toBe(44)
    await expect(gapBelow(last, helper)).toBe(formSpace.controlToHelper)
  },
}

/**
 * The cells are one named group: its description is the field's helper and
 * error, and the cells (not the group) carry the invalid mark. Without an error
 * and a name there is nothing extra.
 */
export const GroupSemantics: Story = {
  render: function GroupSemanticsStory() {
    const [value, setValue] = useState('')
    return (
      <FormField
        label="Verification code"
        errorText="That code is incorrect or has expired."
      >
        <OtpInput
          value={value}
          onChange={setValue}
          aria-label="Verification code"
        />
      </FormField>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group', { name: 'Verification code' })
    await expect(group).toHaveAccessibleDescription(
      'That code is incorrect or has expired.',
    )
    await expect(group).not.toHaveAttribute('aria-invalid')
    const cells = within(group).getAllByRole('textbox')
    await expect(cells).toHaveLength(6)
    for (const cell of cells) await expect(cell).toBeInvalid()
  },
}

/**
 * Outside a `FormField` (a dialog whose lead-in names the code): `invalid`
 * marks every cell, `aria-describedby` points at the help and the error, and
 * `aria-labelledby` names the group. The group is not marked invalid.
 */
export const InvalidWithoutField: Story = {
  render: function InvalidWithoutFieldStory() {
    const [value, setValue] = useState('12')
    return (
      <>
        <Text id="otp-lead">Enter the 6-digit code we sent you.</Text>
        <OtpInput
          value={value}
          onChange={setValue}
          aria-labelledby="otp-lead"
          aria-describedby="otp-help otp-error"
          invalid
        />
        <Text id="otp-help">Codes last 10 minutes.</Text>
        <Text id="otp-error">Enter the 6-digit code from your SMS.</Text>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group', {
      name: 'Enter the 6-digit code we sent you.',
    })
    await expect(group).toHaveAccessibleDescription(
      'Codes last 10 minutes. Enter the 6-digit code from your SMS.',
    )
    await expect(group).not.toHaveAttribute('aria-invalid')
    const cells = within(group).getAllByRole('textbox')
    await expect(cells).toHaveLength(6)
    for (const cell of cells) await expect(cell).toBeInvalid()
  },
}
