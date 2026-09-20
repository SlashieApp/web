import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerQuoteQuickStats } from './WorkerQuoteQuickStats'

const meta: Meta<typeof WorkerQuoteQuickStats> = {
  title: 'dashboard/quotes/ui/WorkerQuoteQuickStats',
  component: WorkerQuoteQuickStats,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
