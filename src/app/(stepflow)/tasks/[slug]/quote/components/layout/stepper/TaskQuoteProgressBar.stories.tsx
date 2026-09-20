import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteProgressBar } from './TaskQuoteProgressBar'

const meta: Meta<typeof TaskQuoteProgressBar> = {
  title: 'stepflow/tasks/quote/layout/stepper/TaskQuoteProgressBar',
  component: TaskQuoteProgressBar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
