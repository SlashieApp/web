import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { Button } from '../Button/Button'
import { FormField } from '../FormField/FormField'
import { gapBelow } from '../FormField/formGap.testing'
import { FormSection } from '../FormSection/FormSection'
import { Input } from '../Input/Input'
import { FormStack } from './FormStack'

/**
 * SDL FormStack: the vertical rhythm of a form. Fields sit 20 apart
 * (`formSpace.fieldGap`), and the main button is one more child, so the last
 * field is 20 above it. With `gap="section"` the sections of a long form sit 32
 * apart. The gap is a `form.*` spacing token, so a screen never types one.
 */
const meta = {
  title: 'UI/FormStack',
  component: FormStack,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    gap: { control: 'inline-radio', options: ['field', 'section'] },
    children: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof FormStack>

export default meta
type Story = StoryObj<typeof meta>

/** Fields 20 apart, then the main button 20 below the last field. */
export const Fields: Story = {
  render: (args) => (
    <FormStack {...args} maxW="420px">
      <FormField label="Email" helperText="Used to sign in.">
        <Input placeholder="you@example.com" type="email" />
      </FormField>
      <FormField label="Password" errorText="Use at least 8 characters.">
        <Input placeholder="Password" type="password" />
      </FormField>
      <Button size="form" w="full">
        Create account
      </Button>
    </FormStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const email = canvas.getByText('Email', { selector: 'label' })
      .parentElement as HTMLElement
    const password = canvas.getByText('Password', { selector: 'label' })
      .parentElement as HTMLElement
    const button = canvas.getByRole('button', { name: 'Create account' })
    await expect(gapBelow(email, password)).toBe(20)
    await expect(gapBelow(password, button)).toBe(20)
  },
}

/** A form-level note or error is one more child, 20 from its neighbours. */
export const WithNote: Story = {
  render: (args) => (
    <FormStack {...args} maxW="420px">
      <FormField label="Email">
        <Input placeholder="you@example.com" type="email" />
      </FormField>
      <p role="alert">We could not sign you in. Check your details.</p>
      <Button size="form" w="full">
        Log in
      </Button>
    </FormStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByText('Email', { selector: 'label' })
      .parentElement as HTMLElement
    const note = canvas.getByRole('alert')
    const button = canvas.getByRole('button', { name: 'Log in' })
    await expect(gapBelow(field, note)).toBe(20)
    await expect(gapBelow(note, button)).toBe(20)
  },
}

/** `gap="section"`: the sections of a long form, 32 apart, no dividing lines. */
export const Sections: Story = {
  args: { gap: 'section' },
  render: (args) => (
    <FormStack {...args} maxW="420px">
      <FormSection title="Contact">
        <FormField label="Email">
          <Input placeholder="you@example.com" type="email" />
        </FormField>
      </FormSection>
      <FormSection title="Address">
        <FormField label="Postcode">
          <Input placeholder="SW1A 1AA" />
        </FormField>
      </FormSection>
    </FormStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const contact = canvas.getByRole('region', { name: 'Contact' })
    const address = canvas.getByRole('region', { name: 'Address' })
    await expect(gapBelow(contact, address)).toBe(32)
  },
}
