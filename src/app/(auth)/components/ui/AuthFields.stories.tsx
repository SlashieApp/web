import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { FormField } from '@ui'

import { AuthCheckbox, EmailInput, PasswordInput } from './AuthFields'

/** The fields every auth form uses: email, password with show / hide, checkbox. */
const meta = {
  title: 'Auth/Parts/AuthFields',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Email with its icon. */
export const Email: Story = {
  render: () => (
    <FormField label="Email">
      <EmailInput />
    </FormField>
  ),
}

/** Password: the eye button shows and hides it. */
export const Password: Story = {
  render: () => (
    <FormField label="Password">
      <PasswordInput defaultValue="correct-horse" />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByLabelText('Password')
    expect(field).toHaveAttribute('type', 'password')
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }))
    expect(field).toHaveAttribute('type', 'text')
    await canvas.findByRole('button', { name: 'Hide password' })
  },
}

/** New password: the rule as a hint, and the error under it. */
export const NewPasswordWithError: Story = {
  render: () => (
    <FormField
      label="Password"
      helperText="At least 8 characters."
      errorText="Use at least 8 characters."
    >
      <PasswordInput defaultValue="short" />
    </FormField>
  ),
}

function CheckboxDemo({ errorText }: { errorText?: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <AuthCheckbox
      name="isOver18"
      checked={checked}
      onCheckedChange={setChecked}
      label="I confirm I am 18 or over."
      errorText={errorText}
    />
  )
}

/** Checkbox: the label toggles it too. */
export const Checkbox: Story = {
  render: () => (
    <Stack>
      <CheckboxDemo />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('I confirm I am 18 or over.'))
    expect(canvas.getByRole('checkbox')).toBeChecked()
  },
}

/** Checkbox with its error (a required consent left unticked). */
export const CheckboxError: Story = {
  render: () => (
    <CheckboxDemo errorText="You must confirm you are 18 or over to use Slashie." />
  ),
}
