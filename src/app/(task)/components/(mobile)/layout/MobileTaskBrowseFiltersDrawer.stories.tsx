import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MobileTaskBrowseFiltersDrawer } from './MobileTaskBrowseFiltersDrawer'

const meta: Meta<typeof MobileTaskBrowseFiltersDrawer> = {
  title: 'task/layout/MobileTaskBrowseFiltersDrawer',
  component: MobileTaskBrowseFiltersDrawer,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
