import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AppShell } from './AppShell'

const meta = {
  title: 'ui/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <Stack gap={3} px={4} py={6}>
        <Heading size="md">Page title</Heading>
        <Text color="text.muted" fontSize="sm">
          Shared Header + scrolling main + mobile bottom nav.
        </Text>
        <Box h="80vh" borderRadius="lg" bg="bg.subtle" />
      </Stack>
    ),
  },
}
