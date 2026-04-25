import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseListItem } from './TaskBrowseListItem'

const meta = {
  title: 'ui/Card',
  component: TaskBrowseListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    task: {
      id: 'task-1',
      title: 'Fix shelf on wall',
      description: 'Need a worker to mount one shelf safely.',
      location: '33 Charing Cross Road',
      priceLabel: '£10',
      badgeText: 'New',
      distanceLabel: '0.4 mi away',
      ownerName: 'John D.',
      ratingLabel: '4.9 (42)',
      ownerAvatarSrc:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
      thumbnailSrc:
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop',
    },
    detailsHref: '/task/task-1',
  },
  render: (args) => (
    <Box maxW="460px">
      <TaskBrowseListItem {...args} />
    </Box>
  ),
} satisfies Meta<typeof TaskBrowseListItem>

export default meta

type Story = StoryObj<typeof meta>

export const ListItem: Story = {
  args: {
    title: 'Fix shelf on wall',
    description: 'Need a worker to mount one shelf safely.',
    priceLabel: '£10',
    metaLine: '33 Charing Cross Road',
    distanceLabel: '0.4 mi away',
    ownerName: 'John D.',
    ratingLabel: '4.9 (42)',
    ownerAvatarSrc:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    thumbnailSrc:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop',
    detailsHref: '/task/task-1',
    badgeText: 'New',
  },
}
