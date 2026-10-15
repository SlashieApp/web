import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerReviewsSection } from './WorkerReviewsSection'

/**
 * Reviews card. Review bodies are not public yet, so it only shows the count;
 * the average appears once there are at least three ratings.
 */
const meta = {
  title: 'Worker profile/WorkerReviewsSection',
  component: WorkerReviewsSection,
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="720px">
      <WorkerReviewsSection {...args} />
    </Box>
  ),
} satisfies Meta<typeof WorkerReviewsSection>

export default meta
type Story = StoryObj<typeof meta>

/** No ratings at all: "No reviews yet". */
export const Default: Story = {}

/** One rating: the count, and a note that the average needs three. */
export const SingleReview: Story = {
  args: { summary: { average: 5, count: 1 } },
}

/** Two ratings: still below the three needed to show an average. */
export const BelowThreshold: Story = {
  args: { summary: { average: 5, count: 2 } },
}

/** Four ratings: the public average, "4.8 from 4 reviews". */
export const PublicAverage: Story = {
  args: { summary: { average: 4.8, count: 4 } },
}
