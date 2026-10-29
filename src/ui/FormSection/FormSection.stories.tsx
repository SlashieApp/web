import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { FormField } from '../FormField/FormField'
import { gapBelow } from '../FormField/formGap.testing'
import { FormStack } from '../FormStack/FormStack'
import { Input } from '../Input/Input'
import { FormSection } from './FormSection'

/**
 * SDL FormSection, for a long form: a section title, then its first field 12
 * below it (`sectionTitleToField`) and its fields 20 apart. Sections sit 32
 * apart (`sectionGap`) in a `FormStack gap="section"`, with no dividing lines.
 */
const meta = {
  title: 'UI/FormSection',
  component: FormSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    as: { control: 'inline-radio', options: ['h2', 'h3'] },
    children: { control: false, table: { disable: true } },
  },
  args: { title: 'Contact', children: null },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FormSection>

export default meta
type Story = StoryObj<typeof meta>

/** Section title, 12, first field, 20, next field. */
export const Default: Story = {
  render: (args) => (
    <FormSection {...args}>
      <FormField label="Email">
        <Input placeholder="you@example.com" type="email" />
      </FormField>
      <FormField label="Phone">
        <Input placeholder="07700 900123" type="tel" />
      </FormField>
    </FormSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { name: 'Contact' })
    const email = canvas.getByText('Email', { selector: 'label' })
      .parentElement as HTMLElement
    const phone = canvas.getByText('Phone', { selector: 'label' })
      .parentElement as HTMLElement
    await expect(gapBelow(title, email)).toBe(12)
    await expect(gapBelow(email, phone)).toBe(20)
  },
}

/** Two sections: 32 apart, and each is a named region. */
export const TwoSections: Story = {
  render: () => (
    <FormStack gap="section">
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
    // No dividing line: neither section draws a border.
    await expect(getComputedStyle(contact).borderTopWidth).toBe('0px')
    await expect(getComputedStyle(address).borderTopWidth).toBe('0px')
  },
}
