import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerReviewsSection } from './WorkerReviewsSection'

const meta: Meta<typeof WorkerReviewsSection> = {
  title: 'worker/workers/ui/sections/WorkerReviewsSection',
  component: WorkerReviewsSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const BelowThreshold: Story = {
  args: {
    summary: { average: 5, count: 2 },
  },
}

export const PublicAverage: Story = {
  args: {
    summary: { average: 4.8, count: 4 },
  },
}
