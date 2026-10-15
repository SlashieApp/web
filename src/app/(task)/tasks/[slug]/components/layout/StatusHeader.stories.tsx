import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { StatusHeader } from './StatusHeader'

/** The band is transparent; a dashed frame shows how tall it is. */
const meta = {
  title: 'Task detail/Layout/StatusHeader',
  component: StatusHeader,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Box
        position="relative"
        borderBottomWidth="2px"
        borderStyle="dashed"
        borderColor="border.strong"
        bg="bg.subtle"
      >
        <Story />
        <Text
          position="absolute"
          bottom={2}
          left={4}
          fontSize="xs"
          color="text.muted"
        >
          Map shows through this band
        </Text>
      </Box>
    ),
  ],
} satisfies Meta<typeof StatusHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Phone: the 300px map band above the sticky title. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}

/** Tablet: a taller 360px band. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
}
