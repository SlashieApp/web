import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  type StoryResponse,
  withAuthWidgets,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import {
  barButton,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  expectReauthPrompt,
  fieldOf,
  labelOf,
  openDialog,
  phone320Short,
  phone390,
  shellOf,
} from '../../../components/ui/dialogSpacing.testing'
import { AccountPasswordDialog } from './AccountPasswordDialog'

/** A story-only session whose API answers the password mutations as given. */
const api = (responses: Record<string, StoryResponse> = {}) =>
  withSession({ me: storyMe(), responses })

const meta = {
  title: 'Dashboard/Account/AccountPasswordDialog',
  component: AccountPasswordDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    mode: 'change',
    email: 'sam.carter@example.com',
    enabledLoginMethods: [LoginMethod.Password],
  },
} satisfies Meta<typeof AccountPasswordDialog>

export default meta
type Story = StoryObj<typeof meta>

const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Fills the form and presses Save password. */
async function save(
  canvasElement: HTMLElement,
  values: { current?: string; next: string; confirm?: string },
) {
  const body = page(canvasElement)
  if (values.current !== undefined) {
    await userEvent.type(
      await body.findByLabelText('Current password'),
      values.current,
    )
  }
  await userEvent.type(await body.findByLabelText('New password'), values.next)
  await userEvent.type(
    body.getByLabelText('Confirm new password'),
    values.confirm ?? values.next,
  )
  await userEvent.click(body.getByRole('button', { name: 'Save password' }))
}

/**
 * Saving a change ends every other session and hands this device a new token,
 * which replaces the old one in the cookie (BE-102).
 */
export const ChangeKeepsThisDeviceSignedIn: Story = {
  decorators: [
    api({
      ChangePassword: {
        kind: 'data',
        data: {
          changePassword: {
            token: 'story-token-after-change',
            user: {
              id: 'story-me',
              enabledLoginMethods: [LoginMethod.Password],
            },
          },
        },
      },
    }),
  ],
  play: async ({ canvasElement, args }) => {
    await save(canvasElement, { current: 'old-password', next: 'new-password' })
    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
    await expect(canvasElement.ownerDocument.cookie).toContain(
      'auth=story-token-after-change',
    )
  },
}

/** Password account: current password, then the new one twice. */
export const Change: Story = {
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('dialog', {
        name: 'Change your password',
      }),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByLabelText('Current password'),
    ).toBeInTheDocument()
  },
}

/** Too short and not matching: the form stops before the API. */
export const ChangeInvalid: Story = {
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await save(canvasElement, { current: 'old', next: 'short', confirm: 'x' })
    await expect(
      await page(canvasElement).findByText('Use at least 8 characters.'),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByText("The passwords don't match."),
    ).toBeInTheDocument()
  },
}

/** The current password is wrong. */
export const ChangeWrongCurrent: Story = {
  decorators: [
    api({
      ChangePassword: { kind: 'graphqlError', code: 'INVALID_CREDENTIALS' },
    }),
  ],
  play: async ({ canvasElement }) => {
    await save(canvasElement, {
      current: 'wrong-password',
      next: 'new-password',
    })
    await expect(
      await page(canvasElement).findByRole('alert'),
    ).toHaveTextContent("Your current password isn't right.")
  },
}

/** Google-only account: no current password, a first one is set. */
export const SetFirst: Story = {
  args: { mode: 'set', enabledLoginMethods: [LoginMethod.Google] },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('dialog', {
        name: 'Set a password',
      }),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).queryByLabelText('Current password'),
    ).toBeNull()
  },
}

/** The last sign-in is too old: sign in again with Google, then save. */
export const SetNeedsReauth: Story = {
  args: { mode: 'set', enabledLoginMethods: [LoginMethod.Google] },
  decorators: [
    api({ SetPassword: { kind: 'graphqlError', code: 'REAUTH_REQUIRED' } }),
    withAuthWidgets(),
  ],
  play: async ({ canvasElement }) => {
    await save(canvasElement, { next: 'new-password' })
    await expect(
      await page(canvasElement).findByText(/sign in again first/),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByRole('button', { name: 'Save password' }),
    ).toBeDisabled()
  },
}

