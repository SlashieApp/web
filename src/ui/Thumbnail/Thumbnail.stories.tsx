import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Thumbnail } from './Thumbnail'

const meta = {
  title: 'ui/Thumbnail',
  component: Thumbnail,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    alt: 'Task thumbnail',
  },
} satisfies Meta<typeof Thumbnail>

export default meta

type Story = StoryObj<typeof meta>

export const TaskWithPhoto: Story = {
  args: {
    alt: 'Garden tidy-up',
    src: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=600&fit=crop',
  },
  render: (args) => <Thumbnail {...args} />,
}

export const NoPhotoPlaceholder: Story = {
  args: { alt: 'Task without photo' },
  render: (args) => <Thumbnail {...args} />,
}

export const BrowseListRow: Story = {
  args: { alt: 'Handyman job' },
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
