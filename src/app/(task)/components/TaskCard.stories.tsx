import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskCard } from './TaskCard'

const meta = {
  title: 'ui/TaskCard',
  component: TaskCard,
  parameters: {
    layout: 'padded',
  },

  render: (args) => (
    <Box maxW="460px">
      <TaskCard {...args} />
    </Box>
  ),
} satisfies Meta<typeof TaskCard>

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
    ratingLabel: '4.9 ',
    ownerAvatarSrc:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    thumbnailSrc:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop',
    detailsHref: '/task/task-1',
    badgeText: 'New',
  },
}
