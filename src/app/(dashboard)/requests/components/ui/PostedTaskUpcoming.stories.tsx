import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PostedTaskUpcoming } from './PostedTaskUpcoming'

const meta: Meta<typeof PostedTaskUpcoming> = {
  title: 'dashboard/requests/ui/PostedTaskUpcoming',
  component: PostedTaskUpcoming,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
