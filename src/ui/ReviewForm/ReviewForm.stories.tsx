import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '../Button/Button'
import { ReviewForm } from './ReviewForm'

const meta = {
  title: 'ui/ReviewForm',
  component: ReviewForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: async () => true,
  },
} satisfies Meta<typeof ReviewForm>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {}

export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultRating: 5,
    defaultComment: 'Careful with the hallway paint, and on time.',
  },
}

export const Locked: Story = {
  args: {
    mode: 'locked',
    defaultRating: 4,
    defaultComment: 'Finished the assembly and left the room tidy.',
  },
}

export const WithReport: Story = {
  args: {
    mode: 'locked',
    defaultRating: 2,
    defaultComment: 'Did not match what we agreed.',
    report: (
      <Button type="button" variant="ghost" size="sm">
        Report this review
      </Button>
    ),
  },
}
