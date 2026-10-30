import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'

import { Button } from '../Button'
import { FormField } from '../FormField/FormField'
import { gapBelow, gapBeside, heightOf } from '../FormField/formGap.testing'
import { FormStack } from '../FormStack/FormStack'
import { Input } from '../Input/Input'
import { Modal } from './Modal'

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: false,
    onOpenChange: () => {},
    title: 'Modal',
    size: 'md',
    submitLoading: false,
    submitDisabled: false,
    hideFooter: false,
    children: null,
  },
  argTypes: {
    title: { control: 'text' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Max-width preset.',
    },
    submitLabel: { control: 'text' },
    submitVariant: {
      control: 'inline-radio',
      options: ['primary', 'danger'],
      description:
        'The primary button: green, or red for a destructive action.',
    },
    cancelLabel: { control: 'text' },
    backLabel: { control: 'text' },
    submitLoading: { control: 'boolean' },
    submitDisabled: { control: 'boolean' },
    hideFooter: { control: 'boolean' },
    onOpenChange: { action: 'openChange' },
    onSubmit: { action: 'submit' },
    onCancel: { action: 'cancel' },
    onBack: { action: 'back' },
    children: { control: false, table: { disable: true } },
    footer: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

/** A self-opening wrapper so each story has a trigger button + controlled open state. */
function ModalDemo({
  triggerLabel = 'Open modal',
  triggerVariant = 'primary',
  initialOpen = false,
  children,
  ...args
}: Omit<React.ComponentProps<typeof Modal>, 'open' | 'onOpenChange'> & {
  triggerLabel?: string
  triggerVariant?: React.ComponentProps<typeof Button>['variant']
  /** Start with the dialog showing (for the "open" stories). */
  initialOpen?: boolean
}) {
  const [open, setOpen] = useState(initialOpen)
  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        m={6}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <Modal
        {...args}
        open={open}
        onOpenChange={setOpen}
        // The Controls panel injects action handlers for these, which would
        // stop Cancel and Back from closing the demo, so log and then close.
        onCancel={() => {
          args.onCancel?.()
          setOpen(false)
        }}
        onBack={() => {
          args.onBack?.()
          setOpen(false)
        }}
        onSubmit={() => {
          args.onSubmit?.()
          setOpen(false)
        }}
      >
        {children}
      </Modal>
    </>
  )
}

/** Default: title + body copy + primary/secondary footer actions. */
export const Default: Story = {
  args: {
    title: 'Add contact phone number',
    submitLabel: 'Send code',
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Verify phone number">
      <Stack gap={4}>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          We will text a 6-digit code to confirm your number before you can
          quote on tasks.
        </Text>
        <FormField label="Mobile number">
          <Input placeholder="+44 7700 900000" />
        </FormField>
      </Stack>
    </ModalDemo>
  ),
}

/** Submit disabled: primary action is inert until the form is valid. */
export const SubmitDisabled: Story = {
  args: {
    title: 'Change email address',
    submitLabel: 'Save',
    submitDisabled: true,
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Update email" triggerVariant="secondary">
      <FormField
        label="New email"
        helperText="Enter a new address to enable Save."
      >
        <Input type="email" placeholder="you@example.com" />
      </FormField>
    </ModalDemo>
  ),
}

/** Loading: primary action shows a spinner while the request is in flight. */
export const SubmitLoading: Story = {
  args: {
    title: 'Submitting quote',
    submitLabel: 'Send quote',
    submitLoading: true,
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Send quote">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Hang tight while we send your quote to the customer.
      </Text>
    </ModalDemo>
  ),
}

/** Error: the field surfaces a validation error tied via aria-describedby. */
export const FieldError: Story = {
  args: {
    title: 'Change email address',
    submitLabel: 'Save',
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Update email" triggerVariant="secondary">
      <FormField
        label="New email"
        errorText="That does not look like a valid email address."
      >
        <Input type="email" defaultValue="not-an-email" />
      </FormField>
    </ModalDemo>
  ),
}

