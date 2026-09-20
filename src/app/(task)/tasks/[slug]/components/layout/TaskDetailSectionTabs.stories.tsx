import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskDetailSectionTabs } from './TaskDetailSectionTabs'

const meta: Meta<typeof TaskDetailSectionTabs> = {
  title: 'task/tasks/layout/TaskDetailSectionTabs',
  component: TaskDetailSectionTabs,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
