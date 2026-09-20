import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerQuoteSummaryBar } from './WorkerQuoteSummaryBar'

const meta: Meta<typeof WorkerQuoteSummaryBar> = {
  title: 'dashboard/quotes/ui/WorkerQuoteSummaryBar',
  component: WorkerQuoteSummaryBar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
