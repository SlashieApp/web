import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { storyTaskDetail } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import { MessagesScreen } from './MessagesScreen'

import { messagesStory } from './messagesStoryDecorator'
import {
  STORY_THREAD_ID,
  bookedConversation,
  sampleThreads,
  taskThread,
} from './messagesStoryFixtures'

const items = bookedConversation('owner')
const open = taskThread('owner', { unreadCount: 1 }, items)
const inbox = { threads: [open, ...sampleThreads.slice(1)], unreadCount: 1 }
const FRAME = { height: '640px', task: storyTaskDetail() } as const

const meta = {
  title: 'Messages/MessagesScreen',
  component: MessagesScreen,
  parameters: { layout: 'fullscreen' },
  args: { threadId: null },
} satisfies Meta<typeof MessagesScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop, nothing open: the inbox beside a prompt to choose a conversation. */
export const InboxOnly: Story = {
  decorators: messagesStory({ viewer: 'owner', inbox, ...FRAME }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Choose a conversation to read it.',
      ),
    ).toBeVisible()
  },
}

/** Desktop, a conversation open: inbox on the left, the thread on the right. */
export const ThreadOpen: Story = {
  args: { threadId: STORY_THREAD_ID },
  decorators: messagesStory({
    viewer: 'owner',
    inbox,
    thread: open,
    items,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('log')).toBeVisible()
    await expect(
      canvas.getByRole('textbox', { name: 'Message Jordan Lee' }),
    ).toBeVisible()
  },
}

/**
 * Desktop: a search that leaves the open conversation out of the list. The
 * list drops its row, and the conversation stays open on the right.
 */
export const SearchLeavesOpenThreadOut: Story = {
  args: { threadId: STORY_THREAD_ID },
  decorators: messagesStory({
    viewer: 'owner',
    inbox,
    thread: open,
    items,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      await canvas.findByRole('searchbox', { name: 'Search messages' }),
      'garden',
    )
    // The list is the navigation; the conversation's header links to Jordan too.
    const list = within(canvas.getByRole('navigation', { name: 'Messages' }))
    await waitFor(() =>
      expect(list.queryByRole('link', { name: /Jordan Lee/ })).toBeNull(),
    )
    await expect(
      list.getByRole('link', { name: /2 workers quoted/ }),
    ).toBeVisible()
    await expect(await canvas.findByRole('log')).toBeVisible()
    await expect(
      canvas.getByRole('textbox', { name: 'Message Jordan Lee' }),
    ).toBeVisible()
  },
}

/** Desktop: the open thread failed to load, with the inbox still usable. */
export const ThreadLoadFailed: Story = {
  args: { threadId: STORY_THREAD_ID },
  decorators: messagesStory({
    viewer: 'owner',
    inbox,
    threadRequest: 'failed',
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Try again' }),
    ).toBeVisible()
  },
}

/** Phones, nothing open: the inbox fills the screen. */
export const PhoneInbox: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: messagesStory({ viewer: 'owner', inbox, height: '560px' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: /Mount bookshelf on living room wall/,
      }),
    ).toBeVisible()
  },
}

/** Phones, a conversation open: the thread replaces the inbox. */
export const PhoneThread: Story = {
  args: { threadId: STORY_THREAD_ID },
  globals: { viewport: { value: 'mobile1' } },
  decorators: messagesStory({
    viewer: 'owner',
    inbox,
    thread: open,
    items,
    task: storyTaskDetail(),
    height: '560px',
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('textbox', {
        name: 'Message Jordan Lee',
      }),
    ).toBeVisible()
  },
}
