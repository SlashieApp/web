import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteReviewStep } from './TaskQuoteReviewStep'

const meta: Meta<typeof TaskQuoteReviewStep> = {
  title: 'stepflow/tasks/quote/ui/steps/TaskQuoteReviewStep',
  component: TaskQuoteReviewStep,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
