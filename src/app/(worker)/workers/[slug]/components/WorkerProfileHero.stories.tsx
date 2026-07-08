import { Box } from '@chakra-ui/react'
import { WorkerContactAction } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerProfileProvider } from '../context/WorkerProfileContext'
import { WorkerProfileHero } from './WorkerProfileHero'
import { workerProfileFixture } from './workerProfileStoryFixtures'

const meta = {
  title: 'worker/WorkerProfileHero',
  component: WorkerProfileHero,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const JamesThornton: Story = {
  render: () => (
    <Box maxW="1100px">
      <WorkerProfileProvider worker={workerProfileFixture}>
        <WorkerProfileHero />
      </WorkerProfileProvider>
    </Box>
  ),
}

/** Signed-in customer with a completed job: Save active, review eligible. */
export const EligibleViewer: Story = {
  render: () => (
    <Box maxW="1100px">
      <WorkerProfileProvider
        worker={{
          ...workerProfileFixture,
          viewer: {
            isSaved: true,
            canLeaveReview: true,
            contactAction: WorkerContactAction.OpenTask,
            relatedTaskId: 'task-1',
            relatedQuoteId: null,
          },
        }}
      >
        <WorkerProfileHero />
      </WorkerProfileProvider>
    </Box>
  ),
}

export const UnverifiedNoTagline: Story = {
  render: () => (
    <Box maxW="1100px">
      <WorkerProfileProvider
        worker={{
          ...workerProfileFixture,
          isVerified: false,
          tagline: null,
          skills: [],
          yearsExperience: null,
          serviceAreaLabel: null,
          serviceArea: { label: null, radiusMiles: null },
          ratingSummary: { average: null, count: 0 },
          completedJobs: [],
        }}
      >
        <WorkerProfileHero />
      </WorkerProfileProvider>
    </Box>
  ),
}
