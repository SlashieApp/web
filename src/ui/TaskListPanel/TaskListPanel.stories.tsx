import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskListPanel } from './TaskListPanel'

const meta = {
  title: 'ui/TaskListPanel',
  component: TaskListPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TaskListPanel>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <TaskListPanel {...args}>
      <Text fontSize="sm" p={4}>
        Task list column content (header + scrollable list in app).
      </Text>
    </TaskListPanel>
  ),
}
