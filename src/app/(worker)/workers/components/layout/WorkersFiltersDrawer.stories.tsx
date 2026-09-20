import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkersFiltersDrawer } from './WorkersFiltersDrawer'

const meta: Meta<typeof WorkersFiltersDrawer> = {
  title: 'worker/workers/layout/WorkersFiltersDrawer',
  component: WorkersFiltersDrawer,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
