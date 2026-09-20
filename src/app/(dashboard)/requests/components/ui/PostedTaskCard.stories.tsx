import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PostedTaskCard } from './PostedTaskCard'

const meta: Meta<typeof PostedTaskCard> = {
  title: 'dashboard/requests/ui/PostedTaskCard',
  component: PostedTaskCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
