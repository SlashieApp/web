import { Stack } from '@chakra-ui/react'
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
} satisfies Meta<typeof FormField>

export default meta

type Story = StoryObj<typeof meta>

export const AuthEmail: Story = {
  render: () => (
    <FormField
      label="Email"
      helperText="Used to sign in and receive quote updates."
    >
      <Input placeholder="you@example.com" type="email" />
    </FormField>
  ),
}

export const PostTaskTitle: Story = {
  render: () => (
    <FormField label="Task title" errorText="Add a short, specific title">
      <Input placeholder="e.g. Fix leaking pipe under sink" />
    </FormField>
  ),
}

export const PostTaskCategory: Story = {
  render: () => (
    <FormField
      label="Category"
      helperText="Workers filter discovery by category."
    >
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
  render: function PostTaskDescriptionStory() {
    const [value, setValue] = useState('')
    return (
      <FormField
        label="Describe the work"
        helperText="Include access details, materials, and timing."
      >
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
  render: function VerifyPhoneNumberStory() {
    const [phone, setPhone] = useState('')
    return (
      <FormField
        label="Mobile number"
        helperText="UK numbers only — we text a verification code."
      >
        <PhoneInput value={phone} onChange={setPhone} />
      </FormField>
    )
  },
}

export const VerifyOtpCode: Story = {
  render: function VerifyOtpCodeStory() {
    const [code, setCode] = useState('')
    return (
      <FormField
        label="Verification code"
        errorText={
          code.length > 0 && code.length < 6 ? 'Enter all 6 digits' : undefined
        }
      >
        <OtpInput value={code} onChange={setCode} />
      </FormField>
    )
  },
}
