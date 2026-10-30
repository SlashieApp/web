import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { expectRingHugsLabel } from '@/app/(auth)/helpers/authSpacing.testing'
import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { formSpace, minHitArea } from '@/theme/styles'
import { gapBelow, heightOf, hitExtent } from '@/ui/FormField/formGap.testing'

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
    // It is Current password's own error.
    await expect(
      page(canvasElement).getByLabelText('Current password'),
    ).toBeInvalid()
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

/**
 * Send code with no number: Mobile number's own error, the field marked
 * invalid and described by it, focus in the field, nothing is sent.
 */
export const MissingNumber: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await page(canvasElement).findByRole('button', { name: 'Send code' }),
    )
    const input = await page(canvasElement).findByLabelText('Mobile number')
    const error = await page(canvasElement).findByText(
      'Enter your mobile number.',
    )
    await expect(input).toBeInvalid()
    await expect(input).toHaveAccessibleDescription(/Enter your mobile number/)
    await waitFor(() => expect(input).toHaveFocus())
    // The field's own error is the alert (announced as it appears), and the
    // only one: no form-level alert next to it.
    await expect(page(canvasElement).queryAllByRole('alert')).toEqual([error])
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
    // Announced, not just drawn: the error is the code's own line, the group
    // is named by the dialog's lead-in and described by its help and error,
    // every box is invalid and focus is back in the first one.
    const error = await page(canvasElement).findByRole('alert')
    await expect(error).toHaveTextContent(
      'Enter the 6-digit code from your SMS.',
    )
    const group = page(canvasElement).getByRole('group', {
      name: /enter the 6-digit code we sent to/,
    })
    await expect(group).toHaveAccessibleDescription(
      /Codes are valid for 10 minutes.*Enter the 6-digit code from your SMS/,
    )
    await expect(group).not.toHaveAttribute('aria-invalid')
    for (const n of [1, 6]) {
      await expect(
        within(group).getByLabelText(`Digit ${n} of 6`),
      ).toBeInvalid()
    }
    await waitFor(() =>
      expect(within(group).getByLabelText('Digit 1 of 6')).toHaveFocus(),
    )
  },
}

/** The code step names its group even with no error. */
export const CodeGroupIsNamed: Story = {
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
    const group = await page(canvasElement).findByRole('group', {
      name: /enter the 6-digit code we sent to/,
    })
    await expect(group).toHaveAccessibleDescription(
      /Codes are valid for 10 minutes/,
    )
    await expect(within(group).getByLabelText('Digit 1 of 6')).not.toBeInvalid()
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

/**
 * A field's error is part of its field: 4 under the helper (the helper is 4
 * under the control), then 20 to the buttons below the last field.
 */
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
    const help = within(password).getByText(/Enter your Slashie password/)
    const send = barButton(dialog, 'Send code')

    await expect(gapBelow(help, error)).toBe(formSpace.helperGap)
    await expect(gapBelow(password, send)).toBe(formSpace.bodyToAction)
  },
}

/**
 * A failed request is one more field group: 20 under the last field, 20 above
 * the buttons, announced as an alert.
 */
export const RequestErrorSpacing: Story = {
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
    await userEvent.click(
      page(canvasElement).getByRole('button', { name: 'Send code' }),
    )
    const { dialog } = await openDialog(canvasElement, 'Change phone number')
    const alert = await within(dialog).findByRole('alert')
    const phone = fieldOf(dialog, 'Mobile number')
    const send = barButton(dialog, 'Send code')

    await expect(gapBelow(phone, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, send)).toBe(formSpace.bodyToAction)
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

/** The six boxes' widths, and the dialog frame they have to sit inside. */
function codeCells(dialog: HTMLElement) {
  const cells = [1, 2, 3, 4, 5, 6].map((n) =>
    within(dialog).getByLabelText(`Digit ${n} of 6`).getBoundingClientRect(),
  )
  return { cells, frame: dialog.getBoundingClientRect() }
}

/** Every box is in the dialog, as wide as the others, and no wider than 44. */
async function expectBoxesFit(dialog: HTMLElement, width?: number) {
  const { cells, frame } = codeCells(dialog)
  for (const cell of cells) {
    await expect(cell.left).toBeGreaterThanOrEqual(frame.left)
    await expect(cell.right).toBeLessThanOrEqual(frame.right)
    await expect(Math.round(cell.width * 100)).toBe(
      Math.round(cells[0].width * 100),
    )
    await expect(cell.width).toBeLessThanOrEqual(44)
    if (width !== undefined) await expect(cell.width).toBe(width)
  }
  return cells[0].width
}

/** The same gaps at phone width, with all six boxes inside the dialog and 44 wide (there is room). */
export const CodeSpacingPhone: Story = {
  ...phone390,
  decorators: [withSession({ me: pendingMe() })],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectCodeSpacing(canvasElement)
    const { dialog } = await openDialog(canvasElement, 'Change phone number')
    await expectBoxesFit(dialog, 44)
  },
}

