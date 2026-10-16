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

/** `password`: Contact, Sign-in with the Password row, Notifications, Delete. */
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
      canvas.getByRole('link', { name: 'Change password' }),
    ).toHaveAttribute('href', '/forgot-password')
    await expect(canvas.getByText('Email and password')).toBeVisible()
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

/** `social`: Google only, so no Password row and the email can't change here. */
export const Social: Story = {
  decorators: [session(storyMe({ enabledLoginMethods: [LoginMethod.Google] }))],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Comes from your Google sign-in.'),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: 'Change password' }),
    ).toBeNull()
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
