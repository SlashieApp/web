import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PublicProfileScreen } from './PublicProfileScreen'
import {
  sampleOwnerProfile,
  samplePublicProfile,
} from './publicProfileStoryFixture'

const meta = {
  title: 'profile/ui/PublicProfileScreen',
  component: PublicProfileScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PublicProfileScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    view: samplePublicProfile(),
    reviewHref: '/tasks/task-1/review?orderId=order-1',
  },
}

export const Owner: Story = {
  args: {
    view: sampleOwnerProfile(),
  },
}
