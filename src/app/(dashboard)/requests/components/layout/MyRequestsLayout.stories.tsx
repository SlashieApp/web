import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MyRequestsLayout } from './MyRequestsLayout'

const meta: Meta<typeof MyRequestsLayout> = {
  title: 'dashboard/requests/layout/MyRequestsLayout',
  component: MyRequestsLayout,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
