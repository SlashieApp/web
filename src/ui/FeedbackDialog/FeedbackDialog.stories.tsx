import { HStack, Stack } from '@chakra-ui/react'
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
import { formSpace, minHitArea } from '@/theme/styles'

import { Button } from '../Button/Button'
import { gapBelow, heightOf } from '../FormField/formGap.testing'
import {
  controlOf,
  expectField,
  lineOf,
  scrollToEnd,
  starTilesOf,
} from '../Modal/taskDialogSpacing.testing'
import { FeedbackDialog, type FeedbackDialogProps } from './FeedbackDialog'
import { FeedbackDialogProvider } from './FeedbackDialogProvider'
import { FeedbackTrigger } from './FeedbackTrigger'

const meta = {
  title: 'UI/FeedbackDialog',
  component: FeedbackDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: async () => true,
  },
} satisfies Meta<typeof FeedbackDialog>

export default meta
type Story = StoryObj<typeof meta>

/** The open dialog. It renders in a portal on `document.body`, not the canvas. */
async function findDialog(canvasElement: HTMLElement) {
  return within(
    await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: 'Send feedback',
    }),
  )
}

/** Fills the two required text fields with valid values. */
async function fillMessageAndEmail(dialog: ReturnType<typeof within>) {
  await userEvent.type(
    dialog.getByRole('textbox', { name: /your message/i }),
    'The map pins load slowly on my phone.',
  )
  await userEvent.type(
    dialog.getByRole('textbox', { name: /^email/i }),
    'sam@example.com',
  )
}

/** A trigger button next to a dialog that opens and closes itself. */
function TriggeredDialog({
  startOpen,
  ...args
}: FeedbackDialogProps & { startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <Stack gap={4} align="flex-start">
      <Button type="button" onClick={() => setOpen(true)}>
        Send feedback
      </Button>
      <FeedbackDialog {...args} open={open} onOpenChange={setOpen} />
    </Stack>
  )
}

/** Guest: empty form with an editable email, open from a trigger button. */
export const Default: Story = {
  render: (args) => <TriggeredDialog {...args} startOpen />,
}

/** Closed: only the trigger button is on screen, the dialog is not mounted. */
export const Closed: Story = {
  render: (args) => <TriggeredDialog {...args} startOpen={false} />,
}

/** Opening: clicking the trigger button opens the dialog. */
export const OpensFromTrigger: Story = {
  render: (args) => <TriggeredDialog {...args} startOpen={false} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Send feedback' }),
    )
    const dialog = await findDialog(canvasElement)
    await waitFor(() => expect(dialog.getByRole('combobox')).toBeVisible(), {
      timeout: 3000,
    })
  },
}

/** Signed in: name and email prefilled, email read-only with a reply hint. */
export const SignedIn: Story = {
  args: {
    defaultEmail: 'sam@example.com',
    defaultName: 'Sam Carter',
    emailLocked: true,
  },
  render: function Render(args) {
    return <FeedbackDialog {...args} open onOpenChange={() => undefined} />
  },
}

/** Rating category: the rating becomes required, here with four stars chosen. */
export const Rating: Story = {
  render: function Render(args) {
    return <FeedbackDialog {...args} open onOpenChange={() => undefined} />
  },
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement)
    await userEvent.selectOptions(dialog.getByRole('combobox'), 'RATING')
    const fourth = dialog.getByRole('radio', { name: '4 out of 5 stars' })
    await userEvent.click(fourth)
    await expect(fourth).toBeChecked()
  },
}

/** Bug category: chosen from the select, the rating stays optional. */
export const CategoryBug: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement)
    await userEvent.selectOptions(dialog.getByRole('combobox'), 'BUG')
    await expect(dialog.getByRole('combobox')).toHaveValue('BUG')
  },
}

/** Feature request category: chosen from the select, the rating stays optional. */
export const CategoryFeatureRequest: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement)
    await userEvent.selectOptions(
      dialog.getByRole('combobox'),
      'FEATURE_REQUEST',
    )
    await expect(dialog.getByRole('combobox')).toHaveValue('FEATURE_REQUEST')
  },
}

/** Validation: sending with the message and email empty shows both errors. */
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement)
    await userEvent.click(dialog.getByRole('button', { name: 'Send feedback' }))
    await waitFor(
      () => {
        expect(dialog.getByText('Enter a message.')).toBeVisible()
        expect(dialog.getByText('Enter your email.')).toBeVisible()
      },
      { timeout: 3000 },
    )
  },
}

/** Validation: a malformed email is rejected with its own error. */
export const InvalidEmail: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement)
    await userEvent.type(
      dialog.getByRole('textbox', { name: /your message/i }),
      'The map pins load slowly on my phone.',
    )
    await userEvent.type(
      dialog.getByRole('textbox', { name: /^email/i }),
      'sam@',
    )
    await userEvent.click(dialog.getByRole('button', { name: 'Send feedback' }))
    await waitFor(
      () => expect(dialog.getByText('Enter a valid email.')).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Validation: the Rating category cannot be sent without a star rating. */
export const RatingRequired: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement)
    await userEvent.selectOptions(dialog.getByRole('combobox'), 'RATING')
    await fillMessageAndEmail(dialog)
    await userEvent.click(dialog.getByRole('button', { name: 'Send feedback' }))
    await waitFor(
      () =>
        expect(dialog.getByText('Choose a rating from 1 to 5.')).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Submitting: the send button shows its spinner and the stars are disabled. */
export const Submitting: Story = {
  args: { submitting: true },
}

/** Error: the host reports a failed send and the message appears above the buttons. */
export const SubmitError: Story = {
  args: {
    submitError: 'We could not send your feedback. Please try again.',
  },
}

/** Success: a valid form is submitted and the dialog closes itself. */
export const SubmitClosesDialog: Story = {
  args: { onSubmit: fn(async () => true as const) },
  render: (args) => <TriggeredDialog {...args} startOpen />,
  play: async ({ args, canvasElement }) => {
    const dialog = await findDialog(canvasElement)
    await fillMessageAndEmail(dialog)
    await userEvent.click(dialog.getByRole('button', { name: 'Send feedback' }))
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    })
    await expect(args.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'GENERAL',
        email: 'sam@example.com',
      }),
    )
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

