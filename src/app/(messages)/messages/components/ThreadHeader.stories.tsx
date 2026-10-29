import { QuoteStatus, TaskStatus, ThreadAttentionKind } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { desktop1280 } from '@/app/(stepflow)/stepFlowSpacing.testing'
import { TaskDetailProvider } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import {
  STORY_OWNER_ID,
  STORY_TASK_ID,
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import {
  expectPanelPadding,
  expectRowsAreRows,
  openPopover,
} from '@/ui/Dropdown/menuSpacing.testing'

import { ThreadHeader } from './ThreadHeader'
import { messagesStory } from './messagesStoryDecorator'
import {
  STORY_THREAD_TITLE,
  cancelledTaskThread,
  needs,
  otherPartyFor,
  systemThread,
  taskThread,
} from './messagesStoryFixtures'

const ownerThread = taskThread('owner')
const workerThread = taskThread('worker')

/** The poster before anyone is booked: nobody there yet, two live quotes. */
const quotedThread = taskThread('owner', {
  otherParty: null,
  canSend: false,
  attention: needs(ThreadAttentionKind.CompareQuotes, 2),
})

/** The owner's open task, with two pending quotes. */
const openTask = storyTaskDetail()

/** Booked: Jordan's quote accepted and the order starts in the future. */
const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
  orders: [
    storyTaskOrder({
      bookedStart: '2030-06-10T14:00:00.000Z',
      bookedEnd: '2030-06-10T16:00:00.000Z',
    }),
  ],
})

/**
 * Task threads render inside the task's detail context, as the thread
 * mounts them; the Slashie thread has no task.
 */
const meta = {
  title: 'Messages/ThreadHeader',
  component: ThreadHeader,
  args: { thread: ownerThread, onToggleBlock: fn() },
  parameters: { layout: 'fullscreen' },
  render: (args) =>
    args.thread.task ? (
      <TaskDetailProvider taskId={args.thread.task.id} captureView={false}>
        <ThreadHeader {...args} />
      </TaskDetailProvider>
    ) : (
      <ThreadHeader {...args} />
    ),
} satisfies Meta<typeof ThreadHeader>

export default meta
type Story = StoryObj<typeof meta>

const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Presses the conversation options button once the task has loaded. */
async function openMenu(canvasElement: HTMLElement) {
  await userEvent.click(
    await within(canvasElement).findByRole('button', {
      name: 'Conversation options',
    }),
  )
  return page(canvasElement)
}

/** Booked, poster's side: Jordan's name opens his profile; the task name opens the task. */
export const Booked: Story = {
  decorators: messagesStory({ viewer: 'owner', task: bookedTask }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: "View Jordan Lee's profile" }),
    ).toHaveAttribute('href', `/profile/${STORY_WORKER_ID}`)
    await expect(
      canvas.getByRole('link', { name: `Open task: ${STORY_THREAD_TITLE}` }),
    ).toHaveAttribute('href', `/tasks/${STORY_TASK_ID}`)
    await expect(
      await canvas.findByRole('button', { name: 'Conversation options' }),
    ).toBeVisible()
  },
}

/** The worker's side: the customer's name over the task. */
export const Worker: Story = {
  args: { thread: workerThread },
  decorators: messagesStory({ viewer: 'worker', task: openTask }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: "View Alex Chen's profile",
      }),
    ).toHaveAttribute('href', `/profile/${STORY_OWNER_ID}`)
  },
}

/** The poster before booking: "2 workers quoted" (not a link), the task under it, the live quotes pinned. */
export const PosterQuoted: Story = {
  args: { thread: quotedThread },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: '2 workers quoted' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('link', { name: /profile/ })).toBeNull()
    await expect(
      await canvas.findByText('Live quotes · cheapest £85'),
    ).toBeVisible()
  },
}

/** The poster with one live quote: "1 worker quoted". */
export const PosterOneQuote: Story = {
  args: {
    thread: taskThread('owner', {
      otherParty: null,
      canSend: false,
      attention: needs(ThreadAttentionKind.CompareQuotes, 1),
    }),
  },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: '1 worker quoted',
      }),
    ).toBeVisible()
  },
}

/** The poster with no live quotes yet: Waiting for quotes. */
export const PosterWaiting: Story = {
  args: {
    thread: taskThread('owner', { otherParty: null, canSend: false }),
  },
  decorators: messagesStory({
    viewer: 'owner',
    task: storyTaskDetail({ quotes: [] }),
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: 'Waiting for quotes',
      }),
    ).toBeVisible()
  },
}

/** The poster's task was cancelled before anyone was booked: Task cancelled, not Waiting for quotes. */
export const PosterTaskCancelled: Story = {
  args: { thread: cancelledTaskThread() },
  decorators: messagesStory({
    viewer: 'owner',
    task: storyTaskDetail({ status: TaskStatus.Cancelled, quotes: [] }),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Task cancelled' }),
    ).toBeVisible()
    await expect(canvas.queryByText('Waiting for quotes')).toBeNull()
  },
}

/** The thread's task is still loading: the title shows; the pin and the menu have not appeared. */
export const TaskLoading: Story = {
  decorators: messagesStory({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Jordan Lee' }),
    ).toBeVisible()
    await expect(canvasElement.querySelector('[data-thread-pin]')).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Conversation options' }),
    ).toBeNull()
  },
}

