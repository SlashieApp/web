import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PublicUserStatus } from './PublicUserStatus'

const meta = {
  title: 'user/ui/PublicUserStatus',
  component: PublicUserStatus,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    variant: 'notFound',
    title: 'Profile unavailable',
    description: 'This profile is private or no longer available.',
  },
} satisfies Meta<typeof PublicUserStatus>

export default meta

type Story = StoryObj<typeof meta>

export const NotFound: Story = {}

export const LoadError: Story = {
  args: {
    variant: 'error',
    title: 'Could not load this profile',
    description: 'Something went wrong. Check your connection and try again.',
    retryLabel: 'Try again',
    onRetry: () => undefined,
  },
}
