import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { QuoteLimitPaywall } from './QuoteLimitPaywall'

const meta: Meta<typeof QuoteLimitPaywall> = {
  title: 'task/tasks/quotes/QuoteLimitPaywall',
  component: QuoteLimitPaywall,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
