import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskDetailTabs } from './TaskDetailTabs'

const meta: Meta<typeof TaskDetailTabs> = {
  title: 'task/tasks/layout/TaskDetailTabs',
  component: TaskDetailTabs,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
