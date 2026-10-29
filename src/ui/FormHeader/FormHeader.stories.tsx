import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { FormField } from '../FormField/FormField'
import { gapBelow } from '../FormField/formGap.testing'
import { Input } from '../Input/Input'
import { FormHeader } from './FormHeader'

/**
 * SDL FormHeader: the title and its subtitle 8 apart (`titleToSubtitle`), then
 * 24 to the first field or block (`headerToBody`). The header owns that 24, so
 * it sits in a plain container, not a stack with its own gap.
 */
const meta = {
  title: 'UI/FormHeader',
  component: FormHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    as: { control: 'inline-radio', options: ['h1', 'h2', 'h3'] },
    align: { control: 'inline-radio', options: ['start', 'center'] },
  },
  args: {
    title: 'Create your account',
    description: 'Post a task or find work near you.',
  },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FormHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Title, 8, subtitle, 24, first field. */
export const Default: Story = {
  render: (args) => (
    <>
      <FormHeader {...args} />
      <FormField label="Email">
        <Input placeholder="you@example.com" type="email" />
      </FormField>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { name: 'Create your account' })
    const subtitle = canvas.getByText('Post a task or find work near you.')
    const field = canvas.getByText('Email', { selector: 'label' })
      .parentElement as HTMLElement
    await expect(gapBelow(title, subtitle)).toBe(8)
    await expect(gapBelow(subtitle, field)).toBe(24)
  },
}

/** No subtitle: the title, then 24 to the first field. */
export const TitleOnly: Story = {
  args: { description: undefined },
  render: (args) => (
    <>
      <FormHeader {...args} />
      <FormField label="Email">
        <Input placeholder="you@example.com" type="email" />
      </FormField>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { name: 'Create your account' })
    const field = canvas.getByText('Email', { selector: 'label' })
      .parentElement as HTMLElement
    await expect(gapBelow(title, field)).toBe(24)
  },
}

/** Status pages (sent, expired, done) centre the header. */
export const Centered: Story = {
  args: {
    title: 'Check your email',
    description: 'We sent a link to you@example.com.',
    align: 'center',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { name: 'Check your email' })
    await expect(
      getComputedStyle(title.parentElement as Element).textAlign,
    ).toBe('center')
  },
}
