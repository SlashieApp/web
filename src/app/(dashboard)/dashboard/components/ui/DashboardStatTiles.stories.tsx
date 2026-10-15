import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardStatTiles } from './DashboardStatTiles'

const meta: Meta<typeof DashboardStatTiles> = {
  title: 'Dashboard/Home/DashboardStatTiles',
  component: DashboardStatTiles,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
