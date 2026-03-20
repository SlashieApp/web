import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { StitchScreensPreview } from './StitchScreensPreview'

const meta: Meta<typeof StitchScreensPreview> = {
  title: 'UI/Project/Stitch Screens Preview',
  component: StitchScreensPreview,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof StitchScreensPreview>

export const Default: Story = {
  render: (args) => (
    <Box bg="surface" py={8} px={{ base: 4, md: 8 }}>
      <StitchScreensPreview {...args} />
    </Box>
  ),
}
