import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { QuotesCards } from './QuotesCards'

const meta: Meta<typeof QuotesCards> = {
  title: 'task/tasks/quotes/QuotesCards',
  component: QuotesCards,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
