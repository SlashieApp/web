import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  WorkerSearchCard,
  type WorkerSearchCardProps,
} from './WorkerSearchCard'

const meta = {
  title: 'search/WorkerSearchCard',
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
    name: 'James Thornton',
    verified: true,
    subtitle: 'Reliable, on-time local help across North London',
    serviceAreaLabel: 'Camden (~5 miles)',
    skills: ['Assembly', 'Handyman', 'Flat-pack', 'Painting', 'Mounting'],
    profileHref: '/workers/worker-1',
  },
}

export const SelectedOnMap: Story = {
  args: {
    ...Default.args,
    isActive: true,
    activateAriaLabel: 'James Thornton. Open profile.',
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
