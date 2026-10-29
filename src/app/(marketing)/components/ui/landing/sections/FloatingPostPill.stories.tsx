import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'
import { CookieConsentBanner } from '@/app/CookieConsentBanner'
import { COOKIE_BANNER_OPEN_ATTR } from '@/app/cookieBannerLayout'

import {
  FLOATING_PILL_GAP_PX,
  FLOATING_PILL_RISE_PX,
  FloatingPostPill,
} from './FloatingPostPill'

const { ctas } = messages.en.common
const zhCtas = messages.zh_hk.common.ctas

/** The character the product's copy never uses, built here so no source line carries it. */
const EM_DASH = String.fromCodePoint(0x2014)

/** Resolved token values the stories check: ink (`text.default`), the page white (`bg.surface`) and green 600 (the focus ring). */
const INK = 'rgb(10, 21, 18)'
const WHITE = 'rgb(255, 255, 255)'
const GREEN_600 = 'rgb(2, 165, 103)'

/**
 * Story-only: the page the pill watches, in the page's own hooks. A hero
 * (`data-landing-hero`), a long story, the final call to action
 * (`data-final-cta`) and a footer, each taller than the screen's share so that
 * at most one of them is in view where the stories say so.
 */
const withPage: Decorator = (Story) => (
  <>
    <Box as="section" data-landing-hero="" h="100vh" p={6}>
      Hero
    </Box>
    <Box h="200vh" p={6} aria-hidden>
      The story
    </Box>
    <Box as="section" data-final-cta="" h="40vh" p={6}>
      Final call to action
    </Box>
    <Box as="footer" h="120vh" p={6} bg="bg.subtle">
      Footer
    </Box>
    <Story />
  </>
)

