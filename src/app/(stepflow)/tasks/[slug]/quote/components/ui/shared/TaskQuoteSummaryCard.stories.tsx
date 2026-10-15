import {
  Currency,
  TaskBudgetType,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { quoteStoryTask, withQuoteStory } from '../../taskQuoteStoryFixtures'
import { TaskQuoteSummaryCard } from './TaskQuoteSummaryCard'

const meta: Meta<typeof TaskQuoteSummaryCard> = {
  title: 'Quote flow/TaskQuoteSummaryCard',
  component: TaskQuoteSummaryCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const card = (task: Parameters<typeof quoteStoryTask>[0] = {}) => [
  withQuoteStory({ task: quoteStoryTask(task) }, { maxWidth: '520px' }),
]

/** Photo, town, the day it is wanted and a fixed price. */
export const Default: Story = { decorators: card() }

/** No photo on the task: a soft green block stands in for the thumbnail. */
export const NoPhoto: Story = { decorators: card({ images: [] }) }

/** No location on the task: the town line is left out. */
export const NoLocation: Story = { decorators: card({ location: undefined }) }

/** Flexible timing: no day, so it reads "Flexible". */
export const FlexibleTiming: Story = {
  decorators: card({
    datetime: { type: TaskDateTimeType.Flexible, date: null, time: null },
  }),
}

/** Paid by the hour: the budget label reads "Per hour". */
export const PerHourBudget: Story = {
  decorators: card({
    budget: {
      amount: 25,
      currency: Currency.Gbp,
      type: TaskBudgetType.PerHour,
      paymentMethod: TaskPaymentMethod.Cash,
    },
  }),
}

/** No budget on the task: the budget label is left out. */
export const NoBudget: Story = { decorators: card({ budget: null }) }

/** A long title is clamped to two lines. */
export const LongTitle: Story = {
  decorators: card({
    title:
      'Mount a large bookshelf and two floating shelves on the living room wall, then tidy up and remove all the packaging afterwards',
  }),
}
