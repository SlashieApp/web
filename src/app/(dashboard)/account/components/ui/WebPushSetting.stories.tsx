import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WebPushSetting } from './WebPushSetting'

const meta = {
  title: 'dashboard/account/ui/WebPushSetting',
  component: WebPushSetting,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: 'Browser notifications',
    description:
      'Get a notification when a quote, job update, or review request arrives and this tab is in the background.',
    checked: false,
    onChange: () => {},
  },
} satisfies Meta<typeof WebPushSetting>

export default meta
type Story = StoryObj<typeof meta>

export const Off: Story = {}

export const On: Story = {
  args: { checked: true },
}

export const Unavailable: Story = {
  args: {
    unavailable: 'Browser notifications are not available in this browser yet.',
  },
}
