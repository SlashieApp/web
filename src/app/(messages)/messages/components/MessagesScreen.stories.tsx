import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { storyTaskDetail } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'
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

/** The inbox and chat panel: the page container's one child. */
function panelOf(canvasElement: HTMLElement) {
  const panel = canvasElement.querySelector(
    '[data-page-container]',
  )?.firstElementChild
  if (!panel) throw new Error('Messages panel not found')
  return panel
}

/**
 * R7: from lg the panel sits inside the container gutters, so its edges are
 * the site header's logo line and menu line (FE-457). The inbox is 360 wide
 * with the chat beside it.
 */
async function expectPanelInsideGutters(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  await within(canvasElement).findByRole('log')
  const { logo, menu } = lines(canvasElement)
  const panel = boxOf(panelOf(canvasElement))
  expectPx(panel.left, logo, 'the panel starts on the logo line')
  expectPx(panel.right, menu, 'and ends on the menu line')
  const inbox = within(canvasElement).getByRole('navigation', {
    name: 'Messages',
  })
  expectPx(boxOf(inbox).left, logo + 1, 'the inbox is the left column')
}

/** Lg (1024): gutters 32. */
export const InsideGuttersLg: Story = {
  ...viewportAt(1024),
  args: { threadId: STORY_THREAD_ID },
  decorators: messagesStory({
    viewer: 'owner',
    inbox,
    thread: open,
    items,
    ...FRAME,
  }),
  play: ({ canvasElement }) => expectPanelInsideGutters(canvasElement, 1024),
}

/** 1366: the container is 80rem and centred, the panel is 1216 wide. */
export const InsideGutters1366: Story = {
  ...viewportAt(1366),
  args: { threadId: STORY_THREAD_ID },
  decorators: messagesStory({
    viewer: 'owner',
    inbox,
    thread: open,
    items,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    await expectPanelInsideGutters(canvasElement, 1366)
    expectPx(boxOf(panelOf(canvasElement)).width, 1216)
  },
}

/** 1920: the panel stays on the logo and menu lines, the page background shows either side. */
export const InsideGutters1920: Story = {
  ...viewportAt(1920),
  args: { threadId: STORY_THREAD_ID },
  decorators: messagesStory({
    viewer: 'owner',
    inbox,
    thread: open,
    items,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    await expectPanelInsideGutters(canvasElement, 1920)
    expectPx(boxOf(panelOf(canvasElement)).width, 1216)
  },
}

/** Below lg the panel has no gutters: it runs edge to edge, as the phone inbox does. */
export const EdgeToEdgeOnPhone: Story = {
  ...viewportAt(390),
  decorators: messagesStory({ viewer: 'owner', inbox, height: '560px' }),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 390)
    await within(canvasElement).findByRole('link', {
      name: /Mount bookshelf on living room wall/,
    })
    const panel = boxOf(panelOf(canvasElement))
    expectPx(panel.left, 0)
    expectPx(panel.right, 390)
  },
}

/** Tablet portrait (820, below lg): still no gutters. */
export const EdgeToEdgeOnTablet: Story = {
  ...viewportAt(820),
  decorators: messagesStory({ viewer: 'owner', inbox, height: '560px' }),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 820)
    await within(canvasElement).findByRole('link', {
      name: /Mount bookshelf on living room wall/,
    })
    const panel = boxOf(panelOf(canvasElement))
    expectPx(panel.left, 0)
    expectPx(panel.right, 820)
  },
}