/** Story-only: sets what `(prefers-reduced-motion: reduce)` reports until cleanup. */
function emulateReducedMotion(matches: boolean) {
  const original = window.matchMedia
  window.matchMedia = (query: string) => {
    const list = original.call(window, query)
    if (!/prefers-reduced-motion:\s*reduce/.test(query)) return list
    return new Proxy(list, {
      get(target, prop) {
        if (prop === 'matches') return matches
        const value = Reflect.get(target, prop)
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
  }
  return () => {
    window.matchMedia = original
  }
}

/**
 * Story-only: a private, in-memory `localStorage`, so the cookie banner starts
 * undecided whatever other stories stored (see the banner's own stories).
 */
function stubLocalStorage() {
  const data = new Map<string, string>()
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

function pillOf(canvasElement: HTMLElement): HTMLElement {
  const pill = canvasElement.querySelector<HTMLElement>(
    '[data-floating-post-pill]',
  )
  if (!pill) throw new Error('The pill is missing')
  return pill
}

function blockOf(canvasElement: HTMLElement, selector: string): HTMLElement {
  const block = canvasElement.ownerDocument.querySelector<HTMLElement>(selector)
  if (!block) throw new Error(`${selector} is missing`)
  return block
}

function box(node: HTMLElement) {
  return node.getBoundingClientRect()
}

/** Scrolls the page and gives the observer a moment to report. */
async function scrollTo(top: number) {
  window.scrollTo(0, top)
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
}

/** Waits until the pill has finished fading in (or out). */
async function settled(pill: HTMLElement, opacity: '0' | '1') {
  await waitFor(() => expect(getComputedStyle(pill).opacity).toBe(opacity), {
    timeout: 3000,
  })
}

/** The pill is shown: marked so, fully opaque, and its link is in the accessibility tree. */
async function expectShown(
  canvasElement: HTMLElement,
  name: string,
): Promise<HTMLElement> {
  const pill = pillOf(canvasElement)
  await waitFor(() => expect(pill).toHaveAttribute('data-visible', 'true'), {
    timeout: 3000,
  })
  await settled(pill, '1')
  return within(canvasElement).getByRole('link', { name })
}

/** The pill is hidden: marked so, faded out, and gone from the accessibility tree and the tab order. */
async function expectHidden(canvasElement: HTMLElement, name: string) {
  const pill = pillOf(canvasElement)
  await waitFor(() => expect(pill).toHaveAttribute('data-visible', 'false'), {
    timeout: 3000,
  })
  await settled(pill, '0')
  await waitFor(() => expect(getComputedStyle(pill).visibility).toBe('hidden'))
  await expect(within(canvasElement).queryByRole('link', { name })).toBeNull()
}

const meta = {
  title: 'Marketing/Landing/FloatingPostPill',
  component: FloatingPostPill,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    label: ctas.postTask,
    href: '/register?next=%2Ftasks%2Fcreate',
  },
  decorators: [withPage],
  beforeEach: () => emulateReducedMotion(false),
} satisfies Meta<typeof FloatingPostPill>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop, down the page and back. At the top the hero is in view and the pill
 * is hidden: out of the accessibility tree and the tab order, 16px low. Once
 * the hero has scrolled out of view it fades in and rises 16px: an ink pill
 * (`text.default` fill, a white label at 500) with the page's post label and an
 * arrow, fixed 16px above the bottom edge and centred. It hides again while the
 * final call to action is in view, and while the footer is, and comes back
 * between them and when the visitor scrolls back up, until the hero returns.
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    const pill = pillOf(canvasElement)
    const screen = window.innerHeight

    // The hero is in view: hidden and held 16px low, out of the tab order.
    await expectHidden(canvasElement, args.label)
    await expect(getComputedStyle(pill).transform).toBe(
      `matrix(1, 0, 0, 1, 0, ${FLOATING_PILL_RISE_PX})`,
    )
    await expect(FLOATING_PILL_RISE_PX).toBe(16)
    await userEvent.tab()
    await expect(canvasElement.contains(document.activeElement)).toBe(false)

    // Past the hero: shown.
    await scrollTo(screen * 1.5)
    const link = await expectShown(canvasElement, args.label)
    await expect(getComputedStyle(pill).transform).toBe('none')

    // A labelled link to the page's post action, with a decorative arrow.
    await expect(link).toHaveAccessibleName(ctas.postTask)
    await expect(link).toHaveAttribute('href', args.href)
    await expect(link.textContent).toBe(ctas.postTask)
    const arrow = link.querySelector('svg')
    await expect(arrow).not.toBeNull()
    await expect(arrow).toHaveAttribute('aria-hidden', 'true')
    await expect(canvasElement.textContent).not.toContain(EM_DASH)
    await expect(link.tabIndex).toBeGreaterThanOrEqual(0)

    // An ink pill: ink fill, a white 500 label, fully round, a 44px touch
    // target at least, lifted by a soft shadow. No green fill, so the hero's
    // Search and the close's Post a task stay the page's greens.
    const look = getComputedStyle(link)
    await expect(look.backgroundColor).toBe(INK)
    await expect(look.color).toBe(WHITE)
    await expect(Number(look.fontWeight)).toBe(500)
    await expect(box(link).height).toBeGreaterThanOrEqual(44)
    await expect(Number.parseFloat(look.borderTopLeftRadius)).toBeGreaterThan(
      box(link).height / 2 - 1,
    )
    await expect(look.boxShadow).not.toBe('none')

    // Fixed to the bottom centre: 16px above the bottom edge, centred.
    await expect(getComputedStyle(pill).position).toBe('fixed')
    const root = canvasElement.ownerDocument.documentElement
    await expect(
      Math.abs(window.innerHeight - box(link).bottom - FLOATING_PILL_GAP_PX),
    ).toBeLessThan(1.5)
    await expect(
      Math.abs((box(link).left + box(link).right) / 2 - root.clientWidth / 2),
    ).toBeLessThan(1.5)
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)

    // A keyboard lands on it with a green 600 focus ring.
    await userEvent.tab()
    await expect(document.activeElement).toBe(link)
    const ring = getComputedStyle(link)
    await expect(ring.outlineStyle).toBe('solid')
    await expect(ring.outlineWidth).toBe('2px')
    await expect(ring.outlineColor).toBe(GREEN_600)
    link.blur()

    // The final call to action is in view: hidden.
    blockOf(canvasElement, '[data-final-cta]').scrollIntoView({
      block: 'center',
    })
    await expectHidden(canvasElement, args.label)

    // The footer alone is in view: still hidden.
    await scrollTo(root.scrollHeight)
    await expectHidden(canvasElement, args.label)

    // Back between them: shown again.
    await scrollTo(screen * 1.5)
    await expectShown(canvasElement, args.label)

    // Back at the top, the hero is in view again: hidden.
    await scrollTo(0)
    await expectHidden(canvasElement, args.label)
  },
}

/**
 * Phone width (320px, the narrowest): the same pill, still centred and inside
 * the gutters, with nothing wider than the screen.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    await expectHidden(canvasElement, args.label)
    await scrollTo(window.innerHeight * 1.5)
    const link = await expectShown(canvasElement, args.label)
    const width = canvasElement.ownerDocument.documentElement.clientWidth
    await expect(box(link).left).toBeGreaterThanOrEqual(16)
    await expect(box(link).right).toBeLessThanOrEqual(width - 16)
    await expect(
      Math.abs((box(link).left + box(link).right) / 2 - width / 2),
    ).toBeLessThan(1.5)
    await expect(
      Math.abs(window.innerHeight - box(link).bottom - FLOATING_PILL_GAP_PX),
    ).toBeLessThan(1.5)
    await expect(box(link).height).toBeGreaterThanOrEqual(44)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * Reduced motion: the pill appears without sliding. Hidden or shown it has no
 * transform (nothing rises) and it only fades; the same rules decide when.
 */
