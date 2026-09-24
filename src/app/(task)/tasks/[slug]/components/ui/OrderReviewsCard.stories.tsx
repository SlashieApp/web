import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@ui'

import { OrderReviewsCard } from './OrderReviewsCard'

const copy = {
  heading: 'Reviews',
  yours: 'Your review',
  theirs: 'Their review',
  edit: 'Edit review',
  locked: 'Editing closed after 48 hours.',
  waiting:
    'You’ll see their review when you have both submitted, or 14 days after the job was completed.',
  empty:
    'Review this completed job when you’re ready. The receipt is available after you submit.',
}

const meta = {
  title: 'task/tasks/ui/OrderReviewsCard',
  component: OrderReviewsCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    copy,
    viewerReview: null,
    counterpartyReview: null,
    viewerHasSubmitted: false,
  },
} satisfies Meta<typeof OrderReviewsCard>

export default meta
type Story = StoryObj<typeof meta>

export const BeforeSubmit: Story = {}

export const WaitingOnTheOtherParty: Story = {
  args: {
    viewerHasSubmitted: true,
    viewerReview: {
      id: 'rev-1',
      rating: 5,
      comment: 'Clear about the time and left the place tidy.',
      createdAt: new Date().toISOString(),
    },
    counterpartyReview: null,
  },
}

export const BothVisible: Story = {
  args: {
    viewerHasSubmitted: true,
    viewerReview: {
      id: 'rev-1',
      rating: 5,
      comment: 'Clear about the time and left the place tidy.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    counterpartyReview: {
      id: 'rev-2',
      rating: 4,
      comment: 'Straightforward job and fair about the price.',
      createdAt: new Date().toISOString(),
    },
    report: (
      <Button type="button" variant="ghost" size="sm">
        Report this review
      </Button>
    ),
  },
}
