import { QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  STORY_CLOSED_STATUS,
  storyTaskQuote,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'

import { TaskQuoteFlow } from './TaskQuoteFlow'
import {
  LIMIT_REACHED_MEMBERSHIP,
  QUOTE_ZH_HK,
  quoteStoryTask,
  withQuoteStory,
  withQuoteZhHk,
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

/** Worker whose earlier quote closed (the booking ended and the task is open again): they can send a new one. */
export const QuoteClosed: Story = {
  decorators: [
    withQuoteStory({
      viewer: 'worker',
      task: quoteStoryTask({
        quotes: [storyTaskQuote({ status: STORY_CLOSED_STATUS })],
      }),
    }),
  ],
}

/** Signed out: the gate asks them to log in, with the task summary above. */
export const SignedOut: Story = {
  decorators: [withQuoteStory({ viewer: 'visitor' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Sign in to send a quote for this task.'),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Log in' })).toBeVisible()
  },
}

/** Signed out, in zh-HK. */
export const SignedOutZhHk: Story = {
  parameters: QUOTE_ZH_HK,
  decorators: [withQuoteStory({ viewer: 'visitor' }), withQuoteZhHk],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('登入後即可為此任務傳送報價。'),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: '登入' })).toBeVisible()
  },
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

const withLimitReached = withQuoteStory(
  { viewer: 'worker' },
  {
    me: (me) => ({
      worker: me.worker && {
        ...me.worker,
        membership: LIMIT_REACHED_MEMBERSHIP,
      },
    }),
  },
)

/** Worker out of free quotes this month: the paywall replaces the form. */
export const QuoteLimitReached: Story = {
  decorators: [withLimitReached],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(
        "You've used this month's free quotes. Quotes you've already sent stay editable.",
      ),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Go unlimited' }),
    ).toHaveAttribute('href', '/billing')
  },
}

/** Out of free quotes, in zh-HK. */
export const QuoteLimitReachedZhHk: Story = {
  parameters: QUOTE_ZH_HK,
  decorators: [withLimitReached, withQuoteZhHk],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('你已用完本月的免費報價。已傳送的報價仍可修改。'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: '升級為無限報價' }),
    ).toHaveAttribute('href', '/zh-hk/billing')
    await expect(canvas.getByRole('link', { name: '返回任務' })).toBeVisible()
  },
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
