import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CurrentUserAvatar } from './CurrentUserAvatar'

const S3_AVATAR = 'https://cdn.slashie.app/users/demo/avatar.jpg'
const GOOGLE_AVATAR = 'https://lh3.googleusercontent.com/a/default-user=s96-c'

const meta = {
  title: 'ui/CurrentUserAvatar',
  component: CurrentUserAvatar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    size: 'lg',
    name: 'Alex Morgan',
    avatarUrl: null,
    googlePhotoUrl: null,
  },
} satisfies Meta<typeof CurrentUserAvatar>

export default meta

type Story = StoryObj<typeof meta>

/** No photo URLs → blank user icon. */
export const BlankUserIcon: Story = {}

/** S3 / CDN profile photo. */
export const S3Avatar: Story = {
  args: {
    avatarUrl: S3_AVATAR,
    googlePhotoUrl: null,
  },
}

/** Google photo when no S3 upload. */
export const GoogleFallback: Story = {
  args: {
    avatarUrl: null,
    googlePhotoUrl: GOOGLE_AVATAR,
  },
}

/**
 * Broken S3 URL advances to Google on `onError`.
 * (Storybook may still show the broken image briefly before the fallback.)
 */
export const S3FailsThenGoogle: Story = {
  args: {
    avatarUrl: 'https://cdn.slashie.app/users/demo/missing-avatar.jpg',
    googlePhotoUrl: GOOGLE_AVATAR,
  },
}
