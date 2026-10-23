import {
  OrderPartyRole,
  OrderStatus,
  QuoteStatus,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskSuspensionNotice } from './TaskSuspensionNotice'

/**
 * The suspension notice above the Task summary (BE-108). Which one shows is
 * `getTaskNoticeView`'s call (views/README.md); the copy is shared with the
 * Expo app word for word.
 */
const meta = {
  title: 'Task detail/Overview/TaskSuspensionNotice',
  component: TaskSuspensionNotice,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskSuspensionNotice>

export default meta
type Story = StoryObj<typeof meta>

const BY_SLASHIE = { bySlashie: true, posterSuspended: false }
const WITH_POSTER = { bySlashie: false, posterSuspended: true }

const openTask = (suspension: typeof BY_SLASHIE | null) =>
  storyTaskDetail({ suspension })

const bookedTask = (suspension: typeof BY_SLASHIE | null = null) =>
  storyTaskDetail({
    status: TaskStatus.Awarded,
    quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
    suspension,
  })

const workerSuspended = (canReopen: boolean) =>
  storyTaskOrder({
    bookedStart: '2030-06-10T09:00:00.000Z',
    counterpartySuspension: {
      role: OrderPartyRole.Worker,
      name: 'Jordan Lee',
      canReopen,
    },
  })

const customerSuspended = storyTaskOrder({
  bookedStart: '2030-06-10T09:00:00.000Z',
  counterpartySuspension: {
    role: OrderPartyRole.Customer,
    name: 'Alex Chen',
    canReopen: false,
  },
})

/** The dialog portals to the page, outside the story canvas. */
const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

async function expectNotice(
  canvasElement: HTMLElement,
  title: string,
  body: string,
) {
  const canvas = within(canvasElement)
  await expect(
    await canvas.findByRole('heading', { name: title }),
  ).toBeVisible()
  await expect(canvas.getByText(body)).toBeVisible()
}

/** Owner of a task Slashie suspended: what it means, and Contact support. */
export const OwnerTaskSuspended: Story = {
  decorators: [
    withTaskDetailStory({ viewer: 'owner', task: openTask(BY_SLASHIE) }),
  ],
  play: async ({ canvasElement }) => {
    await expectNotice(
      canvasElement,
      'This task is suspended',
      'Slashie has suspended this task, so no one can quote, book or message on it. Contact support if you think this is a mistake.',
    )
    await expect(
      within(canvasElement).getByRole('link', { name: 'Contact support' }),
    ).toHaveAttribute('href', 'mailto:admin@slashie.app')
  },
}

/**
 * Customer whose booked worker is suspended: the booking is on hold, and
 * Reopen task asks first (Not now keeps it).
 */
export const CustomerWorkerSuspended: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: bookedTask(),
      order: workerSuspended(true),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expectNotice(
      canvasElement,
      "Jordan Lee's account has been suspended",
      'This booking is on hold. Reopen the task to cancel it and choose another quote.',
    )
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Reopen task' }),
    )
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Reopen this task?',
      }),
    )
    await dialog.findByText(
      'Your booking with Jordan Lee will be cancelled and the task will be open for quotes again. You can accept another quote.',
    )
    await userEvent.click(dialog.getByRole('button', { name: 'Not now' }))
    await waitFor(() =>
      expect(page(canvasElement).queryByRole('dialog')).toBeNull(),
    )
  },
}

/** The same when the API doesn't let them reopen: on hold, no action. */
export const CustomerWorkerSuspendedOnHold: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: bookedTask(),
      order: workerSuspended(false),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expectNotice(
      canvasElement,
      "Jordan Lee's account has been suspended",
      "This booking is on hold. You can't message, reschedule or mark it done while their account is suspended.",
    )
    await expect(within(canvasElement).queryByRole('button')).toBeNull()
  },
}

/** Booked worker whose customer is suspended: a notice only. */
export const WorkerCustomerSuspended: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: bookedTask(WITH_POSTER),
      order: customerSuspended,
    }),
  ],
  play: async ({ canvasElement }) => {
    await expectNotice(
      canvasElement,
      "Alex Chen's account has been suspended",
      "This booking is on hold. You can't message, reschedule or mark it done while their account is suspended.",
    )
    await expect(within(canvasElement).queryByRole('button')).toBeNull()
  },
}

/** Booked worker on a task Slashie suspended: their booking is on hold. */
export const WorkerTaskSuspended: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: bookedTask(BY_SLASHIE),
      order: storyTaskOrder({ bookedStart: '2030-06-10T09:00:00.000Z' }),
    }),
  ],
  play: ({ canvasElement }) =>
    expectNotice(
      canvasElement,
      'This task is suspended',
      "Slashie has suspended this task. Your quote and any booking are on hold until it's restored.",
    ),
}

/** Worker with a pending quote whose poster is suspended: their quote is on hold. */
export const QuotingWorkerPosterSuspended: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({
        suspension: WITH_POSTER,
        quotes: [
          storyTaskQuote({
            workerUserId: STORY_WORKER_ID,
            status: QuoteStatus.Pending,
          }),
        ],
      }),
    }),
  ],
  play: ({ canvasElement }) =>
    expectNotice(
      canvasElement,
      "Alex Chen's account has been suspended",
      'Your quote is on hold while their account is suspended.',
    ),
}

/** A finished booking gets no notice, though the worker is still suspended. */
export const FinishedBookingNoNotice: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: bookedTask(),
      order: storyTaskOrder({
        status: OrderStatus.Completed,
        closedAt: '2026-06-10T17:00:00.000Z',
        counterpartySuspension: {
          role: OrderPartyRole.Worker,
          name: 'Jordan Lee',
          canReopen: false,
        },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect(within(canvasElement).queryByRole('heading')).toBeNull()
  },
}

/** zh-HK: the owner's Slashie notice and the reopen notice in Chinese. */
export const ZhHk: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/zh-hk/tasks/task-detail-story-1' } },
  },
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: bookedTask(),
      order: workerSuspended(true),
    }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectNotice(
      canvasElement,
      'Jordan Lee 的帳戶已被暫停',
      '此預約已暫停。重新開放任務即可取消此預約並選擇其他報價。',
    )
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: '重新開放任務' }),
    )
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: '重新開放此任務？',
      }),
    )
    await dialog.findByText(
      '你與 Jordan Lee 的預約會被取消，任務會再次接受報價。你可以接受其他報價。',
    )
    await waitFor(() =>
      expect(dialog.getByRole('button', { name: '暫時不要' })).toBeVisible(),
    )
  },
}

/** zh-HK: the owner of a task Slashie suspended. */
export const ZhHkOwnerTaskSuspended: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/zh-hk/tasks/task-detail-story-1' } },
  },
  decorators: [
    withTaskDetailStory({ viewer: 'owner', task: openTask(BY_SLASHIE) }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectNotice(
      canvasElement,
      '此任務已被暫停',
      'Slashie 已暫停此任務，任何人都不能報價、預約或傳送訊息。如你認為有誤，請聯絡客服。',
    )
    await expect(
      within(canvasElement).getByRole('link', { name: '聯絡客服' }),
    ).toHaveAttribute('href', 'mailto:admin@slashie.app')
  },
}
