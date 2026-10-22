import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fireEvent, userEvent, within } from 'storybook/test'

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

/** Picks a file through a hidden input, as the file picker (or camera) would. */
function pickFile(
  canvasElement: HTMLElement,
  file: File,
  selector = 'input[type="file"]:not([capture])',
) {
  const input = canvasElement.querySelector(selector)
  if (!input) throw new Error('File input not found')
  fireEvent.change(input, { target: { files: [file] } })
}

/** No photo yet, with a mouse: initials and one Upload photo button that opens the file picker. */
export const NoPhoto: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Upload photo' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Take photo' }),
    ).toBeNull()
  },
}

/** Phones and tablets: Upload photo offers the front camera; its shot is checked like a picked file. */
export const TouchScreen: Story = {
  decorators: [withSession({ me: storyMe() })],
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Upload photo' }),
    )
    const drawer = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Add a photo' },
    )
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Take photo' }),
    )
    await expect(canvasElement.querySelector('input[capture]')).toHaveAttribute(
      'capture',
      'user',
    )
    pickFile(
      canvasElement,
      new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], 'selfie.jpg', {
        type: 'image/jpeg',
      }),
      'input[capture]',
    )
    await expect(
      await canvas.findByText('Image must be 5MB or smaller.'),
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
