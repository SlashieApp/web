import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskPricingCard } from './TaskPricingCard'

const visitor = withTaskDetailStory({ viewer: 'visitor' })

const meta: Meta<typeof TaskPricingCard> = {
  title: 'task/tasks/overview/TaskPricingCard',
  component: TaskPricingCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TaskPricingCard>

export const Default: Story = {
  decorators: [visitor],
}

/** Mobile main CTA: full-width two-part budget + quote control. */
export const Compact: Story = {
  args: { compact: true },
  decorators: [visitor],
}

/** Web main CTA: the same two-part control, content width. */
export const Rail: Story = {
  args: { rail: true },
  decorators: [visitor],
}

/** Worker with a pending £85 quote: budget left, asking price right. */
export const QuotedWorker: Story = {
  decorators: [withTaskDetailStory({ viewer: 'worker' })],
}
