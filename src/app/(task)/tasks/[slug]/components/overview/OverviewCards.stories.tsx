import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OverviewCards } from './OverviewCards'

const meta: Meta<typeof OverviewCards> = {
  title: 'task/tasks/overview/OverviewCards',
  component: OverviewCards,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
