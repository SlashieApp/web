import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SlideToConfirm } from './SlideToConfirm'

const meta = {
  title: 'UI/SlideToConfirm',
  component: SlideToConfirm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
  args: {
    label: 'Slide to mark Done',
    armedLabel: 'Tap again to mark Done',
    onConfirm: () => {},
    disabled: false,
    loading: false,
  },
} satisfies Meta<typeof SlideToConfirm>

export default meta
type Story = StoryObj<typeof meta>

/** Drag to the end, or tap/Enter twice. */
export const Default: Story = {}

export const Loading: Story = { args: { loading: true } }

export const Disabled: Story = { args: { disabled: true } }
