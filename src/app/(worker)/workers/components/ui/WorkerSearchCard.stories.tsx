import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withStoryApollo } from '../storyApollo'
import { storyPhoto } from '../workersStoryFixtures'
import {
  WorkerSearchCard,
  type WorkerSearchCardProps,
} from './WorkerSearchCard'

/**
 * Portrait directory card: photo (or initials) on top, public-safe details
 * below. Everything but the id, name and link is optional.
 */
const meta = {
  title: 'Workers/WorkerSearchCard',
  component: WorkerSearchCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withStoryApollo],
  render: (args) => (
    <Box maxW="280px">
      <WorkerSearchCard {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSearchCardProps>

export default meta

type Story = StoryObj<typeof meta>

/** Verified worker with rating, experience, area and more than three skills ("+2"). */
export const Default: Story = {
  args: {
    workerId: 'worker-1',
    name: 'Tom H.',
    verified: true,
    subtitle: 'Handyman · Furniture assembly',
    ratingLabel: '4.9 (128)',
    experienceLabel: '5 yrs exp',
    serviceAreaLabel: 'Southwark & Lambeth',
    skills: ['Assembly', 'Mounting', 'Flat-pack', 'Painting', 'Repairs'],
    profileHref: '/profile/user-1',
  },
}

/** Has a profile photo: it fills the top of the card instead of initials. */
export const WithPhoto: Story = {
  args: {
    ...Default.args,
    workerId: 'worker-photo',
    name: 'Maya Okafor',
    avatarUrl: storyPhoto(150),
  },
}

/** Unverified with no rating yet: no check marks, and the stats line shows experience only. */
export const NoReviewsYet: Story = {
  args: {
    ...Default.args,
    name: 'Priya Anand',
    verified: false,
    ratingLabel: null,
    experienceLabel: '2 yrs exp',
  },
}

/** No service area set: the area line reads "Service area not set". */
export const NoServiceArea: Story = {
  args: {
    workerId: 'worker-2',
    name: 'Priya Anand',
    verified: false,
    subtitle: '2 yrs experience',
    serviceAreaLabel: null,
    skills: ['Cleaning'],
    profileHref: '/profile/user-2',
  },
}

/** Long name, subtitle, area and skill names clamp or wrap instead of overflowing. */
export const LongText: Story = {
  args: {
    workerId: 'worker-long',
    name: 'Bartholomew Featherstonehaugh-Montgomery',
    verified: true,
    subtitle:
      'Furniture assembly, wall mounting, small repairs, painting and a lot more across the whole of North London',
    ratingLabel: '4.8 (1204)',
    experienceLabel: '15 yrs exp',
    serviceAreaLabel:
      'Camden, Islington, Haringey, Hackney, Barnet and Enfield (~15 miles)',
    skills: [
      'Furniture assembly and disassembly',
      'Wall mounting',
      'Painting and decorating',
      'Small repairs',
    ],
    profileHref: '/profile/user-long',
  },
}

/** Only the required fields: no subtitle, rating, experience or skills. */
export const Minimal: Story = {
  args: {
    workerId: 'worker-minimal',
    name: 'Sam',
    profileHref: '/profile/user-minimal',
  },
}
