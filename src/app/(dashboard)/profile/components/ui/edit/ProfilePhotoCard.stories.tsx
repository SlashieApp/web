import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProfilePhotoCard } from './ProfilePhotoCard'

const meta: Meta<typeof ProfilePhotoCard> = {
  title: 'Dashboard/Profile/ProfilePhotoCard',
  component: ProfilePhotoCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ProfilePhotoCard>

export const Default: Story = {
  args: {},
}
