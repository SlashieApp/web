import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MyRequestsFilterColumn } from './MyRequestsFilterColumn'

const meta: Meta<typeof MyRequestsFilterColumn> = {
  title: 'dashboard/requests/layout/MyRequestsFilterColumn',
  component: MyRequestsFilterColumn,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
