import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskDetailMoneyChrome } from './TaskDetailMoneyChrome'

const meta: Meta<typeof TaskDetailMoneyChrome> = {
  title: 'task/tasks/layout/TaskDetailMoneyChrome',
  component: TaskDetailMoneyChrome,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
