import type { InMemoryCache } from '@apollo/client/core'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { getRouter } from '@storybook/nextjs-vite/navigation.mock'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  type StorySessionOptions,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyMe,
  storyMembership,
  storyWorker,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { MyTasksScreen } from './MyTasksScreen'

const ME_ID = 'user-story'
const CATEGORIES = ['CLEANING', 'HANDYMAN', 'MOVING']

type StoryQuote = {
  id: string
  workerUserId: string
  workerName: string
  status: 'PENDING' | 'ACCEPTED'
  amount: number
}

function quote(taskId: string, base: StoryQuote) {
  return {
    __typename: 'Quote' as const,
    id: base.id,
    taskId,
    workerUserId: base.workerUserId,
    price: {
      __typename: 'Price' as const,
      currency: 'GBP',
      amount: base.amount,
    },
    message: 'Happy to help.',
    proposedSlots: [],
    status: base.status,
    createdAt: '2026-10-20T10:00:00.000Z',
    worker: {
      __typename: 'User' as const,
      id: base.workerUserId,
      profile: {
        __typename: 'Profile' as const,
        name: base.workerName,
        avatarUrl: null,
      },
    },
  }
}

function task(base: {
  id: string
  title: string
  categories: string[]
  status?: 'OPEN' | 'CANCELLED'
  posterId?: string
  quotes?: StoryQuote[]
}) {
  return {
    __typename: 'Task' as const,
    id: base.id,
    title: base.title,
    description: 'Story task.',
    categories: base.categories,
    createdAt: '2026-10-19T09:00:00.000Z',
    budget: {
      __typename: 'TaskBudget' as const,
      amount: 80,
      currency: 'GBP',
      type: 'ONE_OFF',
      paymentMethod: 'CASH',
    },
    datetime: {
      __typename: 'TaskDateTime' as const,
      date: '2026-11-12',
      time: '10:00',
      type: 'EXACT',
    },
    images: [],
    status: base.status ?? 'OPEN',
    location: {
      __typename: 'TaskLocation' as const,
      lat: 51.54,
      lng: -0.1,
      name: 'Islington',
      address: null,
    },
    poster: {
      __typename: 'User' as const,
      id: base.posterId ?? ME_ID,
      profile: {
        __typename: 'Profile' as const,
        name: base.posterId ? 'Jo Poster' : 'Sam Carter',
      },
    },
    quotes: (base.quotes ?? []).map((q) => quote(base.id, q)),
  }
}

/** Tasks you posted: one with two quotes in, one with none, one cancelled. */
const posted = [
  task({
    id: 'task-tap',
    title: 'Fix a leaking kitchen tap',
    categories: ['HANDYMAN'],
    quotes: [
      {
        id: 'quote-1',
        workerUserId: 'worker-a',
        workerName: 'Ada Worker',
        status: 'PENDING',
        amount: 60,
      },
      {
        id: 'quote-2',
        workerUserId: 'worker-b',
        workerName: 'Bo Worker',
        status: 'PENDING',
        amount: 75,
      },
    ],
  }),
  task({
    id: 'task-garage',
    title: 'Clear out a garage',
    categories: ['MOVING'],
  }),
  task({
    id: 'task-cancelled',
    title: 'Deep-clean a studio flat',
    categories: ['CLEANING'],
    status: 'CANCELLED',
  }),
]

/** A quote you sent on someone else's open task. */
const quoted = [
  task({
    id: 'task-desk',
    title: 'Assemble a standing desk',
    categories: ['HANDYMAN'],
    posterId: 'poster-other',
    quotes: [
      {
        id: 'quote-mine',
        workerUserId: ME_ID,
        workerName: 'Sam Carter',
        status: 'PENDING',
        amount: 75,
      },
    ],
  }),
]

/** What the story API answers, by operation name (a story never reaches the real one). */
function answers({
  postedTasks = posted,
  quotedTasks = quoted,
  worker = true,
}: {
  postedTasks?: unknown[]
  quotedTasks?: unknown[]
  worker?: boolean
} = {}): StorySessionOptions['responses'] {
  const data = (me: Record<string, unknown>) => ({
    kind: 'data' as const,
    data: { me: { __typename: 'User', ...me } },
  })
  return {
    MyRequests: data({ tasksPosted: postedTasks }),
    MyQuotes: data({
      worker: worker ? { __typename: 'Worker', quotedTasks } : null,
    }),
    MyOrders: data({ orders: [] }),
    MyTaskCategories: data({ hubTaskCategories: CATEGORIES }),
  }
}

/**
 * `me` has no id in these queries, so each answer would replace the last one's
 * `me`. The app's cache is seeded with `Me` (which has an id); the story cache
 * is not, so it merges them instead.
 */
function mergeMe(client: { cache: unknown }) {
  ;(client.cache as InMemoryCache).policies.addTypePolicies({
    Query: { fields: { me: { merge: true } } },
  })
}

function session(options: Partial<StorySessionOptions> = {}) {
  return withSession({
    me: storyWorkerMe(),
    responses: answers(),
    seed: mergeMe,
    ...options,
  })
}

