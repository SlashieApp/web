import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskPricingCard } from './TaskPricingCard'

const meta: Meta<typeof TaskPricingCard> = {
  title: 'task/tasks/overview/TaskPricingCard',
  component: TaskPricingCard,
  decorators: [withTaskDetailStory({ viewer: 'visitor' })],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TaskPricingCard>

export const Default: Story = {}

/** Mobile main CTA: full-width two-part budget + quote control. */
export const Compact: Story = {
  args: { compact: true },
}

/** Web main CTA: the same two-part control, content width. */
export const Rail: Story = {
  args: { rail: true },
}
