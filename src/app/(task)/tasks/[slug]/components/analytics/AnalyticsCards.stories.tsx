import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'
import { AnalyticsCards, TaskAnalyticsTrigger } from './AnalyticsCards'

const meta: Meta<typeof AnalyticsCards> = {
  title: 'Task detail/Analytics/AnalyticsCards',
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

/** Phones: the Overview button that opens the snapshot in a sheet. */
export const PhoneTrigger: Story = {
  render: () => <TaskAnalyticsTrigger />,
  globals: { viewport: { value: 'mobile1' } },
}
