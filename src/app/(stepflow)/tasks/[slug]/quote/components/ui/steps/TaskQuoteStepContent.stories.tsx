import { Currency, TaskBudgetType, TaskPaymentMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  expectGaps,
  expectLineUnder,
  fieldByLabel,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import {
  storyImage,
  takeStoryPhoto,
} from '@/app/(stepflow)/stepflowStoryHelpers'
import { formSpace } from '@/theme/styles'
import { controlOf, expectField } from '@/ui/Modal/taskDialogSpacing.testing'

import {
  QUOTE_STORY_MESSAGE,
  QUOTE_ZH_HK,
  quoteStorySlots,
  quoteStoryTask,
  withQuoteStory,
  withQuoteZhHk,
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

/** quote.message: empty, with the 0 / 250 counter and the note that the quote will be public. */
export const Message: Story = {
  args: { activeSubStep: 'quote.message' },
  decorators: step(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The step heading carries the description; the field doesn't repeat it.
    await expect(
      canvas.queryByText("Say how you'd do the job and what's included."),
    ).toBeNull()
    const note = canvas.getByText(
      "Your message, price and times will be public. Don't include your name or contact details.",
    )
    await expect(note).toBeVisible()
    // Read out with the field, so it is heard before typing.
    const field = canvas.getByRole('textbox', { name: 'Message to customer' })
    const noteId = note.parentElement?.id ?? ''
    await expect(noteId).not.toBe('')
    await expect(field.getAttribute('aria-describedby')).toContain(noteId)
  },
}

/** quote.message in zh-HK: the helper and the public note. */
export const MessageZhHk: Story = {
  args: { activeSubStep: 'quote.message' },
  parameters: QUOTE_ZH_HK,
  decorators: [...step(), withQuoteZhHk],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(
        '你的留言、價錢和時間會公開。請不要加入你的名字或聯絡資料。',
      ),
    ).toBeVisible()
    await expect(
      canvas.queryByText('說明你會點樣完成工作，以及報價包括甚麼。'),
    ).toBeNull()
  },
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

/** quote.photos: optional, nothing added yet; with a mouse, one add tile that opens the file picker. */
export const PhotosEmpty: Story = {
  args: { activeSubStep: 'quote.photos' },
  decorators: step(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Add photo' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Take photo' }),
    ).toBeNull()
  },
}

/** quote.photos on a phone or tablet: Add photo offers our camera or the library; a shot is added. */
export const PhotosTouchScreen: Story = {
  args: { activeSubStep: 'quote.photos' },
  decorators: step(),
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Add photo' }))
    await takeStoryPhoto(
      await body.findByRole('dialog', { name: 'Add a photo' }),
    )
    // The camera and the drawer under it have closed.
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    await expect(
      await canvas.findByRole('button', { name: 'Remove photo 1' }),
    ).toBeVisible()
  },
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

/** review.check: the read-back, who will see the quote, and the terms line. */
export const Review: Story = {
  args: { activeSubStep: 'review.check', photoUrls: photos(2) },
  decorators: step({}, form),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Once you send it, anyone can see your price, times and message. Only the customer sees your name and profile.',
      ),
    ).toBeVisible()
  },
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

/**
 * Form spacing (FE-481): the price field has its label 8 above it and its helper
 * 4 under it; with the task summary above, the summary and the field are 20
 * apart.
 */
export const SpacingPrice: Story = {
  args: { poundsInput: '85', showTaskSummary: true },
  decorators: step(),
  play: async ({ canvasElement }) => {
    const field = fieldByLabel(canvasElement, 'Your quote')
    await expectField(field)
    await expectLineUnder(controlOf(field), field, /Customer budget/)
    await expectGaps(
      [...(field.parentElement as HTMLElement).children],
      formSpace.fieldGap,
    )
  },
}

/** The message field and the note that it is public are field groups, 20 apart. */
export const SpacingMessage: Story = {
  args: { activeSubStep: 'quote.message' },
  decorators: step({}, { message: form.message }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = fieldByLabel(canvasElement, 'Message to customer')
    const note = canvas.getByText(
      /Your message, price and times will be public/,
    ).parentElement as HTMLElement
    await expectField(field, null)
    await expectGaps([field, note], formSpace.fieldGap)
  },
}

/** The step's error is a field group: 20 under the time cards. */
export const SpacingAvailability: Story = {
  args: {
    activeSubStep: 'quote.availability',
    fieldError:
      'Add at least one time with a day and a start time in the future.',
  },
  decorators: step(),
  play: async ({ canvasElement }) => {
    const error = within(canvasElement).getByText(
      /Add at least one time with a day/,
    )
    const column = error.parentElement as HTMLElement
    await expect(column.children).toHaveLength(2)
    await expectGaps([...column.children], formSpace.fieldGap)
  },
}

/** The review step: the summary, the read-back, the notice, the error and the terms are 20 apart. */
export const SpacingReview: Story = {
  args: {
    activeSubStep: 'review.check',
    showTaskSummary: true,
    quoteError: 'We could not send your quote. Try again.',
  },
  decorators: step(
    {},
    { amountPence: form.amountPence, message: form.message, slots: form.slots },
  ),
  play: async ({ canvasElement }) => {
    const terms = within(canvasElement).getByText(/By sending, you agree to/)
    const column = terms.parentElement as HTMLElement
    await expect(column.children).toHaveLength(5)
    await expectGaps([...column.children], formSpace.fieldGap)
  },
}
