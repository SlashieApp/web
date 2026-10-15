import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteStepper } from './TaskQuoteStepper'

const meta = {
  title: 'Quote flow/TaskQuoteStepper',
  component: TaskQuoteStepper,
  parameters: {
    layout: 'padded',
  },
  args: {
    activeSubStep: 'quote.price',
    completedSubSteps: new Set<string>(),
    onSelectSubStep: () => {},
  },
} satisfies Meta<typeof TaskQuoteStepper>

export default meta
type Story = StoryObj<typeof meta>

/** First step: nothing complete, every later required step is locked. */
export const Price: Story = {}

/** Message: the price is done, so it can be revisited. */
export const Message: Story = {
  args: {
    activeSubStep: 'quote.message',
    completedSubSteps: new Set(['quote.price']),
  },
}

/** Times: price and message are done. */
export const Availability: Story = {
  args: {
    activeSubStep: 'quote.availability',
    completedSubSteps: new Set(['quote.price', 'quote.message']),
  },
}

/** Photos is optional, so Review after it is already reachable. */
export const Photos: Story = {
  args: {
    activeSubStep: 'quote.photos',
    completedSubSteps: new Set([
      'quote.price',
      'quote.message',
      'quote.availability',
    ]),
  },
}

/** Last step: every required step before it is complete. */
export const Review: Story = {
  args: {
    activeSubStep: 'review.check',
    completedSubSteps: new Set([
      'quote.price',
      'quote.message',
      'quote.availability',
      'quote.photos',
    ]),
  },
}