/** Back-style secondary action (multi-step flows). */
export const WithBackAction: Story = {
  args: {
    title: 'Confirm details',
    submitLabel: 'Confirm',
    backLabel: 'Back',
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Continue">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Step 2 of 2. Review your details before confirming.
      </Text>
    </ModalDemo>
  ),
}

/** No footer: caller renders its own actions inside the body. */
export const NoFooter: Story = {
  args: {
    title: 'Quick note',
    hideFooter: true,
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Open note">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        This dialog hides the default footer; close it with the X, ESC, or by
        clicking the scrim.
      </Text>
    </ModalDemo>
  ),
}

/** AllVariants: every size rendered side-by-side as independent triggers. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack direction={{ base: 'column', md: 'row' }} gap={2} p={4} wrap="wrap">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ModalDemo
          key={size}
          title={`Size: ${size}`}
          size={size}
          submitLabel="Confirm"
          triggerLabel={`Open ${size}`}
          triggerVariant="secondary"
        >
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            The {size} preset constrains the dialog max-width. Body copy uses
            text.muted; the surface and border reference SDL semantic roles.
          </Text>
        </ModalDemo>
      ))}
    </Stack>
  ),
}

const verifyPhoneBody = (
  <Stack gap={4}>
    <Text fontSize="sm" color="text.muted" lineHeight="tall">
      We will text a 6-digit code to confirm your number before you can quote on
      tasks.
    </Text>
    <FormField label="Mobile number">
      <Input placeholder="+44 7700 900000" />
    </FormField>
  </Stack>
)

const emailBody = (
  <FormField label="New email" helperText="Enter a new address to enable Save.">
    <Input type="email" placeholder="you@example.com" />
  </FormField>
)

/** Overlay stories render in an iframe on the Docs page so they never cover it. */
const overlayDocs = {
  docs: { story: { inline: false, iframeHeight: 560 } },
} as const

const phoneDescription =
  'We will text a 6-digit code to confirm your number before you can quote on tasks.'

/** The open dialog and the parts of its frame (FE-481 form spacing). */
async function openFrame(canvasElement: HTMLElement, name: string) {
  const page = within(canvasElement.ownerDocument.body)
  const dialog = await page.findByRole('dialog', { name }, { timeout: 3000 })
  await waitFor(() => expect(dialog).toBeVisible(), { timeout: 3000 })
  // The dialog scales in: measure once it has settled.
  await waitFor(() => expect(dialog.getAnimations()).toHaveLength(0), {
    timeout: 3000,
  })
  const part = (cls: string) => dialog.querySelector(cls) as HTMLElement | null
  return {
    dialog,
    title: within(dialog).getByRole('heading', { name }),
    header: part('.chakra-dialog__header') as HTMLElement,
    body: part('.chakra-dialog__body') as HTMLElement,
    footer: part('.chakra-dialog__footer'),
  }
}

/** The FormField root of a field, from its label. */
function fieldOf(dialog: HTMLElement, label: string) {
  return within(dialog).getByText(label, { selector: 'label' })
    .parentElement as HTMLElement
}

/** Form fields in the frame: two fields 20 apart, as a `FormStack` lays them. */
const phoneForm = (
  <FormStack>
    <FormField label="Mobile number">
      <Input placeholder="+44 7700 900000" />
    </FormField>
    <FormField label="Name on the account">
      <Input placeholder="Alex Morgan" />
    </FormField>
  </FormStack>
)

/** Open: the default dialog already showing, Cancel plus primary action. */
export const Open: Story = {
  parameters: overlayDocs,
  args: { title: 'Add contact phone number', submitLabel: 'Send code' },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {verifyPhoneBody}
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const dialog = await page.findByRole(
      'dialog',
      { name: 'Add contact phone number' },
      { timeout: 3000 },
    )
    await waitFor(() => expect(dialog).toBeVisible(), { timeout: 3000 })
    await expect(
      within(dialog).getByRole('button', { name: 'Send code' }),
    ).toBeEnabled()
    await expect(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    ).toBeVisible()
  },
}

