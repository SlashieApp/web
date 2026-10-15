import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { ScheduleChip as ScheduleChipValue } from '@/utils/taskJobSchedule'

import { ScheduleChip } from './ScheduleChip'

const CHIPS: NonNullable<ScheduleChipValue>[] = ['today', 'tomorrow', 'overdue']

const meta = {
  title: 'UI/ScheduleChip',
  component: ScheduleChip,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    chip: {
      control: 'inline-radio',
      options: [...CHIPS, null],
      description:
        'Relative schedule. `null` renders nothing (no chip when a task has no exact date).',
    },
    size: { control: 'inline-radio', options: ['sm', 'lg'] },
    shape: { control: 'inline-radio', options: ['default', 'pill'] },
    dot: {
      control: 'boolean',
      description:
        'Leading status dot. On by default: status is never colour alone.',
    },
  },
  args: { chip: 'today', size: 'sm', shape: 'default', dot: true },
} satisfies Meta<typeof ScheduleChip>

export default meta
type Story = StoryObj<typeof meta>

/** Playground driven by the Controls panel (chip, size, shape, dot). */
export const Playground: Story = {}

/** today → success (green), tomorrow → info (blue), overdue → danger (red). */
export const AllVariants: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      {CHIPS.map((chip) => (
        <ScheduleChip key={chip} chip={chip} />
      ))}
    </HStack>
  ),
}

/** Today: success tone (green) for a task scheduled for today. */
export const Today: Story = {
  args: { chip: 'today' },
}

/** Tomorrow: info tone (blue) for a task scheduled for tomorrow. */
export const Tomorrow: Story = {
  args: { chip: 'tomorrow' },
}

/** Overdue: danger tone (red) for a task whose date has passed. */
export const Overdue: Story = {
  args: { chip: 'overdue' },
}

/** `chip={null}` renders nothing, for a task with no exact schedule. */
export const Empty: Story = {
  args: { chip: null },
  render: (args) => (
    <Stack gap={2} alignItems="flex-start">
      <ScheduleChip {...args} />
      <Text fontSize="sm" color="text.muted">
        (no chip rendered when chip is null)
      </Text>
    </Stack>
  ),
}

/** Status dot can be suppressed, but the label still carries the meaning. */
export const WithoutDot: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      {CHIPS.map((chip) => (
        <ScheduleChip key={chip} chip={chip} dot={false} />
      ))}
    </HStack>
  ),
}

/** Sizes: `sm` (default) next to `lg`. */
export const Sizes: Story = {
  render: () => (
    <HStack gap={2} alignItems="center">
      <ScheduleChip chip="today" size="sm" />
      <ScheduleChip chip="today" size="lg" />
    </HStack>
  ),
}

/** Pill shape: fully rounded chips for all three schedule values. */
export const PillShape: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      {CHIPS.map((chip) => (
        <ScheduleChip key={chip} chip={chip} shape="pill" />
      ))}
    </HStack>
  ),
}

/** Large: the `lg` size with a bigger label and more padding. */
export const Large: Story = {
  args: { chip: 'tomorrow', size: 'lg' },
}

/** Pill: a single fully rounded chip (default is a rounded rectangle). */
export const Pill: Story = {
  args: { chip: 'today', shape: 'pill' },
}
