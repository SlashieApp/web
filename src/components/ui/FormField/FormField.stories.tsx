import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { FormField } from './FormField'
import { TextInput } from '../Input/TextInput'

const meta: Meta<typeof FormField> = {
  title: 'UI/Molecules/FormField',
  component: FormField,
}

export default meta

type Story = StoryObj<typeof FormField>

export const Default: Story = {
  render: () => (
    <FormField label="Email" helperText="We’ll never share your email.">
      <TextInput placeholder="you@example.com" />
    </FormField>
  ),
}

export const WithError: Story = {
  render: () => (
    <FormField label="Password" errorText="Password is too short">
      <TextInput type="password" placeholder="••••••••" />
    </FormField>
  ),
}
