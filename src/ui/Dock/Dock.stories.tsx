import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Dock } from './Dock'

/**
 * SDL Dock — the primary navigation rail. It is a left rail on md+ screens and
 * a bottom bar on mobile. The Dock takes no props; it derives the active item
 * from the current route. Stories render under both light and dark via the
 * global theme toolbar — no mode is hardcoded here.
 */
const meta = {
  title: 'Components/Dock',
  component: Dock,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Dock>

export default meta
type Story = StoryObj<typeof meta>

/** Bare control in the docs Playground (renders in its natural layout slot). */
export const Playground: Story = {}

/** Desktop: fixed left rail, full viewport height, Get app pinned to bottom. */
export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
  render: () => (
    <Box
      h="100dvh"
      bg="bg.canvas"
      display="flex"
      flexDirection="row"
      overflow="hidden"
    >
      <Box flexShrink={0} h="full" w={{ base: 'full', md: 'auto' }}>
        <Dock />
      </Box>
      <Box flex={1} minW={0} p={6} overflowY="auto">
        <Text color="text.default" fontWeight={700}>
          Page content
        </Text>
        <Text color="text.muted" fontSize="sm" mt={2}>
          Dock is a left rail on md+; Get app stays at the bottom via mt-auto.
        </Text>
      </Box>
    </Box>
  ),
}

/** Mobile: Dock sits in the bottom layout slot. */
export const MobileBottom: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <Box minH="100dvh" bg="bg.canvas" display="flex" flexDirection="column">
      <Box flex={1} pt={6} px={4}>
        <Text color="text.default" fontWeight={700}>
          Page content
        </Text>
        <Text color="text.muted" fontSize="sm" mt={2}>
          On mobile, Dock sits in the bottom layout slot.
        </Text>
      </Box>
      <Dock />
    </Box>
  ),
}

/** Overview: both responsive layouts of the Dock side by side. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={8} p={6} bg="bg.canvas">
      <Stack gap={3}>
        <Text color="text.muted" fontSize="sm" fontWeight={600}>
          Desktop — left rail
        </Text>
        <Box
          h="420px"
          border="1px solid"
          borderColor="border.default"
          borderRadius="lg"
          overflow="hidden"
          display="flex"
          flexDirection="row"
        >
          <Box flexShrink={0} h="full">
            <Dock />
          </Box>
          <Box flex={1} minW={0} p={4}>
            <Text color="text.default" fontWeight={700}>
              Page content
            </Text>
          </Box>
        </Box>
      </Stack>

      <Stack gap={3}>
        <Text color="text.muted" fontSize="sm" fontWeight={600}>
          Mobile — bottom bar
        </Text>
        <Box
          w="360px"
          h="420px"
          border="1px solid"
          borderColor="border.default"
          borderRadius="lg"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Box flex={1} p={4}>
            <Text color="text.default" fontWeight={700}>
              Page content
            </Text>
          </Box>
          <Dock />
        </Box>
      </Stack>
    </Stack>
  ),
}
