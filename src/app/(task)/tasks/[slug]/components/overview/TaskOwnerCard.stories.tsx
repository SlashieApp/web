import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'

import { TaskOwnerCard } from './TaskOwnerCard'

const meta = {
  title: 'task/tasks/overview/TaskOwnerCard',
  component: TaskOwnerCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
} satisfies Meta<typeof TaskOwnerCard>

export default meta

type Story = StoryObj<typeof meta>

export const WithAvatar: Story = {}

export const Compact: Story = {
  args: { compact: true },
}

export const InitialsOnly: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({
        poster: {
          id: storyTaskDetail().poster?.id ?? 'owner',
          email: 'alex@example.com',
          profile: { name: 'Alex Chen', avatarUrl: null },
        },
      }),
    }),
  ],
}
