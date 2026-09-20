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
