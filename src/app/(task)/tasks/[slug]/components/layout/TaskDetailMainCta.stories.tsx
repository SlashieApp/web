import { Currency, OrderStatus, QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withOrderReviewSeed } from '../../helpers/taskDetailStoryExtras'
import {
  type TaskDetailStoryConfig,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailMainCta } from './TaskDetailMainCta'

/**
 * The view's primary action. On web it sits top right above the cards; on
 * phones it pins to the bottom of the screen over a soft wash.
 */
const meta = {
  title: 'Task detail/Layout/TaskDetailMainCta',
  component: TaskDetailMainCta,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskDetailMainCta>

export default meta
type Story = StoryObj<typeof meta>

const desktop = { globals: { viewport: { value: 'desktop' } } } as const
const phone = {
  globals: { viewport: { value: 'mobile1' } },
  parameters: { layout: 'fullscreen' },
} as const

const FUTURE_START = '2030-06-10T09:00:00.000Z'
const FUTURE_END = '2030-06-10T11:00:00.000Z'

const competitorQuote = storyTaskQuote({
  id: 'quote-detail-2',
  workerUserId: 'worker-detail-2',
  price: { amount: 95, currency: Currency.Gbp },
  worker: {
    id: 'worker-detail-2',
    profile: { name: 'Sam Taylor', avatarUrl: null },
    worker: { id: 'worker-profile-2', isVerified: false },
  } as never,
})

const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
})

const completedOrder = storyTaskOrder({
  status: OrderStatus.Completed,
  closedAt: '2026-06-10T17:00:00.000Z',
})

function cta(config: Partial<TaskDetailStoryConfig>) {
  return { decorators: [withTaskDetailStory(config)] }
}

/** The pin portals to the page body, outside the story canvas. */
const pin = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

// ----------------------------------------------------------------- web

/** Owner of an open task: Preview the page as a visitor sees it. */
export const OwnerPreview: Story = {
  ...desktop,
  ...cta({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Preview' })
  },
}

/** Worker who has not quoted: the budget joined to Send quote. */
export const WorkerSendQuote: Story = {
  ...desktop,
  ...cta({
    viewer: 'worker',
    task: storyTaskDetail({ quotes: [competitorQuote] }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Send quote' })
  },
}

/** Worker whose quote is waiting: their asking price joined to Edit quote. */
export const WorkerEditQuote: Story = {
  ...desktop,
  ...cta({ viewer: 'worker' }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Edit quote' })
  },
}

/** Signed in without a worker profile: what they could earn, Become a worker. */
export const CustomerBecomeWorker: Story = {
  ...desktop,
  ...cta({ viewer: 'nonWorker' }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Become a worker' })
  },
}

/** Signed out: Sign in to quote. */
export const GuestSignIn: Story = {
  ...desktop,
  ...cta({ viewer: 'visitor' }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Sign in to quote' })
  },
}

/** Before the booked time: the other person's name and contact, Message. */
export const BookedMessage: Story = {
  ...desktop,
  ...cta({
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder({ bookedStart: FUTURE_START, bookedEnd: null }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Message' })
  },
}

/** Booked time has started: slide Done, or "something went wrong". */
export const WorkerReadyToClose: Story = {
  ...desktop,
  ...cta({ viewer: 'worker', task: bookedTask, order: storyTaskOrder() }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Slide to mark Done')
    await canvas.findByRole('button', { name: 'Something went wrong' })
  },
}

/** Job finished and not reviewed yet: Review. */
export const CompletedReview: Story = {
  ...desktop,
  ...cta({ viewer: 'owner', task: bookedTask, order: completedOrder }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Review' })
  },
}

/** Job finished and reviewed: the button becomes Get receipt. */
export const CompletedGetReceipt: Story = {
  ...desktop,
  decorators: [
    withOrderReviewSeed({
      orderId: 'order-detail-1',
      viewerHasSubmittedReview: true,
      viewerReview: {
        id: 'review-1',
        stars: 5,
        comment: 'Tidy and on time.',
        createdAt: '2026-06-11T10:00:00.000Z',
      },
    }),
    withTaskDetailStory({
      viewer: 'owner',
      task: bookedTask,
      order: completedOrder,
    }),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole(
      'button',
      { name: 'Get receipt' },
      { timeout: 4000 },
    )
  },
}

/** Owner of a cancelled task: Repost this task. */
export const OwnerRepost: Story = {
  ...desktop,
  ...cta({
    viewer: 'owner',
    task: storyTaskDetail({ status: TaskStatus.Cancelled }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Repost this task' })
  },
}

/** Worker whose booking was cancelled: Browse other tasks. */
export const WorkerBrowseTasks: Story = {
  ...desktop,
  ...cta({
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.Cancelled,
      closedAt: '2026-06-10T17:00:00.000Z',
    }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', {
      name: 'Browse other tasks',
    })
  },
}

/** Anyone not on an awarded booking: there is no main button. */
export const NoMainButton: Story = {
  ...desktop,
  ...cta({ viewer: 'visitor', task: bookedTask }),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByRole('link')).toBeNull(),
    )
  },
}

// --------------------------------------------------------------- phone

/** Phone, owner: Preview pinned to the bottom. */
export const PhoneOwnerPreview: Story = {
  ...phone,
  ...cta({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    await pin(canvasElement).findByRole('link', { name: 'Preview' })
  },
}

/** Phone, worker: the budget and Send quote, full width. */
export const PhoneWorkerSendQuote: Story = {
  ...phone,
  ...cta({
    viewer: 'worker',
    task: storyTaskDetail({ quotes: [competitorQuote] }),
  }),
  play: async ({ canvasElement }) => {
    await pin(canvasElement).findByRole('link', { name: 'Send quote' })
  },
}

/** Phone, booked: the other person's contact and Message. */
export const PhoneBookedMessage: Story = {
  ...phone,
  ...cta({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({ bookedStart: FUTURE_START, bookedEnd: FUTURE_END }),
  }),
  play: async ({ canvasElement }) => {
    await pin(canvasElement).findByRole('link', { name: 'Message' })
  },
}

/** Phone, time started: the close card with the slider pinned at the bottom. */
export const PhoneReadyToClose: Story = {
  ...phone,
  ...cta({ viewer: 'worker', task: bookedTask, order: storyTaskOrder() }),
  play: async ({ canvasElement }) => {
    const page = pin(canvasElement)
    // The hidden web copy has the same text: wait for the visible one.
    await waitFor(() =>
      expect(
        page
          .queryAllByText('Slide to mark Done')
          .filter((el) => el.checkVisibility()).length,
      ).toBe(1),
    )
  },
}
