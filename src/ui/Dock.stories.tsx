import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Dock } from './Dock'

const meta = {
  title: 'layout/Dock',
  component: Dock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Dock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <Box minH="100vh" bg="bg" position="relative">
      <Dock />
      <Box pt={6} px={4} pl={{ base: 4, md: '88px' }}>
        <Text color="cardFg" fontWeight={700}>
          Page Content
        </Text>
        <Text color="formLabelMuted" fontSize="sm" mt={2}>
          On mobile, Dock is fixed to the bottom.
        </Text>
      </Box>
    </Box>
  ),
}