/** Interaction: the trigger opens the dialog and Cancel closes it again. */
export const OpensAndCancels: Story = {
  args: { title: 'Add contact phone number', submitLabel: 'Send code' },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Verify phone number">
      {verifyPhoneBody}
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Verify phone number' }),
    )
    const dialog = await page.findByRole(
      'dialog',
      { name: 'Add contact phone number' },
      { timeout: 3000 },
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    )
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull(), {
      timeout: 3000,
    })
  },
}

/** Enter in a field submits, like the primary button. */
export const EnterSubmits: Story = {
  args: {
    title: 'Add contact phone number',
    submitLabel: 'Send code',
    onSubmit: fn(),
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {verifyPhoneBody}
    </ModalDemo>
  ),
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const dialog = await page.findByRole(
      'dialog',
      { name: 'Add contact phone number' },
      { timeout: 3000 },
    )
    await userEvent.type(
      within(dialog).getByRole('textbox'),
      '07700900123{Enter}',
    )
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1))
  },
}

/** Open, small: the 400px width preset. */
export const OpenSmall: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Add contact phone number',
    size: 'sm',
    submitLabel: 'Send code',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {verifyPhoneBody}
    </ModalDemo>
  ),
}

/** Open, large: the 560px width preset. */
export const OpenLarge: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Add contact phone number',
    size: 'lg',
    submitLabel: 'Send code',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {verifyPhoneBody}
    </ModalDemo>
  ),
}

/** Open, submit disabled: primary action inert until the form is valid. */
export const OpenSubmitDisabled: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Change email address',
    submitLabel: 'Save',
    submitDisabled: true,
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Update email">
      {emailBody}
    </ModalDemo>
  ),
}

/** Open, submitting: the primary action spins while the request runs. */
export const OpenSubmitLoading: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Submitting quote',
    submitLabel: 'Send quote',
    submitLoading: true,
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Send quote">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Hang tight while we send your quote to the customer.
      </Text>
    </ModalDemo>
  ),
}

/** Open with a field error: the message is tied to the input. */
export const OpenFieldError: Story = {
  parameters: overlayDocs,
  args: { title: 'Change email address', submitLabel: 'Save' },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Update email">
      <FormField
        label="New email"
        errorText="That does not look like a valid email address."
      >
        <Input type="email" defaultValue="not-an-email" />
      </FormField>
    </ModalDemo>
  ),
}

/** Open with a back action: Back replaces Cancel in multi-step flows. */
export const OpenWithBackAction: Story = {
  parameters: overlayDocs,
  args: { title: 'Confirm details', submitLabel: 'Confirm', backLabel: 'Back' },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Continue">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Step 2 of 2. Review your details before confirming.
      </Text>
    </ModalDemo>
  ),
}

/** Open, custom cancel label: the secondary action reads "Keep editing". */
export const OpenCustomCancelLabel: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Discard your changes?',
    submitLabel: 'Discard',
    cancelLabel: 'Keep editing',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Close editor">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        You have unsaved changes to this task. They will be lost if you leave.
      </Text>
    </ModalDemo>
  ),
}

/** Open without a footer: close with the X, ESC or the scrim. */
export const OpenNoFooter: Story = {
  parameters: overlayDocs,
  args: { title: 'Quick note', hideFooter: true },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Open note">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        This dialog hides the default footer; close it with the X, ESC, or by
        clicking the scrim.
      </Text>
    </ModalDemo>
  ),
}

