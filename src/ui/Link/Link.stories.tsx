import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '../Button/Button'
import { textLinkInteraction } from '../interactionStyles'

import { Link } from './Link'

const meta = {
  title: 'ui/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    href: '/tasks',
    children: 'Browse tasks',
    fontWeight: 600,
    color: 'primary.600',
  },
} satisfies Meta<typeof Link>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const External: Story = {
  args: {
    href: 'https://slashie.app',
    children: 'Help center',
    target: '_blank',
    rel: 'noopener noreferrer',
    color: 'cardFg',
    ...textLinkInteraction,
  },
}

export const MutedInline: Story = {
  render: () => (
    <Text fontSize="sm" color="formLabelMuted">
      Need an account?{' '}
      <Link href="/register" color="primary.600" fontWeight={600}>
        Sign up
      </Link>{' '}
      or{' '}
      <Link href="/login" color="primary.600" fontWeight={600}>
        log in
      </Link>
      .
    </Text>
  ),
}

export const WrapsButton: Story = {
  render: () => (
    <Link href="/tasks/create" _hover={{ textDecoration: 'none' }}>
      <Button size="sm">Post a task</Button>
    </Link>
  ),
}

export const FooterStyle: Story = {
  render: () => (
    <Stack gap={2} align="flex-start">
      <Link
        href="/pricing"
        fontWeight={600}
        fontSize="sm"
        color="cardFg"
        {...textLinkInteraction}
      >
        Pricing
      </Link>
      <Link
        href="https://slashie.app"
        target="_blank"
        rel="noopener noreferrer"
        fontWeight={600}
        fontSize="sm"
        color="cardFg"
        {...textLinkInteraction}
      >
        Help center (external)
      </Link>
    </Stack>
  ),
}
