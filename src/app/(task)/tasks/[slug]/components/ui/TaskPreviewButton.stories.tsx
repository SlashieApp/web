import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskPreviewButton } from './TaskPreviewButton'

const meta: Meta<typeof TaskPreviewButton> = {
  title: 'task/tasks/ui/TaskPreviewButton',
  component: TaskPreviewButton,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
