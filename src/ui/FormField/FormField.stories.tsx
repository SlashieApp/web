import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { LuCalendar } from 'react-icons/lu'
import { expect, userEvent, within } from 'storybook/test'

import { FormStack } from '../FormStack/FormStack'
import { Input } from '../Input/Input'
import { Link } from '../Link/Link'
import { OtpInput } from '../OtpInput/OtpInput'
import { PhoneInput } from '../PhoneInput/PhoneInput'
import { Select } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { FormField } from './FormField'
import { gapBelow, heightOf } from './formGap.testing'

/**
 * SDL FormField: the labelled wrapper that supplies a persistent `<label>`,
 * helper copy, and an error message wired via `aria-describedby` to whatever
 * control it wraps. The error message never relies on color alone: it pairs a
 * danger dot with the label text. Renders under both light and dark via the
 * global theme toolbar.
 *
 * Spacing (the `formSpace` tokens): the label sits 8 above the control, and the
 * helper and the error sit 4 below it and 4 apart. A field is as tall as its
 * parts; the 20 between one field and the next is the `FormStack`'s.
 */
const meta = {
  title: 'UI/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorText: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    children: { control: false, table: { disable: true } },
  },
  args: {
    label: 'Email',
    helperText: 'Used to sign in and receive quote updates.',
    children: null,
  },
} satisfies Meta<typeof FormField>

export default meta

type Story = StoryObj<typeof meta>

