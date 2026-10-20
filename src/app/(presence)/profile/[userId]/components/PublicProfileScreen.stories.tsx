import { WorkerContactAction } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { withStoryApollo } from '@/app/(worker)/workers/components/storyApollo'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { PublicProfileScreen } from './PublicProfileScreen'
import {
  STORY_NOW,
  sampleCustomer,
  sampleDayOneWorker,
  sampleHiddenOwner,
  sampleOpenTasks,
  sampleOwner,
  sampleOwnerCustomer,
  sampleReviews,
  sampleViewer,
  sampleWorker,
} from './ui/publicProfileStoryFixture'

/**
 * `/profile/[userId]`: one story per named view (`views/README.md`), then the
 * states inside a view. Who is looking decides the main action; the model
 * decides which sections have something to show.
 */
const meta = {
  title: 'Public profile/PublicProfileScreen',
  component: PublicProfileScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withStoryApollo],
  args: { onSave: fn(), onRetry: fn(), onBack: fn(), now: STORY_NOW },
} satisfies Meta<typeof PublicProfileScreen>

export default meta
type Story = StoryObj<typeof meta>

const REVIEW_HREF = '/tasks/task-1/review?orderId=order-1'

/** The helper line is in the sidebar card and the phone bar; one shows. */
async function expectOneVisible(canvasElement: HTMLElement, text: string) {
  const matches = await within(canvasElement).findAllByText(text)
  await expect(
    matches.filter((element) => element.checkVisibility()),
  ).toHaveLength(1)
}

/** `loading`: the hero and two sections in outline. */
export const Loading: Story = {
  args: { view: 'loading', model: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Loading profile')).toBeInTheDocument()
    await expect(canvas.queryByRole('heading', { level: 1 })).toBeNull()
  },
}

/** `loadError`: the profile could not load; Try again refetches. */
export const LoadError: Story = {
  args: { view: 'loadError', model: null },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Try again' }),
    )
    await expect(args.onRetry).toHaveBeenCalled()
  },
}

/** `unavailable`: private, suspended, deleted or unknown; one way forward. */
export const Unavailable: Story = {
  args: { view: 'unavailable', model: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Profile unavailable' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Back to search' }),
    ).toHaveAttribute('href', '/search')
  },
}

/** `worker.ownerHidden`: your own private worker profile, previewed under a hidden notice. */
export const WorkerOwnerHidden: Story = {
  args: { view: 'worker.ownerHidden', model: sampleHiddenOwner(STORY_NOW) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Your profile is hidden'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Profile settings' }),
    ).toHaveAttribute('href', '/profile?section=visibility')
    await expect(canvas.queryByText('This is how others see you.')).toBeNull()
    await expect(
      canvas.getByRole('heading', { name: 'Work on Slashie' }),
    ).toBeVisible()
  },
}

/** `customer.ownerHidden`: your own private customer profile, the same notice. */
export const CustomerOwnerHidden: Story = {
  args: {
    view: 'customer.ownerHidden',
    model: { ...sampleOwnerCustomer(STORY_NOW), isHidden: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Your profile is hidden'),
    ).toBeVisible()
    await expect(canvas.getByText('bookings completed')).toBeVisible()
  },
}

/** `worker.guest`: signed out. The main action is sign in; no review button. */
export const WorkerGuest: Story = {
  args: { view: 'worker.guest', model: sampleWorker({ viewer: null }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: 'Sign in to contact Alex' }),
    ).toHaveAttribute(
      'href',
      `/login?next=${encodeURIComponent('/profile/user-1')}`,
    )
    await expect(
      canvas.getByRole('button', { name: 'Save this worker' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: 'Leave a review' }),
    ).toBeNull()
  },
}

