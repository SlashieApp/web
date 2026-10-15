import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import { Button } from '../Button'
import { Link, type UiLinkTone } from './Link'

const TONES: UiLinkTone[] = ['default', 'muted', 'emphasis']

const meta = {
  title: 'UI/Link',
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

/** Playground: drive tone, href and label from Controls. */
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
        Default: inline body link
      </Link>
      <Link href="/" tone="muted">
        Muted: footer / back to browse
      </Link>
      <Link href="/billing" tone="emphasis">
        Emphasis: View profile / Manage billing
      </Link>
    </Stack>
  ),
}

/** Default tone: standard inline link in `text.link`, underline on hover. */
export const Default: Story = { args: { tone: 'default' } }
/** Muted tone: reads as body copy and turns link-coloured on hover (footer, back nav). */
export const Muted: Story = {
  args: { tone: 'muted', children: 'Back to browse' },
}
/** Emphasis tone: link colour with weight for affordances like View profile. */
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

/** External: opens in a new tab with a safe `rel`. */
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

/** Wraps button: no underline, the Button owns its own focus ring. */
export const WrapsButton: Story = {
  render: () => (
    <Link href="/tasks/create" _hover={{ textDecoration: 'none' }}>
      <Button variant="primary" size="sm">
        Post a task
      </Button>
    </Link>
  ),
}

/** In a paragraph: an inline link sits in body copy and underlines on hover. */
export const InParagraph: Story = {
  render: () => (
    <Text maxW="420px" color="text.default" lineHeight="tall">
      Not sure what to charge? Read the{' '}
      <Link href="/pricing">pricing guide</Link> before you send a quote.
    </Text>
  ),
}

/** Locale: under `/zh-hk` an internal href gets the locale prefix. */
export const LocalizedZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/pricing' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Pricing' }),
    ).toHaveAttribute('href', '/zh-hk/pricing')
  },
}

/** Unlocalized: mailto, tel and hash-only hrefs are left alone, even under `/zh-hk`. */
export const UnlocalizedHrefs: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/pricing' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  render: () => (
    <HStack gap={6} flexWrap="wrap" alignItems="center">
      <Link href="mailto:help@example.com">Email us</Link>
      <Link href="tel:+447700900123">Call us</Link>
      <Link href="#faq">Jump to FAQ</Link>
    </HStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('link', { name: 'Email us' }),
    ).toHaveAttribute('href', 'mailto:help@example.com')
    await expect(canvas.getByRole('link', { name: 'Call us' })).toHaveAttribute(
      'href',
      'tel:+447700900123',
    )
    await expect(
      canvas.getByRole('link', { name: 'Jump to FAQ' }),
    ).toHaveAttribute('href', '#faq')
  },
}
