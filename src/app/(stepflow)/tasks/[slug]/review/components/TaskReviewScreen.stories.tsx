import { OrderStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { TaskReviewScreen } from './TaskReviewScreen'
import {
  rateAndContinue,
  reachSubmitStep,
  storyViewerReview,
  withReviewStory,
} from './taskReviewStoryFixtures'

const meta: Meta<typeof TaskReviewScreen> = {
  title: 'Review flow/TaskReviewScreen',
  component: TaskReviewScreen,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** The customer on a completed job, with no review yet. */
const newReview = [withReviewStory()]

/** Step 1, the star rating of a new review. */
export const NewReview: Story = { decorators: newReview }

/**
 * The task is suspended (BE-108): the API refuses reviews, so the page says
 * why instead of the form, with Back to task.
 */
export const TaskSuspended: Story = {
  decorators: [withReviewStory({ suspended: 'task' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', {
        name: "This task is suspended, so it can't be changed.",
      }),
    ).toBeVisible()
    await expect(canvas.queryByRole('radio')).toBeNull()
  },
}

/** The other person's account is suspended (BE-108): the same, with its reason. */
export const CounterpartySuspended: Story = {
  decorators: [withReviewStory({ suspended: 'counterparty' })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', {
        name: "The other person's account is suspended, so this can't be done right now.",
      }),
    ).toBeVisible()
    await expect(canvas.queryByRole('radio')).toBeNull()
  },
}

/** The worker reviewing the customer: the same flow as the customer's. */
export const AsWorker: Story = {
  decorators: [withReviewStory({ viewer: 'worker' })],
}

/** Continue pressed with no stars: the step shows its error. */
export const StarsRequired: Story = {
  decorators: newReview,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /^continue/i }),
    )
    await expect(await canvas.findByText('Choose a star rating.')).toBeVisible()
  },
}

/** Step 2, the optional comment. */
export const CommentStep: Story = {
  decorators: newReview,
  play: ({ canvasElement }) =>
    rateAndContinue(canvasElement, 5, /add a comment/i),
}

/** Step 3, the read-back before sending, with "Submit review". */
export const SubmitStep: Story = {
  decorators: newReview,
  play: ({ canvasElement }) => reachSubmitStep(canvasElement),
}

/** Step 3 with no comment written: the read-back shows the comment label. */
export const SubmitWithoutComment: Story = {
  decorators: newReview,
  play: ({ canvasElement }) => reachSubmitStep(canvasElement, ''),
}

/** Submit pressed: the final button shows its loading state. */
export const Submitting: Story = {
  decorators: newReview,
  play: async ({ canvasElement }) => {
    await reachSubmitStep(canvasElement)
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /^submit review/i }),
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

/** Submit pressed but saving failed: the error shows above the read-back. */
export const SubmitFailed: Story = {
  decorators: [withReviewStory({ failSubmitWith: 'Network request failed.' })],
  play: async ({ canvasElement }) => {
    await reachSubmitStep(canvasElement)
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: /^submit review/i }),
    )
    await expect(
      await canvas.findByText('Network request failed.'),
    ).toBeVisible()
  },
}

/** Within 48 hours of sending: the review reopens prefilled, as "Save changes". */
export const EditingReview: Story = {
  decorators: [
    withReviewStory({
      orderReview: { viewerReview: storyViewerReview(1) },
    }),
  ],
}

/** Editing a review whose saved comment is over the limit: Continue flags it. */
export const EditingTooLongComment: Story = {
  decorators: [
    withReviewStory({
      orderReview: {
        viewerReview: storyViewerReview(1, {
          comment: 'Tidy work. '.repeat(50),
        }),
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /^continue/i }),
    )
    await canvas.findByRole('heading', { name: /add a comment/i })
    await userEvent.click(canvas.getByRole('button', { name: /^continue/i }))
    await expect(
      await canvas.findByText(/comment must be 500 characters or fewer/i),
    ).toBeVisible()
  },
}

/** Older than 48 hours: the review is read-only and says so. */
export const ReviewLocked: Story = {
  decorators: [
    withReviewStory({
      orderReview: { viewerReview: storyViewerReview(72) },
    }),
  ],
}

/** The job is not completed yet: a short message and a way back. */
export const NotCompleted: Story = {
  decorators: [withReviewStory({ orderStatus: OrderStatus.Active })],
}

/** Signed in but not the customer or worker on this job: not eligible. */
export const NotPartOfJob: Story = {
  decorators: [withReviewStory({ viewer: 'nonWorker' })],
}

/** The review service is unavailable right now: the message says to retry. */
export const Unavailable: Story = {
  decorators: [withReviewStory({ orderReview: { unavailable: true } })],
}

/** Signed out: asked to sign in as the customer or worker on the job. */
export const SignedOut: Story = {
  decorators: [withReviewStory({ viewer: 'visitor' })],
}

/** The task is still loading: a placeholder screen with a loading title. */
export const Loading: Story = {
  decorators: [withReviewStory({ pending: true })],
}

/** Phones: the progress strip replaces the side stepper. */
export const Mobile: Story = {
  decorators: newReview,
  globals: { viewport: { value: 'mobile1' } },
}