/** `worker.visitor`: signed in, no quote or job yet, and a finished job before. */
export const WorkerVisitor: Story = {
  args: {
    view: 'worker.visitor',
    model: sampleWorker(),
    reviewHref: REVIEW_HREF,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: 'Post a task' }),
    ).toHaveAttribute('href', '/tasks/create')
    await expectOneVisible(
      canvasElement,
      "Contact details unlock after you accept Alex's quote.",
    )
    await expect(
      canvas.getByRole('link', { name: 'Leave a review' }),
    ).toHaveAttribute('href', REVIEW_HREF)
    await expect(
      canvas.getByRole('heading', { name: 'Alex Morgan', level: 1 }),
    ).toBeVisible()
  },
}

/** `worker.quoted`: they quoted on your open task. */
export const WorkerQuoted: Story = {
  args: {
    view: 'worker.quoted',
    model: sampleWorker({
      viewer: sampleViewer(WorkerContactAction.OpenQuote, 'task-7'),
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: "View Alex's quote" }),
    ).toHaveAttribute('href', '/tasks/task-7#task-quotes')
    await expectOneVisible(canvasElement, 'Alex has quoted on your task.')
  },
}

/** `worker.booked`: you have a booked job with them. */
export const WorkerBooked: Story = {
  args: {
    view: 'worker.booked',
    model: sampleWorker({
      viewer: sampleViewer(WorkerContactAction.OpenTask, 'task-8'),
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: 'Open your job' }),
    ).toHaveAttribute('href', '/tasks/task-8')
  },
}

/** `worker.owner`: your own profile. What visitors see, then Your activity. */
export const WorkerOwner: Story = {
  args: { view: 'worker.owner', model: sampleOwner(STORY_NOW) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('This is how others see you.'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Edit profile' }),
    ).toHaveAttribute('href', '/profile')
    await expect(
      canvas.queryByRole('button', { name: 'Save this worker' }),
    ).toBeNull()
    await expect(canvas.queryByText('Get in touch')).toBeNull()
    await expect(
      canvas.getByRole('heading', { name: 'Your activity' }),
    ).toBeVisible()
  },
}

/** `customer.visitor`: open tasks with their budget, then reviews. */
export const CustomerVisitor: Story = {
  args: { view: 'customer.visitor', model: sampleCustomer() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('£60')).toBeVisible()
    await expect(canvas.getByText('Customer')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Save this worker' }),
    ).toBeNull()
    await expect(
      canvas.getByText(
        'No reviews yet. Reviews appear here after completed jobs.',
      ),
    ).toBeVisible()
  },
}

/** `customer.owner`: your own customer profile, with Your activity. */
export const CustomerOwner: Story = {
  args: { view: 'customer.owner', model: sampleOwnerCustomer(STORY_NOW) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('This is how others see you.'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('heading', { name: 'Your activity' }),
    ).toBeVisible()
  },
}

/** You saved this worker: a filled heart that reads "Saved". */
export const Saved: Story = {
  args: { ...WorkerVisitor.args, saved: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const save = await canvas.findByRole('button', {
      name: 'Remove saved worker',
    })
    await expect(save).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(save)
    await expect(args.onSave).toHaveBeenCalled()
  },
}

/** No reviews: no rating cell; Reviews says so once. */
export const NoReviews: Story = {
  args: {
    view: 'worker.visitor',
    model: sampleWorker({ reviews: [], ratingCount: 0, ratingAverage: null }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(
        'No reviews yet. Reviews appear here after completed jobs.',
      ),
    ).toBeVisible()
    await expect(canvas.queryByText('4 reviews')).toBeNull()
  },
}

/** Reviews name their author and job; a deleted author falls back to "A Slashie user". */
export const ReviewAuthors: Story = {
  args: { view: 'worker.visitor', model: sampleWorker() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Priya')).toBeVisible()
    await expect(canvas.getByText('For Assemble a wardrobe')).toBeVisible()
    await expect(canvas.getAllByText('A Slashie user')[0]).toBeVisible()
  },
}

