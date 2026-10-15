import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AccountRestoreScreen } from './AccountRestoreGate'

const meta = {
  title: 'Auth/AccountRestoreGate',
  component: AccountRestoreScreen,
  parameters: { layout: 'fullscreen' },
  args: { scheduledFor: '2026-11-12T10:00:00.000Z' },
} satisfies Meta<typeof AccountRestoreScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Signed in while the account is waiting for deletion. */
export const Default: Story = {}

/** Opened from an error before `me` had the date. */
export const WithoutDate: Story = { args: { scheduledFor: null } }
