import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskReviewStep } from './TaskReviewStep'

const meta = {
  title: 'task/tasks/review/TaskReviewStep',
  component: TaskReviewStep,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    step: 'stars',
    stars: 0,
    comment: '',
    onStarsChange: () => {},
    onCommentChange: () => {},
  },
} satisfies Meta<typeof TaskReviewStep>

export default meta
type Story = StoryObj<typeof meta>

export const Stars: Story = {}

export const Comment: Story = {
  args: {
    step: 'comment',
    stars: 5,
    comment: 'Clear about the time.',
  },
}

export const Submit: Story = {
  args: {
    step: 'submit',
    stars: 5,
    comment: 'Clear about the time and left the place tidy.',
  },
}
