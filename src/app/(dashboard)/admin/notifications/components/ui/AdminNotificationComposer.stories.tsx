import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AdminNotificationComposer } from './AdminNotificationComposer'

const meta = {
  title: 'dashboard/admin/notifications/AdminNotificationComposer',
  component: AdminNotificationComposer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onDryRun: async () => {},
    onSend: async () => {},
    dryRunKey: null,
    recipientCount: null,
  },
} satisfies Meta<typeof AdminNotificationComposer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AfterDryRun: Story = {
  args: {
    dryRunKey: null,
    recipientCount: 12,
    auditId: null,
  },
}
