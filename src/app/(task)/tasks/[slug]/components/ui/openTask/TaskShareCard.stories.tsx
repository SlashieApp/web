import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskShareCard } from './TaskShareCard'

const meta: Meta<typeof TaskShareCard> = {
  title: 'task/tasks/ui/openTask/TaskShareCard',
  component: TaskShareCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
