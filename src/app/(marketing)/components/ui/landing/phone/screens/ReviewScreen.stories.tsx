import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { ReviewScreen } from './ReviewScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone

/**
 * Story-only: taps the stars, unless the screen's autoplay beat (about 2.6 s
 * after it starts) already did, then waits for the typed review and thanks.
 */
async function rateWorker(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  // Before the beat the empty field shows its placeholder.
  if (canvas.queryByText(copy.review.placeholder)) {
    const stars = await canvas.findByRole('button', {
      name: copy.review.rate,
    })
    await userEvent.click(stars)
    // A mouse tap leaves no focus ring; the synthetic click would.
    stars.blur()
  }
  await expect(
    await canvas.findByText(copy.review.thanks, {}, { timeout: 5000 }),
  ).toBeInTheDocument()
}

const meta = {
  title: 'Marketing/Landing/ReviewScreen',
  component: ReviewScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { copy: { control: false } },
  args: { copy, active: true, intro: true },
  // The landing's phone: the pinned one, or the cropped one with `compact`.
  decorators: [withDemoPhone],
} satisfies Meta<typeof ReviewScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the review card is hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: the review card enters and the stars pulse until they are tapped. */
export const Playing: Story = {}

/** Reviewed: five stars filled, the review typed out and the thanks line shown. */
export const Reviewed: Story = {
  play: ({ canvasElement }) => rateWorker(canvasElement),
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the review card (the
 * question, the stars, the field, "Post review") with the stars pulsing.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [copy.review.title, copy.review.submit]),
}

/** Cropped phone, reviewed: the typed review and the thanks line under the card are whole. */
export const CompactReviewed: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await rateWorker(canvasElement)
    await waitFor(
      () =>
        expect(
          within(canvasElement).getByText(copy.review.text),
        ).toBeInTheDocument(),
      { timeout: 4000 },
    )
    await expectFitsTheCrop(canvasElement, [
      copy.review.text,
      copy.review.thanks,
    ])
  },
}
