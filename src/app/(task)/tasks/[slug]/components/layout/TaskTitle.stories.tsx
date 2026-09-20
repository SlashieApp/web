import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskTitle } from './TaskTitle'

const meta: Meta<typeof TaskTitle> = {
  title: 'task/tasks/layout/TaskTitle',
  component: TaskTitle,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
