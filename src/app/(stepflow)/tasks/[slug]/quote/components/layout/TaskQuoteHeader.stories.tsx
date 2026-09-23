import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteHeader } from './TaskQuoteHeader'

const meta: Meta<typeof TaskQuoteHeader> = {
  title: 'stepflow/tasks/quote/layout/TaskQuoteHeader',
  component: TaskQuoteHeader,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    exitHref: '/tasks/example',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
