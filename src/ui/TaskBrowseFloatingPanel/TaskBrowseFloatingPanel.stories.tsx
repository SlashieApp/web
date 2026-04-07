import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseFloatingPanel } from './TaskBrowseFloatingPanel'

const meta = {
  title: 'ui/TaskBrowseFloatingPanel',
  component: TaskBrowseFloatingPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    minH: '120px',
    p: 4,
  },
} satisfies Meta<typeof TaskBrowseFloatingPanel>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <TaskBrowseFloatingPanel {...args}>
      <Text fontSize="sm">
        Floating panel surface (map hero / list chrome).
      </Text>
    </TaskBrowseFloatingPanel>
  ),
}
