import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskHelpCard } from './TaskHelpCard'

const meta: Meta<typeof TaskHelpCard> = {
  title: 'task/tasks/overview/TaskHelpCard',
  component: TaskHelpCard,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
