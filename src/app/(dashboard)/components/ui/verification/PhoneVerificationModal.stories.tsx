import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import {
  barButton,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  fieldOf,
  labelOf,
  openDialog,
  phone390,
  shellOf,
} from '../dialogSpacing.testing'
import { PhoneVerificationModal } from './PhoneVerificationModal'

const PHONE = '+447700900123'

const meta = {
  title: 'Dashboard/Shared/PhoneVerificationModal',
  component: PhoneVerificationModal,
  parameters: { layout: 'padded' },
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof PhoneVerificationModal>

export default meta
type Story = StoryObj<typeof meta>

const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** No number saved: add one and get a code (no password for a first number). */
export const AddNumber: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('dialog', {
        name: 'Add contact phone number',
      }),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByLabelText('Mobile number'),
    ).toHaveValue('')
    await expect(
      page(canvasElement).queryByLabelText('Current password'),
    ).toBeNull()
  },
}

/** A saved number that is not verified yet: it is prefilled. */
export const VerifySavedNumber: Story = {
  decorators: [
    withSession({ me: storyMe({ profile: { contactNumber: PHONE } }) }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByLabelText('Mobile number'),
    ).toHaveDisplayValue(/7700 ?900123/)
  },
}

/** A verified number on a password account: a blank field and the password to confirm. */
export const ChangeVerifiedNumber: Story = {
  decorators: [
    withSession({
      me: storyMe({ phoneVerified: true, profile: { contactNumber: PHONE } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('dialog', {
        name: 'Change phone number',
      }),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByLabelText('Current password'),
    ).toBeInTheDocument()
  },
}

/** Changing without the password: asks for it before anything is sent. */
export const ChangeNeedsPassword: Story = {
  decorators: [
    withSession({
      me: storyMe({ phoneVerified: true, profile: { contactNumber: PHONE } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.type(
      await page(canvasElement).findByLabelText('Mobile number'),
      '7700900456',
    )
    await userEvent.click(
      page(canvasElement).getByRole('button', { name: 'Send code' }),
    )
    await expect(
      await page(canvasElement).findByText('Enter your current password.'),
    ).toBeInTheDocument()
  },
}

/** Google-only account changing a verified number: no password field (the API checks a recent sign-in). */
export const ChangeWithoutPassword: Story = {
  decorators: [
    withSession({
      me: storyMe({
        phoneVerified: true,
        enabledLoginMethods: [LoginMethod.Google],
        profile: { contactNumber: PHONE },
      }),
      responses: {
        SendPhoneVerification: {
          kind: 'graphqlError',
          code: 'REAUTH_REQUIRED',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.type(
      await page(canvasElement).findByLabelText('Mobile number'),
      '7700900456',
    )
    await expect(
      page(canvasElement).queryByLabelText('Current password'),
    ).toBeNull()
    await userEvent.click(
      page(canvasElement).getByRole('button', { name: 'Send code' }),
    )
    await expect(
      await page(canvasElement).findByText(/sign out and sign in again/),
    ).toBeInTheDocument()
  },
}

/** A change is waiting for its SMS code: opens on the code step. */
export const EnterCode: Story = {
  decorators: [
    withSession({
      me: storyMe({
        phoneVerified: true,
        pendingPhone: '+447700900456',
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByText(/enter the 6-digit code we sent to/),
    ).toBeInTheDocument()
  },
}

/** Send code with no number: an inline error, announced, nothing is sent. */
export const MissingNumber: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await page(canvasElement).findByRole('button', { name: 'Send code' }),
    )
    await expect(
      await page(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Enter your mobile number.')
  },
}

/** Code step verified empty: asks for the 6 digits. */
export const CodeIncomplete: Story = {
  decorators: [
    withSession({
      me: storyMe({
        phoneVerified: true,
        pendingPhone: '+447700900456',
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await page(canvasElement).findByRole('button', { name: 'Verify' }),
    )
    // Announced, not just drawn.
    await expect(
      await page(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Enter the 6-digit code from your SMS.')
  },
}

/** Closed: nothing is rendered. */
export const Closed: Story = {
  args: { open: false },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(page(canvasElement).queryByRole('dialog')).toBeNull()
  },
}

/** Where the story's gaps are measured from: the number field and the pieces under it. */
async function phoneStepParts(canvasElement: HTMLElement, name: string) {
  const frame = await openDialog(canvasElement, name)
  const phone = fieldOf(frame.dialog, 'Mobile number')
  const note = within(phone).getByText(/UK mobile numbers only/)
  return { ...frame, phone, note }
}

/**
 * Add a number: the intro is the description (8 under the title), the field is
 * 24 below it, the UK note is its helper (4 under the field) and the field is
 * 20 above the buttons.
 */
async function expectAddNumberSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body, phone, note } =
    await phoneStepParts(canvasElement, 'Add contact phone number')
  const send = barButton(dialog, 'Send code')
  const shell = shellOf(phone)

  await expect(dialog).toHaveAccessibleDescription(
    /Enter your contact phone number/,
  )
  await expect(gapBelow(title, description as HTMLElement)).toBe(
    formSpace.titleToSubtitle,
  )
  await expect(gapBelow(description as HTMLElement, phone)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapBelow(labelOf(phone), shell)).toBe(formSpace.labelToControl)
  await expect(heightOf(shell)).toBe(formSpace.controlHeight)
  await expect(gapBelow(shell, note)).toBe(formSpace.controlToHelper)
  await expect(gapBelow(phone, send)).toBe(formSpace.bodyToAction)
  expectNoHorizontalOverflow(body)
}

/** Add a number: header 8 and 24, the note 4 under the field, 20 to the buttons. */
export const AddNumberSpacing: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: ({ canvasElement }) => expectAddNumberSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const AddNumberSpacingPhone: Story = {
  ...phone390,
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectAddNumberSpacing(canvasElement)
  },
}

/** Change a verified number: two fields 20 apart, each with its helper 4 under it. */
export const ChangeNumberSpacing: Story = {
  decorators: [
    withSession({
      me: storyMe({ phoneVerified: true, profile: { contactNumber: PHONE } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const { dialog, phone, note } = await phoneStepParts(
      canvasElement,
      'Change phone number',
    )
    const password = fieldOf(dialog, 'Current password')
    const passwordHelp = within(password).getByText(
      /Enter your Slashie password/,
    )
    const send = barButton(dialog, 'Send code')

    await expect(gapBelow(phone, password)).toBe(formSpace.fieldGap)
    await expect(gapBelow(shellOf(password), passwordHelp)).toBe(
      formSpace.controlToHelper,
    )
    await expect(heightOf(shellOf(password))).toBe(formSpace.controlHeight)
    await expect(note).toBeVisible()
    await expect(gapBelow(password, send)).toBe(formSpace.bodyToAction)
  },
}

/** A form-level error is one more field group: 20 under the last field, 20 above the buttons. */
export const PhoneErrorSpacing: Story = {
  decorators: [
    withSession({
      me: storyMe({ phoneVerified: true, profile: { contactNumber: PHONE } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.type(
      await page(canvasElement).findByLabelText('Mobile number'),
      '7700900456',
    )
    await userEvent.click(
      page(canvasElement).getByRole('button', { name: 'Send code' }),
    )
    const { dialog } = await openDialog(canvasElement, 'Change phone number')
    const error = await within(dialog).findByText(
      'Enter your current password.',
    )
    const password = fieldOf(dialog, 'Current password')
    const send = barButton(dialog, 'Send code')

    await expect(gapBelow(password, error)).toBe(formSpace.fieldGap)
    await expect(gapBelow(error, send)).toBe(formSpace.bodyToAction)
  },
}

const pendingMe = () =>
  storyMe({
    phoneVerified: true,
    pendingPhone: '+447700900456',
    profile: { contactNumber: PHONE },
  })

/**
 * The code step: the intro is the description, the six boxes are 24 below it
 * and 48 tall, the help line is 4 under them and 20 above the buttons.
 */
async function expectCodeSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Change phone number',
  )
  const first = within(dialog).getByLabelText('Digit 1 of 6')
  const last = within(dialog).getByLabelText('Digit 6 of 6')
  const help = within(dialog).getByText(/Codes are valid for 10 minutes/)
  const verify = barButton(dialog, 'Verify')

  await expect(dialog).toHaveAccessibleDescription(
    /enter the 6-digit code we sent to/,
  )
  await expect(gapBelow(title, description as HTMLElement)).toBe(
    formSpace.titleToSubtitle,
  )
  await expect(gapBelow(description as HTMLElement, first)).toBe(
    formSpace.headerToBody,
  )
  for (const cell of [first, last]) {
    await expect(heightOf(cell)).toBe(formSpace.controlHeight)
  }
  await expect(gapBelow(last, help)).toBe(formSpace.controlToHelper)
  await expect(gapBelow(help, verify)).toBe(formSpace.bodyToAction)
  // The boxes fit the dialog: nothing scrolls sideways.
  expectNoHorizontalOverflow(body)
}

/** Code step: description 8, the boxes 24 below it, the help 4 under them, 20 to the buttons. */
export const CodeSpacing: Story = {
  decorators: [withSession({ me: pendingMe() })],
  play: ({ canvasElement }) => expectCodeSpacing(canvasElement),
}

/** The same gaps at phone width, with all six boxes inside the dialog. */
export const CodeSpacingPhone: Story = {
  ...phone390,
  decorators: [withSession({ me: pendingMe() })],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectCodeSpacing(canvasElement)
    const { dialog } = await openDialog(canvasElement, 'Change phone number')
    const frame = dialog.getBoundingClientRect()
    for (const n of [1, 6]) {
      const cell = within(dialog)
        .getByLabelText(`Digit ${n} of 6`)
        .getBoundingClientRect()
      await expect(cell.left).toBeGreaterThanOrEqual(frame.left)
      await expect(cell.right).toBeLessThanOrEqual(frame.right)
    }
  },
}

/** An error on the code step: 20 under the help line, 20 above the buttons. */
export const CodeErrorSpacing: Story = {
  decorators: [withSession({ me: pendingMe() })],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await page(canvasElement).findByRole('button', { name: 'Verify' }),
    )
    const { dialog } = await openDialog(canvasElement, 'Change phone number')
    const error = await within(dialog).findByText(
      'Enter the 6-digit code from your SMS.',
    )
    const help = within(dialog).getByText(/Codes are valid for 10 minutes/)
    const verify = barButton(dialog, 'Verify')

    await expect(gapBelow(help, error)).toBe(formSpace.fieldGap)
    await expect(gapBelow(error, verify)).toBe(formSpace.bodyToAction)
  },
}
