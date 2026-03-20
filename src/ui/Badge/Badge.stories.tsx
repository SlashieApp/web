import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
}

export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Verified Pro',
  },
}
