import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PostedTaskTimeline } from './PostedTaskTimeline'

const meta: Meta<typeof PostedTaskTimeline> = {
  title: 'dashboard/requests/calendar/PostedTaskTimeline',
  component: PostedTaskTimeline,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
