import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerProfileAddPlaceholder } from './WorkerProfileAddPlaceholder'
import { WorkerProfileOwnerBanner } from './WorkerProfileOwnerBanner'

const meta = {
  title: 'worker/workers/WorkerProfileOwnerBanner',
  component: WorkerProfileOwnerBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** Thin-owner view: banner plus the dashed "Add …" section placeholders. */
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
          title="Add a bio"
          description="Customers read this before accepting your quote. Two or three sentences about the work you do best."
        />
        <WorkerProfileAddPlaceholder
          title="Add photos of your work"
          description="Workers with photos win more quotes. Add pictures of finished jobs."
        />
      </Stack>
    </Box>
  ),
}

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
