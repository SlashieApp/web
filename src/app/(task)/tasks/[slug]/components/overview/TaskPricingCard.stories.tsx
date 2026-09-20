import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskPricingCard } from './TaskPricingCard'

const meta: Meta<typeof TaskPricingCard> = {
  title: 'task/tasks/overview/TaskPricingCard',
  component: TaskPricingCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TaskPricingCard>

export const Default: Story = {}

export const Compact: Story = {
  args: { compact: true },
}
