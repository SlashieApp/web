import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'

import { TaskSecondaryDetailsGrid } from './TaskSecondaryDetailsGrid'

const meta = {
  title: 'task/tasks/mainSection/TaskSecondaryDetailsGrid',
  component: TaskSecondaryDetailsGrid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '640px' })],
} satisfies Meta<typeof TaskSecondaryDetailsGrid>

export default meta

type Story = StoryObj<typeof meta>

export const WithSecondaryFacts: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({
        description:
          'Mount bookshelf.\n\nAccess: Side gate, ring bell\nTools: Bring drill\nParking: Street parking nearby',
      }),
    }),
  ],
}

export const MinimalDescription: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ description: 'Simple shelf mount.' }),
    }),
  ],
}
