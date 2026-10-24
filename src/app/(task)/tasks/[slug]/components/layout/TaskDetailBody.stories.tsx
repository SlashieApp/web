import {
  Currency,
  OrderCloseKind,
  OrderPartyRole,
  OrderStatus,
  QuoteStatus,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { TaskDetailProvider } from '../../context/TaskDetailProvider'
import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import {
  STORY_TASK_ID,
  type TaskDetailStoryConfig,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailBody } from './TaskDetailBody'

/**
 * The task page as one screen: error, not found, loading, or the responsive
 * view for the viewer. Stories run on the real provider; each viewer story is
 * one view from `views/README.md` (the Task summary stories cover them all).
 */
const meta = {
  title: 'Task detail/Page',
  component: TaskDetailBody,
  parameters: { layout: 'fullscreen' },
  args: { taskId: STORY_TASK_ID },
} satisfies Meta<typeof TaskDetailBody>

export default meta
type Story = StoryObj<typeof meta>

const desktop = { globals: { viewport: { value: 'desktop' } } } as const
const phone = { globals: { viewport: { value: 'mobile1' } } } as const

const otherWorker = {
  id: 'worker-detail-2',
  profile: { name: 'Sam Taylor', avatarUrl: null },
  worker: { id: 'worker-profile-2', isVerified: false },
}

const competitorQuote = storyTaskQuote({
  id: 'quote-detail-2',
  workerUserId: 'worker-detail-2',
  price: { amount: 95, currency: Currency.Gbp },
  worker: otherWorker,
})

const openTask = storyTaskDetail()
const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [
    storyTaskQuote({ status: QuoteStatus.Accepted }),
    // The other quotes stay PENDING once someone is booked (BE-113).
    competitorQuote,
  ],
})

/** One viewer, one task, optionally a booking. */
function page(config: Partial<TaskDetailStoryConfig>): Story {
  return { decorators: [withTaskDetailStory(config, { maxWidth: '100%' })] }
}

const TITLE = openTask.title

/** The title is on screen once the page has loaded. */
async function expectTitle(canvasElement: HTMLElement, title: string) {
  await within(canvasElement).findByRole(
    'heading',
    { level: 1, name: title },
    { timeout: 4000 },
  )
}

/** The summary headline names the view this viewer sees. */
async function expectView(
  canvasElement: HTMLElement,
  headline: string | RegExp,
) {
  await within(canvasElement).findByRole(
    'heading',
    { level: 2, name: headline },
    { timeout: 4000 },
  )
}

// ----------------------------------------------------------- data flow

/** Direct load: skeleton title, summary and photos while the task loads. */
export const Loading: Story = {
  ...desktop,
  decorators: [withTaskDetailPending('loading')],
}

/** Opened from a search card: title, price, place and photo paint at once. */
export const LoadingFromSearchCard: Story = {
  ...desktop,
  decorators: [withTaskDetailPending('listingSeed')],
  play: async ({ canvasElement }) => {
    await expectTitle(canvasElement, TITLE)
  },
}

/** The task request failed: an error card with Try again and Browse tasks. */
export const LoadError: Story = {
  ...desktop,
  decorators: [withTaskDetailPending('error')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('alert')
    await canvas.findByRole('button', { name: 'Try again' })
  },
}

/** No such task (or no access): the full-page "Task not found" card. */
export const NotFound: Story = {
  ...desktop,
  ...page({ viewer: 'visitor', task: undefined }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Task not found')
  },
}

// ------------------------------------------------------------- viewers

/** Signed out, task open: earn line and "Sign in to quote". */
export const VisitorOpen: Story = {
  ...desktop,
  ...page({ viewer: 'visitor', task: openTask }),
  play: async ({ canvasElement }) => expectView(canvasElement, /You can earn/),
}

/** Signed in without a worker profile: "Become a worker". */
export const SignedInCustomerOpen: Story = {
  ...desktop,
  ...page({ viewer: 'nonWorker', task: openTask }),
  play: async ({ canvasElement }) => {
    await expectView(canvasElement, /You can earn/)
    await within(canvasElement).findByText(
      'Become a worker to quote on this task.',
    )
  },
}