/** Open, destructive: `submitVariant="danger"` makes the action button red. */
export const OpenDestructive: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Delete this task?',
    cancelLabel: 'Keep task',
    submitLabel: 'Delete task',
    submitVariant: 'danger',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Delete task">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Workers who have already quoted will be told it was removed. This cannot
        be undone.
      </Text>
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    const dialog = await page.findByRole('dialog', {
      name: 'Delete this task?',
    })
    await waitFor(() => expect(dialog).toBeVisible(), { timeout: 3000 })
    await expect(
      within(dialog).getByRole('button', { name: 'Keep task' }),
    ).toBeVisible()
    await expect(
      within(dialog).getByRole('button', { name: 'Delete task' }),
    ).toBeVisible()
  },
}

const houseRules = [
  'Agree the price and the scope of work in the quote before anyone starts.',
  'Meet in a public or well-lit place for the first hand-over, and bring a friend if you can.',
  'Pay the worker directly once the job is finished and you are happy with it.',
  'Keep every message inside Slashie, so there is a record if something goes wrong.',
  'Tell us straight away if a worker asks for money up front or a deposit by bank transfer.',
  'Take photos of the work before and after, and keep receipts for any materials.',
  'If a job needs a licensed tradesperson, ask to see their certificate first.',
  'Leave a review afterwards so the next customer knows what to expect.',
  "Check that the worker's name and photo match the profile you booked.",
  'Clear the work area of valuables and keep pets in another room.',
  'Agree how rubbish and leftover materials will be taken away.',
  'Ask for a receipt that lists labour and materials separately.',
  'Report any damage within 48 hours, with photos, through the task page.',
  'Cancel at least 24 hours ahead if your plans change, so the worker can re-book the slot.',
]

/** Open with long content: the dialog stops at the viewport and the body scrolls between the header and the buttons. */
export const OpenLongContent: Story = {
  parameters: overlayDocs,
  args: { title: 'Before you accept this quote', submitLabel: 'Accept quote' },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Accept quote">
      {houseRules.map((rule, index) => (
        <Text key={rule} fontSize="sm" color="text.muted" lineHeight="tall">
          {index + 1}. {rule}
        </Text>
      ))}
    </ModalDemo>
  ),
}

/** Open with a long title: the heading wraps onto a second line. */
export const OpenLongTitle: Story = {
  parameters: overlayDocs,
  args: {
    title:
      'Are you sure you want to withdraw your quote for the garden fence repair in Hackney?',
    submitLabel: 'Withdraw quote',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Withdraw quote">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        The customer will be told you are no longer available.
      </Text>
    </ModalDemo>
  ),
}

/** Phone, open: the dialog fills the narrow viewport with 16px of margin. */
export const OpenMobile: Story = {
  parameters: overlayDocs,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { title: 'Add contact phone number', submitLabel: 'Send code' },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {verifyPhoneBody}
    </ModalDemo>
  ),
}

/**
 * Open with a description: the title block is the title, the description 8
 * under it, then 24 to the first field. Fields sit 20 apart, and the last field
 * is 20 above the buttons. Neither the header nor the footer has a dividing
 * line.
 */
export const OpenWithDescription: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Add contact phone number',
    description: phoneDescription,
    submitLabel: 'Send code',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {phoneForm}
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const { dialog, title, header, footer } = await openFrame(
      canvasElement,
      'Add contact phone number',
    )
    const description = within(dialog).getByText(phoneDescription)
    const first = fieldOf(dialog, 'Mobile number')
    const last = fieldOf(dialog, 'Name on the account')
    const send = within(dialog).getByRole('button', { name: 'Send code' })

    await expect(gapBelow(title, description)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(description, first)).toBe(formSpace.headerToBody)
    await expect(gapBelow(first, last)).toBe(formSpace.fieldGap)
    await expect(gapBelow(last, send)).toBe(formSpace.bodyToAction)

    await expect(getComputedStyle(header).borderBottomWidth).toBe('0px')
    await expect(getComputedStyle(footer as HTMLElement).borderTopWidth).toBe(
      '0px',
    )
    // The description is the dialog's accessible description.
    await expect(dialog).toHaveAccessibleDescription(phoneDescription)
    // A body that fits has nothing under the bar: no edge line at rest.
    await expect(getComputedStyle(footer as HTMLElement).boxShadow).toBe('none')
  },
}

