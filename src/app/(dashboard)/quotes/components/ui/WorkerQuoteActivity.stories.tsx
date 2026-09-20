import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerQuoteActivity } from './WorkerQuoteActivity'

const meta: Meta<typeof WorkerQuoteActivity> = {
  title: 'dashboard/quotes/ui/WorkerQuoteActivity',
  component: WorkerQuoteActivity,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