/** Triggers: every trigger variant that opens the dialog through the provider. */
export const Triggers: Story = {
  render: () => (
    <FeedbackDialogProvider onSubmit={async () => true}>
      <HStack gap={3} flexWrap="wrap" align="center">
        <FeedbackTrigger variant="button" />
        <FeedbackTrigger variant="nav" />
        <FeedbackTrigger variant="footer" />
        <FeedbackTrigger variant="footerMeta" />
      </HStack>
    </FeedbackDialogProvider>
  ),
}

/**
 * Form spacing (FE-481, wiki Foundations-Form-Spacing), read between visible
 * edges: the intro is the Modal description (8 under the title), the first field
 * 24 under it, the five fields 20 apart, and the last 20 above the buttons.
 * Fields are 48 tall with the label 8 above; the star tiles are the 44 tap target, and
 * a helper sits 4 under its control.
 */
async function expectFeedbackSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Send feedback',
  )
  const column = bodyColumn(body)
  const [category, rating, message, name, email] = [
    ...column.children,
  ] as HTMLElement[]

  await expect(dialog).toHaveAccessibleDescription(/Tell us about a bug/)
  await expect(gapBelow(title, description as HTMLElement)).toBe(
    formSpace.titleToSubtitle,
  )
  await expect(gapBelow(description as HTMLElement, category)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapsBetweenChildren(column)).toEqual(
    Array(4).fill(formSpace.fieldGap),
  )

  await expectField(category)
  await expectField(message, null)
  await expectField(name)
  await expectField(email)

  // The stars: 44 tiles 8 under their label, the helper 4 under them.
  const tiles = starTilesOf(rating)
  await expect(tiles).toHaveLength(5)
  await expect(gapBelow(labelOf(rating), tiles[0])).toBe(
    formSpace.labelToControl,
  )
  for (const tile of tiles) {
    await expect(heightOf(tile)).toBe(minHitArea)
  }
  await expect(
    gapBelow(
      tiles[0],
      lineOf(rating, 'Optional, but required if you chose Rating.'),
    ),
  ).toBe(formSpace.controlToHelper)

  await expect(
    gapBelow(
      controlOf(email),
      lineOf(email, 'We’ll use this to reply within 10 working days.'),
    ),
  ).toBe(formSpace.controlToHelper)
  await scrollToEnd(body)
  await expect(gapBelow(email, barButton(dialog, 'Send feedback'))).toBeCloseTo(
    formSpace.bodyToAction,
    0,
  )
  expectNoHorizontalOverflow(body)
}

/** Desktop: the gaps above. */
export const Spacing: Story = {
  play: ({ canvasElement }) => expectFeedbackSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const SpacingPhone: Story = {
  ...phone390,
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectFeedbackSpacing(canvasElement)
  },
}

/** Both messages under a control: the helper 4 under it, the error 4 under the helper. */
export const SpacingEmailError: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(canvasElement, 'Send feedback')
    const email = bodyColumn(body).children[4] as HTMLElement
    await userEvent.click(barButton(dialog, 'Send feedback'))
    const error = await within(email).findByText('Enter your email.')
    const helper = lineOf(
      email,
      'We’ll use this to reply within 10 working days.',
    )

    await expect(gapBelow(controlOf(email), helper)).toBe(
      formSpace.controlToHelper,
    )
    await expect(gapBelow(helper, error)).toBe(formSpace.helperGap)
  },
}

/** A required rating with an error: the error 4 under the stars (no helper then). */
export const SpacingRatingError: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(canvasElement, 'Send feedback')
    const rating = bodyColumn(body).children[1] as HTMLElement
    await userEvent.selectOptions(
      within(dialog).getByRole('combobox'),
      'RATING',
    )
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: /your message/i }),
      'The map pins load slowly on my phone.',
    )
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: /^email/i }),
      'sam@example.com',
    )
    await userEvent.click(barButton(dialog, 'Send feedback'))
    const error = await within(rating).findByText(
      'Choose a rating from 1 to 5.',
    )

    await expect(gapBelow(starTilesOf(rating)[0], error)).toBe(
      formSpace.controlToHelper,
    )
  },
}

/** A failed send is one more block: 20 under the email, 20 above the buttons. */
export const SpacingSubmitError: Story = {
  args: { submitError: 'We could not send your feedback. Please try again.' },
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(canvasElement, 'Send feedback')
    const column = bodyColumn(body)
    const email = column.children[4] as HTMLElement
    const error = within(column).getByText(
      'We could not send your feedback. Please try again.',
    )

    await expect(gapBelow(email, error)).toBe(formSpace.fieldGap)
    await expect(gapBelow(error, barButton(dialog, 'Send feedback'))).toBe(
      formSpace.bodyToAction,
    )
  },
}
