import { Currency, TaskBudgetType, TaskPaymentMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { storyImage } from '@/app/(stepflow)/stepflowStoryHelpers'

import {
  QUOTE_STORY_MESSAGE,
  quoteStorySlots,
  quoteStoryTask,
  withQuoteStory,
} from '../../taskQuoteStoryFixtures'
import { TaskQuoteStepContent } from './TaskQuoteStepContent'

type StepContentProps = Parameters<typeof TaskQuoteStepContent>[0]

/** Keeps the price and photos in state, as the screen does, so the story is live. */
function StepContentDemo(props: StepContentProps) {
  const [pounds, setPounds] = useState(props.poundsInput)
  const [photos, setPhotos] = useState(props.photoUrls)
  return (
    <TaskQuoteStepContent
      {...props}
      poundsInput={pounds}
      onPoundsInputChange={setPounds}
      photoUrls={photos}
      onPhotoFiles={() =>
        setPhotos((prev) => [...prev, storyImage('#c9b3e8', 144)])
      }
      onRemovePhotoAt={(index) =>
        setPhotos((prev) => prev.filter((_, i) => i !== index))
      }
    />
  )
}

const meta = {
  title: 'Quote flow/TaskQuoteStepContent',
  component: StepContentDemo,
  parameters: {
    layout: 'padded',
  },
  args: {
    activeSubStep: 'quote.price',
    poundsInput: '',
    onPoundsInputChange: () => {},
    photoUrls: [],
    onPhotoFiles: () => {},
    onRemovePhotoAt: () => {},
    fieldError: null,
    quoteError: null,
  },
} satisfies Meta<typeof StepContentDemo>

export default meta
type Story = StoryObj<typeof meta>

const form = {
  amountPence: '8500',
  message: QUOTE_STORY_MESSAGE,
  slots: quoteStorySlots(),
}

/** The worker on an open task with a posted budget, and a seeded quote form. */
const step = (
  taskOverrides: Parameters<typeof quoteStoryTask>[0] = {},
  seed: Partial<typeof form> = {},
) => [
  withQuoteStory(
    { task: quoteStoryTask(taskOverrides) },
    { form: seed, maxWidth: '520px' },
  ),
]

const photos = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    storyImage(`hsl(${i * 55}, 60%, 75%)`, 144),
  )

/** quote.price: empty, with the customer's budget in the helper text. */
export const Price: Story = { decorators: step() }

/** quote.price: the task has no budget, so the helper text drops it. */
export const PriceWithoutBudget: Story = {
  decorators: step({ budget: null }),
}

/** quote.price: a different budget (per hour, in dollars) in the helper text. */
export const PricePerHourBudget: Story = {
  decorators: step({
    budget: {
      amount: 30,
      currency: Currency.Usd,
      type: TaskBudgetType.PerHour,
      paymentMethod: TaskPaymentMethod.Cash,
    },
  }),
}

/** quote.price: a price typed in. */
export const PriceEntered: Story = {
  args: { poundsInput: '85' },
  decorators: step(),
}

/** quote.price: Continue pressed with no valid price. */
export const PriceInvalid: Story = {
  args: { fieldError: 'Enter a valid total price.' },
  decorators: step(),
}

/** quote.price: phones show the task summary card above the field. */
export const PriceWithSummary: Story = {
  args: { showTaskSummary: true },
  decorators: step(),
}

/** quote.message: empty, with the 0 / 250 counter. */
export const Message: Story = {
  args: { activeSubStep: 'quote.message' },
  decorators: step(),
}

/** quote.message: a message written. */
export const MessageWritten: Story = {
  args: { activeSubStep: 'quote.message' },
  decorators: step({}, { message: form.message }),
}

/** quote.message: at the 250 character limit, the counter is full. */
export const MessageAtLimit: Story = {
  args: { activeSubStep: 'quote.message' },
  decorators: step({}, { message: 'I can help. '.repeat(21).slice(0, 250) }),
}

/** quote.message: Continue pressed with a message flagged as over the limit. */
export const MessageTooLong: Story = {
  args: {
    activeSubStep: 'quote.message',
    fieldError: 'Message must be 250 characters or fewer.',
  },
  decorators: step({}, { message: form.message }),
}

/** quote.availability: no time yet, so one empty slot is offered. */
export const Availability: Story = {
  args: { activeSubStep: 'quote.availability' },
  decorators: step(),
}

/** quote.availability: two proposed times chosen. */
export const AvailabilityChosen: Story = {
  args: { activeSubStep: 'quote.availability' },
  decorators: step({}, { slots: form.slots }),
}

/** quote.availability: Continue pressed with no valid time. */
export const AvailabilityInvalid: Story = {
  args: {
    activeSubStep: 'quote.availability',
    fieldError:
      'Add at least one time with a day and a start time in the future.',
  },
  decorators: step(),
}

/** quote.photos: optional, nothing added yet. */
export const PhotosEmpty: Story = {
  args: { activeSubStep: 'quote.photos' },
  decorators: step(),
}

/** quote.photos: three photos added, each removable. */
export const PhotosAdded: Story = {
  args: { activeSubStep: 'quote.photos', photoUrls: photos(3) },
  decorators: step(),
}

/** quote.photos: six photos, the limit, so the add button is gone. */
export const PhotosAtLimit: Story = {
  args: { activeSubStep: 'quote.photos', photoUrls: photos(6) },
  decorators: step(),
}

/** review.check: the read-back, the private-quote note and the terms line. */
export const Review: Story = {
  args: { activeSubStep: 'review.check', photoUrls: photos(2) },
  decorators: step({}, form),
}

/** review.check: phones also show the task summary card above the read-back. */
export const ReviewWithSummary: Story = {
  args: { activeSubStep: 'review.check', showTaskSummary: true },
  decorators: step({}, form),
}

/** review.check: sending failed, so the error shows above the terms. */
export const ReviewSendFailed: Story = {
  args: {
    activeSubStep: 'review.check',
    quoteError: 'Could not send your quote. Try again.',
  },
  decorators: step({}, form),
}
