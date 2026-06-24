import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { LuCalendar } from 'react-icons/lu'

import { Input } from '../Input/Input'
import { OtpInput } from '../OtpInput/OtpInput'
import { PhoneInput } from '../PhoneInput/PhoneInput'
import { Select } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { FormField } from './FormField'

/**
 * SDL FormField — the labelled wrapper that supplies a persistent `<label>`,
 * helper copy, and an error message wired via `aria-describedby` to whatever
 * control it wraps. The error message never relies on color alone: it pairs a
 * danger dot with the label text. Renders under both light and dark via the
 * global theme toolbar.
 */
const meta = {
  title: 'Components/FormField',
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

/** Interactive playground — toggle helperText / errorText / disabled / required. */
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

/** Default — label + helper text, no error. */
export const Default: Story = {
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/** Disabled — field context disables the wrapped control. */
export const Disabled: Story = {
  args: { disabled: true, helperText: 'Locked while we save your draft.' },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/** Required — the field advertises required state to the control. */
export const Required: Story = {
  args: { required: true, helperText: 'You must confirm an email.' },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

/** Error — message is tied via aria-describedby and shows a dot + label. */
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

/** Focus — autofocus the control to show the SDL focus ring on the shell. */
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
    helperText: 'UK numbers only — we text a verification code.',
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

/** OTP entry — surfaces an error once a partial code is entered. */
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
