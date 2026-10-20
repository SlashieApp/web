import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe, storyWorkerMe } from '@/app/(auth)/helpers/authStoryFixtures'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { AccountScreen } from './AccountScreen'
import { STORY_VAPID_KEY, seedVapidKey } from './accountStoryFixtures'

const session = (me: MeSnapshot) =>
  withSession({ me, seed: seedVapidKey(STORY_VAPID_KEY) })

const meta = {
  title: 'Dashboard/Account/AccountScreen',
  component: AccountScreen,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/account' } },
  },
} satisfies Meta<typeof AccountScreen>

export default meta
type Story = StoryObj<typeof meta>

/** `password`: Contact, Sign-in with Change password, Notifications, Delete. */
export const Password: Story = {
  decorators: [session(storyMe())],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { level: 1, name: 'Account' }),
    ).toBeVisible()
    for (const section of [
      'Contact',
      'Sign-in and security',
      'Notifications and language',
      'Delete account',
    ]) {
      await expect(
        canvas.getByRole('heading', { level: 2, name: section }),
      ).toBeVisible()
    }
    await expect(
      canvas.getByRole('button', { name: 'Change password' }),
    ).toBeVisible()
    await expect(canvas.getByText('Email and password')).toBeVisible()
    await expect(
      canvas.getByText(
        'Sign in with sam.carter@example.com and your password.',
      ),
    ).toBeVisible()
    await expect(canvas.getAllByText('Not linked')).toHaveLength(2)
  },
}

/** Password plus a linked Google and an Apple Hide My Email relay: both offer Unlink. */
export const ProvidersLinked: Story = {
  decorators: [
    session(
      storyMe({
        enabledLoginMethods: [
          LoginMethod.Password,
          LoginMethod.Google,
          LoginMethod.Apple,
        ],
        googleLoginEmail: 'sam.personal@gmail.com',
        appleLoginEmail: 'x7k2p9@privaterelay.appleid.com',
      }),
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Linked as sam.personal@gmail.com'),
    ).toBeVisible()
    await expect(
      canvas.getByText('Linked as x7k2p9@privaterelay.appleid.com'),
    ).toBeVisible()
    await expect(
      canvas.getAllByRole('button', { name: 'Unlink' }),
    ).toHaveLength(2)
  },
}

/** A worker sees the same page: no plan card or quota here (that is Plan & billing). */
export const Worker: Story = {
  decorators: [session(storyWorkerMe())],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findAllByText('Verified')).toHaveLength(2)
    await expect(canvas.queryByText('Slashie Unlimited')).toBeNull()
    await expect(canvas.queryByText(/quoted this month/)).toBeNull()
  },
}

/** `social`: Google only, so Set a password, and the email changes once there is one. */
export const Social: Story = {
  decorators: [
    session(
      storyMe({
        enabledLoginMethods: [LoginMethod.Google],
        googleLoginEmail: 'sam.carter@example.com',
      }),
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(/add a password under Sign-in and security/),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Change password' }),
    ).toBeNull()
    await expect(
      canvas.getByRole('button', { name: 'Set a password' }),
    ).toBeVisible()
    await expect(canvas.getByText('Not set yet.')).toBeVisible()
    await expect(canvas.getByText('Google')).toBeVisible()
  },
}

/** `suspended`: read only; Log out and Language still work, no Delete. */
export const Suspended: Story = {
  decorators: [
    session(
      storyMe({ disabled: true, profile: { contactNumber: '+447700900123' } }),
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Log out' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Verify' })).toBeNull()
    // Only Language keeps its Change button.
    await expect(
      canvas.getAllByRole('button', { name: 'Change' }),
    ).toHaveLength(1)
    await expect(
      canvas.queryByRole('button', { name: 'Delete account' }),
    ).toBeNull()
    await expect(
      canvas.getByRole('checkbox', { name: 'Product news by email' }),
    ).toBeDisabled()
  },
}

/** zh-HK: every section and row in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/account' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
    session(storyMe()),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { level: 1, name: '帳戶' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('heading', { level: 2, name: '登入與安全' }),
    ).toBeVisible()
    await expect(canvas.getByText('繁體中文')).toBeVisible()
  },
}

/** Phones: one column with Back in the header. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [session(storyMe())],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Back' }),
    ).toBeVisible()
  },
}
