import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteStepContent } from './TaskQuoteStepContent'

const meta: Meta<typeof TaskQuoteStepContent> = {
  title: 'Quote flow/TaskQuoteStepContent',
  component: TaskQuoteStepContent,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
