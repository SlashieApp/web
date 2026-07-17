import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskPhotoStrip } from './TaskPhotoStrip'

const photo =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'

const meta = {
  title: 'task/tasks/mainSection/TaskPhotoStrip',
  component: TaskPhotoStrip,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="360px" w="full">
      <TaskPhotoStrip {...args} />
    </Box>
  ),
} satisfies Meta<typeof TaskPhotoStrip>

export default meta

type Story = StoryObj<typeof meta>

export const SinglePhoto: Story = {
  args: {
    items: [{ src: photo, alt: 'Task photo 1' }],
  },
}

export const ThreePhotos: Story = {
  args: {
    items: [
      { src: photo, alt: 'Task photo 1' },
      { src: photo, alt: 'Task photo 2' },
      { src: photo, alt: 'Task photo 3' },
    ],
  },
}

export const ManyPhotosOverlay: Story = {
  args: {
    items: [
      { src: photo, alt: 'Task photo 1' },
      { src: photo, alt: 'Task photo 2' },
      { src: photo, alt: 'Task photo 3' },
      { src: photo, alt: 'Task photo 4' },
      { src: photo, alt: 'Task photo 5' },
    ],
  },
}
