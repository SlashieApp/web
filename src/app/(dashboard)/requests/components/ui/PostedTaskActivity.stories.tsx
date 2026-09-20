import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PostedTaskActivity } from './PostedTaskActivity'

const meta: Meta<typeof PostedTaskActivity> = {
  title: 'dashboard/requests/ui/PostedTaskActivity',
  component: PostedTaskActivity,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
