import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { MainSectionHeader } from './MainSectionHeader'

const meta = {
  title: 'taskDetail/MainSection/MainSectionHeader',
  component: MainSectionHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '640px' })],
} satisfies Meta<typeof MainSectionHeader>

export default meta

type Story = StoryObj<typeof meta>

export const OpenTask: Story = {}

export const BookedTask: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({ status: 'CLOSED' }),
        order: storyTaskOrder(),
      },
      { maxWidth: '640px' },
    ),
  ],
}
