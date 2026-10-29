import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { formSpace, minHitArea } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'
import { FormField, FormStack } from '@ui'

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

function CheckboxDemo({
  errorText,
  fieldGroup,
}: {
  errorText?: string
  fieldGroup?: boolean
}) {
  const [checked, setChecked] = useState(false)
  return (
    <AuthCheckbox
      name="isOver18"
      checked={checked}
      onCheckedChange={setChecked}
      label="I confirm I am 18 or over."
      errorText={errorText}
      fieldGroup={fieldGroup}
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

/**
 * A checkbox as a field group (FE-481): one 20px line between two fields, 20
 * above and below it, its error 4 under it. The row is 44 tall to tap and
 * adds no space.
 */
export const CheckboxFieldGroup: Story = {
  render: () => (
    <FormStack maxW="360px">
      <FormField label="Email">
        <EmailInput />
      </FormField>
      <CheckboxDemo
        fieldGroup
        errorText="You must confirm you are 18 or over."
      />
      <FormField label="Password">
        <PasswordInput />
      </FormField>
    </FormStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByRole('checkbox').closest('label') as HTMLElement
    const control = root.querySelector('[data-part="control"]') as HTMLElement
    const row = canvas.getByText('I confirm I am 18 or over.')
      .parentElement as HTMLElement
    const error = canvas.getByText('You must confirm you are 18 or over.')
    const email = canvas.getByText('Email', { selector: 'label' })
      .parentElement as HTMLElement
    const password = canvas.getByText('Password', { selector: 'label' })
      .parentElement as HTMLElement
    const emailShell = (email.querySelector('input') as HTMLElement)
      .parentElement as HTMLElement

    await expect(heightOf(control)).toBe(20)
    await expect(gapBelow(emailShell, control)).toBe(formSpace.fieldGap)
    await expect(gapBelow(control, error)).toBe(formSpace.controlToHelper)
    await expect(gapBelow(error, password)).toBe(formSpace.fieldGap)
    await expect(heightOf(row)).toBe(minHitArea)
  },
}