/** Wide: 44 wide each, as documented. */
export const CodeBoxesWide: Story = {
  decorators: [withSession({ me: pendingMe() })],
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, 'Change phone number')
    await expectBoxesFit(dialog, 44)
  },
}

/**
 * At 320 wide (a small phone, or 400% zoom) the dialog has 248 for the boxes:
 * they shrink together to the largest that fits, both outer boxes inside the
 * frame (they were 40 wide and 8 and 9 outside it). Where it is wide enough
 * they are 44 (the 390 and wide stories); at 320 they are the largest that
 * fits, and the gaps and everything under them are unchanged.
 */
export const CodeSpacingPhone320: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withSession({ me: pendingMe() })],
  play: async ({ canvasElement }) => {
    await expect(canvasElement.ownerDocument.defaultView?.innerWidth).toBe(320)
    await expectCodeSpacing(canvasElement)
    const { dialog } = await openDialog(canvasElement, 'Change phone number')
    const width = await expectBoxesFit(dialog)
    // The largest that fits: wider than the old clipped 40, narrower than 44.
    await expect(width).toBeGreaterThan(34)
    await expect(width).toBeLessThan(44)
  },
}

/**
 * An error on the code step is the code's own line: 4 under the help line
 * (the help is 4 under the boxes), then 20 above the buttons.
 */
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

    await expect(gapBelow(help, error)).toBe(formSpace.helperGap)
    await expect(gapBelow(error, verify)).toBe(formSpace.bodyToAction)
    await expect(heightOf(error)).toBe(16)
  },
}

/**
 * A change waiting for its code, on an account with no password: a resend runs
 * with nothing to ask for (with a password it asks for it first).
 */
const resendMe = () =>
  storyMe({
    phoneVerified: true,
    pendingPhone: '+447700900456',
    enabledLoginMethods: [LoginMethod.Google],
    profile: { contactNumber: PHONE },
  })

/** The code step's resend control and the help sentence it ends. */
async function resendParts(canvasElement: HTMLElement) {
  const { dialog } = await openDialog(canvasElement, 'Change phone number')
  const resend = within(dialog).getByRole('button', {
    name: 'Request a resend',
  })
  return {
    dialog,
    resend,
    help: within(dialog).getByText(/Codes are valid for 10 minutes/),
    label: resend.querySelector('[data-hit-area-label]') as HTMLElement,
    last: within(dialog).getByLabelText('Digit 6 of 6'),
    verify: barButton(dialog, 'Verify'),
  }
}

/** The colour the link role has, read off a probe so the check follows the token. */
function linkColour(dialog: HTMLElement) {
  const probe = dialog.ownerDocument.createElement('span')
  probe.style.color = 'var(--chakra-colors-text-link)'
  dialog.append(probe)
  const colour = getComputedStyle(probe).color
  probe.remove()
  return colour
}

/**
 * "Request a resend" is a link, not more help text: the link colour (the sentence
 * is muted), medium weight, 44 to press with no space added (4 into the gap
 * above, the rest down toward the buttons) and a keyboard ring that hugs the
 * text. The help line is still 20 tall, 4 under the boxes and 20 above the bar.
 */
