import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PublicProfileAchievements } from './PublicProfileAchievements'
import { sampleOwnerProfile } from './publicProfileStoryFixture'

const meta = {
  title: 'profile/ui/PublicProfileAchievements',
  component: PublicProfileAchievements,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PublicProfileAchievements>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    view: sampleOwnerProfile(),
    now: new Date(2026, 8, 20),
  },
}
