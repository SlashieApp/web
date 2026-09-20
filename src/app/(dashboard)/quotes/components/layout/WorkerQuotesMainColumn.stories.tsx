import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerQuotesMainColumn } from './WorkerQuotesMainColumn'

const meta: Meta<typeof WorkerQuotesMainColumn> = {
  title: 'dashboard/quotes/layout/WorkerQuotesMainColumn',
  component: WorkerQuotesMainColumn,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
