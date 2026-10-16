import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import bag from '../../i11n.json'
import { PublicUserStatus } from './PublicUserStatus'

/**
 * Missing, private and failed profile loads. The copy never carries account
 * data, so a private profile looks the same as one that does not exist.
 */
const meta = {
  title: 'Public profile/PublicUserStatus',
  component: PublicUserStatus,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    variant: 'notFound',
    title: bag.en.notFoundTitle,
    description: bag.en.notFoundDescription,
  },
} satisfies Meta<typeof PublicUserStatus>

export default meta

type Story = StoryObj<typeof meta>

/** Private or unknown profile: a message and nothing else. */
export const NotFound: Story = {}

/** Load failed: a message and a Try again button. */
export const LoadError: Story = {
  args: {
    variant: 'error',
    title: bag.en.errorTitle,
    description: bag.en.errorDescription,
    retryLabel: bag.en.errorRetry,
    onRetry: () => undefined,
  },
}

/** Load failed with no retry handler: the message only, no button. */
export const LoadErrorNoRetry: Story = {
  args: {
    variant: 'error',
    title: bag.en.errorTitle,
    description: bag.en.errorDescription,
  },
}
