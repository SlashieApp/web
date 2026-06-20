import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge } from './Badge'

const meta = {
  title: 'ui/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    children: '2 hours ago',
    variant: 'brand',
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Brand: Story = {}

export const Alternative: Story = {
  args: { variant: 'alternative', children: 'Draft' },
}

export const Gray: Story = {
  args: { variant: 'gray', children: 'Metadata' },
}

export const Success: Story = {
  args: { variant: 'success', children: 'Completed' },
}

export const Danger: Story = {
  args: { variant: 'danger', children: 'Overdue' },
}

export const Warning: Story = {
  args: { variant: 'warning', children: 'Pending' },
}

export const Pill: Story = {
  args: { shape: 'pill', children: 'Live' },
}

export const AllVariants: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      <Badge variant="brand">Brand</Badge>
      <Badge variant="alternative">Alternative</Badge>
      <Badge variant="gray">Gray</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="dark">Dark</Badge>
    </HStack>
  ),
}
