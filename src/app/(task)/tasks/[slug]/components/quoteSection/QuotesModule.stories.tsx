import { QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { QuotesModule } from './QuotesModule'

/**
 * The 12-state task-detail Quotes module (approved contact sheet v2).
 * C1–C4 = customer/owner states, W1–W8 = visitor/worker states. State derives
 * from `getTaskDetailPermissions` + quote data seeded by the story decorator.
 */
const meta = {
  title: 'task/tasks/quoteSection/QuotesModule',
  component: QuotesModule,
  tags: ['autodocs'],
} satisfies Meta<typeof QuotesModule>

export default meta
type Story = StoryObj<typeof meta>

const SIDEBAR = { maxWidth: '380px' }

const competitorA = storyTaskQuote({
  id: 'quote-a',
  workerUserId: 'worker-user-a',
  price: { amount: 95, currency: 'GBP' as never },
  message:
    'I can assemble your wardrobe carefully and quickly.\n\nAvailability: Available this week',
})

const competitorB = storyTaskQuote({
  id: 'quote-b',
  workerUserId: 'worker-user-b',
  price: { amount: 85, currency: 'GBP' as never },
  message:
    'Happy to help with your build.\n\nAvailability: Available this week',
  worker: {
    id: 'worker-user-b',
    profile: { name: 'Maria L.', avatarUrl: null },
    worker: { id: 'worker-profile-b', isVerified: false },
  } as never,
})

const competitorC = storyTaskQuote({
  id: 'quote-c',
  workerUserId: 'worker-user-c',
  price: { amount: 110, currency: 'GBP' as never },
  message: 'Experienced flat-pack specialist.\n\nAvailability: Next 3 days',
  worker: {
    id: 'worker-user-c',
    profile: { name: 'Sam K.', avatarUrl: null },
    worker: { id: 'worker-profile-c', isVerified: true },
  } as never,
})

const myPendingQuote = storyTaskQuote({
  id: 'quote-mine',
  workerUserId: STORY_WORKER_ID,
  price: { amount: 90, currency: 'GBP' as never },
  message:
    'I can assemble your wardrobe with care and attention.\n\nAvailability: Available this week',
  status: QuoteStatus.Pending,
})

// ------------------------------------------------------------- customer

/** C1 · owner, no quotes: empty + reassurance. */
export const C1CustomerEmpty: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'owner', task: storyTaskDetail({ quotes: [] }) },
      SIDEBAR,
    ),
  ],
}

/** C2 · owner, quotes: sort + list + Accept/Decline per pending card. */
export const C2CustomerList: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          quotes: [competitorA, competitorB, competitorC],
        }),
      },
      SIDEBAR,
    ),
  ],
}

/** C3 · owner, partial cap: slots strip + mixed accepted/pending cards. */
export const C3CustomerSlotsFilled: Story = {
  render: () => <QuotesModule slotsCap={3} />,
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          quotes: [
            { ...competitorA, status: QuoteStatus.Accepted },
            { ...competitorC, status: QuoteStatus.Accepted },
            competitorB,
          ],
        }),
      },
      SIDEBAR,
    ),
  ],
}

/** C4 · owner, awarded: primary accepted card + collapsed other quotes. */
export const C4CustomerAwarded: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          status: TaskStatus.Awarded,
          quotes: [
            { ...competitorA, status: QuoteStatus.Accepted },
            competitorB,
            competitorC,
          ],
        }),
      },
      SIDEBAR,
    ),
  ],
}

// -------------------------------------------------------- visitor/worker

/** W1 · visitor: lock + Get started / Log in. */
export const W1Visitor: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'visitor', task: storyTaskDetail({ quotes: [] }) },
      SIDEBAR,
    ),
  ],
}

/** W2 · signed in, no worker profile: skeleton preview + set up CTA. */
export const W2NoWorkerProfile: Story = {
  decorators: [
    withTaskDetailStory(
      {
        // storyMe('owner') identity, but the task belongs to someone else —
        // an authenticated customer without a worker profile.
        viewer: 'customer',
        task: storyTaskDetail({
          poster: {
            id: 'someone-else',
            email: 'other@example.com',
            profile: { name: 'Sam Poster', avatarUrl: null },
          } as never,
          quotes: [competitorA, competitorB],
        }),
      },
      SIDEBAR,
    ),
  ],
}

/** W3 · worker, no quotes yet: empty + Send a quote. */
export const W3WorkerEmpty: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'worker', task: storyTaskDetail({ quotes: [] }) },
      SIDEBAR,
    ),
  ],
}

/** W4 · worker, competitors exist: read-only cards + Send a quote. */
export const W4WorkerCompeting: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({ quotes: [competitorA, competitorB] }),
      },
      SIDEBAR,
    ),
  ],
}

/** W5 · worker, own quote pending: pinned "Your quote" + others + edit. */
export const W5WorkerQuotePending: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          quotes: [myPendingQuote, competitorA, competitorB],
        }),
      },
      SIDEBAR,
    ),
  ],
}

/** W6 · worker, quote accepted: success + agreed price + job link. */
export const W6WorkerAccepted: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          status: TaskStatus.Awarded,
          quotes: [{ ...myPendingQuote, status: QuoteStatus.Accepted }],
        }),
      },
      SIDEBAR,
    ),
  ],
}

/** W7 · worker, quote declined: declined card + browse other tasks. */
export const W7WorkerDeclined: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          quotes: [{ ...myPendingQuote, status: QuoteStatus.Declined }],
        }),
      },
      SIDEBAR,
    ),
  ],
}

/** W8 · worker, cap full: no send CTA + accepted worker avatars. */
export const W8WorkerTaskFull: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          quotes: [{ ...competitorA, status: QuoteStatus.Accepted }],
        }),
      },
      SIDEBAR,
    ),
  ],
}
