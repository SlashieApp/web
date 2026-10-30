import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  barButton,
  bodyColumn,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  gapsBetweenChildren,
  labelOf,
  openDialog,
  phone390,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'

import { Button } from '../Button/Button'
import { STAR_TILE } from '../FeedbackDialog/StarRatingInput'
import { gapBelow, heightOf } from '../FormField/formGap.testing'
import {
  expectField,
  lineOf,
  scrollToEnd,
  starTilesOf,
} from '../Modal/taskDialogSpacing.testing'
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

/**
 * Form spacing (FE-481, wiki Foundations-Form-Spacing), read between visible
 * edges. The dialog has no intro, so the stars are the first field, 24 under the
 * title; the stars, the comment and the disclaimer note sit 20 apart (the note is
 * a form-level block); the last block is 20 above the buttons. The star tiles are
 * 32 (their 44 tap target reaches into the gaps) with the label 8 above and the hint 4 under.
 */
async function expectReviewSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Review this job',
  )
  const column = bodyColumn(body)
  const [stars, comment, disclaimer] = [...column.children] as HTMLElement[]
  const tiles = starTilesOf(stars)

  await expect(description).toBeNull()
  await expect(gapBelow(title, stars)).toBe(formSpace.headerToBody)
  await expect(gapsBetweenChildren(column)).toEqual([
    formSpace.fieldGap,
    formSpace.fieldGap,
  ])
  await expect(gapBelow(labelOf(stars), tiles[0])).toBe(
    formSpace.labelToControl,
  )
  for (const tile of tiles) {
    await expect(heightOf(tile)).toBe(STAR_TILE)
  }
  await expect(gapBelow(tiles[0], lineOf(stars, '1 to 5 stars'))).toBe(
    formSpace.controlToHelper,
  )
  await expectField(comment, null)
  await scrollToEnd(body)
  await expect(
    gapBelow(disclaimer, barButton(dialog, 'Submit review')),
  ).toBeCloseTo(formSpace.bodyToAction, 0)
  expectNoHorizontalOverflow(body)
}

/** Create, desktop: the gaps above. */
export const Spacing: Story = {
  play: ({ canvasElement }) => expectReviewSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const SpacingPhone: Story = {
  ...phone390,
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectReviewSpacing(canvasElement)
  },
}

/** The rating error: the hint 4 under the stars, the error 4 under the hint. */
export const SpacingRatingError: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(canvasElement, 'Review this job')
    const stars = bodyColumn(body).children[0] as HTMLElement
    await userEvent.click(barButton(dialog, 'Submit review'))
    const error = await within(stars).findByText('Choose a star rating.')

    await expect(gapBelow(lineOf(stars, '1 to 5 stars'), error)).toBe(
      formSpace.helperGap,
    )
  },
}

/** A failed save and the report slot are blocks of their own: 20 apart, the last 20 above the buttons. */
export const SpacingSubmitErrorAndReport: Story = {
  args: {
    mode: 'edit',
    defaultRating: 5,
    submitError: 'We couldn’t save your review. Try again shortly.',
    report: (
      <Button type="button" variant="ghost" size="sm">
        Report this review
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(canvasElement, 'Edit your review')
    const column = bodyColumn(body)
    const [, , disclaimer, error, report] = [
      ...column.children,
    ] as HTMLElement[]

    await expect(gapBelow(disclaimer, error)).toBe(formSpace.fieldGap)
    await expect(gapBelow(error, report)).toBe(formSpace.fieldGap)
    await scrollToEnd(body)
    await expect(
      gapBelow(report, barButton(dialog, 'Save changes')),
    ).toBeCloseTo(formSpace.bodyToAction, 0)
  },
}

/** Locked: the read-only note sits 20 under the comment, the disclaimer 20 under it, and there is no bar. */
export const SpacingLocked: Story = {
  args: { mode: 'locked', defaultRating: 4, defaultComment: 'Tidy work.' },
  play: async ({ canvasElement }) => {
    const { body, title, footer } = await openDialog(
      canvasElement,
      'Your review',
    )
    const column = bodyColumn(body)
    const [stars, comment, note, disclaimer] = [
      ...column.children,
    ] as HTMLElement[]

    await expect(footer).toBeNull()
    await expect(gapBelow(title, stars)).toBe(formSpace.headerToBody)
    await expect(gapsBetweenChildren(column)).toEqual(
      Array(3).fill(formSpace.fieldGap),
    )
    await expect(note).toHaveTextContent(/edited for 48 hours/)
    await expect(disclaimer).toHaveTextContent(/Reviews are opinions/)
    await expect(comment).toBeInTheDocument()
  },
}
