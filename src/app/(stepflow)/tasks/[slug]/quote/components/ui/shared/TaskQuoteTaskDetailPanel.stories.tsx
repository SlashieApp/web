import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteTaskDetailPanel } from './TaskQuoteTaskDetailPanel'

const meta: Meta<typeof TaskQuoteTaskDetailPanel> = {
  title: 'Quote flow/TaskQuoteTaskDetailPanel',
  component: TaskQuoteTaskDetailPanel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
