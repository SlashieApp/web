import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskDetailsCard } from './TaskDetailsCard'

const meta: Meta<typeof TaskDetailsCard> = {
  title: 'task/tasks/ui/openTask/TaskDetailsCard',
  component: TaskDetailsCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
