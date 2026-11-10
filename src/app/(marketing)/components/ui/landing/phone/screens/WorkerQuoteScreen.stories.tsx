import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { WorkerQuoteScreen } from './WorkerQuoteScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone

/**
 * Story-only: taps "Send quote", unless the screen's autoplay beat (about
 * 2.6 s after it starts) already did, then waits for the finished screen.
 */
async function sendQuote(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  if (!canvas.queryByText(copy.worker.sentBody)) {
    const submit = await canvas.findByRole('button', {
      name: copy.worker.submit,
    })
    await userEvent.click(submit)
    // A mouse tap leaves no focus ring; the synthetic click would.
    submit.blur()
  }
  await expect(
    await canvas.findByText(copy.worker.sentBody),
  ).toBeInTheDocument()
  // The message keeps typing meanwhile: wait for the whole sentence.
  await waitFor(
    () => expect(canvas.getByText(copy.worker.message)).toBeInTheDocument(),
    { timeout: 4000 },
  )
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

/** Resting (not active): the task, price and message cards are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: the message types itself, then autoplay taps "Send quote". */
export const Playing: Story = {}

/**
 * Quote sent: message typed, toast and button confirm the quote (the button is
 * then named "Quote sent", what it reads). The message is public, so it names
 * no one.
 */
export const QuoteSent: Story = {
  play: async ({ canvasElement }) => {
    await sendQuote(canvasElement)
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: copy.worker.sentTitle }),
    ).toBeInTheDocument()
    await expect(
      canvas.queryByRole('button', { name: copy.worker.submit }),
    ).toBeNull()
    await expect(copy.worker.message).not.toMatch(/Priya/)
  },
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the task, the price
 * and the message typing itself, with "Send quote" pulsing above the crop.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [
      copy.worker.priceLabel,
      copy.worker.price,
    ]),
}

/** Cropped phone, quote sent: the toast lies over the bar, and the price, the message and the button are whole. */
export const CompactQuoteSent: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await sendQuote(canvasElement)
    await expectFitsTheCrop(canvasElement, [
      copy.worker.sentTitle,
      copy.worker.sentBody,
      copy.worker.price,
      copy.worker.message,
    ])
  },
}
