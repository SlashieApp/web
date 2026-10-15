import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { withSession } from '../../helpers/authStoryDecorator'
import { storyAvatarUrl, storyMe } from '../../helpers/authStoryFixtures'
import { MeAvatar } from './MeAvatar'

const PROFILE_PHOTO = storyAvatarUrl('SC')
const GOOGLE_PHOTO = storyAvatarUrl('G', '#3b6fd4')
/** Not an image: the browser fails to decode it, like a dead CDN link. */
const BROKEN_PHOTO = 'data:image/png;base64,AAAA'

const withPhoto = storyMe({ profile: { avatarUrl: PROFILE_PHOTO } })

const meta = {
  title: 'Auth/MeAvatar',
  component: MeAvatar,
  parameters: { layout: 'padded' },
  args: { size: 'xl', googlePhotoUrl: null },
} satisfies Meta<typeof MeAvatar>

export default meta
type Story = StoryObj<typeof meta>

/** Signed in with a profile photo. */
export const WithPhoto: Story = {
  decorators: [withSession({ me: withPhoto })],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('img')).toHaveAttribute(
        'src',
        PROFILE_PHOTO,
      ),
    )
  },
}

/** No photo, initials fallback (profile hero). */
export const Initials: Story = {
  args: { fallback: 'initials' },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('SC')).toBeVisible()
  },
}

/** No photo, icon fallback (the default, used in the header). */
export const Icon: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('img')).toBeNull()
    await expect(canvasElement.querySelector('svg')).not.toBeNull()
  },
}

/** No profile photo yet, so the Google account photo stands in. */
export const GooglePhoto: Story = {
  args: { googlePhotoUrl: GOOGLE_PHOTO },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('img')).toHaveAttribute(
        'src',
        GOOGLE_PHOTO,
      ),
    )
  },
}

/** A local preview (a photo just picked for upload) wins over the saved photo. */
export const PreviewOverride: Story = {
  args: { avatarUrl: storyAvatarUrl('NEW', '#b4533c') },
  decorators: [withSession({ me: withPhoto })],
}

/** The photo URL fails to load, so the initials show instead. */
export const BrokenPhoto: Story = {
  args: { fallback: 'initials', avatarUrl: BROKEN_PHOTO },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).getByText('SC')).toBeVisible(),
    )
  },
}

/** Signed out: the generic account icon. */
export const SignedOut: Story = {
  decorators: [withSession()],
}

/** Every size, small to extra large. */
export const Sizes: Story = {
  decorators: [withSession({ me: withPhoto })],
  render: () => (
    <HStack gap={4} align="center">
      <MeAvatar size="sm" googlePhotoUrl={null} />
      <MeAvatar size="md" googlePhotoUrl={null} />
      <MeAvatar size="lg" googlePhotoUrl={null} />
      <MeAvatar size="xl" googlePhotoUrl={null} />
    </HStack>
  ),
}
