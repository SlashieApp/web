import { Box } from '@chakra-ui/react'
import { TaskStatus, ThreadAttentionKind } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { STORY_OWNER_ID } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { InboxSearchProvider } from '../context/InboxSearchProvider'
import { MessagesContext } from '../context/MessagesProvider'
import { ThreadList } from './ThreadList'
import { messagesStory } from './messagesStoryDecorator'
import {
  STORY_THREAD_TITLE,
  cancelledTaskThread,
  conversationMessage,
  messagesValue,
  mixedInbox,
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
      <InboxSearchProvider>
        <Box
          maxW="360px"
          h="560px"
          display="flex"
          flexDirection="column"
          bg="bg.surface"
        >
          <ThreadList selectedId={selectedId} />
        </Box>
      </InboxSearchProvider>
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
    {
      id,
      task: {
        id: `task-${id}`,
        title,
        status: TaskStatus.Awarded,
        poster: { id: STORY_OWNER_ID },
      },
      updatedAt: last.createdAt,
    },
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

/** The poster's task was cancelled before anyone was booked: Task cancelled. */
export const PosterTaskCancelled: Story = {
  ...oneRow(cancelledTaskThread()),
  play: async ({ canvasElement }) => row(canvasElement, 'Task cancelled'),
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
              status: TaskStatus.Awarded,
              poster: { id: STORY_OWNER_ID },
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

/* Search and filter (FE-362). Alex is signed in, so the filters can tell the
   tasks he posted from the ones he works on. */

/** Alex's inbox with a conversation for each filter. */
const mixedDecorators = messagesStory<{ selectedId: string | null }>({
  viewer: 'owner',
  inbox: { threads: mixedInbox(), unreadCount: 3 },
  height: '560px',
  maxW: '360px',
})
const mixed: Story = {
  args: { selectedId: null },
  decorators: mixedDecorators,
}

/** The rows of `mixedInbox`, by what each row says. */
const rows = {
  bookshelf: /Jordan Lee/,
  garden: /2 workers quoted/,
  slashie: /Updates from Slashie/,
  tap: /Sam Taylor/,
  fence: /Chloé Martin/,
}
const allRows = Object.values(rows)

/** The list shows exactly these conversations. */
async function expectRows(canvasElement: HTMLElement, names: RegExp[]) {
  const canvas = within(canvasElement)
  await waitFor(() =>
    expect(canvas.queryAllByRole('link')).toHaveLength(names.length),
  )
  for (const name of names) {
    await expect(canvas.getByRole('link', { name })).toBeVisible()
  }
}

async function typeSearch(canvasElement: HTMLElement, text: string) {
  await userEvent.type(
    await within(canvasElement).findByRole('searchbox', {
      name: 'Search messages',
    }),
    text,
  )
}

/** Opens the filter drawer (it renders on the page, not in the story) and picks one. */
async function pickFilter(canvasElement: HTMLElement, name: string) {
  const page = within(canvasElement.ownerDocument.body)
  await userEvent.click(
    await within(canvasElement).findByRole('button', { name: /^Filter/ }),
  )
  const drawer = within(await page.findByRole('dialog', { name: 'Filter' }))
  await userEvent.click(drawer.getByRole('radio', { name }))
  await waitFor(() => expect(page.queryByRole('dialog')).toBeNull(), {
    timeout: 3000,
  })
}

/** Search text: "garden" is in two task titles. */
export const SearchTaskTitle: Story = {
  ...mixed,
  play: async ({ canvasElement }) => {
    await typeSearch(canvasElement, 'garden')
    await expectRows(canvasElement, [rows.garden, rows.fence])
  },
}

/** Search text: case and accents don't matter, so CHLOE finds Chloé Martin. */
export const SearchPersonIgnoresAccents: Story = {
  ...mixed,
  play: async ({ canvasElement }) => {
    await typeSearch(canvasElement, 'CHLOE')
    await expectRows(canvasElement, [rows.fence])
  },
}

/** Search text: the latest message is searched too, so "drill" finds Jordan's. */
export const SearchLastMessage: Story = {
  ...mixed,
  play: async ({ canvasElement }) => {
    await typeSearch(canvasElement, 'drill')
    await expectRows(canvasElement, [rows.bookshelf])
  },
}

/** The X in the search box clears the text and brings every conversation back. */
export const ClearSearch: Story = {
  ...mixed,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await typeSearch(canvasElement, 'garden')
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Clear search' }),
    )
    await expectRows(canvasElement, allRows)
    await expect(canvas.getByRole('searchbox')).toHaveValue('')
    await expect(canvas.getByRole('searchbox')).toHaveFocus()
  },
}

