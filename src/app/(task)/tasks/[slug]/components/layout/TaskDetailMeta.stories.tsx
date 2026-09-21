import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { TaskDetailMeta } from './TaskDetailMeta'

const meta: Meta<typeof TaskDetailMeta> = {
  title: 'task/tasks/layout/TaskDetailMeta',
  component: TaskDetailMeta,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Stuck chrome: one row, scroll sideways when the chips overflow. */
export const Stuck: Story = {
  args: { isStuck: true },
  decorators: [
    (Story) => (
      <Box maxW="280px">
        <Story />
      </Box>
    ),
  ],
}
