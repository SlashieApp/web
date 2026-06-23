import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProgressBar } from './ProgressBar'

const meta = {
  title: 'ui/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    value: 50,
    label: 'Step 2 of 4 · Your services',
    trackLabel: 'Worker setup progress',
  },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ProgressBar>

export default meta

type Story = StoryObj<typeof meta>

export const SetupEarly: Story = {
  args: {
    value: 25,
    label: 'Step 1 of 4 · Build your profile',
  },
  render: (args) => <ProgressBar {...args} />,
}

export const SetupMid: Story = {
  args: {
    value: 55,
    label: 'Step 2 of 4 · Your services',
  },
  render: (args) => <ProgressBar {...args} />,
}

export const SetupComplete: Story = {
  args: {
    value: 100,
    label: 'All steps complete · Review & go live',
  },
  render: (args) => <ProgressBar {...args} />,
}
