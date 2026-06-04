import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../helpers/taskDetailStoryFixtures'

import { TaskHeader } from './TaskHeader'

const meta = {
  title: 'taskDetail/TaskHeader',
  component: TaskHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskHeader>

export default meta

type Story = StoryObj<typeof meta>

export const OwnerOpenTask: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
}

export const OwnerWithActiveOrder: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      order: storyTaskOrder(),
    }),
  ],
}

export const Visitor: Story = {
  decorators: [withTaskDetailStory({ viewer: 'visitor' })],
}