/** Playground: toggle helperText, errorText, disabled and required. */
export const Playground: Story = {
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/** Overview of every supported state side by side. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={6} maxW="420px">
      <FormField
        label="Default"
        helperText="A short hint sits under the field."
      >
        <Input placeholder="you@example.com" type="email" />
      </FormField>
      <FormField
        label="Required"
        required
        helperText="Required fields are marked."
      >
        <Input placeholder="Full name" />
      </FormField>
      <FormField label="Disabled" disabled helperText="Locked while saving.">
        <Input placeholder="you@example.com" />
      </FormField>
      <FormField label="Error" errorText="Enter a valid email address">
        <Input placeholder="you@example.com" type="email" />
      </FormField>
      <FormField
        label="With leading icon"
        helperText="Tap the row to open a picker."
        icon={<LuCalendar aria-hidden />}
      >
        <Input placeholder="Select a date" readOnly />
      </FormField>
    </Stack>
  ),
}

/** Default: label and helper text, no error. */
export const Default: Story = {
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/** Disabled: the field context disables the wrapped control. */
export const Disabled: Story = {
  args: { disabled: true, helperText: 'Locked while we save your draft.' },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/** Required: the field passes the required state to the control. */
export const Required: Story = {
  args: { required: true, helperText: 'You must confirm an email.' },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/** Error: the message is tied via aria-describedby and shows a dot plus label. */
export const WithError: Story = {
  args: {
    helperText: undefined,
    errorText: 'Enter a valid email address',
  },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/**
 * An error that appears (a check ran, a server said no) is announced: it is an
 * alert, like every other error under a control (`FormErrorText`), because a
 * polite live region that mounts already holding its message is not reliably
 * read out. Nothing is announced before it; it stays the input's description.
 */
export const ErrorIsAnnounced: Story = {
  render: function ErrorIsAnnouncedStory(args) {
    const [shown, setShown] = useState(false)
    return (
      <Stack gap={3} maxW="400px">
        <FormField
          {...args}
          helperText={undefined}
          errorText={shown ? 'Enter a valid email address' : undefined}
        >
          <Input placeholder="you@example.com" type="email" />
        </FormField>
        <button type="button" onClick={() => setShown(true)}>
          Check
        </button>
      </Stack>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('alert')).toBeNull()
    await userEvent.click(canvas.getByRole('button', { name: 'Check' }))
    const alert = await canvas.findByRole('alert')
    await expect(alert).toHaveTextContent('Enter a valid email address')
    await expect(alert).toHaveAttribute('aria-live', 'assertive')
    // Still the input's description, still invalid.
    const input = canvas.getByLabelText('Email')
    await expect(input).toBeInvalid()
    await expect(input.getAttribute('aria-describedby')).toContain(alert.id)
    await expect(input).toHaveAccessibleDescription(
      'Enter a valid email address',
    )
  },
}

/** Label only: no helper text and no error. */
export const LabelOnly: Story = {
  args: { helperText: undefined },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/** Helper and error together: the error follows the helper text. */
export const HelperAndError: Story = {
  args: { errorText: 'Enter a valid email address' },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/** Long text: label, helper and error wrap inside the field width. */
export const LongText: Story = {
  args: {
    label: 'How should the worker get into the property on the day?',
    helperText:
      'Include parking, door codes and whether anyone will be home when the worker arrives, so they can plan the visit.',
    errorText: 'Add a little more detail so the worker knows how to get in',
  },
  render: (args) => (
    <Box maxW="360px">
      <FormField {...args}>
        <Input placeholder="e.g. Key safe by the side gate" />
      </FormField>
    </Box>
  ),
}

/** Render prop: children receive the resolved field state instead of a node. */
export const RenderProp: Story = {
  args: {
    required: true,
    helperText: undefined,
    errorText: 'Pick a date for the work',
  },
  render: (args) => (
    <FormField {...args}>
      {(field) => (
        <Text id={field.controlId} fontSize="sm" color="text.muted">
          {`invalid: ${field.invalid}, disabled: ${field.disabled}, required: ${field.required}`}
        </Text>
      )}
    </FormField>
  ),
}

/** Focus: the control is autofocused to show the SDL focus ring on the shell. */
export const Focus: Story = {
  args: { helperText: 'The shell expresses the focus ring.' },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" autoFocus />
    </FormField>
  ),
}

/** Leading icon + clickable row (e.g. a date trigger). Row is focusable. */
export const WithLeadingIcon: Story = {
  args: {
    label: 'Preferred date',
    helperText: 'Tap to open the date picker.',
    icon: <LuCalendar aria-hidden />,
  },
  render: (args) => (
    <FormField {...args} onControlClick={() => {}}>
      <Input placeholder="Select a date" readOnly />
    </FormField>
  ),
}

/** Select control inside a field. */
export const WithSelect: Story = {
  args: {
    label: 'Category',
    helperText: 'Workers filter discovery by category.',
  },
  render: (args) => (
    <FormField {...args}>
      <Select>
        <option value="">Select a category…</option>
        <option value="handyman">Handyman</option>
        <option value="cleaning">Cleaning</option>
        <option value="garden">Garden</option>
      </Select>
    </FormField>
  ),
}

/** Multiline textarea inside a field. */
export const WithTextarea: Story = {
  args: {
    label: 'Describe the work',
    helperText: 'Include access details, materials, and timing.',
  },
  render: function WithTextareaStory(args) {
    const [value, setValue] = useState('')
    return (
      <FormField {...args}>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What needs doing, and when?"
          rows={4}
        />
      </FormField>
    )
  },
}

/** Phone number entry inside a field. */
export const WithPhoneInput: Story = {
  args: {
    label: 'Mobile number',
    helperText: 'UK numbers only. We text a verification code.',
  },
  render: function WithPhoneInputStory(args) {
    const [phone, setPhone] = useState('')
    return (
      <FormField {...args}>
        <PhoneInput value={phone} onChange={setPhone} />
      </FormField>
    )
  },
}

/** OTP entry: surfaces an error once a partial code is entered. */
export const WithOtp: Story = {
  args: {
    label: 'Verification code',
    helperText: undefined,
  },
  render: function WithOtpStory(args) {
    const [code, setCode] = useState('')
    return (
      <FormField
        {...args}
        errorText={
          code.length > 0 && code.length < 6 ? 'Enter all 6 digits' : undefined
        }
      >
        <OtpInput value={code} onChange={setCode} />
      </FormField>
    )
  },
}

/** The parts of the field labelled `label`: its root, label, control shell, helper and error. */
function fieldParts(canvas: ReturnType<typeof within>, label: string) {
  const labelEl = canvas.getByText(label, { selector: 'label' })
  const root = labelEl.parentElement as HTMLElement
  const shell = (canvas.getByLabelText(label) as HTMLElement)
    .parentElement as HTMLElement
  return {
    root,
    labelEl,
    shell,
    helper: root.querySelector('[id$="-helper"]'),
    error: root.querySelector('[id$="-error"]'),
  }
}

/**
 * Spacing: label 8 above the control, helper 4 below it, error 4 below the
 * helper (or 4 below the control when there is no helper), an inline action in
 * the helper slot 4 below the control, and 20 from one field to the next.
 */
export const Spacing: Story = {
  render: () => (
    <FormStack maxW="420px">
      <FormField label="Helper only" helperText="A short hint under the field.">
        <Input placeholder="you@example.com" />
      </FormField>
      <FormField label="Error only" errorText="Enter a valid email address">
        <Input placeholder="you@example.com" />
      </FormField>
      <FormField
        label="Helper and error"
        helperText="A short hint under the field."
        errorText="Enter a valid email address"
      >
        <Input placeholder="you@example.com" />
      </FormField>
      <FormField
        label="Helper action"
        helperAction={<Link href="/forgot-password">Forgot password?</Link>}
      >
        <Input placeholder="Password" type="password" />
      </FormField>
      <FormField label="Label only">
        <Input placeholder="you@example.com" />
      </FormField>
    </FormStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const labels = [
      'Helper only',
      'Error only',
      'Helper and error',
      'Helper action',
      'Label only',
    ]
    const fields = labels.map((label) => fieldParts(canvas, label))
    const [helperOnly, errorOnly, both, action, labelOnly] = fields

    // Label to control: 8 in every field.
    for (const field of fields) {
      await expect(gapBelow(field.labelEl, field.shell)).toBe(8)
    }

    // Control to helper or error: 4.
    await expect(gapBelow(helperOnly.shell, helperOnly.helper as Element)).toBe(
      4,
    )
    await expect(gapBelow(errorOnly.shell, errorOnly.error as Element)).toBe(4)
    await expect(gapBelow(both.shell, both.helper as Element)).toBe(4)

    // Helper to error: 4.
    await expect(gapBelow(both.helper as Element, both.error as Element)).toBe(
      4,
    )

    // An inline action sits in the helper slot, 4 below the control.
    const link = canvas.getByText('Forgot password?')
    await expect(gapBelow(action.shell, link.parentElement as Element)).toBe(4)

    // One field to the next: 20, whatever the field holds.
    for (let i = 0; i < fields.length - 1; i += 1) {
      await expect(gapBelow(fields[i].root, fields[i + 1].root)).toBe(20)
    }
    await expect(heightOf(labelOnly.root)).toBe(20 + 8 + 48)
  },
}

/**
 * Heights: a control inside a field is 48 tall; on its own (a search bar, a
 * composer) it stays the 44px touch target.
 */
export const Heights: Story = {
  render: () => (
    <Stack gap={6} maxW="420px">
      <FormField label="Name">
        <Input placeholder="Full name" />
      </FormField>
      <FormField label="Category">
        <Select>
          <option value="">Select a category…</option>
        </Select>
      </FormField>
      <PhoneField />
      <Input aria-label="Standalone" placeholder="Standalone" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const label of ['Name', 'Category']) {
      await expect(heightOf(fieldParts(canvas, label).shell)).toBe(48)
    }
    const phone = fieldParts(canvas, 'Mobile number').shell
    await expect(heightOf(phone)).toBe(48)
    // The dial prefix beside it is the same height.
    await expect(
      heightOf(canvas.getByText('+44').parentElement as Element),
    ).toBe(48)
    const standalone = (canvas.getByLabelText('Standalone') as HTMLElement)
      .parentElement as HTMLElement
    await expect(heightOf(standalone)).toBe(44)
  },
}

function PhoneField() {
  const [phone, setPhone] = useState('')
  return <PhoneInput label="Mobile number" value={phone} onChange={setPhone} />
}