export const ResendIsALink: Story = {
  decorators: [withSession({ me: resendMe() })],
  play: async ({ canvasElement }) => {
    const { dialog, resend, help, label, last, verify } =
      await resendParts(canvasElement)

    await expect(getComputedStyle(resend).color).toBe(linkColour(dialog))
    await expect(getComputedStyle(resend).color).not.toBe(
      getComputedStyle(help).color,
    )
    await expect(getComputedStyle(resend).fontWeight).toBe('500')
    await expect(resend).not.toHaveAttribute('aria-disabled')

    // Nothing added to the layout: each line is the help's 20, the gaps are the spec's.
    await expect(heightOf(label)).toBe(20)
    await expect(heightOf(help) % 20).toBe(0)
    await expect(gapBelow(last, help)).toBe(formSpace.controlToHelper)
    await expect(gapBelow(help, verify)).toBe(formSpace.bodyToAction)

    // Pressed anywhere in a 44px column: 4 above the line, 20 below it (the
    // scan steps in whole pixels, the layout may sit on a fraction).
    const reach = hitExtent(resend)
    const text = label.getBoundingClientRect()
    await expect(reach.height).toBe(minHitArea)
    await expect(
      Math.abs(text.top - reach.top - formSpace.controlToHelper),
    ).toBeLessThanOrEqual(1)
    await expect(
      Math.abs(
        reach.bottom +
          1 -
          text.bottom -
          (minHitArea - 20 - formSpace.controlToHelper),
      ),
    ).toBeLessThanOrEqual(1)
    // It stops at the bar and does not reach the boxes.
    await expect(reach.top).toBeGreaterThanOrEqual(
      Math.floor(last.getBoundingClientRect().bottom),
    )
    await expect(reach.bottom + 1).toBeLessThanOrEqual(
      Math.ceil(verify.getBoundingClientRect().top),
    )

    await expectRingHugsLabel(resend)
  },
}

/** The same at phone width, where the sentence wraps and the link may sit on the second line. */
export const ResendIsALinkPhone: Story = {
  ...phone390,
  decorators: [withSession({ me: resendMe() })],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    const { resend, help, label, last, verify } =
      await resendParts(canvasElement)
    await expect(heightOf(label)).toBe(20)
    // However many lines the sentence takes, each is 20.
    await expect(heightOf(help) % 20).toBe(0)
    await expect(gapBelow(last, help)).toBe(formSpace.controlToHelper)
    await expect(gapBelow(help, verify)).toBe(formSpace.bodyToAction)
    await expect(hitExtent(resend).height).toBe(minHitArea)
    await expectRingHugsLabel(resend)
  },
}

/** A resend that is sending says so: aria-disabled, muted, no second request. */
export const ResendWhileSending: Story = {
  // No answer for SendPhoneVerification: the request stays pending.
  decorators: [withSession({ me: resendMe() })],
  play: async ({ canvasElement }) => {
    const { dialog, resend } = await resendParts(canvasElement)
    await userEvent.click(resend)
    await waitFor(() => expect(resend).toHaveAttribute('aria-disabled', 'true'))
    await expect(getComputedStyle(resend).color).not.toBe(linkColour(dialog))
    await expect(getComputedStyle(resend).cursor).toBe('not-allowed')
    // Still a stop in the tab order: it says why it does nothing.
    await expect(resend).not.toBeDisabled()
  },
}

/** Rate limited: the same, and pressing it again sends nothing. */
export const ResendRateLimited: Story = {
  decorators: [
    withSession({
      me: resendMe(),
      responses: {
        SendPhoneVerification: {
          kind: 'graphqlError',
          code: 'PHONE_VERIFICATION_RATE_LIMITED',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const { dialog, resend } = await resendParts(canvasElement)
    await expect(resend).not.toHaveAttribute('aria-disabled')
    await userEvent.click(resend)
    await waitFor(() => expect(resend).toHaveAttribute('aria-disabled', 'true'))
    await expect(getComputedStyle(resend).color).not.toBe(linkColour(dialog))
    // An error says why (the request failed); pressing the link again changes nothing.
    const alert = await within(dialog).findByRole('alert')
    const message = alert.textContent
    await userEvent.click(resend)
    await expect(within(dialog).getByRole('alert').textContent).toBe(message)
    await expect(resend).toHaveAttribute('aria-disabled', 'true')
  },
}
