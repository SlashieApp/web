import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Card } from '../Card/Card'
import { MOBILE_BOTTOM_NAV_CLEARANCE, MobileBottomNav } from './MobileBottomNav'

/**
 * Mobile floating glass nav. Hidden from `md` up (Header owns those links).
 * Scroll the sample cards to see the fade dissolve content behind the pill.
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

const SAMPLE_CARDS = [
  'Assemble IKEA shelves in a Mong Kok walk-up',
  'Weekend dog walk around Victoria Park',
  'Same-day grocery run to ParknShop',
  'Fix a leaking kitchen tap this evening',
  'Move two boxes from Central to Wan Chai',
  'Deep-clean a studio after checkout',
  'Hang a TV and hide the cables',
  'Pick up dry cleaning before 6pm',
  'Assemble a standing desk and chair',
  'Water plants while the owner is away',
  'Help carry luggage up four floors',
  'Replace a flickering hallway bulb',
] as const

export const Default: Story = {
  render: () => (
    <Box minH="100dvh" bg="bg.subtle" position="relative">
      <Stack gap={3} px={4} pt={6} pb={MOBILE_BOTTOM_NAV_CLEARANCE}>
        <Text fontSize="sm" color="text.muted">
          Scroll the list — cards fade out behind the glass bar instead of
          clipping against a solid slab.
        </Text>
        {SAMPLE_CARDS.map((title, index) => (
          <Card key={title} layout="section" heading={title}>
            <Text fontSize="sm" color="text.muted">
              Sample row {index + 1}. Keep scrolling to send this card through
              the bottom fade.
            </Text>
          </Card>
        ))}
      </Stack>
      <MobileBottomNav />
    </Box>
  ),
}
