import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { WorkerQuoteScreen } from './WorkerQuoteScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone
const f = copy.worker.flow

/** Story-only: the flow's step on screen (`price`, `times`, `review`). */
function step(canvasElement: HTMLElement): string | undefined {
  return canvasElement.querySelector<HTMLElement>('[data-flow-step]')?.dataset
    .flowStep
}

/** Story-only: the task page with the quote sent, once it shows. */
function sent(canvasElement: HTMLElement): HTMLElement | null {
  return canvasElement.querySelector<HTMLElement>('[data-quote-sent]')
}

/**
 * Story-only: taps Continue on Your price, unless the screen's autoplay beat
 * (about 2.6 s after it starts) already did, then waits for the flow to run
 * through to the task's page.
 */
async function sendQuote(canvasElement: HTMLElement) {
  if (!sent(canvasElement) && step(canvasElement) === 'price') {
    const next = within(canvasElement).queryByRole('button', {
      name: f.continue,
    })
    if (next) {
      await userEvent.click(next)
      // A mouse tap leaves no focus ring; the synthetic click would.
      next.blur()
    }
  }
  await waitFor(() => expect(sent(canvasElement)).not.toBeNull(), {
    timeout: 8000,
  })
}

const meta = {
  title: 'Marketing/Landing/WorkerQuoteScreen',
  component: WorkerQuoteScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { copy: { control: false } },
  args: { copy, active: true, intro: true },
  // The landing's phone: the pinned one, or the cropped one with `compact`.
  decorators: [withDemoPhone],
} satisfies Meta<typeof WorkerQuoteScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the Your price step. */
export const Resting: Story = {
  args: { active: false },
}

/**
 * Playing: the app's Send a quote flow on Your price: the task it is for,
 * "Step 1 of 2 · Your price", the price with the customer's budget under it,
 * and Continue pulsing.
 */
export const Playing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(f.header)).toBeInTheDocument()
    await expect(
      canvas.getByText(`Step 1 of 2 · ${f.steps.price.label}`),
    ).toBeInTheDocument()
    await expect(
      canvas.getByText(copy.tasks.wardrobe.title),
    ).toBeInTheDocument()
    await expect(canvas.getByText(f.priceLabel)).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: f.continue }),
    ).toBeInTheDocument()
  },
}

/**
 * Quote sent: Continue goes on through the time offered to Review your quote,
 * Send quote is pressed, and the screen lands on the task's page: "Quote
 * sent", the quote and its time, with Edit quote pinned.
 */
export const QuoteSent: Story = {
  play: async ({ canvasElement }) => {
    await sendQuote(canvasElement)
    const page = sent(canvasElement) as HTMLElement
    await expect(page).toHaveTextContent(f.sentHeadline)
    await expect(page).toHaveTextContent(f.price)
    await expect(page).toHaveTextContent(f.slot)
    await expect(page).toHaveTextContent(f.editQuote)
  },
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the flow and its step
 * in the bar, the question, the price and Continue above the crop.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [
      f.steps.price.title,
      f.priceLabel,
      f.continue,
    ]),
}

/** Cropped phone, quote sent: "Quote sent", its line, the quote and its time are whole above the crop. */
export const CompactQuoteSent: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await sendQuote(canvasElement)
    await expectFitsTheCrop(canvasElement, [
      f.sentHeadline,
      f.yourQuote,
      f.proposedTimes,
    ])
  },
}
