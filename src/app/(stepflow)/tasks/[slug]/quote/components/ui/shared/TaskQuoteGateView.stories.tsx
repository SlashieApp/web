import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteGateView } from './TaskQuoteGateView'

const meta: Meta<typeof TaskQuoteGateView> = {
  title: 'Quote flow/TaskQuoteGateView',
  component: TaskQuoteGateView,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
