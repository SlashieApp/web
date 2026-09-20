import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteTaskDetailPanel } from './TaskQuoteTaskDetailPanel'

const meta: Meta<typeof TaskQuoteTaskDetailPanel> = {
  title: 'stepflow/tasks/quote/ui/shared/TaskQuoteTaskDetailPanel',
  component: TaskQuoteTaskDetailPanel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
