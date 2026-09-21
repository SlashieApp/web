import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PublicUserHero } from './PublicUserHero'

const meta = {
  title: 'user/ui/PublicUserHero',
  component: PublicUserHero,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    name: 'Alex Chen',
    avatarUrl: null,
    memberSinceLabel: 'Member since June 2026',
    workerHref: null,
    workerCtaLabel: 'View worker profile',
  },
} satisfies Meta<typeof PublicUserHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithWorkerProfile: Story = {
  args: { workerHref: '/workers/worker-1' },
}

export const Loading: Story = {
  args: { pending: true },
}
