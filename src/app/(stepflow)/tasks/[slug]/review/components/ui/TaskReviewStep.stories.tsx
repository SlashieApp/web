import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { REVIEW_COMMENT_MAX } from '@/content/reviews/reviewModel'

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
