import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import messages from '@/app/(marketing)/i11n.json'

import { PhoneFrame } from './PhoneFrame'
import { SearchScreen } from './screens/SearchScreen'

const copy = messages.en.landing.phone

/** Story-only screen content: a labelled blank canvas the size of the screen. */
function BlankScreen() {
  return (
    <Stack
      position="absolute"
      inset={0}
      align="center"
      justify="center"
      gap={1}
      bg="bg.canvas"
    >
      <Text fontWeight={500}>375 x 812 screen</Text>
      <Text fontSize="sm" color="text.muted">
        Scaled to the width of the frame
      </Text>
    </Stack>
  )
}

const meta = {
  title: 'Marketing/Landing/PhoneFrame',
  component: PhoneFrame,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: copy.demoLabel,
    nominalWidth: 300,
    w: '300px',
    children: <BlankScreen />,
  },
  // The mint wash the landing sets the phone on.
  decorators: [
    (Story) => (
      <Box
        p={{ base: 4, md: 8 }}
        bg="status.success.soft"
        display="inline-block"
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PhoneFrame>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop size (300px, the pinned phone): bezel, status bar, island and home bar. */
export const Default: Story = {}

/** Inline phone below `lg`: 270px, capped at 72vw so it fits a small screen. */
export const Compact: Story = {
  args: { nominalWidth: 270, w: 'min(270px, 72vw)' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Small (180px): the whole 375 x 812 screen scales down, layout unchanged. */
export const Small: Story = {
  args: { nominalWidth: 180, w: '180px' },
}

/** Large (420px): the same screen scaled up, bezel and chrome scale with it. */
export const Large: Story = {
  args: { nominalWidth: 420, w: '420px' },
}

/** With a real demo screen (map search) inside the frame. */
export const WithScreen: Story = {
  args: {
    children: <SearchScreen copy={copy} variant="customer" active />,
  },
}
