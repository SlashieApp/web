import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@ui'

import bag from '../i11n.json'
import { TaskQuoteScreen } from './TaskQuoteScreen'
import {
  QUOTE_STORY_MESSAGE,
  QUOTE_ZH_HK,
  STORY_BACK_TO_TASK,
  advanceQuoteTo,
  quoteStorySlots,
  withQuoteStory,
  withQuoteZhHk,
} from './taskQuoteStoryFixtures'

const meta = {
  title: 'Quote flow/TaskQuoteScreen',
  component: TaskQuoteScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    backToTask: STORY_BACK_TO_TASK,
  },
} satisfies Meta<typeof TaskQuoteScreen>

export default meta
type Story = StoryObj<typeof meta>

/** A worker on an open task, with an empty quote form. */
const emptyForm = [withQuoteStory()]

/** The same worker with a message and two valid times already entered. */
const filledForm = [
  withQuoteStory(
    {},
    { form: { message: QUOTE_STORY_MESSAGE, slots: quoteStorySlots() } },
  ),
]

/** Step 1, the price: empty, with the task beside it on desktop. */
export const Default: Story = { decorators: emptyForm }

/** Continue pressed with no price: the field shows its error. */
export const PriceRequired: Story = {
  decorators: emptyForm,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /^continue/i }),
    )
    await expect(
      await canvas.findByText('Enter a valid total price.'),
    ).toBeVisible()
  },
}

/** Step 2, the message to the customer, with the note that it will be public. */
export const MessageStep: Story = {
  decorators: emptyForm,
  play: async ({ canvasElement }) => {
    await advanceQuoteTo(canvasElement, 'quote.message')
    await expect(
      within(canvasElement).getByText(
        "Your message, price and times will be public. Don't include your name or contact details.",
      ),
    ).toBeVisible()
  },
}

/** Step 3, proposed times: one empty slot to fill in. */
export const AvailabilityStep: Story = {
  decorators: emptyForm,
  play: ({ canvasElement }) =>
    advanceQuoteTo(canvasElement, 'quote.availability'),
}

/** Continue pressed with no valid time: the step shows its error. */
export const AvailabilityRequired: Story = {
  decorators: emptyForm,
  play: async ({ canvasElement }) => {
    await advanceQuoteTo(canvasElement, 'quote.availability')
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /^continue/i }),
    )
    await expect(
      await canvas.findByText(/add at least one time/i),
    ).toBeVisible()
  },
}

/** Step 4, optional photos. */
export const PhotosStep: Story = {
  decorators: filledForm,
  play: ({ canvasElement }) => advanceQuoteTo(canvasElement, 'quote.photos'),
}

/** Step 5, review: the read-back with "Send quote" as the final action. */
export const ReviewStep: Story = {
  decorators: filledForm,
  play: ({ canvasElement }) => advanceQuoteTo(canvasElement, 'review.check'),
}

/** Send quote pressed: the final button shows its loading state. */
export const Submitting: Story = {
  decorators: filledForm,
  play: async ({ canvasElement }) => {
    await advanceQuoteTo(canvasElement, 'review.check')
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /^send quote/i }),
    )
    // A loading Chakra button hides its label and sets data-loading.
    await waitFor(
      () =>
        expect(
          canvasElement.querySelector('button[data-loading]'),
        ).not.toBeNull(),
      { timeout: 3000 },
    )
  },
}

/** Editing a sent quote: price prefilled and a Withdraw control under each step. */
export const EditingExistingQuote: Story = {
  args: {
    initialPounds: '85',
    submitLabel: 'Update quote',
    footer: (
      <Button type="button" variant="ghost" alignSelf="flex-start" px={0}>
        Withdraw quote
      </Button>
    ),
  },
  decorators: filledForm,
}

/** Phones: the task summary on top, a progress strip, then the step. */
export const Mobile: Story = {
  decorators: emptyForm,
  globals: { viewport: { value: 'mobile1' } },
}

/** Phones, review step: the read-back above the sticky Send quote bar. */
export const MobileReviewStep: Story = {
  decorators: filledForm,
  globals: { viewport: { value: 'mobile1' } },
  play: ({ canvasElement }) => advanceQuoteTo(canvasElement, 'review.check'),
}

/** zh-HK, step 1: heading, budget helper, Continue and the price error. */
export const ZhHk: Story = {
  parameters: QUOTE_ZH_HK,
  decorators: [...emptyForm, withQuoteZhHk],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: '你的價錢' }),
    ).toBeVisible()
    await expect(canvas.getByText(/^顧客預算：£\d/)).toBeVisible()
    await expect(canvas.getByRole('button', { name: '繼續' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: '繼續' }))
    await expect(await canvas.findByText('請輸入有效的總價錢。')).toBeVisible()
  },
}

/** zh-HK, review step: the read-back, who will see the quote, terms and 傳送報價. */
export const ReviewStepZhHk: Story = {
  parameters: QUOTE_ZH_HK,
  decorators: [...filledForm, withQuoteZhHk],
  play: async ({ canvasElement }) => {
    await advanceQuoteTo(canvasElement, 'review.check', '85', bag.zh_hk)
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText(
        '送出後，任何人都可以看到你的價錢、時間和留言。只有顧客會看到你的名字和個人檔案。',
      ),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: '服務條款' }),
    ).toHaveAttribute('href', '/zh-hk/terms')
    await expect(canvas.getByRole('button', { name: '返回' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: '傳送報價' })).toBeVisible()
  },
}
