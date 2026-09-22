import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskHelpCard } from './TaskHelpCard'

const meta: Meta<typeof TaskHelpCard> = {
  title: 'task/tasks/overview/TaskHelpCard',
  component: TaskHelpCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Owner: no "Report task" on their own task. */
export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
}

export const Visitor: Story = {
  decorators: [withTaskDetailStory({ viewer: 'visitor' })],
}
