import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { ProfileScreen } from './ProfileScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone
const showAll = formatMessage(copy.profile.showAll, {
  count: copy.profile.reviewCount,
})

/**
 * Story-only: taps "Show all reviews", unless the screen's autoplay beat (about
 * 2.6 s after it starts) already did, then waits for the last review.
 */
async function seeAllReviews(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const lastReview = copy.profile.items[copy.profile.items.length - 1]
  const seeAll = canvas.queryByRole('button', { name: showAll })
  if (seeAll) await userEvent.click(seeAll)
  await expect(await canvas.findByText(lastReview.text)).toBeInTheDocument()
}

const meta = {
  title: 'Marketing/Landing/ProfileScreen',
  component: ProfileScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { copy: { control: false } },
  args: { copy, active: true, intro: true },
  // The landing's phone: the pinned one, or the cropped one with `compact`.
  decorators: [withDemoPhone],
} satisfies Meta<typeof ProfileScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the profile details are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/**
 * Playing: the app's public profile. The card with the photo, Save, the name
 * and "Worker", the stats grid (the rating over its reviews, jobs done,
 * years' experience, joined), Skills, and Reviews with one review and "Show
 * all reviews" pulsing.
 */
export const Playing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(copy.profile.worker)).toBeInTheDocument()
    await expect(canvas.getByText(copy.profile.save)).toBeInTheDocument()
    await expect(canvas.getByText(copy.profile.jobsLabel)).toBeInTheDocument()
    await expect(canvas.getByText(copy.profile.yearsLabel)).toBeInTheDocument()
    await expect(canvas.getByText(copy.profile.joinedLabel)).toBeInTheDocument()
    await expect(canvas.getByText(copy.profile.skillsTitle)).toBeInTheDocument()
    const first = canvasElement.querySelector('[data-profile-review]')
    await expect(first).toHaveTextContent(copy.profile.fromCustomer)
  },
}

/** All reviews: the full review list is shown and the button is gone. */
export const AllReviews: Story = {
  play: ({ canvasElement }) => seeAllReviews(canvasElement),
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the worker in the
 * bar, the rating and the jobs done, one review and "Show all reviews"
 * pulsing above the crop.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [
      copy.profile.name,
      copy.profile.items[0].text,
    ]),
}

/** Cropped phone, all reviews: the list runs under the crop and fades out there; the first two reviews are whole. */
export const CompactAllReviews: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await seeAllReviews(canvasElement)
    await expectFitsTheCrop(canvasElement, [
      copy.profile.items[0].text,
      copy.profile.items[1].text,
    ])
  },
}
