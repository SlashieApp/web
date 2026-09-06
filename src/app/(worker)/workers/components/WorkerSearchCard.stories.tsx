import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  WorkerSearchCard,
  type WorkerSearchCardProps,
} from './WorkerSearchCard'

const meta = {
  title: 'worker/workers/WorkerSearchCard',
  component: WorkerSearchCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="280px">
      <WorkerSearchCard {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSearchCardProps>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    workerId: 'worker-1',
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

export const NoServiceArea: Story = {
  args: {
    workerId: 'worker-2',
    name: 'Priya Anand',
    verified: false,
    subtitle: '2 yrs experience',
    serviceAreaLabel: null,
    skills: ['Cleaning'],
    profileHref: '/workers/worker-2',
  },
}