export const ReducedMotion: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  beforeEach: () => emulateReducedMotion(true),
  play: async ({ canvasElement, args }) => {
    const pill = pillOf(canvasElement)
    await expectHidden(canvasElement, args.label)
    // Held in place while hidden, not 16px low.
    await expect(getComputedStyle(pill).transform).toBe('none')
    await expect(getComputedStyle(pill).transitionProperty).not.toContain(
      'transform',
    )

    await scrollTo(window.innerHeight * 1.5)
    const link = await expectShown(canvasElement, args.label)
    await expect(getComputedStyle(pill).transform).toBe('none')
    await expect(getComputedStyle(pill).transitionProperty).not.toContain(
      'transform',
    )
    await expect(link).toHaveAttribute('href', args.href)

    // The rules are the same: the final call to action hides it.
    blockOf(canvasElement, '[data-final-cta]').scrollIntoView({
      block: 'center',
    })
    await expectHidden(canvasElement, args.label)
  },
}

/**
 * Once it has focus the pill stays, even when the page scrolls to the footer,
 * so it is never pulled from under a keyboard; it goes when focus leaves it.
 */
export const KeepsFocus: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    const pill = pillOf(canvasElement)
    await scrollTo(window.innerHeight * 1.5)
    const link = await expectShown(canvasElement, args.label)

    await userEvent.tab()
    await expect(document.activeElement).toBe(link)

    await scrollTo(canvasElement.ownerDocument.documentElement.scrollHeight)
    await waitFor(() => expect(pill).toHaveAttribute('data-visible', 'false'))
    await expect(getComputedStyle(pill).visibility).toBe('visible')
    await expect(getComputedStyle(pill).opacity).toBe('1')

    link.blur()
    await expectHidden(canvasElement, args.label)
  },
}

/** Story-only: the real cookie banner, undecided, under the pill. */
const withCookieBanner: Decorator = (Story) => (
  <>
    <Story />
    <CookieConsentBanner />
  </>
)

/**
 * The cookie banner is open (first visit): the pill waits, so it never sits on
 * the page's text above a banner that already takes the foot of a phone. The
 * watch has the pill marked shown (the hero is behind), but it stays out of
 * sight and out of the tab order; once the banner is answered it fades in 16px
 * above the bottom edge.
 */
export const WaitsForTheCookieBanner: Story = {
  decorators: [withCookieBanner],
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  beforeEach: () => stubLocalStorage(),
  play: async ({ canvasElement, args }) => {
    const root = canvasElement.ownerDocument.documentElement
    const canvas = within(canvasElement)
    const banner = await canvas.findByRole('region', { name: 'Cookie consent' })
    await waitFor(() => expect(root).toHaveAttribute(COOKIE_BANNER_OPEN_ATTR))

    await scrollTo(window.innerHeight * 1.5)
    const pill = pillOf(canvasElement)
    await waitFor(() => expect(pill).toHaveAttribute('data-visible', 'true'), {
      timeout: 3000,
    })
    // Marked shown, yet faded out, hidden and not a tab stop while the banner
    // is open.
    await settled(pill, '0')
    await waitFor(() =>
      expect(getComputedStyle(pill).visibility).toBe('hidden'),
    )
    await expect(canvas.queryByRole('link', { name: args.label })).toBeNull()

    // The visitor answers the banner: it leaves, and the pill comes in.
    await userEvent.click(
      within(banner).getByRole('button', { name: 'Essential only' }),
    )
    await waitFor(() =>
      expect(root).not.toHaveAttribute(COOKIE_BANNER_OPEN_ATTR),
    )
    const link = await expectShown(canvasElement, args.label)
    await expect(
      Math.abs(window.innerHeight - box(link).bottom - FLOATING_PILL_GAP_PX),
    ).toBeLessThan(1.5)
  },
}

/** Traditional Chinese: the label and the localized href come from the page. */
export const TraditionalChinese: Story = {
  args: {
    label: zhCtas.postTask,
    href: '/zh-hk/register?next=%2Ftasks%2Fcreate',
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    await scrollTo(window.innerHeight * 1.5)
    const link = await expectShown(canvasElement, args.label)
    await expect(link).toHaveAccessibleName(zhCtas.postTask)
    await expect(link).toHaveAttribute('href', args.href)
    await expect(canvasElement.textContent).not.toContain(EM_DASH)
  },
}