/** Open with no description: the title, then 24 to the first field. */
export const OpenWithoutDescription: Story = {
  parameters: overlayDocs,
  args: { title: 'Change email address', submitLabel: 'Save' },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Update email">
      <FormStack>
        <FormField label="New email">
          <Input type="email" placeholder="you@example.com" />
        </FormField>
      </FormStack>
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const { dialog, title } = await openFrame(
      canvasElement,
      'Change email address',
    )
    const field = fieldOf(dialog, 'New email')
    const save = within(dialog).getByRole('button', { name: 'Save' })

    await expect(gapBelow(title, field)).toBe(formSpace.headerToBody)
    await expect(gapBelow(field, save)).toBe(formSpace.bodyToAction)
  },
}

/**
 * A confirm that is one sentence: the sentence is the `description` (8 under
 * the title, and the dialog's accessible description, so it is heard when the
 * dialog opens) and there is no body. The buttons are 24 under it, the
 * header's step to the next block, with no extra body padding on top of that.
 */
export const OpenDescriptionOnly: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Cancel task',
    description:
      'Cancel this task? Workers will no longer be able to send quotes.',
    size: 'sm',
    submitLabel: 'Cancel task',
    submitVariant: 'danger',
    cancelLabel: 'Keep',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Cancel the task" />
  ),
  play: async ({ canvasElement }) => {
    const { dialog, title } = await openFrame(canvasElement, 'Cancel task')
    const sentence = within(dialog).getByText(/Cancel this task\?/)
    const keep = within(dialog).getByRole('button', { name: 'Keep' })
    const body = dialog.querySelector('.chakra-dialog__body') as HTMLElement

    await expect(dialog).toHaveAccessibleDescription(
      'Cancel this task? Workers will no longer be able to send quotes.',
    )
    await expect(gapBelow(title, sentence)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(sentence, keep)).toBe(formSpace.headerToBody)
    // Nothing in the body: it is only the step from the header to the bar.
    await expect(body.children).toHaveLength(0)
    await expect(heightOf(body)).toBe(formSpace.headerToBody)
  },
}

/**
 * Open with two blocks that are direct children of the frame (a note and a
 * form): they are one field apart (20), as a FormStack lays its fields, not
 * the old 24.
 */
export const OpenDirectChildrenAreOneFieldApart: Story = {
  parameters: overlayDocs,
  args: { title: 'Change email address', submitLabel: 'Save' },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Update email">
      <Text>We will send a link to the new address.</Text>
      <FormStack>
        <FormField label="New email">
          <Input type="email" placeholder="you@example.com" />
        </FormField>
      </FormStack>
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const { dialog } = await openFrame(canvasElement, 'Change email address')
    const note = within(dialog).getByText(
      'We will send a link to the new address.',
    )
    const field = fieldOf(dialog, 'New email')
    await expect(gapBelow(note, field)).toBe(formSpace.fieldGap)
  },
}

/** A field error is part of its field: the 20 to the buttons is below it. */
export const OpenErrorAboveButtons: Story = {
  parameters: overlayDocs,
  args: { title: 'Change email address', submitLabel: 'Save' },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Update email">
      <FormStack>
        <FormField
          label="New email"
          errorText="That does not look like a valid email address."
        >
          <Input type="email" defaultValue="not-an-email" />
        </FormField>
      </FormStack>
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const { dialog } = await openFrame(canvasElement, 'Change email address')
    const field = fieldOf(dialog, 'New email')
    const save = within(dialog).getByRole('button', { name: 'Save' })
    await expect(gapBelow(field, save)).toBe(formSpace.bodyToAction)
  },
}

/**
 * Open, tall body: the dialog stops at the viewport, the body scrolls between
 * the header and the button bar, and the bar stays where it is. Scrolled to the
 * end, the last line is 20 above the buttons.
 */
