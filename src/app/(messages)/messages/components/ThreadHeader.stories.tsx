import { QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'

import { ThreadHeader } from './ThreadHeader'
import { messagesStory } from './messagesStoryDecorator'
import {
  STORY_THREAD_TITLE,
  otherPartyFor,
  systemThread,
  taskThread,
} from './messagesStoryFixtures'

const ownerThread = taskThread('owner')
const workerThread = taskThread('worker')

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

const meta = {
  title: 'Messages/ThreadHeader',
  component: ThreadHeader,
  args: { thread: ownerThread, onToggleBlock: fn() },
  parameters: { layout: 'fullscreen' },
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

/** Task thread, owner: the title and name open the task; the menu is closed. */
export const TaskThread: Story = {
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', {
        name: `Open task: ${STORY_THREAD_TITLE}`,
      }),
    ).toBeVisible()
    await expect(
      await canvas.findByRole('button', { name: 'Conversation options' }),
    ).toBeVisible()
  },
}

/** The thread's task is still loading: the title shows; the pinned card and the options menu have not appeared. */
export const TaskLoading: Story = {
  decorators: messagesStory({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', {
        name: `Open task: ${STORY_THREAD_TITLE}`,
      }),
    ).toBeVisible()
    await expect(canvas.queryByText('Jordan Lee')).toBeNull()
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

/** Nobody accepted yet: the card asks the owner to compare quotes, and there is no one to report or block. */
export const AwaitingWorker: Story = {
  args: { thread: taskThread('owner', { otherParty: null, canSend: false }) },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('2 quotes - compare and accept'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Compare quotes' }),
    ).toHaveAttribute('href', `/tasks/${openTask.id}#task-quotes`)
    const menu = await openMenu(canvasElement)
    await expect(
      await menu.findByRole('button', { name: 'Cancel task' }),
    ).toBeInTheDocument()
    await expect(menu.queryByRole('button', { name: /Block/ })).toBeNull()
  },
}

/** The other person deleted their account: no block or report for them. */
export const DeletedUser: Story = {
  args: {
    thread: taskThread('owner', {
      otherParty: { ...otherPartyFor('owner'), deleted: true },
      canSend: false,
    }),
  },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await expect(
      await menu.findByRole('button', { name: 'Cancel task' }),
    ).toBeInTheDocument()
    await expect(menu.queryByRole('button', { name: /Block/ })).toBeNull()
  },
}

/** A long task title clamps to one line. */
export const LongTitle: Story = {
  args: {
    thread: taskThread('owner', {
      title:
        'Mount a very large floor-to-ceiling bookshelf on a plasterboard living room wall before the weekend',
    }),
  },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
}

/** Phones: a back arrow returns to the inbox. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: messagesStory({ viewer: 'owner', task: openTask }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Back to messages',
      }),
    ).toBeVisible()
  },
}

/** Slashie announcements: no task link, no menu. */
export const SystemThread: Story = {
  args: { thread: systemThread() },
  decorators: messagesStory({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Updates from Slashie')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Conversation options' }),
    ).toBeNull()
  },
}
