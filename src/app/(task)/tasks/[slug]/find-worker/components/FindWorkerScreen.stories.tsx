import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import { viewportAt } from '@/ui/PageContainer/pageLines.testing'

import type { FindWorkerMatch } from '../helpers/findWorker'
import { FindWorkerScreen } from './FindWorkerScreen'

/** Story-only: the page inside the app's `main`, on the canvas colour. */
const withPage: Decorator = (Story) => (
  <Box bg="bg.canvas" minH="100dvh">
    <Box as="main" id="main-content">
      <Story />
    </Box>
  </Box>
)

/** Made-up workers: no real names or photos. */
const worker = (
  userId: string,
  name: string,
  over: Partial<FindWorkerMatch> & {
    hasPro?: boolean
    rating?: { average: number; count: number }
  } = {},
): FindWorkerMatch => ({
  matchedCategories: over.matchedCategories ?? ['Plumbing'],
  distanceMiles: over.distanceMiles ?? 1.2,
  alreadyAsked: over.alreadyAsked ?? false,
  worker: {
    id: `worker-${userId}`,
    userId,
    hasPro: over.hasPro ?? false,
    ratingSummary: over.rating ?? { average: 0, count: 0 },
    user: { profile: { name, avatarUrl: null } },
    profile: null,
  },
})

const MATCHES: FindWorkerMatch[] = [
  worker('u1', 'Morgan Reed', {
    matchedCategories: ['Plumbing', 'Leaky tap'],
    distanceMiles: 0.4,
    hasPro: true,
    rating: { average: 4.9, count: 31 },
  }),
  worker('u2', 'Sam Okafor', {
    distanceMiles: 1,
    rating: { average: 4.6, count: 8 },
  }),
  worker('u3', 'Priya Nair', { distanceMiles: 2.34, alreadyAsked: true }),
  worker('u4', 'Jordan Bartholomew-Featherstonehaugh', {
    matchedCategories: ['Leaky tap'],
    distanceMiles: 5.8,
  }),
]

const TASK = {
  title: 'Fix a leaking kitchen tap',
  categories: ['Plumbing', 'Leaky tap'],
  quoteInvitationLimit: 30,
  quoteInvitationsLeft: 29,
}

const meta = {
  title: 'Tasks/Find worker/FindWorkerScreen',
  component: FindWorkerScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withPage],
  args: {
    taskId: 'task-1',
    task: TASK,
    matches: MATCHES,
    onRetry: fn(),
    onAsk: fn(async () => true),
  },
} satisfies Meta<typeof FindWorkerScreen>

export default meta
type Story = StoryObj<typeof meta>

const rowsOf = (canvasElement: HTMLElement) => [
  ...canvasElement.querySelectorAll<HTMLElement>('[data-find-worker-row]'),
]

/** The list as the API ordered it: best match first, one already asked. */
export const List: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Find worker' }),
    ).toBeVisible()
    const rows = rowsOf(canvasElement)
    await expect(rows.map((row) => row.dataset.findWorkerRow)).toEqual([
      'open',
      'open',
      'asked',
      'open',
    ])
    // The API's order is kept: nothing here sorts.
    await expect(
      rows.map((row) => within(row).getByRole('link').getAttribute('href')),
    ).toEqual([
      '/profile/u1?fromTask=task-1',
      '/profile/u2?fromTask=task-1',
      '/profile/u3?fromTask=task-1',
      '/profile/u4?fromTask=task-1',
    ])
    const first = within(rows[0] as HTMLElement)
    await expect(first.getByText('Fits: Plumbing, Leaky tap')).toBeVisible()
    await expect(first.getByText('0.4 miles away')).toBeVisible()
    await expect(first.getByLabelText('Slashie Pro')).toHaveTextContent('Pro')
    await expect(
      within(rows[1] as HTMLElement).getByText('1 mile away'),
    ).toBeVisible()
    // The one already asked says so and has no button.
    const asked = within(rows[2] as HTMLElement)
    await expect(asked.getByText('Asked')).toBeVisible()
    await expect(asked.queryByRole('button')).toBeNull()
    await expect(
      canvas.getByText('You can ask 29 more for this task.'),
    ).toBeVisible()
    // Nothing is sent until a tap.
    await expect(args.onAsk).not.toHaveBeenCalled()
  },
}

