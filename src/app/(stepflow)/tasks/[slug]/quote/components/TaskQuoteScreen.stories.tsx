import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteScreen } from './TaskQuoteScreen'

const meta: Meta<typeof TaskQuoteScreen> = {
  title: 'stepflow/tasks/quote/TaskQuoteScreen',
  component: TaskQuoteScreen,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