/** Back from the re-auth: ready to save. */
export const SetReauthed: Story = {
  args: {
    mode: 'set',
    enabledLoginMethods: [LoginMethod.Google],
    reauthed: true,
  },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByText(/You can save your password now/),
    ).toBeInTheDocument()
  },
}

/** Closed: nothing is rendered. */
export const Closed: Story = {
  args: { open: false },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await expect(page(canvasElement).queryByRole('dialog')).toBeNull()
  },
}

/**
 * Change: no description, so the first field is 24 under the title. Fields are
 * 20 apart, the hint is 4 under its field, and the last field is 20 above the
 * buttons; fields are 48 tall.
 */
async function expectChangeSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Change your password',
  )
  const current = fieldOf(dialog, 'Current password')
  const next = fieldOf(dialog, 'New password')
  const confirm = fieldOf(dialog, 'Confirm new password')
  const hint = within(next).getByText('At least 8 characters.')
  const save = barButton(dialog, 'Save password')

  await expect(description).toBeNull()
  await expect(gapBelow(title, current)).toBe(formSpace.headerToBody)
  await expect(gapBelow(current, next)).toBe(formSpace.fieldGap)
  await expect(gapBelow(next, confirm)).toBe(formSpace.fieldGap)
  await expect(gapBelow(confirm, save)).toBe(formSpace.bodyToAction)
  await expect(gapBelow(shellOf(next), hint)).toBe(formSpace.controlToHelper)
  for (const field of [current, next, confirm]) {
    await expect(gapBelow(labelOf(field), shellOf(field))).toBe(
      formSpace.labelToControl,
    )
    await expect(heightOf(shellOf(field))).toBe(formSpace.controlHeight)
  }
  expectNoHorizontalOverflow(body)
}

/** Change: first field 24 under the title, fields 20 apart, 20 to the buttons. */
export const ChangeSpacing: Story = {
  decorators: [api()],
  play: ({ canvasElement }) => expectChangeSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const ChangeSpacingPhone: Story = {
  ...phone390,
  decorators: [api()],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectChangeSpacing(canvasElement)
  },
}

/** Hint and error under one field: 4 under the control, 4 apart, then 20 to the next field. */
export const ChangeErrorSpacing: Story = {
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await save(canvasElement, { current: 'old', next: 'short', confirm: 'x' })
    const { dialog } = await openDialog(canvasElement, 'Change your password')
    const next = fieldOf(dialog, 'New password')
    const confirm = fieldOf(dialog, 'Confirm new password')
    const hint = within(next).getByText('At least 8 characters.')
    const error = await within(next).findByText('Use at least 8 characters.')
    const mismatch = within(confirm).getByText("The passwords don't match.")

    await expect(gapBelow(shellOf(next), hint)).toBe(formSpace.controlToHelper)
    await expect(gapBelow(hint, error)).toBe(formSpace.helperGap)
    await expect(gapBelow(next, confirm)).toBe(formSpace.fieldGap)
    await expect(gapBelow(shellOf(confirm), mismatch)).toBe(
      formSpace.controlToHelper,
    )
  },
}

/** A form-level error (the API said no): one more field group, 20 under the last field. */
export const ChangeFormErrorSpacing: Story = {
  decorators: [
    api({
      ChangePassword: { kind: 'graphqlError', code: 'INVALID_CREDENTIALS' },
    }),
  ],
  play: async ({ canvasElement }) => {
    await save(canvasElement, { current: 'wrong', next: 'new-password' })
    const { dialog } = await openDialog(canvasElement, 'Change your password')
    const alert = await within(dialog).findByRole('alert')
    const confirm = fieldOf(dialog, 'Confirm new password')
    const button = barButton(dialog, 'Save password')

    await expect(gapBelow(confirm, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, button)).toBe(formSpace.bodyToAction)
  },
}

/** Set: the intro is the description (8 under the title), the first field 24 below it. */
export const SetSpacing: Story = {
  args: { mode: 'set', enabledLoginMethods: [LoginMethod.Google] },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    const { dialog, title, description } = await openDialog(
      canvasElement,
      'Set a password',
    )
    const next = fieldOf(dialog, 'New password')
    const confirm = fieldOf(dialog, 'Confirm new password')
    const button = barButton(dialog, 'Save password')

    await expect(dialog).toHaveAccessibleDescription(
      'Add a password so you can also sign in with sam.carter@example.com.',
    )
    await expect(gapBelow(title, description as HTMLElement)).toBe(
      formSpace.titleToSubtitle,
    )
    await expect(gapBelow(description as HTMLElement, next)).toBe(
      formSpace.headerToBody,
    )
    await expect(gapBelow(next, confirm)).toBe(formSpace.fieldGap)
    await expect(gapBelow(confirm, button)).toBe(formSpace.bodyToAction)
  },
}

