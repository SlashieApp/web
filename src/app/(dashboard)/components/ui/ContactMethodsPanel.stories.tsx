import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { ContactMethodsPanel } from './ContactMethodsPanel'

const PHONE = '+447700900123'

/** Email and phone both confirmed. */
const verified = storyMe({
  phoneVerified: true,
  profile: { contactNumber: PHONE },
})

const meta = {
  title: 'Dashboard/Shared/ContactMethodsPanel',
  component: ContactMethodsPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContactMethodsPanel>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing confirmed yet: Verify on both rows, and a prompt to confirm one. */
export const Unverified: Story = {
  decorators: [
    withSession({
      me: storyMe({
        emailVerified: false,
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findAllByRole('button', { name: 'Verify' }),
    ).toHaveLength(2)
    await expect(
      canvas.getByText('Verify your email or phone to continue.'),
    ).toBeVisible()
  },
}

/** Both confirmed: Change on both rows and the all-clear line. */
export const Verified: Story = {
  decorators: [withSession({ me: verified })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findAllByRole('button', { name: 'Change' }),
    ).toHaveLength(2)
    await expect(
      canvas.getByText(/At least one contact method is verified/),
    ).toBeVisible()
  },
}

/** Email confirmed, phone not: the email alone is enough to continue. */
export const EmailVerifiedPhoneNot: Story = {
  decorators: [
    withSession({ me: storyMe({ profile: { contactNumber: PHONE } }) }),
  ],
}

/** No phone saved yet: the row offers Add phone. */
export const NoPhoneSaved: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Add phone' }),
    ).toBeVisible()
    await expect(canvas.getByText('No number saved')).toBeVisible()
  },
}

/** A new email is waiting for its link; the current one stays live. */
export const EmailChangePending: Story = {
  decorators: [
    withSession({
      me: storyMe({
        phoneVerified: true,
        pendingEmail: 'sam.new@example.com',
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('sam.new@example.com')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Resend link' }),
    ).toBeVisible()
  },
}

/** A new number is waiting for its SMS code; the current one stays live. */
export const PhoneChangePending: Story = {
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
      await within(canvasElement).findByRole('button', { name: 'Enter code' }),
    ).toBeVisible()
  },
}

/** Google-only accounts keep their Google email: no Change on the email row. */
export const GoogleOnly: Story = {
  decorators: [
    withSession({
      me: storyMe({
        phoneVerified: true,
        enabledLoginMethods: [LoginMethod.Google],
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findAllByRole('button', { name: 'Change' }),
    ).toHaveLength(1)
  },
}

/** Worker setup: a verified phone is required, and it is missing. */
export const RequirePhoneMissing: Story = {
  args: { requirePhone: true },
  decorators: [
    withSession({ me: storyMe({ profile: { contactNumber: PHONE } }) }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        /A verified phone is required to send quotes/,
      ),
    ).toBeVisible()
  },
}

/** Worker setup: the phone is verified, so setup can continue. */
export const RequirePhoneVerified: Story = {
  args: { requirePhone: true },
  decorators: [withSession({ me: verified })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(/Your phone number is verified/),
    ).toBeVisible()
  },
}

/** Inside a card that already explains it: the intro paragraph is hidden. */
export const WithoutIntro: Story = {
  args: { showIntro: false },
  decorators: [withSession({ me: verified })],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText(
        /Confirm email or phone so Slashie can reach you/,
      ),
    ).toBeNull()
  },
}

/** With the intro: what contact proof does and does not mean. */
export const WithIntro: Story = {
  decorators: [withSession({ me: verified })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        /Confirm email or phone so Slashie can reach you/,
      ),
    ).toBeVisible()
  },
}

/** Signed out: nothing to show. */
export const SignedOut: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText('Email')).toBeNull()
  },
}

/** Phones: the badges and buttons wrap under each address. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withSession({ me: verified })],
}
