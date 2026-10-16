import { FlashKind, QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'

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

/** Jordan booked for a future slot: the pinned card shows the time and price. */
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

const BOOKED = { ...FRAME, task: bookedTask } as const

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

/**
 * thread.open: owner and worker chatting about a booked task. Day dividers,
 * the pinned card under the header, and a one-line composer.
 */
export const Conversation: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread('owner', {}, ownerItems),
    items: ownerItems,
    ...BOOKED,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const log = await canvas.findByRole('log')
    await expect(log).toHaveTextContent('the spare key is with the neighbour')
    await expect(within(log).getByText('Yesterday')).toBeVisible()
    await expect(within(log).getByText('Today')).toBeVisible()
    const composer = canvas.getByRole('textbox', { name: 'Message Jordan Lee' })
    await expect(composer).toBeEnabled()
    await expect(composer.getBoundingClientRect().height).toBeLessThan(56)
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled()
  },
}

/** zh-HK: day dividers and the composer in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  decorators: [
    ...messagesStory({
      viewer: 'owner',
      thread: taskThread('owner', {}, ownerItems),
      items: ownerItems,
      ...BOOKED,
    }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const log = await canvas.findByRole('log')
    await expect(within(log).getByText('今日')).toBeVisible()
    await expect(within(log).getByText('昨日')).toBeVisible()
    await expect(
      canvas.getByRole('textbox', { name: '傳送訊息給 Jordan Lee' }),
    ).toHaveAttribute('placeholder', '輸入訊息')
  },
}

/** The same conversation from the worker's side: the bubbles swap sides. */
export const AsWorker: Story = {
  decorators: messagesStory({
    viewer: 'worker',
    thread: taskThread('worker', {}, workerItems),
    items: workerItems,
    ...BOOKED,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('textbox', {
        name: 'Message Alex Chen',
      }),
    ).toBeEnabled()
  },
}

/** thread.locked: owner with a pending quote: Accept and Decline on the card, no composer yet. */
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

/** thread.locked: worker who has quoted and is waiting: the card says Awaiting reply. */
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

/** thread.notSelected: the owner chose another worker: the notice explains the thread is closed. */
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

/** thread.blocked: the viewer blocked the other person: the notice says so and offers no composer. */
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

/** thread.system: the Slashie announcements thread: read-only, no pinned card. */
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
      ...BOOKED,
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
      ...BOOKED,
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
      ...BOOKED,
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
    task: bookedTask,
    height: '560px',
  }),
}

/** thread.loading: the request has not settled: skeleton bubbles, no header. */
export const Loading: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    threadRequest: 'loading',
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Loading messages…'),
    ).toBeInTheDocument()
    await expect(
      canvasElement.querySelector('[aria-busy="true"]'),
    ).not.toBeNull()
    await expect(canvas.queryByRole('log')).toBeNull()
  },
}

/** thread.none: desktop with no conversation picked. */
export const NothingPicked: Story = {
  args: { threadId: null },
  decorators: messagesStory({ viewer: 'owner', ...FRAME }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Choose a conversation to read it.',
      ),
    ).toBeVisible()
  },
}

/** thread.notFound: not your conversation (the API answers FORBIDDEN): no Try again, a way back. */
export const NotAvailable: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    threadRequest: 'forbidden',
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("This conversation isn't available"),
    ).toBeVisible()
    await expect(
      canvas.getByText(
        'It may have been removed, or you no longer have access.',
      ),
    ).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Try again' })).toBeNull()
    await expect(
      canvas.getByRole('link', { name: 'Back to messages' }),
    ).toHaveAttribute('href', '/messages')
  },
}

/** thread.loadError: the request failed: an error with Try again and a way back. */
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
