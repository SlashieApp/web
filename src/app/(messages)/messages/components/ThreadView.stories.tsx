import { FlashKind, QuoteStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { storyTaskDetail } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import { ThreadView } from './ThreadView'

import { messagesStory } from './messagesStoryDecorator'
import {
  STORY_THREAD_ID,
  bookedConversation,
  conversationFlash,
  conversationMessage,
  jordanQuote,
  manyMessages,
  systemAnnouncements,
  systemThread,
  taskThread,
} from './messagesStoryFixtures'

/** The owner's open task, so the header menu has its actions. */
const openTask = storyTaskDetail()

const FRAME = { height: '640px', maxW: '720px', task: openTask } as const

const meta = {
  title: 'Messages/ThreadView',
  component: ThreadView,
  parameters: { layout: 'fullscreen' },
  args: { threadId: STORY_THREAD_ID },
} satisfies Meta<typeof ThreadView>

export default meta
type Story = StoryObj<typeof meta>

const ownerItems = bookedConversation('owner')
const workerItems = bookedConversation('worker')

/** A quote still waiting for the owner. */
const pendingItems = [
  conversationFlash(
    'p-1',
    FlashKind.QuoteReceived,
    'New quote: £85',
    'Jordan can come on Saturday morning.',
    new Date().toISOString(),
    {
      quoteId: 'q-jordan',
      quote: jordanQuote({ status: QuoteStatus.Pending }),
    },
  ),
]

/** Owner and worker chatting about a booked task: the composer is ready. */
export const Conversation: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread('owner', {}, ownerItems),
    items: ownerItems,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('log')).toHaveTextContent(
      'the spare key is with the neighbour',
    )
    await expect(
      canvas.getByRole('textbox', { name: 'Message Jordan Lee' }),
    ).toBeEnabled()
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled()
  },
}

/** The same conversation from the worker's side: the bubbles swap sides. */
export const AsWorker: Story = {
  decorators: messagesStory({
    viewer: 'worker',
    thread: taskThread('worker', {}, workerItems),
    items: workerItems,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('textbox', {
        name: 'Message Alex Chen',
      }),
    ).toBeEnabled()
  },
}

/** Owner with a pending quote: Accept and Decline on the card, no composer yet. */
export const OwnerPendingQuote: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread('owner', { canSend: false }, pendingItems),
    items: pendingItems,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Accept' }),
    ).toBeVisible()
    await expect(
      canvas.getByText('You can message here once a quote is accepted.'),
    ).toBeVisible()
  },
}

/** Worker who has quoted and is waiting: the card says Awaiting reply and the thread is locked. */
export const WorkerAwaitingReply: Story = {
  decorators: messagesStory({
    viewer: 'worker',
    thread: taskThread('worker', { canSend: false }, pendingItems),
    items: pendingItems,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Awaiting reply')).toBeVisible()
    await expect(canvas.queryByRole('textbox')).toBeNull()
  },
}

/** The owner chose another worker: the notice explains the thread is closed. */
export const NotSelected: Story = {
  decorators: (() => {
    const items = [
      conversationFlash(
        'n-1',
        FlashKind.QuoteNotSelected,
        'Task went to someone else',
        'Alex chose another worker for this task.',
        new Date().toISOString(),
        {
          quoteId: 'q-jordan',
          quote: jordanQuote({ status: QuoteStatus.NotSelected }),
        },
      ),
    ]
    return messagesStory({
      viewer: 'worker',
      thread: taskThread('worker', { canSend: false }, items),
      items,
      ...FRAME,
    })
  })(),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'This task went to another worker, so the conversation is closed to you.',
      ),
    ).toBeVisible()
  },
}

/** The viewer blocked the other person: the notice says so and offers no composer. */
export const BlockedByMe: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread(
      'owner',
      { blockedByMe: true, canSend: false },
      ownerItems,
    ),
    items: ownerItems,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'You blocked Jordan Lee. Unblock them to send messages.',
      ),
    ).toBeVisible()
  },
}

/** The Slashie announcements thread: read-only. */
export const Announcements: Story = {
  args: { threadId: 't-system' },
  decorators: messagesStory({
    viewer: 'owner',
    thread: systemThread(),
    items: systemAnnouncements(),
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        "Announcements from Slashie. You can't reply here.",
      ),
    ).toBeVisible()
  },
}

/** A review prompt after the job: the card links to the review. */
export const ReviewPrompt: Story = {
  decorators: (() => {
    const items = [
      conversationFlash(
        'r-1',
        FlashKind.ReviewPrompt,
        'How did it go?',
        'Leave a review for Jordan Lee.',
        new Date().toISOString(),
        { orderId: 'order-detail-1' },
      ),
      ...ownerItems,
    ]
    return messagesStory({
      viewer: 'owner',
      thread: taskThread('owner', {}, items),
      items,
      ...FRAME,
    })
  })(),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Leave a review',
      }),
    ).toBeVisible()
  },
}

/** A full page of history: Load earlier appears above the oldest message. */
export const LongHistory: Story = {
  decorators: (() => {
    const items = manyMessages('owner', 50)
    return messagesStory({
      viewer: 'owner',
      thread: taskThread('owner', {}, items),
      items,
      ...FRAME,
    })
  })(),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Load earlier',
      }),
    ).toBeVisible()
  },
}

/** Long and multi-line messages wrap inside their bubbles. */
export const LongMessages: Story = {
  decorators: (() => {
    const items = [
      conversationMessage(
        'owner',
        'worker',
        'long-2',
        'Quick note before Saturday.\nI will park the van outside number 12 and need about two hours.\nIf the bookshelf has not been unpacked yet, please leave it flat in the hallway.',
        new Date().toISOString(),
      ),
      conversationMessage(
        'owner',
        'owner',
        'long-1',
        'Thank you. A very long unbroken link that must not stretch the bubble: https://example.com/guides/mounting-a-bookshelf-on-a-plasterboard-wall-with-the-right-fixings',
        new Date().toISOString(),
      ),
    ]
    return messagesStory({
      viewer: 'owner',
      thread: taskThread('owner', {}, items),
      items,
      ...FRAME,
    })
  })(),
}

/** Phones: the conversation fills the screen. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread('owner', {}, ownerItems),
    items: ownerItems,
    height: '560px',
  }),
}

/** The thread request has not settled: a loading line, no header. */
export const Loading: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    threadRequest: 'loading',
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Loading messages…'),
    ).toBeVisible()
  },
}

/** The thread request failed: an error with Try again and a way back. */
export const LoadError: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    threadRequest: 'failed',
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      "Couldn't load your messages.",
    )
    await expect(
      canvas.getByRole('button', { name: 'Try again' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Back to messages' }),
    ).toBeVisible()
  },
}
