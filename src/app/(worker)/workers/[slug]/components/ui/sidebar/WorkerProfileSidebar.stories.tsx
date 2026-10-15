import { IdentityVerificationStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkerProfile } from '../shared/workerProfileStoryDecorator'
import {
  ownWorkerProfileFixture,
  thinWorkerProfileFixture,
  workerProfileFixture,
} from '../shared/workerProfileStoryFixtures'
import { WorkerProfileSidebar } from './WorkerProfileSidebar'

/**
 * Profile sidebar: Trust & verification, At a glance (only when there is
 * something to show) and Get in touch. A check mark only ever means verified.
 */
const meta = {
  title: 'Worker profile/WorkerProfileSidebar',
  component: WorkerProfileSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkerProfileSidebar>

export default meta
type Story = StoryObj<typeof meta>

/** Identity, phone and email all verified, with experience, quotes and qualifications. */
export const FullyVerified: Story = {
  decorators: [
    withWorkerProfile({ worker: workerProfileFixture, maxWidth: '360px' }),
  ],
}

/** Nothing verified: no identity row, and phone and email as hollow circles reading "not yet confirmed", never a check mark. */
export const NothingVerified: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        isVerified: false,
        identityVerification: IdentityVerificationStatus.NotStarted,
        phoneVerified: false,
        emailVerified: false,
      },
      maxWidth: '360px',
    }),
  ],
}

/** The live repro account shape: email verified, no phone saved. */
export const EmailOnlyVerified: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        isVerified: false,
        identityVerification: IdentityVerificationStatus.NotStarted,
        phoneVerified: false,
        emailVerified: true,
      },
      maxWidth: '360px',
    }),
  ],
}

/** Identity check in review: a hollow "pending" row, contacts confirmed. */
export const IdentityPending: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        isVerified: false,
        identityVerification: IdentityVerificationStatus.Pending,
        phoneVerified: true,
        emailVerified: true,
      },
      maxWidth: '360px',
    }),
  ],
}

/** New worker with no experience, quotes or qualifications: the At a glance card is left out. */
export const ThinProfile: Story = {
  decorators: [
    withWorkerProfile({ worker: thinWorkerProfileFixture, maxWidth: '360px' }),
  ],
}

/** One year and one quote: singular labels, and no qualifications note. */
export const SingularCounts: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        yearsExperience: 1,
        quotesSentCount: 1,
        qualifications: [],
      },
      maxWidth: '360px',
    }),
  ],
}

/** The worker's own profile: Contact is disabled and there is no Report control. */
export const OwnProfile: Story = {
  decorators: [
    withWorkerProfile({ worker: ownWorkerProfileFixture, maxWidth: '360px' }),
  ],
}
