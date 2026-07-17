import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button, type UiButtonVariant } from './Button'

const SDL_VARIANTS: UiButtonVariant[] = [
  'primary',
  'secondary',
  'ghost',
  'danger',
  'premium',
]

const meta = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: SDL_VARIANTS },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { variant: 'primary', size: 'md', children: 'Post a task' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Every variant at the default size. */
export const AllVariants: Story = {
  render: () => (
    <HStack gap={3} flexWrap="wrap" alignItems="center">
      <Button variant="primary">Post a task</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="danger">Cancel task</Button>
      <Button variant="premium">Go Unlimited</Button>
    </HStack>
  ),
}

/** Sizes sm / md / lg (md and lg meet the 44px touch target). */
export const Sizes: Story = {
  render: () => (
    <HStack gap={3} alignItems="center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </HStack>
  ),
}

/** States across the primary variant. Tab to a button to see the focus ring. */
export const States: Story = {
  render: () => (
    <Stack gap={4}>
      {SDL_VARIANTS.map((variant) => (
        <HStack key={variant} gap={3} flexWrap="wrap" alignItems="center">
          <Button variant={variant}>Default</Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
          <Button variant={variant} loading>
            Loading
          </Button>
        </HStack>
      ))}
    </Stack>
  ),
}

export const Loading: Story = { args: { loading: true } }
export const Disabled: Story = { args: { disabled: true } }
