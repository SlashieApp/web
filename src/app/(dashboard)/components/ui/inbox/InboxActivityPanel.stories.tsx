import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { InboxActivityPanel } from './InboxActivityPanel'

const meta: Meta<typeof InboxActivityPanel> = {
  title: 'dashboard/ui/inbox/InboxActivityPanel',
  component: InboxActivityPanel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
