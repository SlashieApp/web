import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Stack, Text } from '@chakra-ui/react'
import { ImageGallery } from './ImageGallery'

const sampleItems = [
  {
    src: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=1000&fit=crop',
    alt: 'Kitchen faucet with water droplets',
  },
  {
    src: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=600&fit=crop',
    alt: 'Plumbing pipes under a sink',
  },
  {
    src: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop',
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
  title: 'ui/ImageGallery',
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

/** Only the first three items display — extras are silently dropped. */
export const ExtraImagesIgnored: Story = {
  args: {
    items: [
      ...sampleItems,
      {
        src: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600&fit=crop',
        alt: 'Extra image that is not shown',
      },
    ],
  },
}

/**
 * Error / fallback state: a broken `src` falls back to the
 * "Image unavailable" tile (rendered on `bg.subtle` with `text.muted`).
 */
export const BrokenImage: Story = {
  args: {
    items: [
      {
        src: 'https://example.invalid/this-image-does-not-exist.jpg',
        alt: 'Broken image fallback',
      },
      sampleItems[1],
    ],
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
