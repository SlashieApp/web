import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskOverflowMenu } from './TaskOverflowMenu'

const meta: Meta<typeof TaskOverflowMenu> = {
  title: 'task/tasks/layout/TaskOverflowMenu',
  component: TaskOverflowMenu,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
