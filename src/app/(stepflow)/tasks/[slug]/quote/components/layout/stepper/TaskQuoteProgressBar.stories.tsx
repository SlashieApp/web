import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteProgressBar } from './TaskQuoteProgressBar'

const meta = {
  title: 'Quote flow/TaskQuoteProgressBar',
  component: TaskQuoteProgressBar,
  parameters: {
    layout: 'padded',
  },
  args: {
    activeSubStep: 'quote.price',
    progressPercent: 20,
  },
} satisfies Meta<typeof TaskQuoteProgressBar>

export default meta
type Story = StoryObj<typeof meta>

/** First sub-step, the price: the bar is at 20%. */
export const Price: Story = {}

/** Second sub-step, the message to the customer: 40%. */
export const Message: Story = {
  args: { activeSubStep: 'quote.message', progressPercent: 40 },
}

/** Third sub-step, proposed times: 60%. */
export const Availability: Story = {
  args: { activeSubStep: 'quote.availability', progressPercent: 60 },
}

/** Fourth sub-step, optional photos: 80%. */
export const Photos: Story = {
  args: { activeSubStep: 'quote.photos', progressPercent: 80 },
}

/** Last sub-step, review and send: the caption moves to step 2 and the bar is full. */
export const Review: Story = {
  args: { activeSubStep: 'review.check', progressPercent: 100 },
}
