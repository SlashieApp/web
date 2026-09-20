import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskList } from './TaskList'

const meta: Meta<typeof TaskList> = {
  title: 'task/layout/TaskList',
  component: TaskList,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
