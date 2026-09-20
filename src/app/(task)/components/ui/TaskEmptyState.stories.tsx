import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskEmptyState } from './TaskEmptyState'

const meta: Meta<typeof TaskEmptyState> = {
  title: 'task/ui/TaskEmptyState',
  component: TaskEmptyState,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
