import { WorkerContactAction } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkerProfile } from '../shared/workerProfileStoryDecorator'
import {
  ownWorkerProfileFixture,
  storyPhoto,
  thinWorkerProfileFixture,
  workerProfileFixture,
  workerViewer,
} from '../shared/workerProfileStoryFixtures'
import { WorkerProfileHero } from './WorkerProfileHero'

/**
 * Profile hero: mint band, avatar with verified badge, name, headline,
 * tagline, stats and the approximate service area, plus the Save / review
 * actions. Listing clicks paint the identity from the card while the rest loads.
 */
const meta = {
  title: 'Worker profile/WorkerProfileHero',
  component: WorkerProfileHero,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkerProfileHero>

export default meta
type Story = StoryObj<typeof meta>

/** Verified worker with tagline, stats and service area, seen by a signed-out visitor. */
export const Default: Story = {
  decorators: [
    withWorkerProfile({ worker: workerProfileFixture, maxWidth: '1100px' }),
  ],
}

/** Signed-in customer with a completed job: Save active, review eligible. */
export const EligibleViewer: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        viewer: workerViewer(WorkerContactAction.OpenTask, {
          isSaved: true,
          canLeaveReview: true,
          relatedTaskId: 'task-1',
        }),
      },
      maxWidth: '1100px',
    }),
  ],
}

/** Worker with a profile photo: the avatar shows it instead of initials. */
export const WithPhoto: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        profile: { avatarUrl: storyPhoto(150), name: 'James Thornton' },
      },
      maxWidth: '1100px',
    }),
  ],
}

/** The worker looking at their own profile: Save disabled, no Report control. */
export const OwnProfile: Story = {
  decorators: [
    withWorkerProfile({ worker: ownWorkerProfileFixture, maxWidth: '1100px' }),
  ],
}

/** New worker: unverified, no tagline or skills, no reviews, no jobs, area from their base town. */
export const UnverifiedNoTagline: Story = {
  decorators: [
    withWorkerProfile({
      worker: thinWorkerProfileFixture,
      maxWidth: '1100px',
    }),
  ],
}

/** Long name, headline, tagline and service area wrap instead of overflowing. */
export const LongText: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        profile: {
          avatarUrl: null,
          name: 'Bartholomew Featherstonehaugh-Montgomery',
        },
        tagline:
          'Reliable, on-time local help across North London, with a van, a full tool kit and a lot of patience for flat-pack instructions',
        skills: ['Furniture assembly and disassembly', 'Handyman'],
        serviceAreaLabel:
          'Camden, Islington, Haringey, Hackney, Barnet and Enfield (~15 miles)',
      },
      maxWidth: '1100px',
    }),
  ],
}

/** Phone: avatar and identity are centred in one column. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withWorkerProfile({ worker: workerProfileFixture })],
}

/** A card click hands over name, photo, rating and area; the rest stays skeleton until the profile arrives. */
export const LoadingFromListing: Story = {
  decorators: [
    withWorkerProfile({
      seed: {
        id: 'worker-from-listing',
        name: 'Maya Okafor',
        avatarUrl: storyPhoto(150),
        verified: true,
        subtitle: 'Flat-pack, shelving and mounting, tidy every time',
        ratingLabel: '4.9 (128)',
        experienceLabel: '5 yrs exp',
        serviceAreaLabel: 'Camden & Islington (~5 miles)',
        skills: ['Assembly', 'Mounting'],
      },
      maxWidth: '1100px',
    }),
  ],
}

/** Opened directly with nothing handed over: identity skeleton and skeleton buttons. */
export const Loading: Story = {
  decorators: [withWorkerProfile({ maxWidth: '1100px' })],
}
