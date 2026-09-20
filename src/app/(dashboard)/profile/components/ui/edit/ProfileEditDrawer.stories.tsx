import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProfileEditDrawer } from './ProfileEditDrawer'

const meta: Meta<typeof ProfileEditDrawer> = {
  title: 'dashboard/profile/ui/edit/ProfileEditDrawer',
  component: ProfileEditDrawer,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
