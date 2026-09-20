import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskCardWorkerQuote } from './TaskCardWorkerQuote'

const meta: Meta<typeof TaskCardWorkerQuote> = {
  title: 'task/ui/TaskCardWorkerQuote',
  component: TaskCardWorkerQuote,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
