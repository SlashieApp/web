import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { FormField } from '../FormField/FormField'
import { gapBelow, gapBeside, heightOf } from '../FormField/formGap.testing'
import { Input } from '../Input/Input'
import { FormRow } from './FormRow'

/**
 * SDL FormRow: fields side by side, 12 apart (`inlineGap`) and of equal width:
 * Min and Max, From and To, First and Last name. A row aligns to the top, so an
 * error under one field does not stretch the other.
 */
const meta = {
  title: 'UI/FormRow',
  component: FormRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FormRow>

export default meta
type Story = StoryObj<typeof meta>

/** Two fields, 12 apart, the same width. */
export const Pair: Story = {
  render: (args) => (
    <FormRow {...args}>
      <FormField label="Min">
        <Input placeholder="£0" inputMode="numeric" />
      </FormField>
      <FormField label="Max">
        <Input placeholder="£500" inputMode="numeric" />
      </FormField>
    </FormRow>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const min = canvas.getByText('Min', { selector: 'label' })
      .parentElement as HTMLElement
    const max = canvas.getByText('Max', { selector: 'label' })
      .parentElement as HTMLElement
    await expect(gapBeside(min, max)).toBe(12)
    await expect(
      Math.abs(
        min.getBoundingClientRect().width - max.getBoundingClientRect().width,
      ),
    ).toBeLessThan(0.5)
  },
}

/** An error under one field leaves the other at its own height, both on one top edge. */
export const ErrorInOne: Story = {
  render: (args) => (
    <FormRow {...args}>
      <FormField label="First name" errorText="Enter your first name">
        <Input placeholder="Sam" />
      </FormField>
      <FormField label="Last name">
        <Input placeholder="Lee" />
      </FormField>
    </FormRow>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByText('First name', { selector: 'label' })
      .parentElement as HTMLElement
    const last = canvas.getByText('Last name', { selector: 'label' })
      .parentElement as HTMLElement
    await expect(first.getBoundingClientRect().top).toBe(
      last.getBoundingClientRect().top,
    )
    await expect(heightOf(last)).toBeLessThan(heightOf(first))
  },
}

/** Rows stack with the form's 20, like any field. */
export const BelowAField: Story = {
  render: (args) => (
    <Box display="flex" flexDirection="column" gap="form.fieldGap">
      <FormField label="Title">
        <Input placeholder="What needs doing?" />
      </FormField>
      <FormRow {...args}>
        <FormField label="From">
          <Input placeholder="Mon" />
        </FormField>
        <FormField label="To">
          <Input placeholder="Fri" />
        </FormField>
      </FormRow>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByText('Title', { selector: 'label' })
      .parentElement as HTMLElement
    const from = canvas.getByText('From', { selector: 'label' })
      .parentElement as HTMLElement
    await expect(gapBelow(title, from)).toBe(20)
  },
}
