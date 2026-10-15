import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskActivitySections } from './TaskActivitySections'

const meta: Meta<typeof TaskActivitySections> = {
  title: 'Task detail/Overview/TaskActivitySections',
  component: TaskActivitySections,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
