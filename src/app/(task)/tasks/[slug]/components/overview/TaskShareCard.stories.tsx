import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskShareCard } from './TaskShareCard'

const meta: Meta<typeof TaskShareCard> = {
  title: 'task/tasks/overview/TaskShareCard',
  component: TaskShareCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Compact: Story = {
  args: { compact: true },
}
