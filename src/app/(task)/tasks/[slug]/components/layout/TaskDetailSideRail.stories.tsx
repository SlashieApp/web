import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskDetailSideRail } from './TaskDetailSideRail'

const meta: Meta<typeof TaskDetailSideRail> = {
  title: 'task/tasks/layout/TaskDetailSideRail',
  component: TaskDetailSideRail,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
