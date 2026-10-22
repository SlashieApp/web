import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { PhotoTile } from './PhotoTile'

/** Solid placeholder picture as a data URI, so the story never fetches one. */
const swatch = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="176" height="176"><rect width="100%" height="100%" fill="${color}"/></svg>`,
  )}`

/**
 * SDL PhotoTile: a picked photo's preview, or why there isn't one yet.
 * Used by task photos, the profile photo and worker setup. HEIC photos show
 * "Converting photo…" while they become a JPEG this browser can show, and
 * "Preview not available" when that fails (the photo still uploads).
 */
const meta = {
  title: 'UI/PhotoTile',
  component: PhotoTile,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    alt: 'Photo 1',
    size: '88px',
    state: 'ready',
    src: swatch('#9ec5e8'),
  },
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['ready', 'converting', 'unavailable'],
    },
  },
} satisfies Meta<typeof PhotoTile>

export default meta
type Story = StoryObj<typeof meta>

/** Ready: the photo itself, cropped to the square. */
export const Ready: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('img', { name: 'Photo 1' }),
    ).toBeVisible()
  },
}

/** Converting: a HEIC photo is becoming a JPEG; spinner, text and `aria-busy`. */
export const Converting: Story = {
  args: { state: 'converting', src: null },
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText('Converting photo…')
    await expect(text).toBeVisible()
    await expect(text.closest('[aria-busy="true"]')).toHaveTextContent(
      'Photo 1',
    )
  },
}

/** Unavailable: this browser can't show the photo; it still uploads. */
export const Unavailable: Story = {
  args: { state: 'unavailable', src: null },
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText('Preview not available')
    await expect(text).toBeVisible()
    await expect(canvasElement.querySelector('[aria-busy]')).toBeNull()
  },
}

/** Round: the profile photo's circle, in each state. */
export const Round: Story = {
  render: () => (
    <HStack gap={4}>
      <PhotoTile
        state="ready"
        src={swatch('#f0c987')}
        alt="You"
        size="96px"
        round
      />
      <PhotoTile state="converting" alt="You" size="96px" round />
      <PhotoTile state="unavailable" alt="You" size="96px" round />
    </HStack>
  ),
}
