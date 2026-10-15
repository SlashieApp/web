import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import bag from '../../../i11n.json'
import { WorkerProfileAddPlaceholder } from '../shared/WorkerProfileAddPlaceholder'
import { WorkerProfileOwnerBanner } from './WorkerProfileOwnerBanner'

/** The banner remembers a dismissal per worker in localStorage (the component's key prefix). */
const DISMISS_KEY_PREFIX = 'slashie.profile-strength-banner.'

function forgetDismissals() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(DISMISS_KEY_PREFIX)) localStorage.removeItem(key)
    }
  } catch {
    // Storage unavailable: the banner shows anyway.
  }
}

/**
 * Owner-only, dismissible profile-strength banner. Hidden at 100%, and hidden
 * for good once the owner dismisses it.
 */
const meta = {
  title: 'Worker profile/WorkerProfileOwnerBanner',
  component: WorkerProfileOwnerBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  // A dismissal from an earlier visit would hide every story below.
  beforeEach: forgetDismissals,
} satisfies Meta<typeof WorkerProfileOwnerBanner>

export default meta
type Story = StoryObj<typeof meta>

/** Thin-owner view: banner plus the dashed "Add ..." section placeholders. */
export const ThinProfileOwner: Story = {
  args: {
    workerId: 'story-thin-owner',
    percent: 50,
    nextGap: { key: 'bio', label: 'write a short bio' },
  },
  render: (args) => (
    <Box maxW="640px">
      <Stack gap={5}>
        <WorkerProfileOwnerBanner {...args} />
        <WorkerProfileAddPlaceholder
          title={bag.en.addBioTitle}
          description={bag.en.addBioDescription}
        />
        <WorkerProfileAddPlaceholder
          title={bag.en.addPhotosTitle}
          description={bag.en.addPhotosDescription}
        />
      </Stack>
    </Box>
  ),
}

/** One step from done: the next gap is the portfolio. */
export const NearlyComplete: Story = {
  args: {
    workerId: 'story-nearly-complete',
    percent: 83,
    nextGap: { key: 'portfolio', label: 'add photos of your work' },
  },
  render: (args) => (
    <Box maxW="640px">
      <WorkerProfileOwnerBanner {...args} />
    </Box>
  ),
}

/** Phone: the banner uses the full width and the dismiss button stays reachable. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: {
    workerId: 'story-phone',
    percent: 50,
    nextGap: { key: 'skills', label: 'add at least 3 skills' },
  },
}

/** Complete profile (100%): the banner renders nothing. */
export const Complete: Story = {
  args: { workerId: 'story-complete', percent: 100, nextGap: null },
  render: (args) => (
    <Stack gap={2} maxW="640px">
      <Text fontSize="sm" color="text.muted">
        Nothing renders below at 100%.
      </Text>
      <WorkerProfileOwnerBanner {...args} />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByText(/% complete/)).toBeNull()
  },
}

/** After the owner dismisses it: the banner goes away. */
export const Dismissed: Story = {
  args: {
    workerId: 'story-dismissed',
    percent: 50,
    nextGap: { key: 'bio', label: 'write a short bio' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Dismiss profile strength banner',
      }),
    )
    await expect(canvas.queryByText(/% complete/)).toBeNull()
  },
}
