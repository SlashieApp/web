import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@ui'

import { TaskDetailPinCard } from './TaskDetailPinCard'

const meta: Meta<typeof TaskDetailPinCard> = {
  title: 'task/tasks/ui/TaskDetailPinCard',
  component: TaskDetailPinCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TaskDetailPinCard>

export const Default: Story = {
  args: {
    title: '£120',
    subtitle: 'Fixed · Cash',
    action: (
      <Button variant="primary" size="sm">
        Send quote
      </Button>
    ),
  },
}
