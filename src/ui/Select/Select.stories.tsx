import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Select } from './Select'

const meta = {
  title: 'ui/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const PostTaskSchedule: Story = {
  render: () => (
    <Select defaultValue="flexible">
      <option value="flexible">Flexible</option>
      <option value="before">Before a date</option>
      <option value="exact">Exact date and time</option>
    </Select>
  ),
}

export const WorkerSetupCategory: Story = {
  render: () => (
    <Select defaultValue="">
      <option value="">Select a category…</option>
      <option value="handyman">Handyman</option>
      <option value="cleaning">Cleaning</option>
    </Select>
  ),
}

export const QuotesSortOrder: Story = {
  render: () => (
    <Select defaultValue="recommended">
      <option value="recommended">Recommended</option>
      <option value="price_low">Price (lowest)</option>
      <option value="price_high">Price (highest)</option>
      <option value="recent">Most recent</option>
    </Select>
  ),
}