/** Owner of an open task: cancel the task, report the worker, block them. */
export const OwnerMenu: Story = {
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await expect(
      await menu.findByRole('button', { name: 'Cancel task' }),
    ).toBeInTheDocument()
    await expect(
      menu.getByRole('button', { name: /Report profile/ }),
    ).toBeInTheDocument()
    await expect(
      menu.getByRole('button', { name: 'Block Jordan Lee' }),
    ).toBeInTheDocument()
  },
}

/**
 * The conversation menu's panel (FE-481 menus): its rows sit 8 inside the panel on
 * every side, and stay rows: 44 tall and touching.
 */
export const OwnerMenuSpacing: Story = {
  ...desktop1280,
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const trigger = await within(canvasElement).findByRole('button', {
      name: 'Conversation options',
    })
    const panel = await openPopover(trigger)
    await within(panel).findByRole('button', { name: 'Cancel task' })
    await expectPanelPadding(panel)
    const rows = [...panel.querySelectorAll('button')]
    await expect(rows.length).toBeGreaterThanOrEqual(3)
    await expectRowsAreRows(rows, 0)
  },
}

/** Worker with a pending quote: withdraw it, report the task, block the owner. */
export const WorkerMenu: Story = {
  args: { thread: workerThread },
  decorators: messagesStory({ viewer: 'worker', task: openTask }),
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await expect(
      await menu.findByRole('button', { name: 'Withdraw quote' }),
    ).toBeInTheDocument()
    await expect(
      menu.getByRole('button', { name: /Report task/ }),
    ).toBeInTheDocument()
    await expect(
      menu.getByRole('button', { name: 'Block Alex Chen' }),
    ).toBeInTheDocument()
  },
}

/** Cancel task asks first, in the dialog task detail uses: nothing is cancelled yet. */
export const OwnerCancelTaskAsks: Story = {
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await userEvent.click(
      await menu.findByRole('button', { name: 'Cancel task' }),
    )
    const dialog = within(
      await menu.findByRole('dialog', { name: 'Cancel task' }),
    )
    await dialog.findByRole('button', { name: 'Keep' })
  },
}

/** Withdraw quote asks first, in the dialog task detail uses: nothing is withdrawn yet. */
export const WorkerWithdrawQuoteAsks: Story = {
  args: { thread: workerThread },
  decorators: messagesStory({ viewer: 'worker', task: openTask }),
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await userEvent.click(
      await menu.findByRole('button', { name: 'Withdraw quote' }),
    )
    const dialog = within(
      await menu.findByRole('dialog', { name: 'Withdraw quote' }),
    )
    await dialog.findByRole('button', { name: 'Keep' })
  },
}

/** Booked and not started: reschedule or cancel the booking. */
export const BookedMenu: Story = {
  decorators: messagesStory({ viewer: 'owner', task: bookedTask }),
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await expect(
      await menu.findByRole('button', { name: 'Reschedule' }),
    ).toBeInTheDocument()
    await expect(
      menu.getByRole('button', { name: 'Cancel booking' }),
    ).toBeInTheDocument()
  },
}

/** The other person is already blocked: the menu offers Unblock. */
export const BlockedUserMenu: Story = {
  args: { thread: taskThread('owner', { blockedByMe: true, canSend: false }) },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await expect(
      await menu.findByRole('button', { name: 'Unblock Jordan Lee' }),
    ).toBeInTheDocument()
  },
}

/** The poster before booking: there is no one to report or block yet. */
export const PosterQuotedMenu: Story = {
  args: { thread: quotedThread },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await expect(
      await menu.findByRole('button', { name: 'Cancel task' }),
    ).toBeInTheDocument()
    await expect(menu.queryByRole('button', { name: /Block/ })).toBeNull()
  },
}

/** The other person deleted their account: their name, but no profile link, block or report. */
export const DeletedUser: Story = {
  args: {
    thread: taskThread('owner', {
      otherParty: {
        ...otherPartyFor('owner'),
        name: 'Deleted user',
        deleted: true,
      },
      canSend: false,
    }),
  },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Deleted user' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('link', { name: /profile/ })).toBeNull()
    const menu = await openMenu(canvasElement)
    await expect(
      await menu.findByRole('button', { name: 'Cancel task' }),
    ).toBeInTheDocument()
    await expect(menu.queryByRole('button', { name: /Block/ })).toBeNull()
  },
}

/** A long task name clamps to one line under the person. */
export const LongTaskName: Story = {
  args: {
    thread: taskThread('owner', {
      task: {
        id: STORY_TASK_ID,
        title:
          'Mount a very large floor-to-ceiling bookshelf on a plasterboard living room wall before the weekend',
        status: TaskStatus.Awarded,
        poster: { id: STORY_OWNER_ID },
      },
    }),
  },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
}

/** zh-HK: the poster's quote count in Traditional Chinese. */
export const ZhHk: Story = {
  args: { thread: quotedThread },
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  decorators: [
    ...messagesStory({ viewer: 'owner', task: openTask }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: '已有 2 位工作者報價',
      }),
    ).toBeVisible()
  },
}

/** Phones: a back arrow returns to the inbox. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: messagesStory({ viewer: 'owner', task: bookedTask }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Back to messages',
      }),
    ).toBeVisible()
  },
}

/** Slashie announcements: the Slashie title, no task link, no menu. */
export const SystemThread: Story = {
  args: { thread: systemThread() },
  decorators: messagesStory({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Slashie' }),
    ).toBeVisible()
    await expect(canvas.getByText('Updates from Slashie')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Conversation options' }),
    ).toBeNull()
  },
}