/** Someone who posts tasks and quotes on others': the default for a story. */
const postsAndQuotes = [session()]

/**
 * My tasks at `/tasks`: Upcoming, Open and Past. From `lg` up the filters are
 * an always-open rail left of the list; below it they are the icon by the
 * title and its drawer. There is no list / chart toggle and no Your activity.
 */
const meta = {
  title: 'My tasks/MyTasksScreen',
  component: MyTasksScreen,
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/tasks' } },
  },
} satisfies Meta<typeof MyTasksScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Waits for the lists, which the story API answers a tick after the first paint. */
async function listLoaded(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await expect(
    await canvas.findByRole('heading', { name: 'Open', level: 2 }),
  ).toBeVisible()
  return canvas
}

/** There is no Your activity: no list / chart toggle, no activity panel. */
async function expectNoYourActivity(canvas: ReturnType<typeof within>) {
  await expect(
    canvas.queryByRole('button', { name: 'Show your activity' }),
  ).toBeNull()
  await expect(canvas.queryByRole('button', { name: 'Show tasks' })).toBeNull()
  await expect(canvas.queryByText('Your activity')).toBeNull()
}

/** Desktop: the filters are an always-open rail left of the one-column list. No icon, no toggle. */
export const Desktop: Story = {
  decorators: postsAndQuotes,
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = await listLoaded(canvasElement)
    const rail = canvas.getByRole('complementary', { name: 'Filter tasks' })
    await expect(rail).toBeVisible()
    await expect(within(rail).getByRole('searchbox')).toBeVisible()
    await expect(
      within(rail).getByRole('group', { name: 'Show' }),
    ).toBeVisible()
    await expect(
      within(rail).getByRole('group', { name: 'Category' }),
    ).toBeVisible()
    await expect(
      within(rail).queryByRole('button', { name: 'Clear filters' }),
    ).toBeNull()
    // Left of the list, and both under the title.
    const open = canvas.getByRole('heading', { name: 'Open', level: 2 })
    await expect(rail.getBoundingClientRect().right).toBeLessThanOrEqual(
      open.getBoundingClientRect().left,
    )
    await expect(
      canvas.getByRole('heading', { name: 'My tasks', level: 1 }),
    ).toBeVisible()
    // No filter icon or drawer on desktop.
    await expect(canvas.queryByRole('button', { name: /^Filters/ })).toBeNull()
    await expectNoYourActivity(canvas)
  },
}

/** Desktop: typing in the rail searches once typing stops, and the URL follows. */
export const DesktopSearch: Story = {
  decorators: postsAndQuotes,
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = await listLoaded(canvasElement)
    await userEvent.type(canvas.getByRole('searchbox'), 'tap')
    await expect(getRouter().replace).not.toHaveBeenCalled()
    await waitFor(
      () =>
        expect(getRouter().replace).toHaveBeenCalledWith('/tasks?q=tap', {
          scroll: false,
        }),
      { timeout: 2000 },
    )
    await expect(
      canvas.getByRole('button', { name: 'Clear filters' }),
    ).toBeVisible()
  },
}

/** Desktop: a chip filters the list and the URL at once; Clear filters undoes it. */
export const DesktopChips: Story = {
  decorators: postsAndQuotes,
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = await listLoaded(canvasElement)
    await expect(canvas.getByText('Assemble a standing desk')).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Posted by you' }))
    await expect(getRouter().replace).toHaveBeenLastCalledWith(
      '/tasks?role=hosted',
      { scroll: false },
    )
    await waitFor(() =>
      expect(canvas.queryByText('Assemble a standing desk')).toBeNull(),
    )
    await expect(canvas.getByText('Fix a leaking kitchen tap')).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Moving' }))
    await expect(getRouter().replace).toHaveBeenLastCalledWith(
      '/tasks?category=MOVING&role=hosted',
      { scroll: false },
    )

    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }))
    await expect(getRouter().replace).toHaveBeenLastCalledWith('/tasks', {
      scroll: false,
    })
    await expect(
      await canvas.findByText('Assemble a standing desk'),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Clear filters' }),
    ).toBeNull()
  },
}

