import {
  Currency,
  OrderPartyRole,
  OrderStatus,
  QuoteStatus,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { AppToastHost } from '@/utils/appToast'

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

const cancelledTask = storyTaskDetail({ status: TaskStatus.Cancelled })

/**
 * Owner of a cancelled task (BE-108): Reopen task, which asks first. Not now
 * closes the dialog; Repost stays under Help & actions.
 */
export const OwnerReopen: Story = {
  ...desktop,
  ...cta({ viewer: 'owner', task: cancelledTask }),
  play: async ({ canvasElement }) => {
    const body = pin(canvasElement)
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Reopen task' }),
    )
    const dialog = within(
      await body.findByRole('dialog', { name: 'Reopen this task?' }),
    )
    await dialog.findByText(
      'It will be open for quotes again, and workers with pending quotes will be told.',
    )
    await userEvent.click(dialog.getByRole('button', { name: 'Not now' }))
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  },
}

/**
 * Reopen task confirmed: "Task reopened", and the task is open again, so
 * the main button becomes Preview.
 */
export const OwnerReopened: Story = {
  ...desktop,
  decorators: [
    (Story) => (
      <>
        <Story />
        <AppToastHost />
      </>
    ),
    withTaskDetailStory({
      viewer: 'owner',
      task: cancelledTask,
      responses: {
        ReopenTask: {
          kind: 'data',
          data: {
            reopenTask: {
              __typename: 'Task',
              id: cancelledTask.id,
              status: TaskStatus.Open,
            },
          },
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const body = pin(canvasElement)
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Reopen task' }),
    )
    const dialog = within(
      await body.findByRole('dialog', { name: 'Reopen this task?' }),
    )
    await userEvent.click(dialog.getByRole('button', { name: 'Reopen task' }))
    await body.findByText('Task reopened')
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    await within(canvasElement).findByRole('link', { name: 'Preview' })
  },
}

/** Reopen refused by the API: its error copy as a toast; the dialog stays. */
export const OwnerReopenRefused: Story = {
  ...desktop,
  decorators: [
    (Story) => (
      <>
        <Story />
        <AppToastHost />
      </>
    ),
    withTaskDetailStory({
      viewer: 'owner',
      task: cancelledTask,
      responses: {
        ReopenTask: { kind: 'graphqlError', code: 'TASK_NOT_REOPENABLE' },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const body = pin(canvasElement)
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Reopen task' }),
    )
    const dialog = within(
      await body.findByRole('dialog', { name: 'Reopen this task?' }),
    )
    await userEvent.click(dialog.getByRole('button', { name: 'Reopen task' }))
    await body.findByText("This task can't be reopened.")
    await expect(body.getByRole('dialog')).toBeVisible()
  },
}

/** A cancelled task Slashie suspended can't be reopened: no main button. */
export const OwnerCancelledSuspended: Story = {
  ...desktop,
  ...cta({
    viewer: 'owner',
    task: storyTaskDetail({
      status: TaskStatus.Cancelled,
      suspension: { bySlashie: true, posterSuspended: false },
    }),
  }),
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect(
      within(canvasElement).queryByRole('button', { name: 'Reopen task' }),
    ).toBeNull()
  },
}

/**
 * Booked worker suspended (BE-108), job time started: the booking is frozen,
 * so there is no slide to mark Done.
 */
export const OwnerFrozenNoMarkDone: Story = {
  ...desktop,
  ...cta({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      counterpartySuspension: {
        role: OrderPartyRole.Worker,
        name: 'Jordan Lee',
        canReopen: true,
      },
    }),
  }),
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect(within(canvasElement).queryByRole('slider')).toBeNull()
    await expect(
      within(canvasElement).queryByText('Slide to mark Done'),
    ).toBeNull()
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
