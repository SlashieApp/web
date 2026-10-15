import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withStoryApollo } from '@/app/(worker)/workers/components/storyApollo'

import { PublicProfileScreen } from './PublicProfileScreen'
import {
  sampleCustomerProfile,
  sampleOwnerCustomerProfile,
  sampleOwnerProfile,
  samplePublicProfile,
  sampleRichWorkerProfile,
  sampleThinWorkerProfile,
} from './publicProfileStoryFixture'

/**
 * Public profile at `/profile/[userId]`: hero, then about, skills, open
 * tasks, work history and reviews, with a trust and contact sidebar for
 * workers. What shows depends on who the profile is and who is looking.
 */
const meta = {
  title: 'Public profile/PublicProfileScreen',
  component: PublicProfileScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withStoryApollo],
} satisfies Meta<typeof PublicProfileScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Worker seen by a signed-in customer who has worked with them: Contact, Save and an enabled Leave a review. */
export const Default: Story = {
  args: {
    view: samplePublicProfile(),
    reviewHref: '/tasks/task-1/review?orderId=order-1',
  },
}

/** Signed-out visitor: no viewer, so Leave a review is disabled and Contact and Save lead to sign in. */
export const SignedOut: Story = {
  args: { view: samplePublicProfile({ viewer: null }) },
}

/** Visitor who has saved this worker: the heart is filled and reads "Saved". */
export const Saved: Story = {
  args: { ...Default.args, saved: true },
}

/** The worker's own profile: preview banner, Contact and Save disabled, no Report, and the private Your activity block. */
export const Owner: Story = {
  args: { view: sampleOwnerProfile() },
}

/** A customer's own profile: preview banner, their open tasks and the private Your activity block, with no Report control. */
export const OwnerCustomer: Story = {
  args: { view: sampleOwnerCustomerProfile() },
}

/** Every section filled: long bio, 11 skills (with "Show 3 more"), credentials, photos, open tasks, jobs and reviews. */
export const RichWorker: Story = {
  args: {
    view: sampleRichWorkerProfile(),
    reviewHref: '/tasks/task-1/review?orderId=order-1',
  },
}

/** Worker on day one: no bio, skills, jobs or reviews, and every empty state in its place. */
export const ThinWorker: Story = {
  args: { view: sampleThinWorkerProfile() },
}

/** Nothing verified: no tick by the name, phone and email rows read "not confirmed". */
export const Unverified: Story = {
  args: {
    view: samplePublicProfile({
      verified: false,
      phoneVerified: false,
      emailVerified: false,
      yearsExperience: null,
    }),
  },
}

/** Two reviews: the count shows, and a note that the average appears after three. */
export const BelowReviewThreshold: Story = {
  args: {
    view: samplePublicProfile({
      ratingCount: 2,
      ratingAverage: null,
      reviews: [
        {
          id: 'review-1',
          stars: 5,
          comment: 'On time and tidy.',
          createdLabel: '12 Mar 2026',
        },
        {
          id: 'review-2',
          stars: 4,
          comment: null,
          createdLabel: '2 Feb 2026',
        },
      ],
    }),
  },
}

/** Customer profile: just their open tasks and a Report control, with no worker sections or Contact. */
export const Customer: Story = {
  args: { view: sampleCustomerProfile() },
}

/** Opened from one of their tasks: that task is left out, so an empty list says "No other open tasks". */
export const NoOtherOpenTasks: Story = {
  args: { view: samplePublicProfile(), excludeTaskId: 'task-open-1' },
}

/** Long name, headline, tagline, bio and service area wrap instead of overflowing. */
export const LongText: Story = {
  args: {
    view: samplePublicProfile({
      name: 'Bartholomew Featherstonehaugh-Montgomery',
      headline:
        'Handyman • Furniture assembly • TV mounting • Small repairs • Flat-pack kitchens',
      tagline:
        'Careful, tidy work across the whole of north London, with my own van, tools and dust sheets',
      bio: 'I take on small repairs and flat-pack builds of every size, from a single bookshelf to a full set of fitted wardrobes.\nMost jobs are done in a morning. I always bring my own tools, put dust sheets down and take every offcut with me when I leave, so you never have to tidy up after me.\nSend a few photos of the job and I will tell you what I can do and roughly how long it will take.',
      serviceAreaLabel:
        'Camden, Islington, Haringey, Hackney, Barnet and Enfield (~15 miles)',
    }),
  },
}

/** Phone: centred hero, one column, and the Contact button floating above the bottom nav. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: {
    view: samplePublicProfile(),
    reviewHref: '/tasks/task-1/review?orderId=order-1',
  },
}

/** Profile still loading: two skeleton blocks. */
export const Loading: Story = {
  args: { pending: true },
}
