import { Box, Heading, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { useUserStore } from '@/app/(auth)/store/user'
import { FeedbackDialogProvider } from '@/ui/FeedbackDialog/FeedbackDialogProvider'

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
  },
  // The page, as the public pages lay it out: the marketing header, then the
  // title bar in a column as tall as the page.
  decorators: [
    (Story) => (
      <FeedbackDialogProvider onSubmit={async () => true}>
        <Box bg="bg.subtle" minH="100dvh">
          <MarketingHeader />
          <Box px={4} pb={10} minH="200vh">
            <Story />
            <Text color="text.muted" pt={4}>
              Page content
            </Text>
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

/** The bar's small title: the one copy of the title that is not the h1. */
const barTitle = (canvasElement: HTMLElement, title: string) =>
  within(canvasElement).getByText(title, { selector: 'p' })

const isHiddenFromReaders = (node: HTMLElement) =>
  node.closest('[aria-hidden="true"]') !== null

/** Top of the page: Back in the bar, the large title is the page's h1. */
export const LargeTitle: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: args.title }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Go back' })).toBeVisible()
    await expect(isHiddenFromReaders(barTitle(canvasElement, args.title))).toBe(
      true,
    )
  },
}

/**
 * Scrolled: the bar sticks right under the marketing header and its small
 * title shows, now read by screen readers. The h1 is still the one heading.
 */
export const LargeTitleScrolled: Story = {
  play: async ({ canvasElement, args }) => {
    window.scrollTo(0, 300)
    await waitFor(() =>
      expect(isHiddenFromReaders(barTitle(canvasElement, args.title))).toBe(
        false,
      ),
    )
    const header = canvasElement.querySelector('header') as HTMLElement
    const back = within(canvasElement).getByRole('button', { name: 'Go back' })
    await expect(
      within(canvasElement).getAllByRole('heading', { level: 1 }),
    ).toHaveLength(1)
    await expect(back.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      header.getBoundingClientRect().bottom,
    )
  },
}

/** Pricing (FE-449): a large "Membership" (the h1), then the page's own centred heading as an h2. */
export const PricingLargeTitle: Story = {
  args: {
    title: 'Membership',
    description: undefined,
    contentMaxW: undefined,
  },
  parameters: { nextjs: { navigation: { pathname: '/pricing' } } },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Heading as="h2" size="2xl" textAlign="center" pt={8}>
          Simple plans. Clear quotes.
        </Heading>
      </>
    ),
  ],
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
    // The small title in the bar is hidden from readers while the large one shows.
    await expect(
      isHiddenFromReaders(barTitle(canvasElement, 'Membership')),
    ).toBe(true)
  },
}

/** Phone: the marketing header is 56px, and the bar sticks under it when scrolled. */
export const LargeTitlePhoneScrolled: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    window.scrollTo(0, 300)
    await waitFor(() =>
      expect(isHiddenFromReaders(barTitle(canvasElement, args.title))).toBe(
        false,
      ),
    )
  },
}
