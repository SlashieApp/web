import { Box } from '@chakra-ui/react'
import { ThreadAttentionKind } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { MessagesContext } from '../context/MessagesProvider'
import { ThreadList } from './ThreadList'
import {
  STORY_THREAD_TITLE,
  conversationMessage,
  messagesValue,
  needs,
  sampleThreads,
  systemThread,
  taskThread,
} from './messagesStoryFixtures'

const meta = {
  title: 'Messages/ThreadList',
  component: ThreadList,
  args: { selectedId: 't1' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ThreadList>

export default meta
type Story = StoryObj<typeof meta>

function Frame({
  value,
  selectedId,
}: {
  value: ReturnType<typeof messagesValue>
  selectedId: string | null
}) {
  return (
    <MessagesContext.Provider value={value}>
      <Box
        maxW="360px"
        h="560px"
        display="flex"
        flexDirection="column"
        bg="bg.surface"
      >
        <ThreadList selectedId={selectedId} />
      </Box>
    </MessagesContext.Provider>
  )
}

const daysAgo = (days: number, h = 11) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(h, 0, 0, 0)
  return d.toISOString()
}

/** A task thread whose last message was written `days` ago. */
const threadFrom = (id: string, title: string, days: number) => {
  const last = conversationMessage(
    'owner',
    'worker',
    `last-${id}`,
    'Thanks, that works for me.',
    daysAgo(days),
  )
  return taskThread(
    'owner',
    { id, task: { id: `task-${id}`, title }, updatedAt: last.createdAt },
    [last],
  )
}

/** inbox.list: a booked thread with unread messages, a poster's thread with quotes, and the Slashie thread. */
export const Default: Story = {
  render: (args) => <Frame value={messagesValue()} {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findAllByRole('link')).toHaveLength(
      sampleThreads.length,
    )
    await expect(canvas.getByLabelText('2 unread')).toBeVisible()
    await expect(canvas.getByText('2 workers quoted')).toBeVisible()
    await expect(canvas.getByText('Garden tidy-up')).toBeVisible()
    await expect(canvas.getByText('Updates from Slashie')).toBeVisible()
  },
}

/** One row on its own, as `viewer` sees the thread. */
const oneRow = (thread: ReturnType<typeof taskThread>): Story => ({
  args: { selectedId: null },
  render: (args) => (
    <Frame
      value={messagesValue({ threads: [thread], unreadCount: 0 })}
      {...args}
    />
  ),
})

/** Checks the row's title and the task name under it. */
const row = async (canvasElement: HTMLElement, title: string) => {
  const link = within(await within(canvasElement).findByRole('link'))
  await expect(link.getByText(title)).toBeVisible()
  await expect(link.getByText(STORY_THREAD_TITLE)).toBeVisible()
}

/** The poster before booking with three live quotes: "3 workers quoted" over the task. */
export const PosterQuoted: Story = {
  ...oneRow(
    taskThread('owner', {
      otherParty: null,
      canSend: false,
      attention: needs(ThreadAttentionKind.CompareQuotes, 3),
    }),
  ),
  play: async ({ canvasElement }) => row(canvasElement, '3 workers quoted'),
}

/** The poster with one live quote: "1 worker quoted". */
export const PosterOneQuote: Story = {
  ...oneRow(
    taskThread('owner', {
      otherParty: null,
      canSend: false,
      attention: needs(ThreadAttentionKind.CompareQuotes, 1),
    }),
  ),
  play: async ({ canvasElement }) => row(canvasElement, '1 worker quoted'),
}

/** The poster with no live quotes: Waiting for quotes. */
export const PosterWaiting: Story = {
  ...oneRow(taskThread('owner', { otherParty: null, canSend: false })),
  play: async ({ canvasElement }) => row(canvasElement, 'Waiting for quotes'),
}

/** Booked, the poster's side: the worker's name over the task. */
export const Booked: Story = {
  ...oneRow(taskThread('owner')),
  play: async ({ canvasElement }) => row(canvasElement, 'Jordan Lee'),
}

/** The worker's side: the customer's name over the task. */
export const Worker: Story = {
  ...oneRow(taskThread('worker')),
  play: async ({ canvasElement }) => row(canvasElement, 'Alex Chen'),
}

/** The other person deleted their account: "Deleted user", no photo. */
export const DeletedUser: Story = {
  ...oneRow(
    taskThread('owner', {
      otherParty: {
        userId: 'gone',
        name: 'Deleted user',
        avatarUrl: null,
        deleted: true,
      },
    }),
  ),
  play: async ({ canvasElement }) => row(canvasElement, 'Deleted user'),
}

/** No thread is selected: no row is highlighted. */
export const NothingSelected: Story = {
  args: { selectedId: null },
  render: (args) => <Frame value={messagesValue()} {...args} />,
}

/** inbox.loading: the request has not settled: skeleton rows. */
export const Loading: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame value={messagesValue({ threads: [], loading: true })} {...args} />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Loading messages…'),
    ).toBeInTheDocument()
    await expect(
      canvasElement.querySelector('[aria-busy="true"]'),
    ).not.toBeNull()
  },
}

/** inbox.empty: no threads yet. */
export const Empty: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame value={messagesValue({ threads: [], unreadCount: 0 })} {...args} />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('No messages yet'),
    ).toBeVisible()
  },
}

/** inbox.error: the request failed: an error with Try again. */
export const LoadError: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame value={messagesValue({ threads: [], error: true })} {...args} />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Try again' }),
    ).toBeVisible()
  },
}

/** zh-HK: the inbox in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  render: (args) => (
    <LocaleProvider>
      <Frame value={messagesValue()} {...args} />
    </LocaleProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('訊息')).toBeVisible()
    await expect(canvas.getByText('Slashie 的更新')).toBeVisible()
    await expect(canvas.getByText('已有 2 位師傅報價')).toBeVisible()
  },
}

/** Counts above 99 show as 99+. */
export const ManyUnread: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame
      value={messagesValue({
        threads: [taskThread('owner', { unreadCount: 120 })],
        unreadCount: 120,
      })}
      {...args}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('99+')).toBeVisible()
  },
}

/** Long task names and previews clamp to one line. */
export const LongText: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame
      value={messagesValue({
        threads: [
          taskThread('owner', {
            task: {
              id: 'task-long',
              title:
                'Mount a very large floor-to-ceiling bookshelf on a plasterboard living room wall before the weekend',
            },
            unreadCount: 3,
          }),
        ],
      })}
      {...args}
    />
  ),
}

/** The time label: clock time today, Yesterday, a weekday, then a date. */
export const TimeLabels: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame
      value={messagesValue({
        threads: [
          threadFrom('d0', 'Today', 0),
          threadFrom('d1', 'Yesterday', 1),
          threadFrom('d3', 'A few days ago', 3),
          threadFrom('d12', 'Last month', 12),
        ],
        unreadCount: 0,
      })}
      {...args}
    />
  ),
}

/** A new account: only the Slashie announcements thread. */
export const OnlyAnnouncements: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame
      value={messagesValue({ threads: [systemThread()], unreadCount: 0 })}
      {...args}
    />
  ),
}

/** Phones: the list fills the width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  render: (args) => <Frame value={messagesValue()} {...args} />,
}
