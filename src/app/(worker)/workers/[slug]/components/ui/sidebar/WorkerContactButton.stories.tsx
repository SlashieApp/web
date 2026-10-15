import { WorkerContactAction } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkerProfile } from '../shared/workerProfileStoryDecorator'
import {
  ownWorkerProfileFixture,
  workerProfileFixture,
  workerViewer,
} from '../shared/workerProfileStoryFixtures'
import { WorkerContactButton } from './WorkerContactButton'

/**
 * "Contact {first name}" button. What a click does depends on the viewer's
 * `contactAction` (sign in, open the quote or task, explain the unlock); the
 * button itself only changes for the worker's own profile and while loading.
 */
const meta = {
  title: 'Worker profile/WorkerContactButton',
  component: WorkerContactButton,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkerContactButton>

export default meta
type Story = StoryObj<typeof meta>

/** Signed-out visitor: a click goes to sign in and returns to this profile. */
export const SignedOut: Story = {
  decorators: [
    withWorkerProfile({ worker: workerProfileFixture, maxWidth: '320px' }),
  ],
}

/** Signed-in with no history: a click explains that contact unlocks after accepting a quote. */
export const AcceptQuoteFirst: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        viewer: workerViewer(WorkerContactAction.AcceptQuoteFirst),
      },
      maxWidth: '320px',
    }),
  ],
}

/** The worker has a pending quote on the viewer's task: a click opens that task's quotes. */
export const PendingQuote: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        viewer: workerViewer(WorkerContactAction.OpenQuote, {
          relatedTaskId: 'task-1',
          relatedQuoteId: 'quote-1',
        }),
      },
      maxWidth: '320px',
    }),
  ],
}

/** Active job together: a click opens that task. */
export const ActiveJob: Story = {
  decorators: [
    withWorkerProfile({
      worker: {
        ...workerProfileFixture,
        viewer: workerViewer(WorkerContactAction.OpenTask, {
          relatedTaskId: 'task-1',
        }),
      },
      maxWidth: '320px',
    }),
  ],
}

/** The worker's own profile: the button is disabled. */
export const OwnProfile: Story = {
  decorators: [
    withWorkerProfile({ worker: ownWorkerProfileFixture, maxWidth: '320px' }),
  ],
}

/** Large size, as used in the phone sticky bar. */
export const Large: Story = {
  args: { size: 'lg' },
  decorators: [
    withWorkerProfile({ worker: workerProfileFixture, maxWidth: '320px' }),
  ],
}

/** Profile still loading: a skeleton the size of the button. */
export const Loading: Story = {
  decorators: [withWorkerProfile({ maxWidth: '320px' })],
}
