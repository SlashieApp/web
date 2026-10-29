import { Box } from '@chakra-ui/react'
import { LoginMethod, UserLanguage } from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { FeedbackDialogProvider } from '@/ui/FeedbackDialog/FeedbackDialogProvider'

import { MarketingHeader } from './MarketingHeader'

/** The live `getUser` calls the API (`.env` is production). */
const realGetUser = useUserStore.getState().getUser

const suspendedMe: MeSnapshot = {
  id: 'user-1',
  email: 'sam@example.com',
  disabled: true,
  emailVerified: true,
  phoneVerified: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  enabledLoginMethods: [LoginMethod.Password],
  deletionBlockers: [],
  savedWorkers: [],
  workerEligibility: false,
  profile: { name: 'Sam Carter', emailVerified: true, phoneVerified: true },
  settings: {
    isProfilePrivate: false,
    language: UserLanguage.En,
    marketingEmails: false,
  },
  worker: null,
}

/** White page behind the transparent landing header, like `LandingBackdrop`. */
const withLandingBackdrop: Decorator = (Story) => (
  <Box bg="bg.surface" minH="240px">
    <Story />
  </Box>
)

/** Gives the page room to scroll so the landing header can solidify. */
const withScrollRoom: Decorator = (Story) => (
  <Box bg="bg.surface">
    <Story />
    <Box h="200vh" />
  </Box>
)

const headerBackground = (canvasElement: HTMLElement) =>
  getComputedStyle(canvasElement.querySelector('header') as HTMLElement)
    .backgroundColor

const meta = {
  title: 'Marketing/Layout/MarketingHeader',
  component: MarketingHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/terms' } },
  },
  decorators: [
    (Story) => (
      <FeedbackDialogProvider onSubmit={async () => true}>
        <Story />
      </FeedbackDialogProvider>
    ),
  ],
  // The suspended-account banner reads the shared user store: start every
  // story signed out. It also calls the live `getUser` when an auth cookie
  // exists (cookies are shared by concurrent test files), so stub it.
  beforeEach: () => {
    useUserStore.setState({ user: null, me: null, getUser: async () => null })
    return () => useUserStore.setState({ getUser: realGetUser })
  },
} satisfies Meta<typeof MarketingHeader>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Solid header on a marketing page with no nav item active. A page that has
 * not taken the marketing frame (a route not in `FRAMED_ROUTES`) keeps the
 * canvas colour.
 */
export const Default: Story = {
  parameters: { nextjs: { navigation: { pathname: '/not-framed' } } },
  play: async ({ canvasElement }) => {
    await expect(headerBackground(canvasElement)).toBe('rgb(250, 250, 250)')
  },
}

/**
 * On a legal page (`/terms`, `/privacy`, `/cookies`, `/help/safety`): no nav
 * item is current, and the header is white like the page, which sits in the
 * marketing frame (FE-471).
 */
export const LegalPage: Story = {
  parameters: { nextjs: { navigation: { pathname: '/terms' } } },
  play: async ({ canvasElement }) => {
    await expect(headerBackground(canvasElement)).toBe('rgb(255, 255, 255)')
    await expect(
      within(canvasElement).getByRole('link', { name: 'Pricing' }),
    ).not.toHaveAttribute('aria-current')
  },
}

/** The safety page's path is two segments deep and is framed too. */
export const SafetyPage: Story = {
  parameters: { nextjs: { navigation: { pathname: '/help/safety' } } },
  play: async ({ canvasElement }) => {
    await expect(headerBackground(canvasElement)).toBe('rgb(255, 255, 255)')
  },
}

/**
 * On `/pricing`: the Pricing link is current (semibold, link colour,
 * aria-current), and the header is white like the page, which sits in the
 * marketing frame (FE-471).
 */
export const PricingActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/pricing' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(headerBackground(canvasElement)).toBe('rgb(255, 255, 255)')
    await waitFor(
      () =>
        expect(canvas.getByRole('link', { name: 'Pricing' })).toHaveAttribute(
          'aria-current',
          'page',
        ),
      { timeout: 3000 },
    )
    await expect(
      canvas.getByRole('link', { name: 'About' }),
    ).not.toHaveAttribute('aria-current')
  },
}

