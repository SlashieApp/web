import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerQuoteFilterColumn } from './WorkerQuoteFilterColumn'

const meta: Meta<typeof WorkerQuoteFilterColumn> = {
  title: 'dashboard/quotes/layout/WorkerQuoteFilterColumn',
  component: WorkerQuoteFilterColumn,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
