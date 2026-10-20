import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { ContactRows } from './ContactRows'

const PHONE = '+447700900123'

const meta = {
  title: 'Dashboard/Shared/ContactRows',
  component: ContactRows,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContactRows>

export default meta
type Story = StoryObj<typeof meta>

/** Email verified on a password account (Change) and no phone yet (Add phone). */
export const EmailVerifiedNoPhone: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Verified')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Change' })).toBeVisible()
    await expect(canvas.getByText('No number yet')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Add phone' }),
    ).toBeVisible()
  },
}

/** Google-only account: no password, so no Change until one is added. */
export const EmailLocked: Story = {
  decorators: [
    withSession({ me: storyMe({ enabledLoginMethods: [LoginMethod.Google] }) }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(/add a password under Sign-in and security/),
    ).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Change' })).toBeNull()
  },
}

/** Email not confirmed, phone saved but not confirmed: Verify on both. */
export const BothUnverified: Story = {
  decorators: [
    withSession({
      me: storyMe({ emailVerified: false, profile: { contactNumber: PHONE } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findAllByRole('button', { name: 'Verify' }),
    ).toHaveLength(2)
    await expect(canvas.getAllByText('Not verified')).toHaveLength(2)
  },
}

/** Both verified: Change on both. */
export const BothVerified: Story = {
  decorators: [
    withSession({
      me: storyMe({ phoneVerified: true, profile: { contactNumber: PHONE } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findAllByRole('button', { name: 'Change' }),
    ).toHaveLength(2)
  },
}

/** A new email waits for its link: Resend link and Cancel change, no Change. */
export const EmailPending: Story = {
  decorators: [
    withSession({
      me: storyMe({
        pendingEmail: 'sam.new@example.com',
        phoneVerified: true,
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(/open the link we sent to sam.new@example.com/),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Resend link' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Cancel change' }),
    ).toBeVisible()
  },
}

/** A new number waits for its code: Enter code and Cancel change. */
export const PhonePending: Story = {
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
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Enter code' }),
    ).toBeVisible()
    await expect(
      canvas.getByText(/Waiting for the code we texted/),
    ).toBeVisible()
  },
}

/** Read only (suspended): values and badges, no buttons, even on a pending change. */
export const ReadOnly: Story = {
  args: { readOnly: true },
  decorators: [
    withSession({
      me: storyMe({
        emailVerified: false,
        pendingPhone: '+447700900456',
        phoneVerified: true,
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Not verified')).toBeVisible()
    await expect(canvas.queryAllByRole('button')).toHaveLength(0)
  },
}

/** zh-HK: rows, badges and actions in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/account' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
    withSession({ me: storyMe({ profile: { contactNumber: PHONE } }) }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('電郵')).toBeVisible()
    await expect(canvas.getByText('未驗證')).toBeVisible()
    await expect(canvas.getByRole('button', { name: '驗證' })).toBeVisible()
  },
}