/**
 * On `/about`: the About link is current, and the header is white like the
 * page, which sits in the marketing frame (FE-471).
 */
export const AboutActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/about' } } },
  play: async ({ canvasElement }) => {
    await expect(headerBackground(canvasElement)).toBe('rgb(255, 255, 255)')
    await waitFor(
      () =>
        expect(
          within(canvasElement).getByRole('link', { name: 'About' }),
        ).toHaveAttribute('aria-current', 'page'),
      { timeout: 3000 },
    )
  },
}

/** Landing at the top of the page: transparent over the backdrop, quiet Get started. */
export const LandingTop: Story = {
  parameters: { nextjs: { navigation: { pathname: '/home' } } },
  decorators: [withLandingBackdrop],
  play: async ({ canvasElement }) => {
    await expect(headerBackground(canvasElement)).toBe('rgba(0, 0, 0, 0)')
  },
}

/** The green fill of a primary button (green 400), resolved. */
const GREEN_FILL = 'rgb(0, 220, 130)'

const getStartedBackground = (canvasElement: HTMLElement) =>
  getComputedStyle(
    within(canvasElement).getByRole('link', { name: 'Get started' }),
  ).backgroundColor

/**
 * Story-only: a button that carries a page's green action
 * (`data-page-green-action`, like the landing's closing Post a task), taller
 * than the screen so it is in view wherever the story scrolls to.
 */
const withGreenActionInView: Decorator = (Story) => (
  <Box bg="bg.surface">
    <Story />
    <Box data-page-green-action="" h="200vh" />
  </Box>
)

/**
 * Story-only: the page's green action arrives after the header, the way the
 * pricing page streams in behind its loading frame, and is taller than the
 * screen so it is in view wherever the story scrolls to.
 */
function LateGreenAction() {
  const [arrived, setArrived] = useState(false)
  const arrive = (node: HTMLElement | null) => {
    if (!node) return
    const timer = window.setTimeout(() => setArrived(true), 400)
    return () => window.clearTimeout(timer)
  }
  return (
    <Box ref={arrive} bg="bg.surface">
      {arrived ? <Box data-page-green-action="" h="200vh" /> : null}
    </Box>
  )
}

const withLateGreenAction: Decorator = (Story) => (
  <Box bg="bg.surface">
    <Story />
    <LateGreenAction />
  </Box>
)

/** Landing after scrolling past 24px: the header solidifies to the white page and Get started turns primary. */
export const LandingScrolled: Story = {
  parameters: { nextjs: { navigation: { pathname: '/home' } } },
  decorators: [withScrollRoom],
  beforeEach: () => () => window.scrollTo(0, 0),
  play: async ({ canvasElement }) => {
    window.scrollTo(0, 200)
    // The landing is a white page: the solid header ends white, not the canvas.
    await waitFor(
      () => expect(headerBackground(canvasElement)).toBe('rgb(255, 255, 255)'),
      { timeout: 3000 },
    )
    // Nothing on screen has a green action of its own: Get started is it.
    await waitFor(
      () => expect(getStartedBackground(canvasElement)).toBe(GREEN_FILL),
      { timeout: 3000 },
    )
  },
}

/**
 * Landing scrolled to the closing call to action: the page's own green Post a
 * task is on screen, so the solid header's Get started stays secondary (one
 * green fill per screen, marketing included).
 */
export const LandingScrolledAtClose: Story = {
  parameters: { nextjs: { navigation: { pathname: '/home' } } },
  decorators: [withGreenActionInView],
  beforeEach: () => () => window.scrollTo(0, 0),
  play: async ({ canvasElement }) => {
    window.scrollTo(0, 200)
    await waitFor(
      () => expect(headerBackground(canvasElement)).toBe('rgb(255, 255, 255)'),
      { timeout: 3000 },
    )
    await waitFor(
      () => expect(getStartedBackground(canvasElement)).not.toBe(GREEN_FILL),
      { timeout: 3000 },
    )
    await expect(getStartedBackground(canvasElement)).toBe('rgb(255, 255, 255)')
  },
}

