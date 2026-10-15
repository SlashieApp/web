import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  WorkerProfileHeroIdentitySkeleton,
  WorkerProfileSectionSkeleton,
} from './WorkerProfileSkeletons'

/**
 * Loading placeholders for the worker profile: a section card with two to four
 * text lines, and the hero's avatar plus identity lines.
 */
const meta = {
  title: 'Worker profile/WorkerProfileSkeletons',
  component: WorkerProfileSectionSkeleton,
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="720px">
      <WorkerProfileSectionSkeleton {...args} />
    </Box>
  ),
} satisfies Meta<typeof WorkerProfileSectionSkeleton>

export default meta
type Story = StoryObj<typeof meta>

/** Section card, three lines (the default). */
export const Default: Story = {}

/** Section card with two text lines. */
export const TwoLines: Story = { args: { lines: 2 } }

/** Section card with four text lines. */
export const FourLines: Story = { args: { lines: 4 } }

/** Hero identity: avatar circle and four text lines, shown by a hero with nothing to paint yet. */
export const HeroIdentity: Story = {
  render: () => (
    <Box maxW="720px">
      <WorkerProfileHeroIdentitySkeleton />
    </Box>
  ),
}

/** Phone: the hero identity skeleton centres under the avatar. */
export const HeroIdentityPhone: Story = {
  ...HeroIdentity,
  globals: { viewport: { value: 'mobile1' } },
}
