import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'

import { ContactMethodsPanel } from './ContactMethodsPanel'

function contactFixture(overrides: Partial<MeSnapshot> = {}): MeSnapshot {
  return {
    id: 'user-story',
    email: 'sam@example.com',
    emailVerified: false,
    phoneVerified: false,
    phoneVerifiedAt: null,
    pendingEmail: null,
    pendingPhone: null,
    enabledLoginMethods: [LoginMethod.Password],
    profile: { contactNumber: '+447700900123' },
    ...overrides,
  } as MeSnapshot
}

const verified = {
  emailVerified: true,
  phoneVerified: true,
  phoneVerifiedAt: '2026-10-01T10:00:00.000Z',
}

type StoryArgs = { me: MeSnapshot }

const meta = {
  title: 'Dashboard/Shared/ContactMethodsPanel',
  parameters: { layout: 'padded' },
  render: ({ me }) => {
    useUserStore.setState({
      user: { id: me.id, email: me.email, createdAt: '2026-06-01' },
      me,
    })
    return <ContactMethodsPanel />
  },
  args: { me: contactFixture() },
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Unverified: Story = {}

export const Verified: Story = {
  args: { me: contactFixture(verified) },
}

export const EmailChangePending: Story = {
  args: {
    me: contactFixture({ ...verified, pendingEmail: 'sam.new@example.com' }),
  },
}

export const PhoneChangePending: Story = {
  args: { me: contactFixture({ ...verified, pendingPhone: '+447700900456' }) },
}

/** Google-only accounts keep their Google email: no Change. */
export const GoogleOnly: Story = {
  args: {
    me: contactFixture({
      ...verified,
      enabledLoginMethods: [LoginMethod.Google],
    }),
  },
}
