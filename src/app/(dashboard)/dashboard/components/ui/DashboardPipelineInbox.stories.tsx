import { OrderStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  storyOrder,
  storyQuote,
  storyTask,
} from '@/app/(dashboard)/quotes/components/workerQuoteStoryFixtures'
import type { MyQuoteItem } from '@/utils/dashboardHelpers'

import {
  type PipelineInboxRow,
  buildPostedByMeRows,
  buildWorkImOnRows,
} from '../../helpers/pipelineInbox'
import { DashboardPipelineInbox } from './DashboardPipelineInbox'

const CUSTOMER_ID = 'customer-story-1'
const WORKER_ID = 'worker-story-1'

const pendingA = storyQuote({
  id: 'q-respond-a',
  taskId: 'posted-respond',
  status: 'PENDING',
})
const pendingB = storyQuote({
  id: 'q-respond-b',
  taskId: 'posted-respond',
  status: 'PENDING',
})
const acceptQuote = storyQuote({
  id: 'q-accept',
  taskId: 'posted-accept',
  status: 'PENDING',
})

const postedRows = buildPostedByMeRows(
  [
    storyTask({
      id: 'posted-respond',
      title: 'Paint living room walls',
      quotes: [pendingA, pendingB],
    }),
    storyTask({
      id: 'posted-accept',
      title: 'Fix leaking kitchen tap',
      quotes: [acceptQuote],
    }),
    storyTask({
      id: 'posted-waiting',
      title: 'Assemble IKEA wardrobe',
      quotes: [],
    }),
    storyTask({
      id: 'posted-booked',
      title: 'Mount TV on brick wall',
      status: 'AWARDED',
    }),
  ],
  [
    storyOrder({
      id: 'order-posted-booked',
      taskId: 'posted-booked',
      customerUserId: CUSTOMER_ID,
      status: OrderStatus.Active,
    }),
  ],
  CUSTOMER_ID,
)

const bookedQuote = storyQuote({
  id: 'q-work-booked',
  taskId: 'work-booked',
  workerUserId: WORKER_ID,
  status: 'ACCEPTED',
})
const pendingWork = storyQuote({
  id: 'q-work-pending',
  taskId: 'work-pending',
  workerUserId: WORKER_ID,
  status: 'PENDING',
})

const sentQuotes: MyQuoteItem[] = [
  {
    task: storyTask({
      id: 'work-booked',
      title: 'Garden tidy-up this weekend',
      quotes: [bookedQuote],
    }),
    quote: bookedQuote,
  },
  {
    task: storyTask({
      id: 'work-pending',
      title: 'Help move a sofa upstairs',
      quotes: [pendingWork],
    }),
    quote: pendingWork,
  },
]

const workRows = buildWorkImOnRows(
  sentQuotes,
  [
    storyOrder({
      id: 'order-work-booked',
      taskId: 'work-booked',
      quoteId: bookedQuote.id,
      workerUserId: WORKER_ID,
      status: OrderStatus.Active,
    }),
  ],
  WORKER_ID,
)

const meta = {
  title: 'Dashboard/Home/DashboardPipelineInbox',
  component: DashboardPipelineInbox,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    postedRows,
    workRows,
    loading: false,
  },
} satisfies Meta<typeof DashboardPipelineInbox>

export default meta
type Story = StoryObj<typeof meta>

/** Posted tasks and work in progress, with items that need an answer. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText(/items need you today/)).toBeVisible()
  },
}

/** Nothing posted and no work: both columns invite a first step. */
export const Empty: Story = {
  args: {
    postedRows: [],
    workRows: [],
  },
}

/** Still fetching: skeleton rows in both columns. */
export const Loading: Story = {
  args: { postedRows: [], workRows: [], loading: true },
}

/** Rows exist but none need the user: the quiet subtitle. */
export const AllCaughtUp: Story = {
  args: {
    postedRows: postedRows.map((row) => ({ ...row, needsAttention: false })),
    workRows: workRows.map((row) => ({ ...row, needsAttention: false })),
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Posted tasks and work you’re on, with one next step each.',
      ),
    ).toBeVisible()
  },
}

/** Tasks posted but no work yet: the work column is empty. */
export const OnlyPosted: Story = {
  args: { workRows: [] },
}

/** Work in progress but nothing posted: the posted column is empty. */
export const OnlyWork: Story = {
  args: { postedRows: [] },
}

const row = (
  overrides: Partial<PipelineInboxRow> & Pick<PipelineInboxRow, 'id'>,
): PipelineInboxRow => ({
  title: 'Mount bookshelf on living room wall',
  href: `/tasks/${overrides.id}`,
  statusLabel: 'Quoting',
  statusTone: 'warning',
  actionKind: 'view',
  actionHref: `/tasks/${overrides.id}`,
  needsAttention: false,
  happenedAt: '2026-10-01T10:00:00.000Z',
  ...overrides,
})

/** Every action button and status tone the rows can carry. */
export const ActionsAndTones: Story = {
  args: {
    postedRows: [
      row({
        id: 'a',
        statusLabel: 'Quoting',
        statusTone: 'warning',
        actionKind: 'respond',
        needsAttention: true,
      }),
      row({
        id: 'b',
        statusLabel: 'Quote received',
        statusTone: 'warning',
        actionKind: 'accept',
        needsAttention: true,
      }),
      row({
        id: 'c',
        statusLabel: 'Booked',
        statusTone: 'success',
        actionKind: 'markDone',
        needsAttention: true,
      }),
      row({
        id: 'd',
        statusLabel: 'Waiting for quotes',
        statusTone: 'neutral',
        actionKind: 'view',
      }),
    ],
    workRows: [
      row({
        id: 'e',
        statusLabel: 'Quote sent',
        statusTone: 'info',
        actionKind: 'view',
      }),
      row({
        id: 'f',
        statusLabel: 'Booked',
        statusTone: 'success',
        actionKind: 'contactOffline',
      }),
      row({
        id: 'g',
        statusLabel: 'Conflict',
        statusTone: 'danger',
        actionKind: 'view',
        needsAttention: true,
      }),
    ],
  },
}

/** Long titles clamp to two lines beside the action. */
export const LongTitles: Story = {
  args: {
    postedRows: [
      row({
        id: 'long',
        title:
          'Mount a very large floor-to-ceiling bookshelf on a plasterboard living room wall, with the fixings supplied, before the weekend',
        statusLabel: 'Quoting',
        actionKind: 'respond',
        needsAttention: true,
      }),
    ],
    workRows: [],
  },
}

/** Phones: the two columns stack. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
