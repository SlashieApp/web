import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  WorkerSearchCard,
  type WorkerSearchCardProps,
} from './WorkerSearchCard'

const meta = {
  title: 'task/search/WorkerSearchCard',
  component: WorkerSearchCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="420px">
      <WorkerSearchCard {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSearchCardProps>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Tom H.',
    verified: true,
    subtitle: 'Handyman · Furniture assembly',
    ratingLabel: '4.9 (128)',
    experienceLabel: '5 yrs exp',
    respondsLabel: 'Responds in ~30 min',
    serviceAreaLabel: 'Southwark & Lambeth',
    skills: ['Assembly', 'Mounting', 'Flat-pack', 'Painting', 'Repairs'],
    profileHref: '/workers/worker-1',
  },
}

export const NoReviewsYet: Story = {
  args: {
    ...Default.args,
    name: 'Priya Anand',
    verified: false,
    ratingLabel: null,
    respondsLabel: null,
    experienceLabel: '2 yrs exp',
  },
}

export const SelectedOnMap: Story = {
  args: {
    ...Default.args,
    isActive: true,
    activateAriaLabel: 'Tom H. Open profile.',
  },
}

export const NoServiceArea: Story = {
  args: {
    name: 'Priya Anand',
    verified: false,
    subtitle: '2 yrs experience',
    serviceAreaLabel: null,
    skills: ['Cleaning'],
    profileHref: '/workers/worker-2',
  },
}

export const CompactCarousel: Story = {
  args: {
    ...Default.args,
    compact: true,
  },
}
