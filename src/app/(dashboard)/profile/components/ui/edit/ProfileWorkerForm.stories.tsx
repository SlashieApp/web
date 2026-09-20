import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProfileWorkerForm } from './ProfileWorkerForm'

const meta: Meta<typeof ProfileWorkerForm> = {
  title: 'dashboard/profile/ui/edit/ProfileWorkerForm',
  component: ProfileWorkerForm,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
