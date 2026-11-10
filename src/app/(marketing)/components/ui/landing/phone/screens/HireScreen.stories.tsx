import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HireScreen } from './HireScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone

/**
 * Story-only: taps "Accept quote", unless the screen's autoplay beat (about
 * 2.6 s after it starts) already did, then waits for the confirmation.
 */
async function acceptQuote(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  if (!canvas.queryByText(copy.hire.acceptedBody)) {
    const accept = await canvas.findByRole('button', {
      name: copy.hire.accept,
    })
    await userEvent.click(accept)
    // A mouse tap leaves no focus ring; the synthetic click would.
    accept.blur()
  }
  await expect(
    await canvas.findByText(copy.hire.acceptedBody),
  ).toBeInTheDocument()
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

/** Resting (not active): the quote sheet is slid away until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: the quote sheet rises over the map and "Accept quote" pulses. */
export const Playing: Story = {}

/** Accepted: the sheet shows the booking confirmation and a done button, which is then named "Quote accepted", what it reads. */
export const Accepted: Story = {
  play: async ({ canvasElement }) => {
    await acceptQuote(canvasElement)
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: copy.hire.acceptedTitle }),
    ).toBeInTheDocument()
    await expect(
      canvas.queryByRole('button', { name: copy.hire.accept }),
    ).toBeNull()
  },
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the quote sheet (who,
 * the price, when, how to pay) with "Accept quote" pulsing above the crop.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [copy.hire.price, copy.hire.when]),
}

/** Cropped phone, accepted: the button reads "Quote accepted" and the booking line under it is whole. */
export const CompactAccepted: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await acceptQuote(canvasElement)
    await expectFitsTheCrop(canvasElement, [
      copy.hire.acceptedTitle,
      copy.hire.acceptedBody,
    ])
  },
}
