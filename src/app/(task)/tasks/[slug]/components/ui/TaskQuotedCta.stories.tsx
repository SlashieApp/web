import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskQuotedCta } from './TaskQuotedCta'

const meta: Meta<typeof TaskQuotedCta> = {
  title: 'task/tasks/ui/TaskQuotedCta',
  component: TaskQuotedCta,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

/** Worker with a pending £85 quote. */
export const Default: Story = {
  decorators: [withTaskDetailStory({ viewer: 'worker' })],
}

/** API returned no price for the worker's own quote (and none stored). */
export const PriceUnavailable: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({
        quotes: [
          storyTaskQuote({
            id: 'quote-no-price',
            workerUserId: STORY_WORKER_ID,
            price: null,
          }),
        ],
      }),
    }),
  ],
}
