import { Box } from '@chakra-ui/react'
import { IdentityVerificationStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerProfileProvider } from '../context/WorkerProfileContext'
import { WorkerProfileSidebar } from './WorkerProfileSidebar'
import { workerProfileFixture } from './workerProfileStoryFixtures'

const meta = {
  title: 'worker/workers/WorkerProfileSidebar',
  component: WorkerProfileSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const FullyVerified: Story = {
  render: () => (
    <Box maxW="360px">
      <WorkerProfileProvider worker={workerProfileFixture}>
        <WorkerProfileSidebar />
      </WorkerProfileProvider>
    </Box>
  ),
}

/**
 * The reproduced trust bug: nothing verified. Identity row (NOT_STARTED) is
 * hidden entirely; phone and email show hollow grey circles with "not yet
 * verified" — never a check mark.
 */
export const NothingVerified: Story = {
  render: () => (
    <Box maxW="360px">
      <WorkerProfileProvider
        worker={{
          ...workerProfileFixture,
          isVerified: false,
          identityVerification: IdentityVerificationStatus.NotStarted,
          phoneVerified: false,
          emailVerified: false,
        }}
      >
        <WorkerProfileSidebar />
      </WorkerProfileProvider>
    </Box>
  ),
}

/** The live repro account shape: email verified, no phone saved. */
export const EmailOnlyVerified: Story = {
  render: () => (
    <Box maxW="360px">
      <WorkerProfileProvider
        worker={{
          ...workerProfileFixture,
          isVerified: false,
          identityVerification: IdentityVerificationStatus.NotStarted,
          phoneVerified: false,
          emailVerified: true,
        }}
      >
        <WorkerProfileSidebar />
      </WorkerProfileProvider>
    </Box>
  ),
}

export const IdentityPending: Story = {
  render: () => (
    <Box maxW="360px">
      <WorkerProfileProvider
        worker={{
          ...workerProfileFixture,
          isVerified: false,
          identityVerification: IdentityVerificationStatus.Pending,
          phoneVerified: true,
          emailVerified: true,
        }}
      >
        <WorkerProfileSidebar />
      </WorkerProfileProvider>
    </Box>
  ),
}
