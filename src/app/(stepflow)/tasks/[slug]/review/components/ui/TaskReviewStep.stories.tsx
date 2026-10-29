import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, within } from 'storybook/test'

import {
  expectGaps,
  expectLineUnder,
  fieldByLabel,
  labelIn,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import { REVIEW_COMMENT_MAX } from '@/content/reviews/reviewModel'
import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'
import { controlOf, expectField } from '@/ui/Modal/taskDialogSpacing.testing'

import { TaskReviewStep, type TaskReviewStepProps } from './TaskReviewStep'

/** Keeps the stars and comment in state so the step is live in Storybook. */
function ReviewStepDemo(props: TaskReviewStepProps) {
  const [stars, setStars] = useState(props.stars)
  const [comment, setComment] = useState(props.comment)
  return (
    <TaskReviewStep
      {...props}
      stars={stars}
      comment={comment}
      onStarsChange={setStars}
      onCommentChange={setComment}
    />
  )
}

const meta = {
  title: 'Review flow/TaskReviewStep',
  component: ReviewStepDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    step: 'stars',
    stars: 0,
    comment: '',
    onStarsChange: () => {},
    onCommentChange: () => {},
  },
} satisfies Meta<typeof ReviewStepDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Stars step: no rating chosen yet. */
export const Stars: Story = {}

/** Stars step: three stars chosen. */
export const StarsChosen: Story = { args: { stars: 3 } }

/** Stars step: Continue pressed with no rating. */
export const StarsRequired: Story = {
  args: { starsError: 'Choose a star rating.' },
}

/** Stars step on a review that can no longer be edited: the stars are disabled. */
export const StarsLocked: Story = { args: { stars: 4, locked: true } }

/** Comment step: empty, with the 0 / 500 counter. */
export const CommentEmpty: Story = { args: { step: 'comment', stars: 5 } }

/** Comment step: a short comment written. */
export const Comment: Story = {
  args: {
    step: 'comment',
    stars: 5,
    comment: 'Clear about the time.',
  },
}

/** Comment step: a comment at the 500 character limit. */
export const CommentAtLimit: Story = {
  args: {
    step: 'comment',
    stars: 5,
    comment: 'Tidy work. '.repeat(46).slice(0, REVIEW_COMMENT_MAX),
  },
}

/** Comment step: the comment is over the limit when Continue is pressed. */
export const CommentTooLong: Story = {
  args: {
    step: 'comment',
    stars: 5,
    comment: 'Tidy work. '.repeat(50),
    commentError: 'Comment must be 500 characters or fewer.',
  },
}

/** Comment step on a locked review: the comment is read-only. */
export const CommentLocked: Story = {
  args: {
    step: 'comment',
    stars: 5,
    comment: 'Clear about the time.',
    locked: true,
  },
}

/** Submit step: the stars, the comment and the disclaimer. */
export const Submit: Story = {
  args: {
    step: 'submit',
    stars: 5,
    comment: 'Clear about the time and left the place tidy.',
  },
}

/** Submit step with no comment: the comment label stands in. */
export const SubmitWithoutComment: Story = {
  args: { step: 'submit', stars: 4 },
}

/**
 * Form spacing (FE-481): the label is 8 above the stars, the hint 4 under them
 * and the error 4 under the hint. The stars stay 44 tiles: a rating is not a
 * text field.
 */
export const SpacingStars: Story = {
  args: { starsError: 'Choose a star rating.' },
  play: async ({ canvasElement }) => {
    const field = fieldByLabel(canvasElement, 'Rating')
    const control = labelIn(field).nextElementSibling as HTMLElement
    await expect(gapBelow(labelIn(field), control)).toBe(
      formSpace.labelToControl,
    )
    const hint = within(field).getByText(/1 to 5 stars/)
    await expect(gapBelow(control, hint)).toBe(formSpace.controlToHelper)
    await expect(
      gapBelow(hint, within(field).getByText('Choose a star rating.')),
    ).toBe(formSpace.helperGap)
  },
}

/** The comment: label 8 above the textarea, the character count 4 under it. */
export const SpacingComment: Story = {
  args: { step: 'comment', stars: 5, comment: 'Clear about the time.' },
  play: async ({ canvasElement }) => {
    const field = fieldByLabel(canvasElement, /^Comment/)
    await expectField(field, null)
    await expectLineUnder(controlOf(field), field, `21/${REVIEW_COMMENT_MAX}`)
  },
}

/** The read-back: the stars, the comment and the disclaimer are field groups, 20 apart. */
export const SpacingSubmit: Story = {
  args: {
    step: 'submit',
    stars: 5,
    comment: 'Clear about the time and left the place tidy.',
  },
  play: async ({ canvasElement }) => {
    const comment = within(canvasElement).getByText(/Clear about the time/)
    const column = comment.parentElement as HTMLElement
    await expect(column.children).toHaveLength(3)
    await expectGaps([...column.children], formSpace.fieldGap)
  },
}
