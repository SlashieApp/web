import { HStack, Text, VStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { Thumbnail } from './Thumbnail'

/** Inline SVG stand-ins for photos, so stories never fetch remote images. */
function artwork(from: string, to: string, width = 600, height = 600): string {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">',
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>`,
    '</linearGradient></defs>',
    `<rect width="${width}" height="${height}" fill="url(#g)"/>`,
    `<circle cx="${width * 0.74}" cy="${height * 0.3}" r="${height * 0.1}" fill="#fff" fill-opacity="0.7"/>`,
    `<path d="M0 ${height * 0.8} Q${width * 0.3} ${height * 0.55} ${width * 0.6} ${height * 0.75} T${width} ${height * 0.7} V${height} H0Z" fill="#000" fill-opacity="0.2"/>`,
    '</svg>',
  ].join('')
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const PHOTO = artwork('#8fd3a8', '#2f8f6b')
const HANDYMAN_PHOTO = artwork('#f3c58b', '#c0763a')
const CLEANING_PHOTO = artwork('#9ccaf0', '#3f78b5')
/** Landscape artwork: `cover` crops it, `contain` letterboxes it. */
const WIDE_PHOTO = artwork('#c3b2f2', '#6b4fc0', 800, 400)
/** Bytes that are not an image, so decoding fails at once (no network). */
const BROKEN_SRC = 'data:image/png;base64,AAAA'

const meta = {
  title: 'UI/Thumbnail',
  component: Thumbnail,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Square min-width preset.',
    },
    fit: {
      control: 'inline-radio',
      options: ['cover', 'contain'],
      description: 'Object-fit of the image.',
    },
    src: { control: 'text' },
    alt: { control: 'text' },
    priority: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  args: {
    alt: 'Task thumbnail',
    size: 'md',
    fit: 'cover',
    src: PHOTO,
  },
} satisfies Meta<typeof Thumbnail>

export default meta

type Story = StoryObj<typeof meta>

/** Default thumbnail with a photo. */
export const Default: Story = {}

/** Placeholder: no source, so the muted image glyph shows. */
export const Placeholder: Story = {
  args: { alt: 'Task without photo', src: undefined },
}

/** Error: a broken image shows an icon and an "Image unavailable" label. */
export const ErrorState: Story = {
  args: {
    alt: 'Unreachable image',
    src: BROKEN_SRC,
  },
}

/** Interactive: a button with a focus ring, 44px target and hover motion. */
export const Interactive: Story = {
  args: { alt: 'Open garden tidy-up task', onClick: () => {} },
}

/** Size presets. */
export const Sizes: Story = {
  render: (args) => (
    <HStack gap={4} align="flex-end">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <VStack key={size} gap={2}>
          <Thumbnail {...args} size={size} />
          <Text fontSize="xs" color="text.muted">
            {size}
          </Text>
        </VStack>
      ))}
    </HStack>
  ),
}

/** A horizontal browse list row of thumbnails. */
export const BrowseListRow: Story = {
  render: (args) => (
    <HStack gap={3}>
      <Thumbnail {...args} alt="Handyman job" src={HANDYMAN_PHOTO} />
      <Thumbnail {...args} alt="Cleaning job" src={CLEANING_PHOTO} />
      <Thumbnail {...args} alt="Task without photo" src={undefined} />
    </HStack>
  ),
}

/** Overview of every state side by side (light and dark via the toolbar). */
export const AllVariants: Story = {
  render: (args) => (
    <HStack gap={6} align="flex-start" wrap="wrap">
      <VStack gap={2}>
        <Thumbnail {...args} src={PHOTO} />
        <Text fontSize="xs" color="text.muted">
          With photo
        </Text>
      </VStack>
      <VStack gap={2}>
        <Thumbnail {...args} alt="No photo" src={undefined} />
        <Text fontSize="xs" color="text.muted">
          Placeholder
        </Text>
      </VStack>
      <VStack gap={2}>
        <Thumbnail {...args} alt="Broken image" src={BROKEN_SRC} />
        <Text fontSize="xs" color="text.muted">
          Error
        </Text>
      </VStack>
      <VStack gap={2}>
        <Thumbnail {...args} alt="Open task" src={PHOTO} onClick={() => {}} />
        <Text fontSize="xs" color="text.muted">
          Interactive
        </Text>
      </VStack>
    </HStack>
  ),
}

const LOADING_ALT = 'Loading thumbnail'

/** Loading: shimmer until the image loads (this story holds the load). */
export const Loading: Story = {
  args: { alt: LOADING_ALT },
  // The data URI loads almost instantly, so this story holds it in the loading
  // state: its `load` event is swallowed and `complete` reads false (Next/Image
  // re-checks `complete` on every render). Only images with this alt are held,
  // and both patches are undone when the story ends.
  beforeEach: () => {
    const complete = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'complete',
    )
    const isHeld = (node: unknown) =>
      node instanceof HTMLImageElement && node.alt === LOADING_ALT
    const holdLoad = (event: Event) => {
      if (isHeld(event.target)) event.stopImmediatePropagation()
    }
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      configurable: true,
      get(this: HTMLImageElement) {
        return isHeld(this) ? false : complete?.get?.call(this)
      },
    })
    // `load` never propagates to `window`, so listen on the document.
    document.addEventListener('load', holdLoad, true)
    return () => {
      document.removeEventListener('load', holdLoad, true)
      if (complete) {
        Object.defineProperty(HTMLImageElement.prototype, 'complete', complete)
      }
    }
  },
  play: async ({ canvasElement }) => {
    const image = within(canvasElement).getByAltText(
      LOADING_ALT,
    ) as HTMLImageElement
    // The browser has the pixels, yet the thumbnail still shows its shimmer.
    await waitFor(() => expect(image.naturalWidth).toBeGreaterThan(0), {
      timeout: 3000,
    })
    await expect(image).toHaveStyle({ opacity: '0' })
  },
}

/** Small size: 88px square for dense lists. */
export const SizeSmall: Story = {
  args: { size: 'sm' },
}

/** Large size: 160px square for featured cards. */
export const SizeLarge: Story = {
  args: { size: 'lg' },
}

/** Fit cover (default): a wide photo fills the square and is cropped. */
export const FitCover: Story = {
  args: { alt: 'Wide photo, cropped', src: WIDE_PHOTO, fit: 'cover' },
}

/** Fit contain: the whole wide photo shows, letterboxed in the square. */
export const FitContain: Story = {
  args: { alt: 'Wide photo, letterboxed', src: WIDE_PHOTO, fit: 'contain' },
  play: async ({ canvasElement }) => {
    const image = within(canvasElement).getByAltText(
      'Wide photo, letterboxed',
    ) as HTMLImageElement
    await waitFor(() => expect(image.naturalWidth).toBeGreaterThan(0), {
      timeout: 3000,
    })
  },
}

/** Error, small size: the icon and label still fit the 88px square. */
export const ErrorSmall: Story = {
  args: { alt: 'Unreachable image', src: BROKEN_SRC, size: 'sm' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Image unavailable', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible()
  },
}
