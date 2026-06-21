import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Input } from '../Input/Input'
import { OtpInput } from '../OtpInput/OtpInput'
import { PhoneInput } from '../PhoneInput/PhoneInput'
import { Select } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { FormField } from './FormField'

const meta = {
  title: 'ui/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: 'Label',
    children: null,
  },
  argTypes: {
    children: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof FormField>

export default meta

type Story = StoryObj<typeof meta>

export const AuthEmail: Story = {
  args: {
    label: 'Email',
    helperText: 'Used to sign in and receive quote updates.',
  },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

export const PostTaskTitle: Story = {
  args: {
    label: 'Task title',
    errorText: 'Add a short, specific title',
  },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="e.g. Fix leaking pipe under sink" />
    </FormField>
  ),
}

export const PostTaskCategory: Story = {
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

export const PostTaskDescription: Story = {
  args: {
    label: 'Describe the work',
    helperText: 'Include access details, materials, and timing.',
  },
  render: function PostTaskDescriptionStory(args) {
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

export const VerifyPhoneNumber: Story = {
  args: {
    label: 'Mobile number',
    helperText: 'UK numbers only — we text a verification code.',
  },
  render: function VerifyPhoneNumberStory(args) {
    const [phone, setPhone] = useState('')
    return (
      <FormField {...args}>
        <PhoneInput value={phone} onChange={setPhone} />
      </FormField>
    )
  },
}

export const VerifyOtpCode: Story = {
  args: {
    label: 'Verification code',
  },
  render: function VerifyOtpCodeStory(args) {
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
