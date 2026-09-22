import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskShareCard } from './TaskShareCard'

const meta: Meta<typeof TaskShareCard> = {
  title: 'task/tasks/overview/TaskShareCard',
  component: TaskShareCard,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Main CTA: just the primary button, no card. */
export const Compact: Story = {
  args: { compact: true },
}
