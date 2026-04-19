import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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

const meta = {
  title: 'ui/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    items: sampleItems,
  },
} satisfies Meta<typeof ImageGallery>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleImage: Story = {
  args: {
    items: sampleItems.slice(0, 1),
  },
}

export const ManyImagesHidden: Story = {
  args: {
    items: [
      ...sampleItems,
      {
        src: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600&fit=crop',
        alt: 'Extra image not shown',
      },
    ],
  },
}
