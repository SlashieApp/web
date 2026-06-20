import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from './Button'

const meta = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Tertiary: Story = {
  args: { variant: 'tertiary' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Success: Story = {
  args: { variant: 'success', children: 'Confirm' },
}

export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={3} align="flex-start">
      <HStack gap={2}>
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Base</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra large</Button>
      </HStack>
    </Stack>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
    </HStack>
  ),
}
