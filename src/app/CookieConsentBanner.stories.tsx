import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import {
  COOKIE_CONSENT_STORAGE_KEY,
  getCookieConsent,
  openCookieSettings,
} from '@/utils/analytics'

import { CookieConsentBanner } from './CookieConsentBanner'
import { COOKIE_BANNER_HEIGHT_VAR } from './cookieBannerLayout'

/** The height the banner published on `<html>` for fixed controls to clear (empty when it is closed). */
function publishedHeight(canvasElement: HTMLElement) {
  return canvasElement.ownerDocument.documentElement.style.getPropertyValue(
    COOKIE_BANNER_HEIGHT_VAR,
  )
}

/**
 * Story-only: a private, in-memory `localStorage` for this page. The real one
 * is shared by every test file running at once and survives between visits,
 * and an "accepted" cookie choice would let the next `capture()` start PostHog
 * with the production token, so these stories never touch it.
 */
function stubLocalStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  const storage: Storage = {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => {
      data.delete(key)
    },
    setItem: (key, value) => {
      data.set(key, String(value))
    },
  }
  const original = Object.getOwnPropertyDescriptor(window, 'localStorage')
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: storage,
  })
  return () => {
    if (original) Object.defineProperty(window, 'localStorage', original)
    else Reflect.deleteProperty(window, 'localStorage')
  }
}

const meta = {
  title: 'Shell/CookieConsentBanner',
  component: CookieConsentBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  // The banner reads localStorage on mount: every story starts undecided
  // unless it sets `parameters.storedConsent`.
  beforeEach: ({ parameters }) =>
    stubLocalStorage(
      parameters.storedConsent
        ? { [COOKIE_CONSENT_STORAGE_KEY]: parameters.storedConsent }
        : {},
    ),
} satisfies Meta<typeof CookieConsentBanner>

export default meta
type Story = StoryObj<typeof meta>

/**
 * First visit, no stored choice: the banner is pinned to the bottom of the
 * screen and publishes its height (`--cookie-banner-height` on `<html>`), so
 * fixed controls such as the landing's floating pill sit above it.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const banner = await within(canvasElement).findByRole('region', {
      name: 'Cookie consent',
    })
    await expect(banner).toBeVisible()
    await waitFor(() =>
      expect(publishedHeight(canvasElement)).toBe(`${banner.offsetHeight}px`),
    )
  },
}

/** Phone width: text above, both choices below, right-aligned. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy, picked from the `/zh-hk` URL prefix. */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
}

/** Choosing "Essential only" stores the choice and dismisses the banner. */
export const EssentialOnlyChosen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Essential only' }),
    )
    await expect(getCookieConsent()).toBe('rejected')
    await waitFor(
      () =>
        expect(
          canvas.queryByRole('region', { name: 'Cookie consent' }),
        ).toBeNull(),
      { timeout: 3000 },
    )
    // Closed: nothing left to clear.
    await expect(publishedHeight(canvasElement)).toBe('')
  },
}

/** A choice is already stored: the banner renders nothing. */
export const AlreadyDecided: Story = {
  parameters: { storedConsent: 'rejected' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('region', { name: 'Cookie consent' }),
    ).toBeNull()
    await expect(publishedHeight(canvasElement)).toBe('')
  },
}

/** Footer "Cookie settings" after a stored choice: the banner opens again to change it. */
export const ReopenedFromFooter: Story = {
  parameters: { storedConsent: 'rejected' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.queryByRole('region', { name: 'Cookie consent' }),
    ).toBeNull()
    openCookieSettings()
    const banner = await canvas.findByRole('region', { name: 'Cookie consent' })
    await expect(banner).toBeVisible()
    await waitFor(() =>
      expect(publishedHeight(canvasElement)).toBe(`${banner.offsetHeight}px`),
    )
  },
}
