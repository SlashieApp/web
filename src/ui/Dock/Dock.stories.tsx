import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Dock } from './Dock'

const meta = {
  title: 'ui/Dock',
  component: Dock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Dock>

export default meta

type Story = StoryObj<typeof meta>

/** Desktop: fixed left rail, full viewport height, Get app pinned to bottom. */
export const Default: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  render: () => (
    <Box
      h="100dvh"
      bg="bg"
      display="flex"
      flexDirection="row"
      overflow="hidden"
    >
      <Box flexShrink={0} h="full" w={{ base: 'full', md: 'auto' }}>
        <Dock />
      </Box>
      <Box flex={1} minW={0} p={6} overflowY="auto">
        <Text color="cardFg" fontWeight={700}>
          Page content
        </Text>
        <Text color="formLabelMuted" fontSize="sm" mt={2}>
          Dock is a left rail on md+; Get app stays at the bottom via mt-auto.
        </Text>
      </Box>
    </Box>
  ),
}

export const MobileBottom: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <Box minH="100dvh" bg="bg" display="flex" flexDirection="column">
      <Box flex={1} pt={6} px={4}>
        <Text color="cardFg" fontWeight={700}>
          Page content
        </Text>
        <Text color="formLabelMuted" fontSize="sm" mt={2}>
          On mobile, Dock sits in the bottom layout slot.
        </Text>
      </Box>
      <Dock />
    </Box>
  ),
}
