import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storyPhoto } from '../shared/workerProfileStoryFixtures'
import { WorkerPortfolioSection } from './WorkerPortfolioSection'

/**
 * Portfolio card: up to six work photos, or three "coming soon" tiles while
 * the worker has none. Takes plain props, so no profile context is needed.
 */
const meta = {
  title: 'Worker profile/WorkerPortfolioSection',
  component: WorkerPortfolioSection,
  parameters: { layout: 'padded' },
  args: { workerName: 'James Thornton', portfolioUrls: [] },
  render: (args) => (
    <Box maxW="720px">
      <WorkerPortfolioSection {...args} />
    </Box>
  ),
} satisfies Meta<typeof WorkerPortfolioSection>

export default meta
type Story = StoryObj<typeof meta>

/** No photos yet: three dashed "Work photos coming soon" tiles. */
export const Default: Story = {}

/** Three photos in a row. */
export const ThreePhotos: Story = {
  args: { portfolioUrls: [storyPhoto(150), storyPhoto(30), storyPhoto(280)] },
}

/** More than six photos: only the first six show. */
export const ManyPhotos: Story = {
  args: {
    portfolioUrls: [20, 60, 120, 180, 240, 300, 340, 90].map(storyPhoto),
  },
}

/** Phone: photos stack in one column. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: { portfolioUrls: [storyPhoto(150), storyPhoto(30), storyPhoto(280)] },
}
