import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskStatusPill } from './TaskStatusPill'

const meta: Meta<typeof TaskStatusPill> = {
  title: 'Task detail/Parts/TaskStatusPill',
  component: TaskStatusPill,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
