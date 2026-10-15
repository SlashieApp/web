import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  STORY_WORKER_AVATAR,
  completedWorkerSetupForm,
  withWorkerSetup,
  workerSetupStoryForm,
} from '../../workerSetupStoryFixtures'
import { WorkerSetupProfilePreview } from './WorkerSetupProfilePreview'

const meta: Meta<typeof WorkerSetupProfilePreview> = {
  title: 'Worker setup/WorkerSetupProfilePreview',
  component: WorkerSetupProfilePreview,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Nothing filled in: placeholder name, no headline, empty skills and bio. */
export const Empty: Story = {
  decorators: [withWorkerSetup({ form: workerSetupStoryForm() })],
}

/** Name, trade and years only: a headline appears, the rest stays empty. */
export const NameAndTrade: Story = {
  decorators: [
    withWorkerSetup({
      form: workerSetupStoryForm({
        firstName: 'Sam',
        lastName: 'Taylor',
        primaryCategory: 'handyman',
        yearsExperience: '8',
      }),
    }),
  ],
}

/** A finished profile: photo, headline, bio, service area and six skills. */
export const Complete: Story = {
  decorators: [
    withWorkerSetup(
      {
        form: completedWorkerSetupForm,
      },
      { avatarUrl: STORY_WORKER_AVATAR, phoneVerified: true },
    ),
  ],
}

/** A long bio: phones collapse it behind "Read more". */
export const LongBio: Story = {
  decorators: [
    withWorkerSetup({
      form: {
        ...completedWorkerSetupForm,
        bio: 'I fit and repair kitchens and bathrooms across North London, with 8 years on the tools. Customers choose me for tidy work, honest quotes and turning up when I say I will. I also take small plumbing and tiling jobs, and I always leave the room cleaner than I found it.',
      },
    }),
  ],
  globals: { viewport: { value: 'mobile1' } },
}
