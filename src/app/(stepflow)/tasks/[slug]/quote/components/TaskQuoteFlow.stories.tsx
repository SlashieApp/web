import { QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storyTaskQuote } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'

import { TaskQuoteFlow } from './TaskQuoteFlow'
import {
  LIMIT_REACHED_MEMBERSHIP,
  quoteStoryTask,
  withQuoteStory,
} from './taskQuoteStoryFixtures'

const meta: Meta<typeof TaskQuoteFlow> = {
  title: 'Quote flow/TaskQuoteFlow',
  component: TaskQuoteFlow,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Worker who has not quoted yet: empty steps, "Send quote". */
export const Default: Story = {
  decorators: [withQuoteStory({ viewer: 'worker' })],
}

/** Worker with a pending quote: prefilled, "Update quote", and Withdraw. */
export const ExistingQuote: Story = {
  decorators: [
    withQuoteStory({
      viewer: 'worker',
      task: quoteStoryTask({ quotes: [storyTaskQuote()] }),
    }),
  ],
}

/** Worker whose earlier quote was declined: they can send a new one. */
export const QuoteDeclined: Story = {
  decorators: [
    withQuoteStory({
      viewer: 'worker',
      task: quoteStoryTask({
        quotes: [storyTaskQuote({ status: QuoteStatus.Declined })],
      }),
    }),
  ],
}

/** Signed out: the gate asks them to log in, with the task summary above. */
export const SignedOut: Story = {
  decorators: [withQuoteStory({ viewer: 'visitor' })],
}

/** Signed in without a worker profile: the gate offers to create one. */
export const NoWorkerProfile: Story = {
  decorators: [withQuoteStory({ viewer: 'nonWorker' })],
}

/** Worker with an unverified email: the gate points them to their inbox. */
export const EmailNotVerified: Story = {
  decorators: [
    withQuoteStory(
      { viewer: 'worker' },
      { me: () => ({ emailVerified: false }) },
    ),
  ],
}

/** Worker out of free quotes this month: the paywall replaces the form. */
export const QuoteLimitReached: Story = {
  decorators: [
    withQuoteStory(
      { viewer: 'worker' },
      {
        me: (me) => ({
          worker: me.worker && {
            ...me.worker,
            membership: LIMIT_REACHED_MEMBERSHIP,
          },
        }),
      },
    ),
  ],
}

/** Task already awarded to someone else: a splash while they are sent back. */
export const TaskNoLongerOpen: Story = {
  decorators: [
    withQuoteStory({
      viewer: 'worker',
      task: quoteStoryTask({
        status: TaskStatus.Awarded,
        quotes: [
          storyTaskQuote({
            id: 'quote-other',
            workerUserId: 'worker-detail-2',
            status: QuoteStatus.Accepted,
          }),
        ],
      }),
    }),
  ],
}
