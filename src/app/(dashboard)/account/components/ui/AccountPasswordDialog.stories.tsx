import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  type StoryResponse,
  withAuthWidgets,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

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
