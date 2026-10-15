import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProgressBar } from './ProgressBar'

const meta = {
  title: 'UI/ProgressBar',
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

/** Default: green fill at 55% with a step caption (size sm). */
export const Default: Story = {}

/** Paused: dimmed with the `opacity` pass-through (no disabled prop). */
export const Disabled: Story = {
  args: {
    value: 30,
    tone: 'default',
    opacity: 0.5,
    label: 'Paused · Awaiting verification',
  },
}

/** Loading: indeterminate sweep while the amount of work is unknown. */
export const Loading: Story = {
  args: {
    indeterminate: true,
    label: 'Loading your dashboard…',
    trackLabel: 'Loading',
  },
}

/** Error: danger fill plus a status dot and caption (never colour alone). */
export const ErrorState: Story = {
  args: {
    value: 40,
    error: true,
    label: 'Upload failed · Retry to continue',
    trackLabel: 'Upload progress',
  },
}

/** Early progress: 25% through a four step setup flow. */
export const SetupEarly: Story = {
  args: {
    value: 25,
    label: 'Step 1 of 4 · Build your profile',
  },
}

/** Mid progress: 55% through the setup flow. */
export const SetupMid: Story = {
  args: {
    value: 55,
    label: 'Step 2 of 4 · Your services',
  },
}

/** Complete: 100% with the final caption. */
export const SetupComplete: Story = {
  args: {
    value: 100,
    label: 'All steps complete · Review & go live',
  },
}

/** Overview: every tone, size and state together for visual review. */
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

/** Empty: 0% leaves only the track visible. */
export const Empty: Story = {
  args: { value: 0, label: 'Not started yet' },
}

/** Success tone: a completed or healthy measure. */
export const Success: Story = {
  args: { tone: 'success', value: 80, label: 'Profile strength: strong' },
}

/** Warning tone: a limit is getting close. */
export const Warning: Story = {
  args: { tone: 'warning', value: 85, label: 'Photo storage almost full' },
}

/** Danger tone: danger fill on its own (error adds the dot and red caption). */
export const Danger: Story = {
  args: { tone: 'danger', value: 20, label: 'Profile strength: weak' },
}

/** Info tone: neutral background progress. */
export const Info: Story = {
  args: { tone: 'info', value: 60, label: 'Syncing your calendar' },
}

/** Medium size: 6px track. */
export const SizeMedium: Story = {
  args: { size: 'md' },
}

/** Large size: 8px track. */
export const SizeLarge: Story = {
  args: { size: 'lg' },
}

/** Custom track height: `trackHeight` overrides the size preset. */
export const CustomTrackHeight: Story = {
  args: { trackHeight: '12px' },
}

/** No caption: the track on its own, without the label row. */
export const WithoutLabel: Story = {
  args: { label: undefined },
}

/** Long caption: wraps below the track instead of overflowing. */
export const LongLabel: Story = {
  args: {
    label:
      'Step 3 of 4 · Tell customers where you work and how far you are happy to travel for a job',
  },
}