export const OpenBarStaysPut: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Before you accept this quote',
    description: 'Read these through first.',
    submitLabel: 'Accept quote',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Accept quote">
      {[...houseRules, ...houseRules].map((rule, index) => (
        <Text
          // biome-ignore lint/suspicious/noArrayIndexKey: the rules repeat
          key={index}
          fontSize="sm"
          color="text.muted"
          lineHeight="tall"
        >
          {index + 1}. {rule}
        </Text>
      ))}
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const { dialog, header, body } = await openFrame(
      canvasElement,
      'Before you accept this quote',
    )
    const accept = within(dialog).getByRole('button', { name: 'Accept quote' })
    const viewportHeight = canvasElement.ownerDocument.defaultView?.innerHeight

    // The dialog fits the viewport, and the body is what scrolls.
    const box = dialog.getBoundingClientRect()
    await expect(box.top).toBeGreaterThanOrEqual(0)
    await expect(box.bottom).toBeLessThanOrEqual(viewportHeight ?? 0)
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)

    const headerTop = header.getBoundingClientRect().top
    const acceptTop = accept.getBoundingClientRect().top
    body.scrollTop = body.scrollHeight
    await waitFor(() =>
      expect(body.scrollTop + body.clientHeight).toBeGreaterThanOrEqual(
        body.scrollHeight - 1,
      ),
    )
    // Header and bar did not move; the last rule is 20 above the button.
    await expect(header.getBoundingClientRect().top).toBe(headerTop)
    await expect(accept.getBoundingClientRect().top).toBe(acceptTop)
    const rules = within(body).getAllByText(/^\d+\. /)
    const last = rules[rules.length - 1] as HTMLElement
    // A scroll position is a whole number and the layout is not, so the end
    // of the scroll can sit up to half a pixel off.
    await expect(gapBelow(last, accept)).toBeCloseTo(formSpace.bodyToAction, 0)
  },
}

/**
 * The same long body, and what shows that there is more: while the body can
 * scroll further, the bar has a hairline on its top edge (the frame's own
 * border colour, drawn above the bar, so nothing moves); at the end of the
 * scroll it goes, and the bar is where it was. A body that fits has no line.
 */
export const OpenBarEdgeWhileScrolling: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Before you accept this quote',
    description: 'Read these through first.',
    submitLabel: 'Accept quote',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Accept quote">
      {[...houseRules, ...houseRules].map((rule, index) => (
        <Text
          // biome-ignore lint/suspicious/noArrayIndexKey: the rules repeat
          key={index}
          fontSize="sm"
          color="text.muted"
          lineHeight="tall"
        >
          {index + 1}. {rule}
        </Text>
      ))}
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const { dialog, body, footer } = await openFrame(
      canvasElement,
      'Before you accept this quote',
    )
    const bar = footer as HTMLElement
    const edge = () => getComputedStyle(bar).boxShadow
    const rule = getComputedStyle(dialog).borderTopColor
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)

    // Top of the scroll: more below, so the bar's edge shows, in the frame's colour.
    await waitFor(() => expect(edge()).not.toBe('none'))
    await expect(edge()).toContain(rule)
    await expect(edge()).toMatch(/0px -1px 0px 0px$/)
    const barTop = bar.getBoundingClientRect().top

    // Part way: still more below.
    body.scrollTop = Math.floor((body.scrollHeight - body.clientHeight) / 2)
    await waitFor(() => expect(edge()).not.toBe('none'))

    // End of the scroll: nothing more, so no line; the bar did not move.
    body.scrollTop = body.scrollHeight
    await waitFor(() => expect(edge()).toBe('none'))
    await expect(bar.getBoundingClientRect().top).toBe(barTop)

    // Back up: it returns.
    body.scrollTop = 0
    await waitFor(() => expect(edge()).not.toBe('none'))
  },
}

