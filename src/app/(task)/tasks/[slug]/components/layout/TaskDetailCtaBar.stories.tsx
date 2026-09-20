import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskDetailCtaBar } from './TaskDetailCtaBar'

const meta: Meta<typeof TaskDetailCtaBar> = {
  title: 'task/tasks/layout/TaskDetailCtaBar',
  component: TaskDetailCtaBar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
