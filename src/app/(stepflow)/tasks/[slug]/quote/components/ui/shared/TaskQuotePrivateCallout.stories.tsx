import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuotePrivateCallout } from './TaskQuotePrivateCallout'

const meta: Meta<typeof TaskQuotePrivateCallout> = {
  title: 'Quote flow/TaskQuotePrivateCallout',
  component: TaskQuotePrivateCallout,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
