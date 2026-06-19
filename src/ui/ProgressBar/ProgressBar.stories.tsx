import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProgressBar } from './ProgressBar'

const meta = {
  title: 'ui/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
  args: {
    value: 40,
    label: 'Step 2 of 5 · Your services',
    trackLabel: 'Setup progress',
  },
} satisfies Meta<typeof ProgressBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Complete: Story = {
  args: {
    value: 100,
    label: 'All steps complete',
  },
}

export const NoLabel: Story = {
  args: {
    value: 65,
    label: undefined,
  },
}