/** Worker who has not quoted: the budget with "Send a quote". */
export const WorkerOpenNotQuoted: Story = {
  ...desktop,
  ...page({
    viewer: 'worker',
    task: storyTaskDetail({ quotes: [competitorQuote] }),
  }),
  play: async ({ canvasElement }) =>
    expectView(canvasElement, 'Open for quotes - 1 so far'),
}

/** Worker whose quote is waiting: their price against the budget, Edit quote. */
export const WorkerOpenQuoted: Story = {
  ...desktop,
  ...page({ viewer: 'worker', task: openTask }),
  play: async ({ canvasElement }) => expectView(canvasElement, 'Quote sent'),
}

/** Owner of a live task with no quotes yet: Preview, share and analytics. */
export const OwnerOpenNoQuotes: Story = {
  ...desktop,
  ...page({ viewer: 'owner', task: storyTaskDetail({ quotes: [] }) }),
  play: async ({ canvasElement }) =>
    expectView(canvasElement, 'Your task is live - reaching workers'),
}

/** Owner with quotes: compare them and accept one. */
export const OwnerOpenWithQuotes: Story = {
  ...desktop,
  ...page({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) =>
    expectView(canvasElement, '2 quotes - compare and accept'),
}

/** Owner with a booking before the start time: Message the worker. */
export const OwnerBooked: Story = {
  ...desktop,
  ...page({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      bookedStart: '2030-06-10T09:00:00.000Z',
      bookedEnd: '2030-06-10T11:00:00.000Z',
    }),
  }),
  play: async ({ canvasElement }) => expectView(canvasElement, 'Worker booked'),
}

/** Booked worker once the time has started: slide to mark the job Done. */
export const WorkerBookedReady: Story = {
  ...desktop,
  ...page({ viewer: 'worker', task: bookedTask, order: storyTaskOrder() }),
  play: async ({ canvasElement }) =>
    expectView(canvasElement, 'Job time has started'),
}

/** Finished job, owner's side: the record, reviews and Review. */
export const OwnerCompleted: Story = {
  ...desktop,
  ...page({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.Completed,
      myCloseAction: {
        kind: OrderCloseKind.Done,
        at: '2026-10-15T10:00:00.000Z',
      },
      counterpartyCloseAction: {
        kind: OrderCloseKind.Done,
        at: '2026-10-15T10:00:00.000Z',
      },
      closedAt: '2026-10-15T10:00:00.000Z',
    }),
  }),
  play: async ({ canvasElement }) => expectView(canvasElement, 'Job complete'),
}

/** Owner of a cancelled task: Reopen task; Repost stays in Help & actions. */
export const OwnerCancelled: Story = {
  ...desktop,
  ...page({
    viewer: 'owner',
    task: storyTaskDetail({ status: TaskStatus.Cancelled }),
  }),
  play: async ({ canvasElement }) =>
    expectView(canvasElement, 'Task cancelled'),
}

// ------------------------------------------------- suspensions (BE-108)

/** The notice sits above the Task summary: it comes first on the page. */
async function expectNoticeFirst(
  canvasElement: HTMLElement,
  notice: string,
  headline: string | RegExp,
) {
  const canvas = within(canvasElement)
  const noticeHeading = await canvas.findByRole(
    'heading',
    { name: notice },
    { timeout: 4000 },
  )
  const summary = await canvas.findByRole('heading', {
    level: 2,
    name: headline,
  })
  await expect(
    noticeHeading.compareDocumentPosition(summary) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
}

/**
 * Owner of an open task Slashie suspended: the notice, and Help & actions
 * without Edit or Cancel task (Share and Repost stay). Preview stays.
 */
export const OwnerTaskSuspended: Story = {
  ...desktop,
  ...page({
    viewer: 'owner',
    task: storyTaskDetail({
      suspension: { bySlashie: true, posterSuspended: false },
    }),
  }),
  play: async ({ canvasElement }) => {
    await expectNoticeFirst(
      canvasElement,
      'This task is suspended',
      /quotes? - compare and accept/,
    )
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: 'Contact support' })
    await canvas.findByRole('button', { name: 'Share task' })
    await expect(canvas.queryByRole('link', { name: 'Edit task' })).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Cancel task' }),
    ).toBeNull()
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/**
 * Customer of a suspended worker: the notice with Reopen task, Message
 * stays, and no Reschedule or Cancel booking.
 */
