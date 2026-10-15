import { Box } from '@chakra-ui/react'
import { LoginMethod, UserLanguage } from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
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
  workerEligibility: false,
  profile: { name: 'Sam Carter', emailVerified: true, phoneVerified: true },
  settings: {
    isProfilePrivate: false,
    language: UserLanguage.En,
    marketingEmails: false,
  },
  worker: null,
}

/** Mint wash behind the transparent landing header, like `LandingBackdrop`. */
const withMintBackdrop: Decorator = (Story) => (
  <Box bg="status.success.soft" minH="240px">
    <Story />
  </Box>
)

/** Gives the page room to scroll so the landing header can solidify. */
const withScrollRoom: Decorator = (Story) => (
  <Box bg="status.success.soft">
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

/** Solid header on a marketing page with no nav item active. */
export const Default: Story = {}

/** On `/pricing`: the Pricing link is current (bold, link colour, aria-current). */
export const PricingActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/pricing' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
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

/** On `/about`: the About link is current. */
export const AboutActive: Story = {
  parameters: { nextjs: { navigation: { pathname: '/about' } } },
  play: async ({ canvasElement }) => {
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
  decorators: [withMintBackdrop],
  play: async ({ canvasElement }) => {
    await expect(headerBackground(canvasElement)).toBe('rgba(0, 0, 0, 0)')
  },
}

/** Landing after scrolling past 24px: the header solidifies and Get started turns primary. */
export const LandingScrolled: Story = {
  parameters: { nextjs: { navigation: { pathname: '/home' } } },
  decorators: [withScrollRoom],
  beforeEach: () => () => window.scrollTo(0, 0),
  play: async ({ canvasElement }) => {
    window.scrollTo(0, 200)
    await waitFor(
      () =>
        expect(headerBackground(canvasElement)).not.toBe('rgba(0, 0, 0, 0)'),
      { timeout: 3000 },
    )
  },
}

/** Phone width on a content page: logo, Open in app, and the menu button. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: { nextjs: { navigation: { pathname: '/pricing' } } },
}

/** Phone width with the menu drawer open: nav links, Feedback, Log in and Get started. */
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
  },
}

/** Phone width on the landing: no menu button, the page's own story leads. */
export const MobileLanding: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: { nextjs: { navigation: { pathname: '/home' } } },
  decorators: [withMintBackdrop],
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
