import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge, StatusPill, type UiBadgeVariant } from './Badge'

const FAMILIES: UiBadgeVariant[] = [
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
]

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: FAMILIES },
    size: { control: 'inline-radio', options: ['sm', 'lg'] },
    shape: { control: 'inline-radio', options: ['default', 'pill'] },
    dot: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { variant: 'success', size: 'sm', dot: true, children: 'Open' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const AllFamilies: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      {FAMILIES.map((variant) => (
        <Badge key={variant} variant={variant} dot>
          {variant}
        </Badge>
      ))}
    </HStack>
  ),
}

export const WithAndWithoutDot: Story = {
  render: () => (
    <Stack gap={3}>
      <HStack gap={2}>
        <Badge variant="success" dot>
          With dot
        </Badge>
        <Badge variant="success">No dot</Badge>
      </HStack>
    </Stack>
  ),
}

/** TaskStatus mapping — every pill shows dot + label (never colour alone). */
export const TaskStatus: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      <StatusPill status="OPEN" />
      <StatusPill status="AWARDED" />
      <StatusPill status="CLOSED" />
      <StatusPill status="CANCELLED" />
    </HStack>
  ),
}

export const Sizes: Story = {
  render: () => (
    <HStack gap={2} alignItems="center">
      <Badge variant="info" size="sm" dot>
        Small
      </Badge>
      <Badge variant="info" size="lg" dot>
        Large
      </Badge>
    </HStack>
  ),
}
