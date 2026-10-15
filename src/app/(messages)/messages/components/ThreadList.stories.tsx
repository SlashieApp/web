import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { MessagesContext } from '../context/MessagesProvider'
import { ThreadList } from './ThreadList'
import {
  conversationMessage,
  messagesValue,
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
  return taskThread('owner', { id, title, updatedAt: last.createdAt }, [last])
}

/** Task threads with unread counts, one with no worker yet, and the Slashie thread. */
export const Default: Story = {
  render: (args) => <Frame value={messagesValue()} {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findAllByRole('link')).toHaveLength(
      sampleThreads.length,
    )
    await expect(canvas.getByLabelText('2 unread')).toBeVisible()
  },
}

/** No thread is selected: no row is highlighted. */
export const NothingSelected: Story = {
  args: { selectedId: null },
  render: (args) => <Frame value={messagesValue()} {...args} />,
}

/** The inbox request has not settled. */
export const Loading: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame value={messagesValue({ threads: [], loading: true })} {...args} />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Loading messages…'),
    ).toBeVisible()
  },
}

/** No threads yet: an empty message. */
export const Empty: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame value={messagesValue({ threads: [], unreadCount: 0 })} {...args} />
  ),
}

/** The inbox request failed: an error with Try again. */
export const LoadError: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame value={messagesValue({ threads: [], error: true })} {...args} />
  ),
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

/** Long titles and previews clamp to one line. */
export const LongText: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame
      value={messagesValue({
        threads: [
          taskThread('owner', {
            title:
              'Mount a very large floor-to-ceiling bookshelf on a plasterboard living room wall before the weekend',
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