/** A tap asks that worker: the row turns to Asked and the count drops. */
export const AskOne: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Ask Sam to quote' }),
    )
    await waitFor(() => expect(args.onAsk).toHaveBeenCalledTimes(1))
    await expect(args.onAsk).toHaveBeenCalledWith(
      expect.objectContaining({ workerUserId: 'u2', firstName: 'Sam' }),
    )
    await waitFor(() =>
      expect(rowsOf(canvasElement)[1]?.dataset.findWorkerRow).toBe('asked'),
    )
    await expect(
      canvas.getByText('You can ask 28 more for this task.'),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Ask Sam to quote' }),
    ).toBeNull()
  },
}

/** The API said no: the reason sits on that worker's row, and the row stays. */
export const AskRefused: Story = {
  args: { onAsk: fn(async () => false) },
  render: (args) => (
    <FindWorkerScreen
      {...args}
      askError="Sam can't be asked to quote right now."
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // No row carries the error until one was asked.
    await expect(canvas.queryByRole('alert')).toBeNull()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Ask Sam to quote' }),
    )
    const alert = await canvas.findByRole('alert')
    await expect(alert).toHaveTextContent(
      "Sam can't be asked to quote right now.",
    )
    await expect(rowsOf(canvasElement)[1]).toContainElement(alert)
    await expect(rowsOf(canvasElement)[1]?.dataset.findWorkerRow).toBe('open')
  },
}

/** All 30 asked: the count says so and no row can be asked. */
export const NoneLeft: Story = {
  args: { task: { ...TASK, quoteInvitationsLeft: 0 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText(
        "You've asked 30 workers about this task, the most for one task.",
      ),
    ).toBeVisible()
    for (const button of canvas.getAllByRole('button', { name: /to quote$/ })) {
      await expect(button).toBeDisabled()
    }
  },
}

export const Loading: Story = {
  args: { loading: true, matches: null, task: null },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-find-worker-loading]'),
    ).toHaveAttribute('aria-busy', 'true')
    await expect(rowsOf(canvasElement)).toHaveLength(0)
  },
}

/** Nobody fits: say so, and point at the full list of workers. */
export const Empty: Story = {
  args: { matches: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('No matching workers yet')).toBeVisible()
    await expect(
      canvas.getByText(/fits Plumbing, Leaky tap right now/),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Browse all workers' }),
    ).toHaveAttribute('href', '/workers')
  },
}

/** Opened without Slashie Pro (a typed address): the API refuses it. */
export const ProRequired: Story = {
  args: { refused: 'proRequired', matches: null, task: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText('Find worker comes with Slashie Pro'),
    ).toBeVisible()
    await expect(canvas.getByText(/ask up to 30 of them/)).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'See Slashie Pro' }),
    ).toHaveAttribute('href', '/pricing')
    await expect(rowsOf(canvasElement)).toHaveLength(0)
  },
}

export const TaskClosed: Story = {
  args: { refused: 'closed', matches: null, task: null },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Back to task' }),
    ).toHaveAttribute('href', '/tasks/task-1')
  },
}

export const NotYours: Story = {
  args: { refused: 'unavailable', matches: null, task: null },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Go to My tasks' }),
    ).toHaveAttribute('href', '/tasks')
  },
}

export const LoadFailed: Story = {
  args: { refused: 'error', matches: null, task: null },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('alert')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
    await expect(args.onRetry).toHaveBeenCalledTimes(1)
  },
}

/** A phone: a long name is cut, the button stays whole, nothing scrolls sideways. */
export const Phone320: Story = {
  parameters: viewportAt(320),
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument.documentElement
    await expect(doc.scrollWidth).toBeLessThanOrEqual(doc.clientWidth)
    for (const row of rowsOf(canvasElement)) {
      const button = row.querySelector('button')
      if (!button) continue
      const box = button.getBoundingClientRect()
      await expect(box.right).toBeLessThanOrEqual(doc.clientWidth)
      await expect(box.height).toBeGreaterThanOrEqual(36)
      await expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth)
    }
  },
}

export const ZhHk: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: '/zh-hk/tasks/task-1/find-worker' },
    },
  },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: '尋找工作者' }),
    ).toBeVisible()
    await expect(canvas.getByText('這項任務還可以邀請 29 位。')).toBeVisible()
    await expect(canvas.getByText('已邀請')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: '請 Sam 報價' }),
    ).toBeVisible()
  },
}
