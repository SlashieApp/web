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
      title: 'Fix leaking kitchen sink',
      description: 'Small leak under the basin cabinet.',
      location: 'Mission District, SF',
      priceLabel: '$120',
      badgeText: 'Featured',
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
    title: 'Fix leaking kitchen sink',
    description: 'Small leak under the basin cabinet.',
    priceLabel: '$120',
    metaLine: 'Mission District, SF',
    thumbnailSrc:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop',
    detailsHref: '/task/task-1',
    badgeText: 'Featured',
  },
}