export const CustomerWorkerSuspended: Story = {
  ...desktop,
  ...page({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      bookedStart: '2030-06-10T09:00:00.000Z',
      bookedEnd: '2030-06-10T11:00:00.000Z',
      counterpartySuspension: {
        role: OrderPartyRole.Worker,
        name: 'Jordan Lee',
        canReopen: true,
      },
    }),
  }),
  play: async ({ canvasElement }) => {
    await expectNoticeFirst(
      canvasElement,
      "Jordan Lee's account has been suspended",
      'Worker booked',
    )
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Reopen task' })
    await expect(
      canvas.queryByRole('button', { name: 'Reschedule' }),
    ).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Cancel booking' }),
    ).toBeNull()
  },
}

/** Booked worker whose customer is suspended: the on-hold notice only. */
export const WorkerCustomerSuspended: Story = {
  ...phone,
  ...page({
    viewer: 'worker',
    task: {
      ...bookedTask,
      suspension: { bySlashie: false, posterSuspended: true },
    },
    order: storyTaskOrder({
      bookedStart: '2030-06-10T09:00:00.000Z',
      bookedEnd: '2030-06-10T11:00:00.000Z',
      counterpartySuspension: {
        role: OrderPartyRole.Customer,
        name: 'Alex Chen',
        canReopen: false,
      },
    }),
  }),
  play: ({ canvasElement }) =>
    expectNoticeFirst(
      canvasElement,
      "Alex Chen's account has been suspended",
      'You are booked for this job',
    ),
}

/** Anyone not on the booking, task awarded: read-only, no main button. */
export const VisitorAwarded: Story = {
  ...desktop,
  ...page({ viewer: 'visitor', task: bookedTask }),
  play: async ({ canvasElement }) => expectView(canvasElement, 'Worker booked'),
}

/** Owner preview: the page exactly as a signed-out visitor sees it. */
export const OwnerPreviewAsGuest: Story = {
  ...desktop,
  ...page({ viewer: 'owner', task: openTask }),
  render: (args) => (
    <TaskDetailProvider
      taskId={args.taskId}
      initialTask={openTask}
      viewAs="guest"
      captureView={false}
    >
      <TaskDetailBody taskId={args.taskId} />
    </TaskDetailProvider>
  ),
  play: async ({ canvasElement }) => expectView(canvasElement, /You can earn/),
}

// --------------------------------------------------------------- phone

/** Phone, loading: map band, sticky title and skeleton summary. */
export const PhoneLoading: Story = {
  ...phone,
  decorators: [withTaskDetailPending('loading')],
}

/** Phone, signed out: the main button pins to the bottom. */
export const PhoneVisitorOpen: Story = {
  ...phone,
  ...page({ viewer: 'visitor', task: openTask }),
  play: async ({ canvasElement }) => expectView(canvasElement, /You can earn/),
}

/** Phone, owner with quotes: Analytics and Activity open as sheets. */
export const PhoneOwnerOpenWithQuotes: Story = {
  ...phone,
  ...page({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) =>
    expectView(canvasElement, '2 quotes - compare and accept'),
}

/** Phone, booked worker: slide to Done pinned at the bottom. */
export const PhoneWorkerBookedReady: Story = {
  ...phone,
  ...page({ viewer: 'worker', task: bookedTask, order: storyTaskOrder() }),
  play: async ({ canvasElement }) =>
    expectView(canvasElement, 'Job time has started'),
}

/** Phone, task not found. */
export const PhoneNotFound: Story = {
  ...phone,
  ...page({ viewer: 'visitor', task: undefined }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Task not found')
  },
}