/**
 * The green action arrives after the header (a streamed page): Get started is
 * the green one until it does, and gives way once it is on screen.
 */
export const GetStartedYieldsToALateGreenAction: Story = {
  parameters: { nextjs: { navigation: { pathname: '/pricing' } } },
  decorators: [withLateGreenAction],
  play: async ({ canvasElement }) => {
    await waitFor(
      () => expect(getStartedBackground(canvasElement)).toBe(GREEN_FILL),
      { timeout: 3000 },
    )
    // Once the button has finished fading from green to the outline's white.
    await waitFor(
      () =>
        expect(getStartedBackground(canvasElement)).toBe('rgb(255, 255, 255)'),
      { timeout: 5000 },
    )
  },
}

/** A page with no green action of its own (the legal pages), or none on screen: Get started is the screen's one green button. */
export const GetStartedIsTheGreenOnAPageWithNone: Story = {
  parameters: { nextjs: { navigation: { pathname: '/terms' } } },
  play: async ({ canvasElement }) => {
    await waitFor(
      () => expect(getStartedBackground(canvasElement)).toBe(GREEN_FILL),
      { timeout: 3000 },
    )
  },
}

/** Phone width on a content page: logo, Open in app, and the menu button. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: { nextjs: { navigation: { pathname: '/pricing' } } },
  play: async ({ canvasElement }) => {
    const menu = within(canvasElement).getByRole('button', { name: 'Menu' })
    // An icon button is round (the ui IconButton), 44px.
    await expect(getComputedStyle(menu).borderTopLeftRadius).toBe('9999px')
    await expect(menu.getBoundingClientRect().height).toBe(44)
  },
}

/** Left edge of the text inside `element` (its box has padding of its own). */
const textLeft = (element: Element) => {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect().left
}

/** Phone width with the menu drawer open: nav links, Feedback, Log in and Get started, all starting on the title's left edge and 44px tall. */
export const MobileMenuOpen: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: { nextjs: { navigation: { pathname: '/pricing' } } },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Menu' }),
    )
    const drawer = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
    )
    await expect(
      within(drawer).getByRole('link', { name: 'Pricing' }),
    ).toBeVisible()
    await expect(
      within(drawer).getByRole('link', { name: 'Log in' }),
    ).toBeVisible()
    await expect(
      within(drawer).getByRole('link', { name: 'Get started' }),
    ).toBeVisible()

    const title = within(drawer).getByRole('heading', { name: 'Menu' })
    const rows = [
      within(drawer).getByRole('link', { name: 'Pricing' }),
      within(drawer).getByRole('link', { name: 'About' }),
      within(drawer).getByRole('button', { name: 'Feedback' }),
      within(drawer).getByRole('link', { name: 'Log in' }),
      within(drawer).getByRole('link', { name: 'Get started' }),
    ]
    for (const row of rows) {
      expect(Math.abs(textLeft(row) - textLeft(title))).toBeLessThanOrEqual(0.5)
      expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
    }
  },
}

/** Phone width on the landing: no menu button, the page's own story leads. */
export const MobileLanding: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: { nextjs: { navigation: { pathname: '/home' } } },
  decorators: [withLandingBackdrop],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', { name: 'Menu' }),
    ).toBeNull()
  },
}

/** Traditional Chinese copy, picked from the `/zh-hk` URL prefix. */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/pricing' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
}

/** Signed-in suspended account: the contact banner sits above the header. */
export const SuspendedAccount: Story = {
  beforeEach: () => {
    useUserStore.setState({
      user: {
        id: suspendedMe.id,
        email: suspendedMe.email,
        createdAt: suspendedMe.createdAt,
      },
      me: suspendedMe,
    })
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toBeVisible()
  },
}
