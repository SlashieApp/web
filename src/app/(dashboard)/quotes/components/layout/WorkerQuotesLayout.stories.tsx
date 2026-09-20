import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerQuotesLayout } from './WorkerQuotesLayout'

const meta: Meta<typeof WorkerQuotesLayout> = {
  title: 'dashboard/quotes/layout/WorkerQuotesLayout',
  component: WorkerQuotesLayout,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
