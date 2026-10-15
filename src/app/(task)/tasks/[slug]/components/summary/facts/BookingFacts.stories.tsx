import { Stack } from '@chakra-ui/react'
import {
  OrderStatus,
  QuoteStatus,
  TaskPaymentMethod,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ComponentType } from 'react'
import { within } from 'storybook/test'

import { Card } from '@ui'

import { withTaskDetailStory } from '../../../helpers/taskDetailStoryDecorator'
import {
  type OrderReviewSeed,
  withOrderReviewSeed,
} from '../../../helpers/taskDetailStoryExtras'
import {
  STORY_WORKER_ID,
  type TaskDetailStoryConfig,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../../helpers/taskDetailStoryFixtures'
import {
  AgreedPriceFact,
  OtherPartyFact,
  RecordFact,
  ReviewsFact,
} from './BookingFacts'

/** Hairline between facts, as in the Task summary. */
const FACT_DIVIDERS = {
  '& > * + *': { borderTopWidth: '1px', borderTopColor: 'border.default' },
} as const

function FactsCard({ facts }: { facts: ComponentType[] }) {
  return (
    <Card layout="section" framed maxW="560px">
      <Stack gap={0} css={FACT_DIVIDERS}>
        {facts.map((Fact) => (
          <Fact key={Fact.name} />
        ))}
      </Stack>
    </Card>
  )
}

/**
 * The booking facts in the Task summary: the other person, the agreed price,
 * the order record and the reviews. The Task summary stories show them in
 * context; these cover the variations inside each fact.
 */
const meta = {
  title: 'Task detail/Summary/BookingFacts',
  component: OtherPartyFact,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OtherPartyFact>

export default meta
type Story = StoryObj<typeof meta>

const bookedTask = (workerPhone: string | null = null) =>
  storyTaskDetail({
    status: TaskStatus.Awarded,
    quotes: [
      storyTaskQuote({
        status: QuoteStatus.Accepted,
        worker: {
          id: STORY_WORKER_ID,
          profile: {
            name: 'Jordan Lee',
            avatarUrl: null,
            contactNumber: workerPhone,
          },
          worker: { id: 'worker-profile-1', isVerified: true },
        } as never,
      }),
    ],
  })

const completedOrder = storyTaskOrder({
  status: OrderStatus.Completed,
  closedAt: '2026-06-10T17:00:00.000Z',
})

function booking(
  Fact: ComponentType,
  config: Partial<TaskDetailStoryConfig>,
): Story {
  return {
    render: () => <FactsCard facts={[Fact]} />,
    decorators: [withTaskDetailStory(config, { maxWidth: '640px' })],
  }
}

// ------------------------------------------------------------ other party

/** Owner: the worker's name, avatar and phone number. */
export const OtherPartyWorkerWithPhone: Story = {
  ...booking(OtherPartyFact, {
    viewer: 'owner',
    task: bookedTask('+44 7700 900456'),
    order: storyTaskOrder(),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Your worker')
    await canvas.findByText('+44 7700 900456')
  },
}

/** Booked worker: the customer's name with phone and email. */
export const OtherPartyCustomer: Story = {
  ...booking(OtherPartyFact, {
    viewer: 'worker',
    task: bookedTask(),
    order: storyTaskOrder(),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Your customer')
    await canvas.findByText(/alex@example.com/)
  },
}

/** No contact details shared yet: the name alone. */
export const OtherPartyNameOnly: Story = {
  ...booking(OtherPartyFact, {
    viewer: 'owner',
    task: bookedTask(),
    order: storyTaskOrder(),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Jordan Lee')
  },
}

// ----------------------------------------------------------- agreed price

/** The agreed total, with how it is paid. */
export const AgreedPriceCash: Story = {
  ...booking(AgreedPriceFact, {
    viewer: 'owner',
    task: bookedTask(),
    order: storyTaskOrder(),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Agreed total')
    await canvas.findByText('Cash')
  },
}

/** Paid by bank transfer. */
export const AgreedPriceBankTransfer: Story = {
  ...booking(AgreedPriceFact, {
    viewer: 'owner',
    task: bookedTask(),
    order: storyTaskOrder({
      snapshot: {
        ...storyTaskOrder().snapshot,
        paymentMethod: TaskPaymentMethod.BankTransfer,
      },
    }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Bank transfer')
  },
}

// ------------------------------------------------------------ order record

/** Booking under way: created, then Booked as the current step. */
export const RecordActive: Story = booking(RecordFact, {
  viewer: 'owner',
  task: bookedTask(),
  order: storyTaskOrder(),
})

/** Finished: created, booked and completed, all done. */
export const RecordCompleted: Story = booking(RecordFact, {
  viewer: 'owner',
  task: bookedTask(),
  order: completedOrder,
})

/** Cancelled: the record ends on "Order cancelled". */
export const RecordCancelled: Story = {
  ...booking(RecordFact, {
    viewer: 'owner',
    task: bookedTask(),
    order: storyTaskOrder({
      status: OrderStatus.Cancelled,
      closedAt: '2026-06-10T17:00:00.000Z',
    }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Order cancelled')
  },
}

/** In conflict: the record ends on "Needs resolving". */
export const RecordConflict: Story = {
  ...booking(RecordFact, {
    viewer: 'owner',
    task: bookedTask(),
    order: storyTaskOrder({ status: OrderStatus.Conflict }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Needs resolving')
  },
}

// ----------------------------------------------------------------- reviews

/** A review seeded onto the completed order, with the viewer as the owner. */
function reviews(seed: Omit<OrderReviewSeed, 'orderId'>): Story {
  return {
    render: () => <FactsCard facts={[ReviewsFact]} />,
    decorators: [
      withOrderReviewSeed({ orderId: 'order-detail-1', ...seed }),
      withTaskDetailStory(
        { viewer: 'owner', task: bookedTask(), order: completedOrder },
        { maxWidth: '640px' },
      ),
    ],
  }
}

/** Neither review exists yet: a prompt to review once the job is done. */
export const ReviewsNoneYet: Story = {
  ...reviews({ canSubmit: true }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(/Review this completed job/)
  },
}

/** Your review, still inside the 48-hour edit window: Edit review. */
export const ReviewsYoursEditable: Story = {
  ...reviews({
    viewerHasSubmittedReview: true,
    viewerReview: {
      id: 'review-yours',
      stars: 5,
      comment: 'Tidy, on time and fair.',
      createdAt: new Date().toISOString(),
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Tidy, on time and fair.')
    await canvas.findByRole('link', { name: 'Edit review' })
  },
}

/** Your review after the edit window: locked, and waiting on theirs. */
export const ReviewsYoursLocked: Story = {
  ...reviews({
    viewerHasSubmittedReview: true,
    viewerReview: {
      id: 'review-yours',
      stars: 4,
      comment: 'Good work.',
      createdAt: '2026-06-11T10:00:00.000Z',
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Editing closed after 48 hours.')
    await canvas.findByText(/You’ll see their review/)
  },
}

/** Both reviews are in: yours, then theirs with a Report this review button. */
export const ReviewsBoth: Story = {
  ...reviews({
    viewerHasSubmittedReview: true,
    viewerReview: {
      id: 'review-yours',
      stars: 5,
      comment: 'Tidy, on time and fair.',
      createdAt: new Date().toISOString(),
    },
    counterpartReview: {
      id: 'review-theirs',
      stars: 5,
      comment: 'Clear brief and paid on the day.',
      createdAt: '2026-06-11T12:00:00.000Z',
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Their review')
    await canvas.findByText('Clear brief and paid on the day.')
  },
}
