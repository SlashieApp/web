import { OrderStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  storyOrder,
  storyQuote,
  storyTask,
} from '@/app/(dashboard)/quotes/components/workerQuoteStoryFixtures'
import type { MyQuoteItem } from '@/utils/dashboardHelpers'

import {
  buildPostedByMeRows,
  buildWorkImOnRows,
} from '../helpers/pipelineInbox'
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
  title: 'dashboard/dashboard/DashboardPipelineInbox',
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

export const Default: Story = {}
