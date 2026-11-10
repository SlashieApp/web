import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { PHONE_CROP_H, PhoneCrop, PhoneFrame } from './PhoneFrame'
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
  // The white page the landing sets the phone on.
  decorators: [
    (Story) => (
      <Box p={{ base: 4, md: 8 }} bg="bg.surface" display="inline-block">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PhoneFrame>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop size (300px, the pinned phone): bezel, status bar, island and home bar. */
export const Default: Story = {}

/**
 * Inline phone below `lg` (`PhoneCrop`): the top of a phone in a 340px well,
 * drawn at 1:1, a 16px gutter from the well's top and sides and running off
 * its bottom.
 */
export const Cropped: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: ({ label }) => (
    <Box w="full" minW="256px" maxW="358px">
      <PhoneCrop label={label}>
        <SearchScreen copy={copy} variant="customer" active compact />
      </PhoneCrop>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const well = within(canvasElement).getByRole('figure', {
      name: copy.demoLabel,
    })
    const phone = well.querySelector('[data-phone-crop]')
    if (!phone) throw new Error('The cropped phone is missing')
    const box = well.getBoundingClientRect()
    const device = phone.getBoundingClientRect()
    await expect(Math.round(box.height)).toBe(PHONE_CROP_H)
    // One gutter on the top and both sides (16px inside the 1px hairline).
    await expect(Math.round(device.top - box.top)).toBe(17)
    await expect(Math.round(device.left - box.left)).toBe(17)
    await expect(Math.round(box.right - device.right)).toBe(17)
    // The phone's foot is cut by the well: it bleeds off the bottom.
    await expect(device.bottom).toBeGreaterThan(box.bottom)
    await expect(getComputedStyle(phone).transform).toBe('none')
  },
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
