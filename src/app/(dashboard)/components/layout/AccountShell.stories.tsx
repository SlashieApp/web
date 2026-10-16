import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe, storyWorkerMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { AccountShell } from './AccountShell'
import { DashboardPageLayout } from './DashboardPageLayout'

const meta = {
  title: 'Dashboard/Shared/AccountShell',
  component: AccountShell,
  parameters: { layout: 'fullscreen' },
  args: {
    children: (
      <DashboardPageLayout
        title="Account"
        description="Email, phone and sign-in."
      >
        Page body
      </DashboardPageLayout>
    ),
  },
} satisfies Meta<typeof AccountShell>

export default meta
type Story = StoryObj<typeof meta>

/** Worker signed in: header with the account menu, page body, legal footer. */
export const Worker: Story = {
  args: { hasSession: true },
  decorators: [withSession({ me: storyWorkerMe() })],
}

/** Customer signed in: the account menu offers the worker upsell. */
export const Customer: Story = {
  args: { hasSession: true },
  decorators: [withSession({ me: storyMe() })],
}

/** A session cookie exists but `me` has not loaded: account slot skeletons. */
export const SessionLoading: Story = {
  args: { hasSession: true },
  decorators: [withSession({ token: true, authLoading: true })],
}

/** No session: guest header with Log in and Sign up. */
export const Guest: Story = {
  decorators: [withSession()],
}

/** Phones: the bottom navigation replaces the header links. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: { hasSession: true },
  decorators: [withSession({ me: storyWorkerMe() })],
}
