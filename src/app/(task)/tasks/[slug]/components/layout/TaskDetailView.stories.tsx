import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskDetailView } from './TaskDetailView'

const meta: Meta<typeof TaskDetailView> = {
  title: 'task/tasks/layout/TaskDetailView',
  component: TaskDetailView,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
