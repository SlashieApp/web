import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { PostScreen } from './PostScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone
const f = copy.post.flow

/** Story-only: the flow's step on screen (`details`, `timing`, `budget`, `review`). */
function step(canvasElement: HTMLElement): string | undefined {
  return canvasElement.querySelector<HTMLElement>('[data-flow-step]')?.dataset
    .flowStep
}

/** Story-only: the task page the flow lands on, once it shows. */
function posted(canvasElement: HTMLElement): HTMLElement | null {
  return canvasElement.querySelector<HTMLElement>('[data-posted]')
}

/**
 * Story-only: taps Continue on Details, unless the screen's autoplay beat
 * (about 2.6 s after it starts) already did, then waits for the flow to run
 * through to the posted task's page.
 */
async function postTask(canvasElement: HTMLElement) {
  if (!posted(canvasElement) && step(canvasElement) === 'details') {
    const next = within(canvasElement).queryByRole('button', {
      name: f.continue,
    })
    if (next) {
      await userEvent.click(next)
      // A mouse tap leaves no focus ring; the synthetic click would.
      next.blur()
    }
  }
  await waitFor(() => expect(posted(canvasElement)).not.toBeNull(), {
    timeout: 8000,
  })
}

const meta = {
  title: 'Marketing/Landing/PostScreen',
  component: PostScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { copy: { control: false } },
  args: { copy, active: true, intro: true },
  // The landing's phone: the pinned one, or the cropped one with `compact`.
  decorators: [withDemoPhone],
} satisfies Meta<typeof PostScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the Details step, its title not typed yet. */
export const Resting: Story = {
  args: { active: false },
}

/**
 * Playing: the app's Post a task flow on its Details step: the close bar, the
 * progress track with "Step 3 of 7 · Details", the question, the title being
 * typed, a category, and Continue pulsing.
 */
export const Playing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(f.header)).toBeInTheDocument()
    await expect(
      canvas.getByText(`Step 3 of 7 · ${f.steps.details.label}`),
    ).toBeInTheDocument()
    await expect(canvas.getByText(f.steps.details.title)).toBeInTheDocument()
    await expect(canvas.getByText(f.titleLabel)).toBeInTheDocument()
    await expect(canvas.getByText(f.category)).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: f.continue }),
    ).toBeInTheDocument()
  },
}

/**
 * Posted: Continue taps through Timing and Budget to Check and post, Post
 * task is pressed, and the screen lands on the new task's page: Open, "Your
 * task is live", its budget, time and place, with Preview pinned.
 */
export const Posted: Story = {
  play: async ({ canvasElement }) => {
    await postTask(canvasElement)
    const page = posted(canvasElement) as HTMLElement
    await expect(page).toHaveTextContent(f.open)
    await expect(page).toHaveTextContent(f.liveHeadline)
    await expect(page).toHaveTextContent(copy.post.budgetValue)
    await expect(page).toHaveTextContent(f.whenValue)
    await expect(page).toHaveTextContent(f.preview)
  },
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the flow and its step
 * in the bar, the question, the title and Continue above the crop.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [
      f.steps.details.title,
      f.titleLabel,
      f.continue,
    ]),
}

/** Cropped phone, posted: Open, the headline and the task's details are whole above the crop. */
export const CompactPosted: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await postTask(canvasElement)
    await expectFitsTheCrop(canvasElement, [
      f.liveHeadline,
      f.detailBudget,
      f.detailWhen,
      f.detailLocation,
    ])
  },
}
