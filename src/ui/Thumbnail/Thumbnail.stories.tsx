import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Thumbnail } from './Thumbnail'

const meta = {
  title: 'ui/Thumbnail',
  component: Thumbnail,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Thumbnail>

export default meta

type Story = StoryObj<typeof meta>

export const TaskWithPhoto: Story = {
  render: () => (
    <Thumbnail
      alt="Garden tidy-up"
      src="https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=600&fit=crop"
    />
  ),
}

export const NoPhotoPlaceholder: Story = {
  render: () => <Thumbnail alt="Task without photo" />,
}

export const BrowseListRow: Story = {
  render: () => (
    <HStack gap={3}>
      <Thumbnail
        alt="Handyman job"
        src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop"
      />
      <Thumbnail
        alt="Cleaning job"
        src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=600&fit=crop"
      />
    </HStack>
  ),
}