/** Desktop, filters in the URL: the rail shows them and the list is narrowed. */
export const DesktopFiltersInUrl: Story = {
  decorators: postsAndQuotes,
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/tasks',
        query: { q: 'tap', category: 'HANDYMAN', role: 'hosted' },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = await listLoaded(canvasElement)
    await expect(canvas.getByRole('searchbox')).toHaveValue('tap')
    await expect(
      canvas.getByRole('button', { name: 'Posted by you' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      canvas.getByRole('button', { name: 'Handyman' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      canvas.getByRole('button', { name: 'Clear filters' }),
    ).toBeVisible()
    // Posted by you: the quote you sent on someone else's task is out.
    await expect(canvas.queryByText('Assemble a standing desk')).toBeNull()
  },
}

/** Desktop, the filters leave nothing: the message's Clear filters also clears the rail. */
export const DesktopNoMatches: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [
    session({
      me: storyMe(),
      responses: answers({ worker: false, quotedTasks: [] }),
    }),
  ],
  parameters: {
    nextjs: {
      navigation: { pathname: '/tasks', query: { role: 'quoted' } },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'No matching tasks' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('complementary', { name: 'Filter tasks' }),
    ).toBeVisible()
    const clear = canvas.getAllByRole('button', { name: 'Clear filters' })
    await expect(clear).toHaveLength(2)
    // The one under the message is the second in the page.
    await userEvent.click(clear[1])
    await expect(getRouter().replace).toHaveBeenLastCalledWith('/tasks', {
      scroll: false,
    })
    await expect(
      await canvas.findByText('Fix a leaking kitchen tap'),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Clear filters' }),
    ).toBeNull()
  },
}

/** Desktop, only tasks you posted: the rail has no Show choice. */
export const DesktopOneKind: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [
    session({
      me: storyMe(),
      responses: answers({ worker: false, quotedTasks: [] }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = await listLoaded(canvasElement)
    await expect(canvas.getByRole('group', { name: 'Category' })).toBeVisible()
    await expect(canvas.queryByRole('group', { name: 'Show' })).toBeNull()
  },
}

/** Desktop, a worker who can't quote: the strip sits above the list, beside the rail. */
export const DesktopQuoteBlocker: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [
    session({
      me: storyWorkerMe({
        worker: storyWorker({
          membership: storyMembership('freeLimitReached'),
        }),
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = await listLoaded(canvasElement)
    const strip = canvas.getByText(/Before you can quote/)
    const rail = canvas.getByRole('complementary', { name: 'Filter tasks' })
    await expect(strip).toBeVisible()
    await expect(rail.getBoundingClientRect().right).toBeLessThanOrEqual(
      strip.getBoundingClientRect().left,
    )
  },
}

/** Desktop, a new user with nothing to filter: no rail, and the message uses the full width. */
export const DesktopNoTasks: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [
    session({
      me: storyMe(),
      responses: answers({ postedTasks: [], quotedTasks: [], worker: false }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'No tasks yet' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('complementary')).toBeNull()
    await expect(canvas.queryByRole('button', { name: /^Filters/ })).toBeNull()
    const title = canvas.getByRole('heading', { name: 'My tasks', level: 1 })
    const message = canvas.getByRole('heading', { name: 'No tasks yet' })
    await expect(message.getBoundingClientRect().left).toBeCloseTo(
      title.getBoundingClientRect().left,
      0,
    )
  },
}

/** Desktop, first load: no rail yet, but its room is kept so the list does not jump when it appears. */
export const DesktopLoading: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [session({ responses: {} })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Loading your tasks…'),
    ).toBeInTheDocument()
    await expect(canvas.queryByRole('complementary')).toBeNull()
    const title = canvas.getByRole('heading', { name: 'My tasks', level: 1 })
    const placeholders = canvasElement.querySelector('[aria-busy="true"]')
    // The placeholders start right of where the rail will be (19rem and a 2rem gap).
    await expect(
      placeholders?.getBoundingClientRect().left,
    ).toBeGreaterThanOrEqual(title.getBoundingClientRect().left + 21 * 16)
  },
}

/** Phone: the filter icon by the title opens the bottom sheet. No rail, no toggle. */
export const Phone: Story = {
  decorators: postsAndQuotes,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = await listLoaded(canvasElement)
    await expect(canvas.queryByRole('complementary')).toBeNull()
    await expectNoYourActivity(canvas)
    await userEvent.click(canvas.getByRole('button', { name: 'Filters' }))
    const page = within(canvasElement.ownerDocument.body)
    const sheet = await page.findByRole('dialog', { name: 'Filter tasks' })
    await userEvent.click(within(sheet).getByRole('button', { name: 'Moving' }))
    await userEvent.click(within(sheet).getByRole('button', { name: 'Apply' }))
    await expect(getRouter().replace).toHaveBeenCalledWith(
      '/tasks?category=MOVING',
      { scroll: false },
    )
    await expect(
      await canvas.findByRole('button', { name: 'Filters, 1 active' }),
    ).toBeVisible()
  },
}

/** Phone, filters in the URL: the icon counts them. */
export const PhoneFiltersInUrl: Story = {
  decorators: postsAndQuotes,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/tasks',
        query: { q: 'tap', category: 'HANDYMAN', role: 'hosted' },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = await listLoaded(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Filters, 3 active' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('complementary')).toBeNull()
  },
}

/** Tablet (below `lg`): the same icon and sheet as a phone, in the centred column. */
export const Tablet: Story = {
  decorators: postsAndQuotes,
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = await listLoaded(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Filters' })).toBeVisible()
    await expect(canvas.queryByRole('complementary')).toBeNull()
  },
}

/** Traditional Chinese copy (from the `/zh-hk` URL prefix), on desktop. */
export const TraditionalChinese: Story = {
  globals: { viewport: { value: 'desktop' } },
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks' } } },
  decorators: [
    session(),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('complementary', { name: '篩選任務' }),
    ).toBeVisible()
    await expect(canvas.queryByText('你的活動')).toBeNull()
  },
}
