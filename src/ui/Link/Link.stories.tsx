import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '../Button'
import { Link, type UiLinkTone } from './Link'

const TONES: UiLinkTone[] = ['default', 'muted', 'emphasis']

const meta = {
  title: 'ui/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
    href: { control: 'text' },
    children: { control: 'text' },
  },
  args: { tone: 'default', href: '/pricing', children: 'Pricing' },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Every tone at the default size. Tab to a link to see the focus ring. */
export const AllVariants: Story = {
  render: () => (
    <HStack gap={6} flexWrap="wrap" alignItems="center">
      <Link href="/pricing" tone="default">
        Default link
      </Link>
      <Link href="/" tone="muted">
        Muted link
      </Link>
      <Link href="/profile" tone="emphasis">
        Emphasis link
      </Link>
    </HStack>
  ),
}

/** Tones stacked with descriptions of where each is used. */
export const Tones: Story = {
  render: () => (
    <Stack gap={3}>
      <Link href="/pricing" tone="default">
        Default — inline body link
      </Link>
      <Link href="/" tone="muted">
        Muted — footer / back to browse
      </Link>
      <Link href="/billing" tone="emphasis">
        Emphasis — View profile / Manage billing
      </Link>
    </Stack>
  ),
}

export const Default: Story = { args: { tone: 'default' } }
export const Muted: Story = {
  args: { tone: 'muted', children: 'Back to browse' },
}
export const Emphasis: Story = {
  args: { tone: 'emphasis', children: 'View profile' },
}

/** Keyboard focus: every tone exposes the SDL visible focus ring. */
export const Focus: Story = {
  render: () => (
    <HStack gap={6} flexWrap="wrap" alignItems="center">
      {TONES.map((tone) => (
        <Link key={tone} href="/pricing" tone={tone}>
          Focus {tone}
        </Link>
      ))}
    </HStack>
  ),
}

/** External link — opens in a new tab with safe rel. */
export const External: Story = {
  render: () => (
    <Link
      href="https://slashie.app"
      target="_blank"
      rel="noopener noreferrer"
      tone="emphasis"
      fontSize="sm"
      fontWeight={600}
    >
      Help Center
    </Link>
  ),
}

/** Link wrapping a Button — no underline; the Button owns its own focus ring. */
export const WrapsButton: Story = {
  render: () => (
    <Link href="/tasks/create" _hover={{ textDecoration: 'none' }}>
      <Button variant="primary" size="sm">
        Post a task
      </Button>
    </Link>
  ),
}
