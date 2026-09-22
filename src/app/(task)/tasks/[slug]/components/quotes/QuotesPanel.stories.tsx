import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'
import { QuotesPanel } from './QuotesPanel'

const meta: Meta<typeof QuotesPanel> = {
  title: 'task/tasks/quotes/QuotesPanel',
  component: QuotesPanel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' })],
}

/** Owner with no quotes yet — "Reaching workers" empty card. */
export const OwnerEmpty: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ quotes: [] }),
    }),
  ],
}
