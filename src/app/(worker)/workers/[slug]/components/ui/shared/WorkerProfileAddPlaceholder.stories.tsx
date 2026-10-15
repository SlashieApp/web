import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import bag from '../../../i11n.json'
import { WorkerProfileAddPlaceholder } from './WorkerProfileAddPlaceholder'

/**
 * Owner-only dashed card shown in place of an empty section, linking back to
 * worker setup. Visitors never see these.
 */
const meta = {
  title: 'Worker profile/WorkerProfileAddPlaceholder',
  component: WorkerProfileAddPlaceholder,
  parameters: { layout: 'padded' },
  args: {
    title: bag.en.addBioTitle,
    description: bag.en.addBioDescription,
  },
  render: (args) => (
    <Box maxW="640px">
      <WorkerProfileAddPlaceholder {...args} />
    </Box>
  ),
} satisfies Meta<typeof WorkerProfileAddPlaceholder>

export default meta
type Story = StoryObj<typeof meta>

/** Missing bio. */
export const Default: Story = {}

/** Missing skills. */
export const AddSkills: Story = {
  args: {
    title: bag.en.addSkillsTitle,
    description: bag.en.addSkillsDescription,
  },
}

/** Missing portfolio photos. */
export const AddPhotos: Story = {
  args: {
    title: bag.en.addPhotosTitle,
    description: bag.en.addPhotosDescription,
  },
}

/** Phone: the copy wraps beside the plus icon. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
