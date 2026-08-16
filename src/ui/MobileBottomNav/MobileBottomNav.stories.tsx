import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MobileBottomNav } from './MobileBottomNav'

/**
 * Mobile floating primary nav. Hidden from `md` up (Header owns those links).
 */
const meta = {
  title: 'ui/MobileBottomNav',
  component: MobileBottomNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/search',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
} satisfies Meta<typeof MobileBottomNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Box minH="100dvh" bg="bg.subtle" position="relative">
      <Box px={4} pt={6} color="text.muted" fontSize="sm">
        Scrollable page content sits above the floating bar.
      </Box>
      <MobileBottomNav />
    </Box>
  ),
}
