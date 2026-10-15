import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Stack, Text } from '@chakra-ui/react'
import { ImageGallery } from './ImageGallery'

/** Inline SVG placeholder photo, so stories never fetch a remote image. */
function photo(label: string, from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="610" cy="150" r="64" fill="#fff" fill-opacity=".35"/><path d="M0 470 230 300l190 130 150-110L800 440v160H0z" fill="#000" fill-opacity=".18"/><text x="400" y="320" text-anchor="middle" font-family="sans-serif" font-size="46" fill="#fff">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** Not a decodable image: fires `onError` without any network request. */
const brokenSrc = 'data:image/png;base64,AAAA'

const sampleItems = [
  {
    src: photo('Kitchen tap', '#2f6f9f', '#8fc1de'),
    alt: 'Kitchen faucet with water droplets',
  },
  {
    src: photo('Pipes', '#7a5a3a', '#d2b48c'),
    alt: 'Plumbing pipes under a sink',
  },
  {
    src: photo('Tools', '#3f6b4f', '#9bc9a6'),
    alt: 'Tools on a workbench',
  },
]

/**
 * SDL ImageGallery. Adaptive bento grid from `md` up, Embla carousel on small
 * viewports. Renders at most three images. Surfaces, borders, controls and the
 * carousel indicators all reference SDL semantic roles, so the gallery adapts
 * automatically under the light/dark theme toolbar.
 */
const meta = {
  title: 'UI/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    items: {
      control: 'object',
      description:
        'Up to three images (extra items are ignored). Each needs `src` + descriptive `alt`.',
    },
  },
  args: {
    items: sampleItems,
  },
} satisfies Meta<typeof ImageGallery>

export default meta

type Story = StoryObj<typeof meta>

/** Three images: full bento layout on desktop, swipeable carousel on mobile. */
export const Default: Story = {}

/** Single image fills the whole gallery area; no carousel controls. */
export const SingleImage: Story = {
  args: {
    items: sampleItems.slice(0, 1),
  },
}

/** Two images split evenly with no empty slots. */
export const TwoImages: Story = {
  args: {
    items: sampleItems.slice(0, 2),
  },
}

/** Three images render the classic bento (one tall + two stacked). */
export const ThreeImages: Story = {
  args: {
    items: sampleItems.slice(0, 3),
  },
}

/** Only the first three items display; extras are silently dropped. */
export const ExtraImagesIgnored: Story = {
  args: {
    items: [
      ...sampleItems,
      {
        src: photo('Extra', '#8a3f6b', '#d9a6c4'),
        alt: 'Extra image that is not shown',
      },
    ],
  },
}

/** Broken image: a failing `src` falls back to the "Image unavailable" tile on `bg.subtle`. */
export const BrokenImage: Story = {
  args: {
    items: [
      {
        src: brokenSrc,
        alt: 'Broken image fallback',
      },
      sampleItems[1],
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Image unavailable'),
    ).toBeVisible()
  },
}

/** Phone, three images: swipeable carousel with arrows and slide indicators. */
export const PhoneCarousel: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Previous image' }),
    ).toBeDisabled()
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Next image' }),
    )
    await expect(
      await canvas.findByRole('button', { name: 'Image 2 of 3' }),
    ).toHaveAttribute('aria-current', 'true')
  },
}

/** Phone, single image: one slide with no arrows and no indicators. */
export const PhoneSingleImage: Story = {
  args: { items: sampleItems.slice(0, 1) },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('img')).toBeVisible()
    await expect(canvas.queryByRole('button')).toBeNull()
  },
}

/** Phone, broken image: the carousel slide shows the "Image unavailable" tile. */
export const PhoneBrokenImage: Story = {
  args: {
    items: [{ src: brokenSrc, alt: 'Broken image fallback' }, sampleItems[1]],
  },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Image unavailable'),
    ).toBeVisible()
  },
}

/** Empty input renders nothing (the component returns `null`). */
export const EmptyState: Story = {
  args: {
    items: [],
  },
  render: (args) => (
    <Stack gap={2}>
      <Text fontSize="sm" color="text.muted">
        With no items the gallery renders nothing:
      </Text>
      <ImageGallery {...args} />
    </Stack>
  ),
}

/** Side-by-side overview of every supported item count. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={8}>
      <Stack gap={2}>
        <Text fontSize="sm" fontWeight={600} color="text.muted">
          One image
        </Text>
        <ImageGallery items={sampleItems.slice(0, 1)} />
      </Stack>
      <Stack gap={2}>
        <Text fontSize="sm" fontWeight={600} color="text.muted">
          Two images
        </Text>
        <ImageGallery items={sampleItems.slice(0, 2)} />
      </Stack>
      <Stack gap={2}>
        <Text fontSize="sm" fontWeight={600} color="text.muted">
          Three images (bento)
        </Text>
        <ImageGallery items={sampleItems.slice(0, 3)} />
      </Stack>
    </Stack>
  ),
}
