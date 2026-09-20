import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PostedTaskFilters } from './PostedTaskFilters'

const meta: Meta<typeof PostedTaskFilters> = {
  title: 'dashboard/requests/layout/PostedTaskFilters',
  component: PostedTaskFilters,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
