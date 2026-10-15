import { WorkerContactAction } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkerProfile } from '../shared/workerProfileStoryDecorator'
import {
  ownWorkerProfileFixture,
  workerProfileFixture,
  workerViewer,
} from '../shared/workerProfileStoryFixtures'
import { WorkerProfileActions } from './WorkerProfileActions'

/**
 * Hero actions: Save (heart), Leave a review and Report, driven by how the
 * viewer relates to the worker. Save toggles optimistically; no request
 * leaves Storybook.
 */
const meta = {
  title: 'Worker profile/WorkerProfileActions',
  component: WorkerProfileActions,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkerProfileActions>

export default meta
type Story = StoryObj<typeof meta>

/** Signed-out visitor: Save sends them to sign in, Leave a review is disabled. */
export const SignedOut: Story = {
  decorators: [withWorkerProfile({ worker: workerProfileFixture })],
}

/** Signed-in customer with no history with the worker: can save, cannot review yet. */
export const SignedIn: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        viewer: workerViewer(WorkerContactAction.AcceptQuoteFirst),
      },
    }),
  ],
}

/** Worker already saved: filled heart and "Saved". */
export const Saved: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        viewer: workerViewer(WorkerContactAction.AcceptQuoteFirst, {
          isSaved: true,
        }),
      },
    }),
  ],
}

/** Customer with a completed job: Leave a review is enabled. */
export const CanLeaveReview: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        viewer: workerViewer(WorkerContactAction.OpenTask, {
          canLeaveReview: true,
          relatedTaskId: 'task-1',
        }),
      },
    }),
  ],
}

/** The worker's own profile: Save is disabled and there is no Report control. */
export const OwnProfile: Story = {
  decorators: [withWorkerProfile({ worker: ownWorkerProfileFixture })],
}

/** Profile still loading: skeleton buttons. */
export const Loading: Story = {
  decorators: [withWorkerProfile()],
}
