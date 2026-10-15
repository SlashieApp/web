import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '../Button/Button'
import { ReviewForm, type ReviewFormProps } from './ReviewForm'

const meta = {
  title: 'UI/ReviewForm',
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

/** The open dialog. It renders in a portal on `document.body`, not the canvas. */
async function findDialog(canvasElement: HTMLElement, name: string) {
  return within(
    await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name,
    }),
  )
}

/** A trigger button next to a form that opens and closes itself. */
function TriggeredReview({
  startOpen,
  ...args
}: ReviewFormProps & { startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <Stack gap={4} align="flex-start">
      <Button type="button" onClick={() => setOpen(true)}>
        Leave a review
      </Button>
      <ReviewForm {...args} open={open} onOpenChange={setOpen} />
    </Stack>
  )
}

/** Create: empty form for a first review (no stars chosen, empty comment). */
export const Create: Story = {}

/** Closed: only the trigger button is on screen, the dialog is not mounted. */
export const Closed: Story = {
  render: (args) => <TriggeredReview {...args} startOpen={false} />,
}

/** Opening: clicking the trigger button opens the review form. */
export const OpensFromTrigger: Story = {
  render: (args) => <TriggeredReview {...args} startOpen={false} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Leave a review' }),
    )
    const dialog = await findDialog(canvasElement, 'Review this job')
    await waitFor(
      () =>
        expect(
          dialog.getByRole('radio', { name: '5 out of 5 stars' }),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    )
  },
}

/** Edit: an existing review within its edit window, prefilled and saveable. */
export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultRating: 5,
    defaultComment: 'Careful with the hallway paint, and on time.',
  },
}

/** Locked: the edit window has passed, so stars and comment are read-only. */
export const Locked: Story = {
  args: {
    mode: 'locked',
    defaultRating: 4,
    defaultComment: 'Finished the assembly and left the room tidy.',
  },
}

/** Locked with a report control: the review can still be reported. */
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

/** Long comment: a comment close to the 500 character limit fills the text area. */
export const LongComment: Story = {
  args: {
    mode: 'edit',
    defaultRating: 4,
    defaultComment:
      'Arrived on time with all the right tools and explained every step before starting. The wardrobe, the shelves and the desk were all assembled within the afternoon, and the old packaging was flattened and taken away without being asked. He spotted that one shelf bracket was missing from the box, fetched a spare from his van and fitted it, so nothing had to be reordered. The room was left tidier than we found it. Friendly, careful and fairly priced. We would happily book him again.',
  },
}

/** Validation: sending without choosing a star rating shows the rating error. */
export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement, 'Review this job')
    await userEvent.click(dialog.getByRole('button', { name: 'Submit review' }))
    await waitFor(
      () => expect(dialog.getByText('Choose a star rating.')).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Submitting: the submit button shows its spinner and is disabled. */
export const Submitting: Story = {
  args: { submitting: true, defaultRating: 5 },
}

/** Error: the host reports a failed save and the message appears above the buttons. */
export const SubmitError: Story = {
  args: {
    defaultRating: 5,
    defaultComment: 'Careful with the hallway paint, and on time.',
    submitError: 'We couldn’t save your review. Try again shortly.',
  },
}

/** Success: a star rating is chosen, the review is sent and the form closes itself. */
export const SubmitClosesForm: Story = {
  args: { onSubmit: fn(async () => true as const) },
  render: (args) => <TriggeredReview {...args} startOpen />,
  play: async ({ args, canvasElement }) => {
    const dialog = await findDialog(canvasElement, 'Review this job')
    await userEvent.click(
      dialog.getByRole('radio', { name: '5 out of 5 stars' }),
    )
    await userEvent.click(dialog.getByRole('button', { name: 'Submit review' }))
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    })
    await expect(args.onSubmit).toHaveBeenCalledWith({
      rating: 5,
      comment: '',
    })
    await waitFor(
      () =>
        expect(
          within(canvasElement.ownerDocument.body).queryByRole('dialog'),
        ).toBeNull(),
      { timeout: 3000 },
    )
  },
}

/** Phone: the dialog fills the narrow viewport width. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
