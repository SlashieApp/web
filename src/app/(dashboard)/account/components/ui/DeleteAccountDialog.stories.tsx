import { AccountDeletionBlockerKind, LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { isAppleAuthConfigured } from '@/app/(auth)/helpers/appleAuthConfig'
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
  gapsBetweenChildren,
  labelOf,
  openDialog,
  phone390,
  shellOf,
} from '../../../components/ui/dialogSpacing.testing'
import { DeleteAccountDialog } from './DeleteAccountDialog'

const me = storyMe()

/** One story-only session whose API answers `RequestAccountDeletion` as given. */
const api = (response?: StoryResponse) =>
  withSession({
    me,
    responses: response ? { RequestAccountDeletion: response } : undefined,
  })

const meta = {
  title: 'Dashboard/Account/DeleteAccountDialog',
  component: DeleteAccountDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    enabledLoginMethods: [LoginMethod.Password],
    reauthed: false,
  },
} satisfies Meta<typeof DeleteAccountDialog>

export default meta
type Story = StoryObj<typeof meta>

const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Types the password and presses Delete my account. */
async function confirmWithPassword(canvasElement: HTMLElement) {
  await userEvent.type(
    await page(canvasElement).findByLabelText('Your password'),
    'hunter2',
  )
  await userEvent.click(
    page(canvasElement).getByRole('button', { name: 'Delete my account' }),
  )
}

/** Password accounts confirm with their password: the button waits for one. */
export const PasswordAccount: Story = {
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('button', {
        name: 'Delete my account',
      }),
    ).toBeDisabled()
    await userEvent.type(
      page(canvasElement).getByLabelText('Your password'),
      'x',
    )
    await expect(
      page(canvasElement).getByRole('button', { name: 'Delete my account' }),
    ).toBeEnabled()
  },
}

/** Google-only: sign in again before confirming. */
export const GoogleOnly: Story = {
  args: { enabledLoginMethods: [LoginMethod.Google] },
  decorators: [api(), withAuthWidgets()],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByText(/sign in again first/),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByRole('button', { name: 'Delete my account' }),
    ).toBeDisabled()
  },
}

/** Apple-only: the same re-sign-in step with Apple's button. */
export const AppleOnly: Story = {
  args: { enabledLoginMethods: [LoginMethod.Apple] },
  decorators: [api(), withAuthWidgets()],
  play: async ({ canvasElement }) => {
    // Apple's button only renders when a Services ID is configured.
    if (!isAppleAuthConfigured()) return
    await expect(
      await page(canvasElement).findByRole('button', {
        name: 'Continue with Apple',
      }),
    ).toBeInTheDocument()
  },
}

/** Back from the Google re-auth: ready to confirm. */
export const GoogleReauthed: Story = {
  args: { enabledLoginMethods: [LoginMethod.Google], reauthed: true },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByText(/You can confirm now/),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByRole('button', { name: 'Delete my account' }),
    ).toBeEnabled()
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

/** Confirmed and waiting for the API: the button is busy. */
export const Deleting: Story = {
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await confirmWithPassword(canvasElement)
    await waitFor(() =>
      expect(
        canvasElement.ownerDocument.querySelector('button[data-loading]'),
      ).toBeDisabled(),
    )
  },
}

/** The password is wrong: an inline error on the field. */
export const WrongPassword: Story = {
  decorators: [api({ kind: 'graphqlError', code: 'INVALID_CREDENTIALS' })],
  play: async ({ canvasElement }) => {
    await confirmWithPassword(canvasElement)
    await expect(
      await page(canvasElement).findByText("That password isn't right."),
    ).toBeInTheDocument()
  },
}

/** An active booking blocks deletion: an alert with a link to My tasks. */
export const LiveOrders: Story = {
  decorators: [api({ kind: 'graphqlError', code: 'ACCOUNT_HAS_LIVE_ORDERS' })],
  play: async ({ canvasElement }) => {
    await confirmWithPassword(canvasElement)
    const alert = await page(canvasElement).findByRole('alert')
    await expect(alert).toHaveTextContent('You have an active booking')
    await expect(
      within(alert).getByRole('link', { name: 'Go to My tasks' }),
    ).toBeInTheDocument()
  },
}

