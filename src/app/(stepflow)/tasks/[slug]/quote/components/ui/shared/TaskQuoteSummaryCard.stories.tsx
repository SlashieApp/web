import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteSummaryCard } from './TaskQuoteSummaryCard'

const meta: Meta<typeof TaskQuoteSummaryCard> = {
  title: 'stepflow/tasks/quote/ui/shared/TaskQuoteSummaryCard',
  component: TaskQuoteSummaryCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