/** Open with no footer: the body ends 24 above the dialog's edge, as it did. */
export const OpenNoFooterEnds: Story = {
  parameters: overlayDocs,
  args: { title: 'Quick note', hideFooter: true },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Open note">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        This dialog hides the default footer.
      </Text>
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openFrame(canvasElement, 'Quick note')
    const note = within(dialog).getByText(
      'This dialog hides the default footer.',
    )
    await expect(
      Math.round(
        body.getBoundingClientRect().bottom -
          note.getBoundingClientRect().bottom,
      ),
    ).toBe(24)
  },
}

/**
 * A viewport of the given size (Storybook's own presets are 320 by 568 and up).
 * Spread it into a story: `{ ...viewportOf('narrow', 320, 256) }`.
 */
function viewportOf(name: string, width: number, height: number) {
  return {
    parameters: {
      viewport: {
        options: {
          [name]: {
            name,
            styles: { width: `${width}px`, height: `${height}px` },
            type: 'mobile',
          },
        },
      },
    },
    globals: { viewport: { value: name, isRotated: false } },
  } as const
}

/**
 * The frame: the buttons of the bar are 48 tall, like the fields (the spec's
 * `controlHeight`); the title is 28 under the panel's top with the close button
 * in its row, centred on it, the 20px glyph on the content's right edge and the
 * 44px target reaching 12 into the panel's padding, as in `Drawer`.
 */
export const OpenFrame: Story = {
  parameters: overlayDocs,
  args: {
    title: 'Add contact phone number',
    description: phoneDescription,
    submitLabel: 'Send code',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {phoneForm}
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const { dialog, title, header } = await openFrame(
      canvasElement,
      'Add contact phone number',
    )
    const send = within(dialog).getByRole('button', { name: 'Send code' })
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' })
    await expect(heightOf(send)).toBe(formSpace.controlHeight)
    await expect(heightOf(cancel)).toBe(formSpace.controlHeight)

    const close = within(dialog).getByRole('button', { name: 'Close' })
    const panel = dialog.getBoundingClientRect()
    const titleBox = title.getBoundingClientRect()
    const closeBox = close.getBoundingClientRect()
    const headerBox = header.getBoundingClientRect()
    // The panel has a 1px border: the title is 28 below its inner top.
    await expect(titleBox.top - headerBox.top).toBe(28)
    // The close button is level with the title, not floating in the corner.
    await expect(closeBox.top + closeBox.height / 2).toBeCloseTo(
      titleBox.top + titleBox.height / 2,
      1,
    )
    await expect(closeBox.height).toBe(44)
    // The glyph (20, centred in the 44) ends on the content edge: the title's
    // right edge is the content's, and the target reaches 12 past it.
    const content = within(dialog)
      .getByText(phoneDescription)
      .getBoundingClientRect()
    await expect(closeBox.right - content.right).toBe(12)
    await expect(panel.right - closeBox.right).toBeGreaterThan(0)
  },
}

/**
 * Footer buttons that do not fit one line (a phone 320 wide, a long label) wrap
 * rather than leave the left one outside the dialog: the main button on top,
 * the two 8 apart, both inside the panel.
 */
export const OpenButtonsWrapOnNarrowPhone: Story = {
  ...viewportOf('narrow phone', 320, 568),
  parameters: {
    ...viewportOf('narrow phone', 320, 568).parameters,
    ...overlayDocs,
  },
  args: {
    title: 'Delete your account',
    submitLabel: 'Delete my account',
    submitVariant: 'danger',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Delete account">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        This cannot be undone.
      </Text>
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.ownerDocument.defaultView?.innerWidth).toBe(320)
    const { dialog } = await openFrame(canvasElement, 'Delete your account')
    const panel = dialog.getBoundingClientRect()
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' })
    const remove = within(dialog).getByRole('button', {
      name: 'Delete my account',
    })
    for (const button of [cancel, remove]) {
      const box = button.getBoundingClientRect()
      await expect(box.left).toBeGreaterThanOrEqual(panel.left)
      await expect(box.right).toBeLessThanOrEqual(panel.right)
      await expect(heightOf(button)).toBe(formSpace.controlHeight)
    }
    // They wrapped: the main button is above Cancel, 8 apart.
    await expect(gapBelow(remove, cancel)).toBe(formSpace.alternativesGap)
  },
}

