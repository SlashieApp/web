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
