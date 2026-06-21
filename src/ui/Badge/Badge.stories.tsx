import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge } from './Badge'

const meta = {
  title: 'ui/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Schedule: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      <Badge variant="brand">Today</Badge>
      <Badge variant="blue">Tomorrow</Badge>
      <Badge variant="danger">Overdue</Badge>
    </HStack>
  ),
}

export const Status: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      <Badge variant="brand">Collecting quotes</Badge>
      <Badge variant="brand">In progress</Badge>
      <Badge variant="gray">Completed</Badge>
      <Badge variant="danger">Cancelled</Badge>
      <Badge variant="alternative">Draft</Badge>
    </HStack>
  ),
}

export const Browse: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      <Badge variant="brand">2 hours ago</Badge>
      <Badge variant="brand">Posted yesterday</Badge>
    </HStack>
  ),
}

export const Quotes: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      <Badge variant="brand" shape="pill" size="sm">
        3 offers
      </Badge>
      <Badge variant="gray">Quote sent</Badge>
      <Badge variant="success">Accepted</Badge>
    </HStack>
  ),
}

export const Trust: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      <Badge variant="success">Verified</Badge>
      <Badge variant="gray">Unverified</Badge>
      <Badge variant="danger">Link expired</Badge>
    </HStack>
  ),
}

export const Membership: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Past due</Badge>
      <Badge variant="danger">Payment failed</Badge>
      <Badge variant="warning">Trial ending</Badge>
      <Badge variant="alternative">Canceled</Badge>
    </HStack>
  ),
}

export const Setup: Story = {
  render: () => (
    <Badge variant="gray" size="sm">
      Optional
    </Badge>
  ),
}

export const Pricing: Story = {
  render: () => (
    <Badge
      variant="brand"
      shape="pill"
      size="sm"
      fontWeight={800}
      letterSpacing="0.08em"
    >
      Most popular
    </Badge>
  ),
}