/** Two buttons that fit stay on one line, 12 apart (the wrap is only for when they do not). */
export const OpenButtonsStayOnOneLine: Story = {
  parameters: overlayDocs,
  args: { title: 'Add contact phone number', submitLabel: 'Send code' },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {phoneForm}
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    const { dialog } = await openFrame(
      canvasElement,
      'Add contact phone number',
    )
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' })
    const send = within(dialog).getByRole('button', { name: 'Send code' })
    await expect(gapBeside(cancel, send)).toBe(formSpace.inlineGap)
    await expect(cancel.getBoundingClientRect().top).toBe(
      send.getBoundingClientRect().top,
    )
  },
}

/**
 * A viewport as short as a 1280 by 1024 window at 400% zoom (320 by 256): the
 * header and the bar would leave the body no room, so the dialog scrolls as a
 * whole and the buttons stay reachable. Nothing is cut off at the end of the
 * scroll.
 */
export const OpenShortViewportScrolls: Story = {
  ...viewportOf('reflow 320 by 256', 320, 256),
  parameters: {
    ...viewportOf('reflow 320 by 256', 320, 256).parameters,
    ...overlayDocs,
  },
  args: {
    title: 'Add contact phone number',
    description: phoneDescription,
    submitLabel: 'Send code',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {phoneForm}
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.ownerDocument.defaultView?.innerHeight).toBe(256)
    const { dialog, body } = await openFrame(
      canvasElement,
      'Add contact phone number',
    )
    // The dialog is what scrolls: the body is not a scroller of its own
    // (squeezed between the bars it would have no height left).
    await expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight)
    await expect(body.scrollHeight).toBe(body.clientHeight)
    const send = within(dialog).getByRole('button', { name: 'Send code' })
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' })

    dialog.scrollTop = dialog.scrollHeight
    await waitFor(() =>
      expect(dialog.scrollTop + dialog.clientHeight).toBeGreaterThanOrEqual(
        dialog.scrollHeight - 1,
      ),
    )
    // At the end, both buttons are inside the dialog, whole.
    const panel = dialog.getBoundingClientRect()
    for (const button of [send, cancel]) {
      const box = button.getBoundingClientRect()
      await expect(box.bottom).toBeLessThanOrEqual(panel.bottom)
      await expect(box.top).toBeGreaterThanOrEqual(panel.top)
    }
  },
}

/** A short landscape phone (667 by 375) still pins the bar: the body is what scrolls. */
export const OpenLandscapePhonePinsBar: Story = {
  ...viewportOf('landscape phone', 667, 375),
  parameters: {
    ...viewportOf('landscape phone', 667, 375).parameters,
    ...overlayDocs,
  },
  args: {
    title: 'Add contact phone number',
    description: phoneDescription,
    submitLabel: 'Send code',
  },
  render: (args) => (
    <ModalDemo {...args} initialOpen triggerLabel="Verify phone number">
      {phoneForm}
    </ModalDemo>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.ownerDocument.defaultView?.innerHeight).toBe(375)
    const { dialog, body } = await openFrame(
      canvasElement,
      'Add contact phone number',
    )
    // Everything is inside the dialog without scrolling it.
    await expect(dialog.scrollHeight).toBeLessThanOrEqual(dialog.clientHeight)
    await expect(body.clientHeight).toBeGreaterThanOrEqual(128)
    const send = within(dialog).getByRole('button', { name: 'Send code' })
    await expect(send.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      dialog.getBoundingClientRect().bottom,
    )
  },
}
