import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HireScreen } from './HireScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone
const best = copy.quotes.items[0]

/** Story-only: the booked page, once it shows. */
function booked(canvasElement: HTMLElement): HTMLElement | null {
  return canvasElement.querySelector<HTMLElement>('[data-booked]')
}

/**
 * Story-only: taps Accept on the best quote, unless the screen's autoplay
 * beat (about 2.6 s after it starts) already did, then waits for the accept
 * sheet to be confirmed and the booking to land.
 */
async function acceptQuote(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  if (!booked(canvasElement)) {
    const accept = canvas.queryByRole('button', { name: copy.quotes.accept })
    const sheet = canvasElement.querySelector('[data-accept-sheet]')
    if (accept && sheet?.getAttribute('aria-hidden') === 'true') {
      await userEvent.click(accept)
      // A mouse tap leaves no focus ring; the synthetic click would.
      accept.blur()
    }
  }
  await waitFor(() => expect(booked(canvasElement)).not.toBeNull(), {
    timeout: 6000,
  })
}

const meta = {
  title: 'Marketing/Landing/HireScreen',
  component: HireScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { copy: { control: false } },
  args: { copy, active: true, intro: true },
  // The landing's phone: the pinned one, or the cropped one with `compact`.
  decorators: [withDemoPhone],
} satisfies Meta<typeof HireScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the quotes are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/**
 * Playing: the task page's quotes with Accept on the best one pulsing. The
 * accept sheet waits below the screen.
 */
export const Playing: Story = {
  play: async ({ canvasElement }) => {
    const sheet = canvasElement.querySelector('[data-accept-sheet]')
    if (!sheet) throw new Error('The accept sheet is missing')
    // The sheet is the app's: its title, what accepting means, the times.
    await expect(sheet).toHaveTextContent(copy.hire.acceptTitle)
    await expect(sheet).toHaveTextContent(copy.hire.acceptHint)
    await expect(sheet).toHaveTextContent(copy.hire.slot)
    await expect(sheet).toHaveTextContent(copy.hire.acceptCta)
  },
}

/**
 * Accepted: Accept opens the sheet, Accept quote is pressed and the page
 * shows the booking: Awarded, "Worker booked", their worker with Message, the
 * time and the agreed total.
 */
export const Accepted: Story = {
  play: async ({ canvasElement }) => {
    await acceptQuote(canvasElement)
    const page = booked(canvasElement) as HTMLElement
    await expect(page).toHaveTextContent(copy.hire.awarded)
    await expect(page).toHaveTextContent(copy.hire.bookedHeadline)
    await expect(page).toHaveTextContent(best.name)
    await expect(page).toHaveTextContent(copy.hire.slot)
    await expect(page).toHaveTextContent(copy.hire.price)
    await expect(
      within(canvasElement).getAllByText(copy.hire.message).length,
    ).toBeGreaterThan(0)
  },
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the best quote is
 * whole, with its Accept pulsing above the crop.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [best.name, best.price]),
}

/** Cropped phone, accepted: Awarded, "Worker booked", their worker with Message, the time and the total are whole above the crop. */
export const CompactAccepted: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await acceptQuote(canvasElement)
    await expectFitsTheCrop(canvasElement, [
      copy.hire.bookedHeadline,
      copy.hire.yourWorker,
      copy.hire.message,
      copy.hire.slot,
      copy.hire.agreedTotal,
    ])
  },
}
