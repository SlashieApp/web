import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProgressBar } from './ProgressBar'

const meta = {
  title: 'ui/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Completion percentage (0–100). Ignored when indeterminate.',
    },
    tone: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
      description: 'Visual + semantic tone of the fill.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    indeterminate: { control: 'boolean' },
    error: { control: 'boolean' },
    label: { control: 'text' },
    trackLabel: { control: 'text' },
  },
  args: {
    value: 55,
    tone: 'default',
    size: 'sm',
    indeterminate: false,
    error: false,
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

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    value: 30,
    tone: 'default',
    opacity: 0.5,
    label: 'Paused · Awaiting verification',
  },
}

export const Loading: Story = {
  args: {
    indeterminate: true,
    label: 'Loading your dashboard…',
    trackLabel: 'Loading',
  },
}

export const ErrorState: Story = {
  args: {
    value: 40,
    error: true,
    label: 'Upload failed · Retry to continue',
    trackLabel: 'Upload progress',
  },
}

export const SetupEarly: Story = {
  args: {
    value: 25,
    label: 'Step 1 of 4 · Build your profile',
  },
}

export const SetupMid: Story = {
  args: {
    value: 55,
    label: 'Step 2 of 4 · Your services',
  },
}

export const SetupComplete: Story = {
  args: {
    value: 100,
    label: 'All steps complete · Review & go live',
  },
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack gap={6}>
      <Stack gap={3}>
        <Text fontSize="sm" fontWeight={600} color="text.default">
          Tones
        </Text>
        <ProgressBar
          value={70}
          tone="default"
          label="Default · action.primary"
        />
        <ProgressBar value={70} tone="success" label="Success" />
        <ProgressBar value={70} tone="warning" label="Warning" />
        <ProgressBar value={70} tone="danger" label="Danger" />
        <ProgressBar value={70} tone="info" label="Info" />
      </Stack>

      <Stack gap={3}>
        <Text fontSize="sm" fontWeight={600} color="text.default">
          Sizes
        </Text>
        <ProgressBar value={60} size="sm" label="sm · 4px track" />
        <ProgressBar value={60} size="md" label="md · 6px track" />
        <ProgressBar value={60} size="lg" label="lg · 8px track" />
      </Stack>

      <Stack gap={3}>
        <Text fontSize="sm" fontWeight={600} color="text.default">
          States
        </Text>
        <ProgressBar value={0} label="Empty (0%)" />
        <ProgressBar value={45} label="In progress (45%)" />
        <ProgressBar value={100} label="Complete (100%)" />
        <ProgressBar indeterminate label="Loading (indeterminate)" />
        <ProgressBar value={40} error label="Error · dot + label" />
      </Stack>
    </Stack>
  ),
}
