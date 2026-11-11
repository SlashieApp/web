import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { ReviewScreen } from './ReviewScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone
const f = copy.review.flow

/** Story-only: the flow's step on screen (`stars`, `comment`, `submit`). */
function step(canvasElement: HTMLElement): string | undefined {
  return canvasElement.querySelector<HTMLElement>('[data-flow-step]')?.dataset
    .flowStep
}

/** Story-only: the finished job's page with the review on it, once it shows. */
function reviewed(canvasElement: HTMLElement): HTMLElement | null {
  return canvasElement.querySelector<HTMLElement>('[data-reviewed]')
}

/**
 * Story-only: gives five stars, unless the screen's autoplay beat (about
 * 2.6 s after it starts) already did, then waits for the flow to run through
 * to the finished job's page.
 */
async function leaveReview(canvasElement: HTMLElement) {
  if (!reviewed(canvasElement) && step(canvasElement) === 'stars') {
    const stars = within(canvasElement).queryByRole('button', { name: f.rate })
    const given = canvasElement
      .querySelector('[data-stars]')
      ?.getAttribute('data-stars')
    if (stars && given === '0') {
      await userEvent.click(stars)
      // A mouse tap leaves no focus ring; the synthetic click would.
      stars.blur()
    }
  }
  await waitFor(() => expect(reviewed(canvasElement)).not.toBeNull(), {
    timeout: 9000,
  })
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

/** Resting (not active): the Stars step, no stars given. */
export const Resting: Story = {
  args: { active: false },
}

/**
 * Playing: the app's Review flow on Stars: "Step 1 of 3 · Stars", "How did
 * the job go?", five empty stars pulsing, and Continue.
 */
export const Playing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(f.header)).toBeInTheDocument()
    await expect(
      canvas.getByText(`Step 1 of 3 · ${f.steps.stars}`),
    ).toBeInTheDocument()
    await expect(canvas.getByText(f.starsTitle)).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: f.rate }),
    ).toBeInTheDocument()
  },
}

/**
 * Reviewed: five stars, a few words on Comment, Send your review, Submit
 * review is pressed, and the screen lands on the finished job's page with
 * "Your review" on it.
 */
export const Reviewed: Story = {
  play: async ({ canvasElement }) => {
    await leaveReview(canvasElement)
    const page = reviewed(canvasElement) as HTMLElement
    await expect(page).toHaveTextContent(f.completed)
    await expect(page).toHaveTextContent(f.completedHeadline)
    await expect(page).toHaveTextContent(f.yours)
    await expect(page).toHaveTextContent(f.text)
  },
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the flow and its step
 * in the bar, the question, the stars and Continue above the crop.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [f.starsTitle, f.ratingLabel, f.continue]),
}

/** Cropped phone, reviewed: Completed, "Job complete" and "Your review" are whole above the crop. */
export const CompactReviewed: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await leaveReview(canvasElement)
    await expectFitsTheCrop(canvasElement, [f.completedHeadline, f.yours])
  },
}
