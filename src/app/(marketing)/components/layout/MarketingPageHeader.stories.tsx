import { Box, Heading, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { useUserStore } from '@/app/(auth)/store/user'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { FeedbackDialogProvider } from '@/ui/FeedbackDialog/FeedbackDialogProvider'

import chromeMessages from '../../i11n.chrome.json'
import { MarketingHeader } from './MarketingHeader'
import { MarketingPageHeader } from './MarketingPageHeader'

/** The live `getUser` calls the API (`.env` is production). */
const realGetUser = useUserStore.getState().getUser

const meta = {
  title: 'Marketing/Layout/MarketingPageHeader',
  component: MarketingPageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/terms' } },
  },
  args: {
    title: 'Terms of Service',
    description: 'Last updated: 8 July 2026',
    contentMaxW: '45rem',
    children: (
      <Text color="text.muted" h="200vh" pt={4}>
        Page content
      </Text>
    ),
  },
  // The page, as the public pages lay it out: the marketing header, then the
  // page header wrapping the page.
  decorators: [
    (Story) => (
      <FeedbackDialogProvider onSubmit={async () => true}>
        <Box bg="bg.subtle" minH="100dvh">
          <MarketingHeader />
          <Box px={4} pb={10}>
            <Story />
          </Box>
        </Box>
      </FeedbackDialogProvider>
    ),
  ],
  // The suspended-account banner reads the shared user store: start signed
  // out, with the live `getUser` stubbed. Scroll back up when a story ends.
  beforeEach: () => {
    useUserStore.setState({ user: null, me: null, getUser: async () => null })
    return () => {
      useUserStore.setState({ getUser: realGetUser })
      window.scrollTo(0, 0)
    }
  },
} satisfies Meta<typeof MarketingPageHeader>

export default meta
type Story = StoryObj<typeof meta>

/** The bar's one-line copy: the one copy of the title that is not the h1. */
const barTitle = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-sticky-header-bar-title]') as HTMLElement

const isHiddenFromReaders = (node: HTMLElement) =>
  node.closest('[aria-hidden="true"]') !== null

/** Top of the page: Back in the bar, the big title is the page's h1, the bar's copy is hidden. */
export const Header: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: args.title }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Go back' })).toBeVisible()
    await expect(isHiddenFromReaders(barTitle(canvasElement))).toBe(true)
    await expect(getComputedStyle(barTitle(canvasElement)).opacity).toBe('0')
  },
}

/**
 * Scrolled: the bar sticks right under the marketing header and the title has
 * collapsed into it. The bar's copy stays hidden from screen readers; the h1
 * is still the one heading.
 */
export const HeaderScrolled: Story = {
  play: async ({ canvasElement }) => {
    window.scrollTo(0, 300)
    await waitFor(() =>
      expect(getComputedStyle(barTitle(canvasElement)).opacity).toBe('1'),
    )
    const header = canvasElement.querySelector('header') as HTMLElement
    const back = within(canvasElement).getByRole('button', { name: 'Go back' })
    await expect(isHiddenFromReaders(barTitle(canvasElement))).toBe(true)
    await expect(
      within(canvasElement).getAllByRole('heading', { level: 1 }),
    ).toHaveLength(1)
    await expect(back.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      header.getBoundingClientRect().bottom,
    )
  },
}

/** Pricing (FE-449): a large "Membership" (the h1), then the page's own centred heading as an h2. */
export const PricingTitle: Story = {
  args: {
    title: 'Membership',
    description: undefined,
    contentMaxW: undefined,
    children: (
      <Heading as="h2" size="2xl" textAlign="center" pt={8} pb="150vh">
        Simple plans. Clear quotes.
      </Heading>
    ),
  },
  parameters: { nextjs: { navigation: { pathname: '/pricing' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Membership' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('heading', {
        level: 2,
        name: 'Simple plans. Clear quotes.',
      }),
    ).toBeVisible()
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(isHiddenFromReaders(barTitle(canvasElement))).toBe(true)
  },
}

/** Phone: the marketing header is 56px, and the bar sticks under it when scrolled. */
export const HeaderPhoneScrolled: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    window.scrollTo(0, 300)
    await waitFor(() =>
      expect(getComputedStyle(barTitle(canvasElement)).opacity).toBe('1'),
    )
  },
}

/** zh-HK: the same header with the Chinese back label. */
export const ZhHk: Story = {
  args: { title: '服務條款', description: '最後更新：2026 年 7 月 8 日' },
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/terms' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: '服務條款' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: chromeMessages.zh_hk.goBack }),
    ).toBeVisible()
  },
}
