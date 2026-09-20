import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteFlow } from './TaskQuoteFlow'

const meta: Meta<typeof TaskQuoteFlow> = {
  title: 'stepflow/tasks/quote/TaskQuoteFlow',
  component: TaskQuoteFlow,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
