import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseMapHeroMobileColumn } from './TaskBrowseMapHeroMobileColumn'

const meta = {
  title: 'ui/TaskBrowseMapHeroMobileColumn',
  component: TaskBrowseMapHeroMobileColumn,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onOpenFilters: () => {},
  },
} satisfies Meta<typeof TaskBrowseMapHeroMobileColumn>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    taskList: null,
  },
  render: (args) => (
    <TaskBrowseMapHeroMobileColumn
      {...args}
      taskList={
        <Text fontSize="sm" p={4}>
          Mobile list stack below the filters button.
        </Text>
      }
    />
  ),
}
