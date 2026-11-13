import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import { viewportAt } from '@/ui/PageContainer/pageLines.testing'
import {
  COOKIE_CONSENT_STORAGE_KEY,
  getCookieConsent,
  openCookieSettings,
} from '@/utils/analytics'

import { CookieConsentBanner } from './CookieConsentBanner'
import {
  COOKIE_BANNER_HEIGHT_VAR,
  COOKIE_BANNER_OPEN_ATTR,
} from './cookieBannerLayout'

/** Whether the banner has marked `<html>` as open (the floating pill waits on it). */
function markedOpen(canvasElement: HTMLElement) {
  return canvasElement.ownerDocument.documentElement.hasAttribute(
    COOKIE_BANNER_OPEN_ATTR,
  )
}

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
 * screen and publishes its height (`--cookie-banner-height` on `<html>`) and
 * marks `<html>` open (`data-cookie-banner-open`): the page keeps scrolled-to
 * controls above it, and the landing's floating pill waits until it is answered.
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
    await expect(markedOpen(canvasElement)).toBe(true)
    // First visit: nothing stored, so no current-choice line (FE-565), no
    // button marked, and the banner does not take focus from the page.
    await expect(banner.querySelector('[data-current-choice]')).toBeNull()
    for (const button of within(banner).getAllByRole('button')) {
      await expect(button).not.toHaveAttribute('aria-pressed')
    }
    await expect(banner).not.toHaveFocus()
    await expect(banner).not.toHaveAttribute('aria-describedby')
  },
}

/**
 * A 390 phone (FE-541): the short text above, both choices on one row of
 * equal halves in the same style, Essential only first; under 130px tall.
 */
export const Mobile: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    const banner = await within(canvasElement).findByRole('region', {
      name: 'Cookie consent',
    })
    const [essential, accept] = within(banner).getAllByRole('button')
    if (!essential || !accept) throw new Error('Two choices expected')
    await expect(essential).toHaveTextContent('Essential only')
    await expect(accept).toHaveTextContent('Accept all')
    const a = essential.getBoundingClientRect()
    const b = accept.getBoundingClientRect()
    await expect(Math.abs(a.width - b.width)).toBeLessThanOrEqual(1)
    await expect(a.top).toBe(b.top)
    await expect(essential.className).toBe(accept.className)
    await expect(banner).toHaveTextContent('We do not record your screen.')
    await expect(banner.getBoundingClientRect().height).toBeLessThan(130)
  },
}

/** Traditional Chinese copy, picked from the `/zh-hk` URL prefix: the full stop is 。, inside the copy. */
export const TraditionalChinese: Story = {
  ...viewportAt(390),
  parameters: {
    ...viewportAt(390).parameters,
    nextjs: { navigation: { pathname: '/zh-hk' } },
  },
  play: async ({ canvasElement }) => {
    const banner = await within(canvasElement).findByRole('region', {
      name: 'Cookie 同意',
    })
    await expect(banner).toHaveTextContent('我們不會錄製你的畫面。')
    await expect(banner.textContent).toMatch(/Cookie 政策。/)
    await expect(banner.textContent).not.toMatch(/\.$/)
  },
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
    // Closed: nothing left to clear, and the mark is gone.
    await expect(publishedHeight(canvasElement)).toBe('')
    await expect(markedOpen(canvasElement)).toBe(false)
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

/**
 * Footer "Cookie settings" after a stored choice: the banner opens again to
 * change it, says the stored choice (FE-565), and takes focus so a screen
 * reader announces it, with the stored button pressed.
 */
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
    // FE-565: the stored choice, as one line; the buttons stay identical.
    await expect(
      within(banner).getByText('Current choice: Essential only'),
    ).toBeVisible()
    const [essential, accept] = within(banner).getAllByRole('button')
    await expect(essential?.className).toBe(accept?.className)
    // Screen readers: the stored choice is the pressed button, and the banner
    // takes focus with the line as its description.
    await expect(essential).toHaveAttribute('aria-pressed', 'true')
    await expect(accept).toHaveAttribute('aria-pressed', 'false')
    await waitFor(() => expect(banner).toHaveFocus())
    await expect(banner).toHaveAccessibleDescription(
      'Current choice: Essential only',
    )
  },
}

/** Reopened after "Accept all" (FE-565): the line names that choice. */
export const ReopenedAfterAcceptAll: Story = {
  parameters: { storedConsent: 'accepted' },
  play: async ({ canvasElement }) => {
    openCookieSettings()
    const banner = await within(canvasElement).findByRole('region', {
      name: 'Cookie consent',
    })
    await expect(
      within(banner).getByText('Current choice: Accept all'),
    ).toBeVisible()
    await expect(
      within(banner).getByRole('button', { name: 'Accept all' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      within(banner).getByRole('button', { name: 'Essential only' }),
    ).toHaveAttribute('aria-pressed', 'false')
    await waitFor(() => expect(banner).toHaveFocus())
    await expect(banner).toHaveAccessibleDescription(
      'Current choice: Accept all',
    )
  },
}

/** Reopened in Chinese (FE-565): 目前選擇 with the banner's own button word. */
export const ReopenedTraditionalChinese: Story = {
  parameters: {
    storedConsent: 'rejected',
    nextjs: { navigation: { pathname: '/zh-hk' } },
  },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    openCookieSettings()
    const banner = await within(canvasElement).findByRole('region', {
      name: 'Cookie 同意',
    })
    await expect(
      within(banner).getByText('目前選擇：只使用必要 Cookie'),
    ).toBeVisible()
    await expect(
      within(banner).getByRole('button', { name: '只使用必要 Cookie' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(banner).toHaveAccessibleDescription(
      '目前選擇：只使用必要 Cookie',
    )
  },
}
