import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'
import { AnalyticsCards } from './AnalyticsCards'

const meta: Meta<typeof AnalyticsCards> = {
  title: 'task/tasks/analytics/AnalyticsCards',
  component: AnalyticsCards,
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof AnalyticsCards>

export const Default: Story = {}

export const NoQuotes: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ quotes: [], views: 2 }),
    }),
  ],
}
