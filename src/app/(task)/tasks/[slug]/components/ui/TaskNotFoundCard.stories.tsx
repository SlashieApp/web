import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskNotFoundCard } from './TaskNotFoundCard'

const meta: Meta<typeof TaskNotFoundCard> = {
  title: 'task/tasks/ui/TaskNotFoundCard',
  component: TaskNotFoundCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
