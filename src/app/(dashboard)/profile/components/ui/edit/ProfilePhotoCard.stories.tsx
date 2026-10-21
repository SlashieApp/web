import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fireEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyAvatarUrl, storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { ProfilePhotoCard } from './ProfilePhotoCard'

const meta = {
  title: 'Dashboard/Profile/ProfilePhotoCard',
  component: ProfilePhotoCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProfilePhotoCard>

export default meta
type Story = StoryObj<typeof meta>

/** Picks a file through the hidden input, as the browser file picker would. */
function pickFile(canvasElement: HTMLElement, file: File) {
  const input = canvasElement.querySelector('input[type="file"]')
  if (!input) throw new Error('File input not found')
  fireEvent.change(input, { target: { files: [file] } })
}

/** No photo yet: initials and an Upload photo button. */
export const NoPhoto: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Upload photo',
      }),
    ).toBeVisible()
  },
}

/** A photo is saved: the button reads Replace photo. */
export const WithPhoto: Story = {
  decorators: [
    withSession({
      me: storyMe({ profile: { avatarUrl: storyAvatarUrl('SC') } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Replace photo',
      }),
    ).toBeVisible()
  },
}

/** A file that is not a supported image type is refused before any upload. */
export const WrongFileType: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Upload photo' })
    pickFile(
      canvasElement,
      new File(['not an image'], 'cv.pdf', { type: 'application/pdf' }),
    )
    await expect(
      await within(canvasElement).findByText(
        'Use a JPG, PNG, WebP, HEIC, or AVIF image.',
      ),
    ).toBeVisible()
  },
}

/** An image over 5MB is refused before any upload. */
export const FileTooLarge: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Upload photo' })
    pickFile(
      canvasElement,
      new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], 'huge.png', {
        type: 'image/png',
      }),
    )
    await expect(
      await within(canvasElement).findByText('Image must be 5MB or smaller.'),
    ).toBeVisible()
  },
}