/** Two reviews: the count, and the average waits for a third. */
export const BelowReviewThreshold: Story = {
  args: {
    view: 'worker.visitor',
    model: sampleWorker({
      reviews: sampleReviews(2),
      ratingCount: 2,
      ratingAverage: null,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('The average appears after 3 reviews.'),
    ).toBeVisible()
  },
}

/** Busy profile: 5 reviews and 5 jobs show, then Show all. */
export const LongLists: Story = {
  args: {
    view: 'worker.visitor',
    model: sampleWorker({
      reviews: sampleReviews(8),
      ratingCount: 8,
      ratingAverage: 4.7,
      completedJobsCount: 7,
      completedJobs: Array.from({ length: 7 }, (_, index) => ({
        id: `job-${index + 1}`,
        title: `Flat-pack job ${index + 1}`,
        category: 'Handyman',
        areaLabel: 'Camden',
        completedLabel: 'March 2026',
        rating: 5,
      })),
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Flat-pack job 5')).toBeVisible()
    await expect(canvas.queryByText('Flat-pack job 6')).toBeNull()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show all 7 jobs' }),
    )
    await expect(await canvas.findByText('Flat-pack job 7')).toBeVisible()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show all 8 reviews' }),
    )
    await expect(
      await canvas.findByText('Brought the right tools first time.'),
    ).toBeVisible()
  },
}

/** Day one: empty sections stay hidden; Reviews keeps its empty line. */
export const DayOneWorker: Story = {
  args: { view: 'worker.guest', model: sampleDayOneWorker() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Reviews' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('heading', { name: 'About' })).toBeNull()
    await expect(
      canvas.queryByRole('heading', { name: 'Work on Slashie' }),
    ).toBeNull()
    await expect(canvas.getByText('Oct 2026')).toBeVisible()
  },
}

/** A worker who also hosts: their open tasks come after the photos. */
export const WorkerWhoHosts: Story = {
  args: {
    view: 'worker.visitor',
    model: sampleWorker({
      openTasks: sampleOpenTasks.slice(0, 1),
      openTaskCount: 1,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Open tasks' }),
    ).toBeVisible()
  },
}

/** Opened from their only task: that task is left out. */
export const NoOtherOpenTasks: Story = {
  args: {
    view: 'customer.visitor',
    model: sampleCustomer({ openTasks: [], openTaskCount: 0 }),
    excludeTaskId: 'task-open-1',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('No other open tasks right now.'),
    ).toBeVisible()
  },
}

/** Long name, headline, tagline and area wrap instead of overflowing. */
export const LongText: Story = {
  args: {
    view: 'worker.visitor',
    model: sampleWorker({
      name: 'Bartholomew Featherstonehaugh-Montgomery',
      headline: 'Handyman · Furniture assembly',
      tagline:
        'Careful, tidy work across the whole of north London, with my own van, tools and dust sheets',
      serviceAreaLabel:
        'Camden, Islington, Haringey, Hackney, Barnet and Enfield (~15 miles)',
    }),
  },
}

/** Phone, signed out: one column, the main action in a bar above the nav. */
export const Phone: Story = {
  ...WorkerGuest,
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const links = await canvas.findAllByRole('link', {
      name: 'Sign in to contact Alex',
    })
    await expect(links).toHaveLength(1)
    await expect(canvas.getByRole('button', { name: 'Back' })).toBeVisible()
  },
}

/** Phone, customer profile: one column of task cards. */
export const PhoneCustomer: Story = {
  ...CustomerVisitor,
  globals: { viewport: { value: 'mobile1' } },
}

/** zh-HK: the same view in Chinese. */
export const ZhHk: Story = {
  ...WorkerVisitor,
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/profile/user-1' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('link', { name: '發布任務' }),
    ).toHaveAttribute('href', '/zh-hk/tasks/create')
    await expectOneVisible(
      canvasElement,
      '接受 Alex 的報價後，先會解鎖聯絡資料。',
    )
  },
}
