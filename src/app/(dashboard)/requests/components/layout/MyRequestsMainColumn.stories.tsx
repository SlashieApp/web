import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MyRequestsMainColumn } from './MyRequestsMainColumn'

const meta: Meta<typeof MyRequestsMainColumn> = {
  title: 'dashboard/requests/layout/MyRequestsMainColumn',
  component: MyRequestsMainColumn,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
