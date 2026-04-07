import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskFilter } from './TaskFilter'

const meta = {
  title: 'ui/TaskFilter',
  component: TaskFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    title: 'Filters',
  },
} satisfies Meta<typeof TaskFilter>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <TaskFilter {...args}>
      <Text fontSize="sm" color="muted">
        Filter controls (search, categories, etc.) render here.
      </Text>
    </TaskFilter>
  ),
}
