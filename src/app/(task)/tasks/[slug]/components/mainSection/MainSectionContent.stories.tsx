import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'

import { MainSectionContent } from './MainSectionContent'

const meta = {
  title: 'task/MainSection/MainSectionContent',
  component: MainSectionContent,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '720px' })],
} satisfies Meta<typeof MainSectionContent>

export default meta

type Story = StoryObj<typeof meta>

export const WithPhotosAndContact: Story = {}

export const NoImages: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({ images: [], contactMethod: 'EMAIL' }),
      },
      { maxWidth: '720px' },
    ),
  ],
}
