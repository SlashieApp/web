import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryDecorator'
import { storyTaskDetail } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'

import { TaskQuoteFlow } from './TaskQuoteFlow'

const meta: Meta<typeof TaskQuoteFlow> = {
  title: 'stepflow/tasks/quote/TaskQuoteFlow',
  component: TaskQuoteFlow,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Worker who has not quoted yet: empty steps, "Send quote". */
export const Default: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'worker', task: storyTaskDetail({ quotes: [] }) },
      { maxWidth: '100%' },
    ),
  ],
}

/** Worker with a pending quote: prefilled, "Update quote", and Withdraw. */
export const ExistingQuote: Story = {
  decorators: [withTaskDetailStory({ viewer: 'worker' }, { maxWidth: '100%' })],
}
