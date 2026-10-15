import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkersStory } from '../workersStoryDecorator'
import {
  WorkersAreaInput,
  WorkersDistanceControl,
  WorkersSkillsInput,
  WorkersVerifiedToggle,
} from './WorkersSearchFields'

/**
 * The four controls of the worker search bar and filters drawer. Each reads
 * the shared area and filter state, so every story mounts the real providers.
 */
const meta = {
  title: 'Workers/WorkersSearchFields',
  component: WorkersAreaInput,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WorkersAreaInput>

export default meta
type Story = StoryObj<typeof meta>

/** Area field with the searched area filled in and the "use my location" button. */
export const AreaInput: Story = {
  decorators: [
    withWorkersStory({
      area: { label: 'Camden', lat: 51.539, lng: -0.1426 },
    }),
  ],
  render: () => (
    <Box maxW="360px">
      <WorkersAreaInput />
    </Box>
  ),
}

/** Skills field, empty: shows its placeholder. */
export const SkillsInput: Story = {
  decorators: [withWorkersStory()],
  render: () => (
    <Box maxW="360px">
      <WorkersSkillsInput />
    </Box>
  ),
}

/** Skills field with a search already typed in. */
export const SkillsInputFilled: Story = {
  decorators: [withWorkersStory({ searchText: 'plumbing' })],
  render: () => (
    <Box maxW="360px">
      <WorkersSkillsInput />
    </Box>
  ),
}

/** Distance as an inline slider with a km label, as in the desktop bar. */
export const DistanceInline: Story = {
  decorators: [withWorkersStory()],
  render: () => (
    <Box maxW="260px">
      <WorkersDistanceControl layout="inline" />
    </Box>
  ),
}

/** Distance as a block with the label above, as in the phone filters drawer (25 miles = 40 km). */
export const DistanceBlock: Story = {
  decorators: [withWorkersStory({ radiusMiles: 25 })],
  render: () => (
    <Box maxW="360px">
      <WorkersDistanceControl layout="block" />
    </Box>
  ),
}

/** "Identity verified" toggle, off. */
export const VerifiedToggleOff: Story = {
  decorators: [withWorkersStory()],
  render: () => <WorkersVerifiedToggle />,
}

/** "Identity verified" toggle, on: primary fill and a check mark. */
export const VerifiedToggleOn: Story = {
  decorators: [withWorkersStory({ verifiedOnly: true })],
  render: () => <WorkersVerifiedToggle />,
}