/**
 * Sign in again: the error is 20 under the last field, the re-auth block 20
 * under it. In the block the sentence is 8 above Google, Google and Apple are 8
 * apart and 48 tall, and Apple is 20 above the buttons.
 */
export const SetReauthSpacing: Story = {
  args: {
    mode: 'set',
    enabledLoginMethods: [LoginMethod.Google, LoginMethod.Apple],
  },
  decorators: [
    api({ SetPassword: { kind: 'graphqlError', code: 'REAUTH_REQUIRED' } }),
    withAuthWidgets(),
  ],
  play: async ({ canvasElement }) => {
    await save(canvasElement, { next: 'new-password' })
    const { dialog } = await openDialog(canvasElement, 'Set a password')
    const alert = await within(dialog).findByRole('alert')
    const confirm = fieldOf(dialog, 'Confirm new password')
    const button = barButton(dialog, 'Save password')

    await expect(gapBelow(confirm, alert)).toBe(formSpace.fieldGap)
    const block = await expectReauthPrompt(dialog, /sign in again first/)
    if (!block) return
    await expect(gapBelow(alert, block.text)).toBe(formSpace.fieldGap)
    await expect(gapBelow(block.apple, button)).toBe(formSpace.bodyToAction)
  },
}

/**
 * The same re-auth on a 320 by 640 phone: the body is taller than the room
 * between the header and the two-row bar, so it scrolls under the bar. The bar
 * shows a hairline while there is more below (the Apple button is cut by it at
 * the top of the scroll), and at the end of the scroll the line is gone and
 * Apple is 20 above the buttons, whole.
 */
export const SetReauthScrollsAt320: Story = {
  ...phone320Short,
  args: {
    mode: 'set',
    enabledLoginMethods: [LoginMethod.Google, LoginMethod.Apple],
  },
  decorators: [
    api({ SetPassword: { kind: 'graphqlError', code: 'REAUTH_REQUIRED' } }),
    withAuthWidgets(),
  ],
  play: async ({ canvasElement }) => {
    await expect(canvasElement.ownerDocument.defaultView?.innerWidth).toBe(320)
    await save(canvasElement, { next: 'new-password' })
    const { dialog, body, footer } = await openDialog(
      canvasElement,
      'Set a password',
    )
    const block = await expectReauthPrompt(dialog, /sign in again first/)
    if (!block) return
    const bar = footer as HTMLElement
    const edge = () => getComputedStyle(bar).boxShadow
    const button = barButton(dialog, 'Save password')

    // The body scrolls, and says so: more is below.
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
    await waitFor(() => expect(edge()).not.toBe('none'))

    body.scrollTop = body.scrollHeight
    await waitFor(() => expect(edge()).toBe('none'))
    // At the end nothing is under the bar: Apple is whole, 20 above it (the
    // scroll lands on a fraction of a pixel).
    const gap = gapBelow(block.apple, button)
    await expect(gap).toBeGreaterThanOrEqual(formSpace.bodyToAction - 1)
    await expect(gap).toBeLessThanOrEqual(formSpace.bodyToAction + 1)
    expectNoHorizontalOverflow(body)
  },
}

/** Back from the re-auth: the thanks line is 20 under the last field, 20 above the buttons. */
export const SetReauthedSpacing: Story = {
  args: {
    mode: 'set',
    enabledLoginMethods: [LoginMethod.Google],
    reauthed: true,
  },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, 'Set a password')
    const thanks = within(dialog).getByText(/You can save your password now/)
    const confirm = fieldOf(dialog, 'Confirm new password')
    const button = barButton(dialog, 'Save password')

    await expect(gapBelow(confirm, thanks)).toBe(formSpace.fieldGap)
    await expect(gapBelow(thanks, button)).toBe(formSpace.bodyToAction)
  },
}
