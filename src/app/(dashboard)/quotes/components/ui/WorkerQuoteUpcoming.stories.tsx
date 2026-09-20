import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerQuoteUpcoming } from './WorkerQuoteUpcoming'

const meta: Meta<typeof WorkerQuoteUpcoming> = {
  title: 'dashboard/quotes/ui/WorkerQuoteUpcoming',
  component: WorkerQuoteUpcoming,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