/** Signed in again more than 10 minutes ago: the sign-in step comes back. */
export const ReauthExpired: Story = {
  args: { enabledLoginMethods: [LoginMethod.Google], reauthed: true },
  decorators: [
    api({ kind: 'graphqlError', code: 'REAUTH_REQUIRED' }),
    withAuthWidgets(),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await page(canvasElement).findByRole('button', {
        name: 'Delete my account',
      }),
    )
    await expect(
      await page(canvasElement).findByRole('alert'),
    ).toHaveTextContent('more than 10 minutes ago')
    await expect(
      page(canvasElement).getByText(/sign in again first/),
    ).toBeInTheDocument()
  },
}

/** Live bookings (`me.deletionBlockers`): links to each, no delete button, no API call. */
export const BlockedByLiveBookings: Story = {
  args: {
    deletionBlockers: [
      {
        kind: AccountDeletionBlockerKind.LiveOrder,
        orderId: 'order-1',
        taskId: 'task-1',
      },
      {
        kind: AccountDeletionBlockerKind.LiveOrder,
        orderId: 'order-2',
        taskId: 'task-2',
      },
    ],
  },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    const dialog = await page(canvasElement).findByRole('dialog', {
      name: 'Finish your live bookings first',
    })
    await expect(
      within(dialog).getByRole('link', { name: 'Booking 1' }),
    ).toHaveAttribute('href', '/tasks/task-1#task-order')
    await expect(
      within(dialog).getByRole('link', { name: 'Booking 2' }),
    ).toHaveAttribute('href', '/tasks/task-2#task-order')
    await expect(
      within(dialog).queryByRole('button', { name: 'Delete my account' }),
    ).toBeNull()
  },
}

const BLOCKERS = [
  {
    kind: AccountDeletionBlockerKind.LiveOrder,
    orderId: 'order-1',
    taskId: 'task-1',
  },
  {
    kind: AccountDeletionBlockerKind.LiveOrder,
    orderId: 'order-2',
    taskId: 'task-2',
  },
  {
    kind: AccountDeletionBlockerKind.LiveOrder,
    orderId: 'order-3',
    taskId: 'task-3',
  },
]

/**
 * The lead-in and its list are one block: the sentence 8 above the list, the
 * items 8 apart, with dot bullets. The block is the first thing in the body, 24
 * under the title (there is no description: the sentence introduces the list).
 */
async function expectLeadInList(
  dialog: HTMLElement,
  title: HTMLElement,
  lead: string,
  items: number,
) {
  const sentence = within(dialog).getByText(lead)
  const list = dialog.querySelector('ul') as HTMLElement

  await expect(gapBelow(title, sentence)).toBe(formSpace.headerToBody)
  await expect(gapBelow(sentence, list)).toBe(formSpace.labelToControl)
  await expect(list.children).toHaveLength(items)
  for (const gap of gapsBetweenChildren(list)) {
    await expect(gap).toBe(formSpace.labelToControl)
  }
  // Dot bullets still draw: the items are list items in a list with a disc.
  await expect(getComputedStyle(list).listStyleType).toBe('disc')
  for (const item of list.children) {
    await expect(getComputedStyle(item).display).toBe('list-item')
  }
  return { sentence, list }
}

/**
 * Password account: the lead-in and bullets, then the password field 20 below
 * the list (label 8, helper 4), and the field 20 above the buttons.
 */
async function expectDeletePasswordSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Delete your account?',
  )
  await expect(description).toBeNull()
  const { list } = await expectLeadInList(
    dialog,
    title,
    'Here is what happens:',
    4,
  )
  const field = fieldOf(dialog, 'Your password')
  const helper = within(field).getByText(
    "Enter your password to confirm it's you.",
  )
  const confirm = barButton(dialog, 'Delete my account')

  await expect(gapBelow(list, field)).toBe(formSpace.fieldGap)
  await expect(gapBelow(labelOf(field), shellOf(field))).toBe(
    formSpace.labelToControl,
  )
  await expect(heightOf(shellOf(field))).toBe(formSpace.controlHeight)
  await expect(gapBelow(shellOf(field), helper)).toBe(formSpace.controlToHelper)
  await expect(gapBelow(field, confirm)).toBe(formSpace.bodyToAction)
  expectNoHorizontalOverflow(body)
}

/** Password account: block 24 under the title, the field 20 under the list, 20 to the buttons. */
export const PasswordSpacing: Story = {
  decorators: [api()],
  play: ({ canvasElement }) => expectDeletePasswordSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const PasswordSpacingPhone: Story = {
  ...phone390,
  decorators: [api()],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectDeletePasswordSpacing(canvasElement)
  },
}