/** One filter on: the drawer's choice is applied, and the button says so. */
const filtered = (name: string, shown: RegExp[]): Story => ({
  ...mixed,
  play: async ({ canvasElement }) => {
    await pickFilter(canvasElement, name)
    await expectRows(canvasElement, shown)
    await expect(
      within(canvasElement).getByRole('button', {
        name: 'Filter, 1 active',
      }),
    ).toBeVisible()
  },
})

/** Filter Unread: only the conversations with something unread. */
export const FilterUnread: Story = filtered('Unread', [
  rows.bookshelf,
  rows.fence,
])

/** Filter Needs you: quotes to compare, and a booking to mark Done. */
export const FilterNeedsYou: Story = filtered('Needs you', [
  rows.garden,
  rows.tap,
])

/** Filter Posted by you: the tasks Alex posted. */
export const FilterPostedByYou: Story = filtered('Posted by you', [
  rows.bookshelf,
  rows.garden,
])

/** Filter Working on: the tasks someone else posted. */
export const FilterWorkingOn: Story = filtered('Working on', [
  rows.tap,
  rows.fence,
])

/** Filter Slashie updates: the Slashie thread only. */
export const FilterSlashieUpdates: Story = filtered('Slashie updates', [
  rows.slashie,
])

/** Search and filter together: "garden" among the tasks Alex posted. */
export const SearchAndFilter: Story = {
  ...mixed,
  play: async ({ canvasElement }) => {
    await pickFilter(canvasElement, 'Posted by you')
    await typeSearch(canvasElement, 'garden')
    await expectRows(canvasElement, [rows.garden])
  },
}

/** inbox.noMatches: nothing matches, so the list says so and offers Clear search and filter. */
export const NoResults: Story = {
  ...mixed,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await typeSearch(canvasElement, 'plumber')
    await expect(
      await canvas.findByText('No conversations match'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Clear search and filter' }),
    ).toBeVisible()
    await expectRows(canvasElement, [])
  },
}

/** Clear search and filter: every conversation is back, the text is empty and the filter is off. */
export const ClearSearchAndFilter: Story = {
  ...mixed,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await pickFilter(canvasElement, 'Slashie updates')
    await typeSearch(canvasElement, 'plumber')
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Clear search and filter' }),
    )
    await expectRows(canvasElement, allRows)
    await expect(canvas.getByRole('searchbox')).toHaveValue('')
    await expect(canvas.getByRole('button', { name: 'Filter' })).toBeVisible()
  },
}

/** Phones: the filter button opens a bottom sheet with the six choices, the current one marked. */
export const FilterDrawerPhone: Story = {
  ...mixed,
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Filter' }),
    )
    const drawer = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Filter',
      }),
    )
    for (const name of [
      'All',
      'Unread',
      'Needs you',
      'Posted by you',
      'Working on',
      'Slashie updates',
    ]) {
      await expect(drawer.getByRole('radio', { name })).toBeVisible()
    }
    await expect(drawer.getByRole('radio', { name: 'All' })).toBeChecked()
  },
}

/** zh-HK: the search box, the filter button and its drawer in Traditional Chinese. */
export const ZhHkSearchAndFilter: Story = {
  ...mixed,
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  decorators: [
    ...mixedDecorators,
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await expect(
      await canvas.findByRole('searchbox', { name: '搜尋訊息' }),
    ).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: '篩選' }))
    const drawer = within(await page.findByRole('dialog', { name: '篩選' }))
    for (const name of [
      '全部',
      '未讀',
      '需要你處理',
      '我發布的',
      '我接的工作',
      'Slashie 通知',
    ]) {
      await expect(drawer.getByRole('radio', { name })).toBeVisible()
    }
    await userEvent.click(drawer.getByRole('radio', { name: '我接的工作' }))
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull(), {
      timeout: 3000,
    })
    await expectRows(canvasElement, [rows.tap, rows.fence])
    await expect(
      canvas.getByRole('button', { name: '篩選，已套用 1 項' }),
    ).toBeVisible()
  },
}
