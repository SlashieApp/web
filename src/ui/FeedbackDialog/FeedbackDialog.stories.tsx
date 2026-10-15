import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '../Button/Button'
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
