import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { JobCard } from './JobCard'

const sampleAvatars = [
  {
    src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop',
    name: 'Alex',
  },
  {
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop',
    name: 'Jordan',
  },
]

const meta = {
  title: 'ui/JobCard',
  component: JobCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    title: 'Plumbing Emergency: Master Bath',
    description:
      'Minor leak under the sink causing water damage. Need immediate inspection and repair.',
    postedAgo: '2 hours ago',
    estimate: '$120 Est.',
    responders: sampleAvatars,
    extraResponderCount: 4,
  },
} satisfies Meta<typeof JobCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Box bg="bg" p={8} borderRadius="lg" w="fit-content">
      <JobCard {...args} />
    </Box>
  ),
}

export const Minimal: Story = {
  args: {
    title: 'Shelf installation',
    description: 'Two floating shelves in the living room.',
    postedAgo: '1 day ago',
    estimate: '$85 Est.',
    responders: [],
    extraResponderCount: 0,
  },
  render: (args) => (
    <Box bg="bg" p={8} borderRadius="lg" w="fit-content">
      <JobCard {...args} />
    </Box>
  ),
}
