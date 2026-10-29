import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { PhoneFrame } from '../PhoneFrame'
import { ProfileScreen } from './ProfileScreen'

const copy = messages.en.landing.phone

/**
 * Story-only: taps "See all reviews", unless the screen's autoplay beat (about
 * 2.6 s after it starts) already did, then waits for the last review.
 */
async function seeAllReviews(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const lastReview = copy.profile.items[copy.profile.items.length - 1]
  const seeAll = canvas.queryByRole('button', { name: copy.profile.seeAll })
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
  // The landing's phone: the screen inside its frame on the white page.
  decorators: [
    (Story) => (
      <Box p={{ base: 4, md: 8 }} bg="bg.surface" display="inline-block">
        <PhoneFrame label={copy.demoLabel} nominalWidth={300} w="300px">
          <Story />
        </PhoneFrame>
      </Box>
    ),
  ],
} satisfies Meta<typeof ProfileScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the profile details are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: the profile fills in with one review and "See all reviews" pulses. */
export const Playing: Story = {}

/** All reviews: the full review list is shown and the button is gone. */
export const AllReviews: Story = {
  play: ({ canvasElement }) => seeAllReviews(canvasElement),
}
