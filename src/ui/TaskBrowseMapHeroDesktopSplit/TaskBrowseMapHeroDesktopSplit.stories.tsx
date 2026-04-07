import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseMapHeroDesktopSplit } from './TaskBrowseMapHeroDesktopSplit'

const meta = {
  title: 'ui/TaskBrowseMapHeroDesktopSplit',
  component: TaskBrowseMapHeroDesktopSplit,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TaskBrowseMapHeroDesktopSplit>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    filters: null,
    taskList: null,
  },
  render: () => (
    <TaskBrowseMapHeroDesktopSplit
      filters={
        <Text fontSize="sm" px={2}>
          Filter form placeholder
        </Text>
      }
      taskList={
        <Text fontSize="sm" px={2}>
          List column placeholder
        </Text>
      }
    />
  ),
}
