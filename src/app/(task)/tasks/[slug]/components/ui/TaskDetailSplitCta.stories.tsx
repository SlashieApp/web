import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskDetailSplitCta } from './TaskDetailSplitCta'

const meta: Meta<typeof TaskDetailSplitCta> = {
  title: 'task/tasks/ui/TaskDetailSplitCta',
  component: TaskDetailSplitCta,
  parameters: { layout: 'padded' },
  args: {
    eyebrow: 'Budget',
    value: '£500',
    meta: 'Fixed price · Cash',
    action: { href: '#quote', label: 'Send a quote' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Compact pin: stretches across the phone width. */
export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <Box maxW="390px">
        <Story />
      </Box>
    ),
  ],
}