/** A wrong password: the error is 4 under the helper, and the field is still 20 above the buttons. */
export const WrongPasswordSpacing: Story = {
  decorators: [api({ kind: 'graphqlError', code: 'INVALID_CREDENTIALS' })],
  play: async ({ canvasElement }) => {
    await confirmWithPassword(canvasElement)
    const { dialog } = await openDialog(canvasElement, 'Delete your account?')
    const field = fieldOf(dialog, 'Your password')
    const helper = within(field).getByText(
      "Enter your password to confirm it's you.",
    )
    const error = await within(field).findByText("That password isn't right.")

    await expect(gapBelow(helper, error)).toBe(formSpace.helperGap)
    await expect(gapBelow(field, barButton(dialog, 'Delete my account'))).toBe(
      formSpace.bodyToAction,
    )
  },
}

/** The alert box (an active booking) is one more field group: 20 under the field, 20 above the buttons. */
export const LiveOrdersSpacing: Story = {
  decorators: [api({ kind: 'graphqlError', code: 'ACCOUNT_HAS_LIVE_ORDERS' })],
  play: async ({ canvasElement }) => {
    await confirmWithPassword(canvasElement)
    const { dialog } = await openDialog(canvasElement, 'Delete your account?')
    const alert = await within(dialog).findByRole('alert')
    const field = fieldOf(dialog, 'Your password')

    await expect(gapBelow(field, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, barButton(dialog, 'Delete my account'))).toBe(
      formSpace.bodyToAction,
    )
  },
}

/**
 * Google and Apple only: the sentence is 20 under the list and 8 above Google,
 * Google and Apple are 8 apart and 48 tall, and Apple is 20 above the buttons.
 */
export const ReauthSpacing: Story = {
  args: {
    enabledLoginMethods: [LoginMethod.Google, LoginMethod.Apple],
  },
  decorators: [api(), withAuthWidgets()],
  play: async ({ canvasElement }) => {
    const { dialog, title } = await openDialog(
      canvasElement,
      'Delete your account?',
    )
    const { list } = await expectLeadInList(
      dialog,
      title,
      'Here is what happens:',
      4,
    )
    const block = await expectReauthPrompt(dialog, /sign in again first/)
    if (!block) return
    await expect(gapBelow(list, block.text)).toBe(formSpace.fieldGap)
    await expect(
      gapBelow(block.apple, barButton(dialog, 'Delete my account')),
    ).toBe(formSpace.bodyToAction)
  },
}

/** The same on a phone: Google's button is as wide as Apple's, and neither spills out of the dialog. */
export const ReauthSpacingPhone: Story = {
  ...phone390,
  args: {
    enabledLoginMethods: [LoginMethod.Google, LoginMethod.Apple],
  },
  decorators: [api(), withAuthWidgets()],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    const { dialog, body } = await openDialog(
      canvasElement,
      'Delete your account?',
    )
    await expectReauthPrompt(dialog, /sign in again first/)
    expectNoHorizontalOverflow(body)
  },
}

/** Back from the re-auth: the thanks line is 20 under the list and 20 above the buttons. */
export const ReauthedSpacing: Story = {
  args: { enabledLoginMethods: [LoginMethod.Google], reauthed: true },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, 'Delete your account?')
    const list = dialog.querySelector('ul') as HTMLElement
    const thanks = within(dialog).getByText(/You can confirm now/)

    await expect(gapBelow(list, thanks)).toBe(formSpace.fieldGap)
    await expect(gapBelow(thanks, barButton(dialog, 'Delete my account'))).toBe(
      formSpace.bodyToAction,
    )
  },
}

/** Live bookings: the lead-in 24 under the title, the links 8 apart, the last 20 above Close. */
export const BlockedSpacing: Story = {
  args: { deletionBlockers: BLOCKERS },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    const { dialog, title, description } = await openDialog(
      canvasElement,
      'Finish your live bookings first',
    )
    await expect(description).toBeNull()
    const { list } = await expectLeadInList(
      dialog,
      title,
      'You can delete your account once these bookings are done or cancelled:',
      3,
    )
    await expect(gapBelow(list, barButton(dialog, 'Close'))).toBe(
      formSpace.bodyToAction,
    )
  },
}
