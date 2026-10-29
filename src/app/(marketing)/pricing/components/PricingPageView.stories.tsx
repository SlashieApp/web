import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'
import { FeedbackDialogProvider } from '@/ui/FeedbackDialog/FeedbackDialogProvider'

import { MarketingHeader } from '../../components/layout/MarketingHeader'
import { PricingPageView } from './PricingPageView'
import {
  buildStoryMe,
  freeMembership,
  storyPricing,
  stubSession,
} from './pricingStoryFixtures'

const copy = pricingBag.en

/** The character the product's copy never uses, built here so no source line carries it. */
const EM_DASH = String.fromCodePoint(0x2014)

/** Resolved token values the stories check. */
const WHITE = 'rgb(255, 255, 255)'
const PLUM = 'rgb(105, 56, 239)'
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const BORDER_STRONG = 'rgb(212, 212, 216)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const INK = 'rgb(10, 21, 18)'
const GREEN_400 = 'rgb(0, 220, 130)'
const GREEN_600 = 'rgb(2, 165, 103)'
/** `sizes.page`: 80rem. */
const PAGE_PX = 1280

/**
 * Story-only: the page as the marketing layout sets it, the marketing header
 * (on `/pricing`, so white) and then the page, on the layout's canvas colour.
 */
const withLayout: Decorator = (Story) => (
  <FeedbackDialogProvider onSubmit={async () => true}>
    <Box bg="bg.canvas" minH="100dvh">
      <MarketingHeader />
      <Box as="main" id="main-content">
        <Story />
      </Box>
    </Box>
  </FeedbackDialogProvider>
)

const meta = {
  title: 'Marketing/Pricing/PricingPage',
  component: PricingPageView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/pricing' } },
  },
  args: {
    pricing: storyPricing,
    hasSession: false,
    copy,
  },
  decorators: [withLayout],
  // Signed out unless a story seeds its own session; scroll back up after.
  beforeEach: () => {
    const restore = stubSession(null, null)
    return () => {
      restore()
      window.scrollTo(0, 0)
    }
  },
} satisfies Meta<typeof PricingPageView>

export default meta
type Story = StoryObj<typeof meta>

function box(node: Element) {
  return node.getBoundingClientRect()
}

/** The pieces of the page the stories look at. */
function parts(canvasElement: HTMLElement) {
  const frame = canvasElement.querySelector<HTMLElement>(
    '[data-marketing-rails]',
  )?.parentElement
  const rails = canvasElement.querySelector<HTMLElement>(
    '[data-marketing-rails]',
  )
  const rules = [
    ...canvasElement.querySelectorAll<HTMLElement>('[data-section-rule]'),
  ]
  const plans = canvasElement.querySelector<HTMLElement>(
    '[data-pricing-plans-section]',
  )
  const faq = canvasElement.querySelector<HTMLElement>('[data-pricing-faq]')
  const free = canvasElement.querySelector<HTMLElement>(
    '[data-pricing-plan="free"]',
  )
  const unlimited = canvasElement.querySelector<HTMLElement>(
    '[data-pricing-plan="unlimited"]',
  )
  const header = canvasElement.querySelector<HTMLElement>('header')
  if (!frame || !rails || !plans || !header) {
    throw new Error('The page is missing its frame or plans section')
  }
  return { frame, rails, rules, plans, faq, free, unlimited, header }
}

/** Every element in the frame (the marketing header is chrome and is not the page). */
function everyNode(root: HTMLElement) {
  return [root, ...root.querySelectorAll<HTMLElement>('*')]
}

/**
 * Desktop (1366): the white page in the marketing frame. A rail down each side
 * of the page column, a full-width rule under the title and one between the
 * plans and the questions; the page header's big title is the one h1; the plans
 * section and the questions are landmarks named by their h2s, the plan titles
 * and the questions are h3s. The head is the left column, the content the right
 * one. Plum for the paid plan, green only in the check icons.
 */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { frame, rails, rules, plans, faq, free, unlimited, header } =
      parts(canvasElement)
    if (!faq || !free || !unlimited) throw new Error('The page is incomplete')

    // One h1; the h2s name the two landmarks; the plans and the questions are h3s.
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(
      canvas.getByRole('heading', { level: 1, name: copy.title }),
    ).toBeVisible()
    await expect(
      canvas
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([copy.header.heading, copy.faq.heading])
    await expect(
      canvas.getByRole('region', { name: copy.header.heading }),
    ).toBe(plans)
    await expect(canvas.getByRole('region', { name: copy.faq.heading })).toBe(
      faq,
    )
    const h3s = canvas.getAllByRole('heading', { level: 3 })
    await expect(h3s.map((heading) => heading.textContent)).toEqual([
      copy.plans.free.title,
      storyPricing.productName,
      copy.faq.customers.question,
      copy.faq.freeQuotes.question,
      copy.faq.unlimited.question,
      copy.faq.payments.question,
      copy.faq.trial.question,
      copy.faq.cancel.question,
    ])
    await expect(frame.textContent).not.toContain(EM_DASH)

    // White page: the frame, the page header's bar and the marketing header.
    await expect(getComputedStyle(frame).backgroundColor).toBe(WHITE)
    await expect(getComputedStyle(header).backgroundColor).toBe(WHITE)
    const bar = canvasElement.querySelector<HTMLElement>(
      '[data-sticky-header-bar-bg]',
    )
    await expect(getComputedStyle(bar as HTMLElement).backgroundColor).toBe(
      WHITE,
    )

    // The rails bound the page column; the rules run edge to edge under the
    // title and between the two sections, and nowhere else.
    await expect(getComputedStyle(rails).display).toBe('block')
    const column = rails.firstElementChild as HTMLElement
    const edge = getComputedStyle(column)
    for (const side of ['Left', 'Right'] as const) {
      await expect(edge[`border${side}Width`]).toBe('1px')
      await expect(edge[`border${side}Color`]).toBe(BORDER_DEFAULT)
    }
    await expect(box(column).width).toBe(Math.min(box(frame).width, PAGE_PX))
    await expect(rules).toHaveLength(2)
    for (const rule of rules) {
      await expect(box(rule).width).toBe(box(frame).width)
      await expect(box(rule).height).toBe(1)
      await expect(getComputedStyle(rule).backgroundColor).toBe(BORDER_DEFAULT)
    }
    const [first, second] = rules as [HTMLElement, HTMLElement]
    await expect(box(first).bottom).toBeLessThanOrEqual(box(plans).top + 1)
    await expect(box(second).top).toBeGreaterThanOrEqual(box(plans).bottom - 1)
    await expect(box(second).bottom).toBeLessThanOrEqual(box(faq).top + 1)
    // The rhythm: 128px above and below the content of each section.
    for (const section of [plans, faq]) {
      await expect(getComputedStyle(section).paddingTop).toBe('128px')
      await expect(getComputedStyle(section).paddingBottom).toBe('128px')
    }

    // The head is the left column of the section, the cards the right one,
    // side by side at one height; the questions follow the same split.
    const head = canvas.getByRole('heading', {
      level: 2,
      name: copy.header.heading,
    })
    await expect(head).toHaveStyle({ textAlign: 'start' })
    await expect(box(head).right).toBeLessThan(box(free).left)
    await expect(box(free).top).toBe(box(unlimited).top)
    await expect(box(free).height).toBe(box(unlimited).height)
    await expect(box(unlimited).left).toBeGreaterThan(box(free).right)
    const questions = canvas.getByRole('heading', {
      level: 2,
      name: copy.faq.heading,
    })
    const firstRow = canvasElement.querySelector<HTMLElement>(
      '[data-pricing-faq-item]',
    ) as HTMLElement
    await expect(box(questions).right).toBeLessThan(box(firstRow).left)
    await expect(box(firstRow).left).toBe(box(free).left)

    // The cards follow the teaser: white, a 1px hairline, 12px corners, e1.
    for (const card of [free, unlimited]) {
      const style = getComputedStyle(card)
      await expect(style.backgroundColor).toBe(WHITE)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopLeftRadius).toBe('12px')
      await expect(style.boxShadow).toContain('rgba(10, 21, 18, 0.05)')
      await expect(style.textAlign).toMatch(/^(start|left)$/)
    }
    await expect(getComputedStyle(free).borderTopColor).toBe(BORDER_DEFAULT)
    await expect(getComputedStyle(unlimited).borderTopColor).toBe(PLUM)

    // Plum is the paid plan's: its label (with the sparkle) and its pill. The
    // free plan's label is muted and it has no sparkle.
    const freeTitle = within(free).getByRole('heading', { level: 3 })
    const paidTitle = within(unlimited).getByRole('heading', { level: 3 })
    await expect(getComputedStyle(freeTitle).color).toBe(TEXT_MUTED)
    await expect(getComputedStyle(paidTitle).color).toBe(PLUM)
    await expect(freeTitle.previousElementSibling).toBeNull()
    await expect(paidTitle.previousElementSibling).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    for (const title of [freeTitle, paidTitle]) {
      await expect(Number(getComputedStyle(title).fontWeight)).toBe(500)
    }

    // The price is a figure: 34px at 600 with tabular figures, in ink.
    for (const text of ['£0', '6 months free']) {
      const figure = within(canvasElement).getByText(text)
      const style = getComputedStyle(figure)
      await expect(Number(style.fontWeight)).toBe(600)
      await expect(style.fontSize).toBe('34px')
      await expect(style.fontVariantNumeric).toContain('tabular-nums')
      await expect(style.color).toBe(INK)
    }

    // The buttons are pills: outline on Free, plum with a white label on the paid plan.
    const freeButton = within(free).getByRole('link', { name: 'Get started' })
    const paidButton = within(unlimited).getByRole('link', {
      name: 'Start free trial',
    })
    const outline = getComputedStyle(freeButton)
    await expect(outline.backgroundColor).toBe(WHITE)
    await expect(outline.borderTopColor).toBe(BORDER_STRONG)
    await expect(outline.color).toBe(INK)
    const solid = getComputedStyle(paidButton)
    await expect(solid.backgroundColor).toBe(PLUM)
    await expect(solid.color).toBe(WHITE)
    for (const button of [freeButton, paidButton]) {
      await expect(Number(getComputedStyle(button).fontWeight)).toBe(500)
      await expect(
        Number.parseFloat(getComputedStyle(button).borderTopLeftRadius),
      ).toBeGreaterThan(box(button).height / 2 - 1)
      await expect(box(button).height).toBeGreaterThanOrEqual(44)
    }
    await expect(box(freeButton).bottom).toBe(box(paidButton).bottom)

    // Green does a job or stays out: no green fill anywhere on the page, no
    // green text, and the only green strokes are the check icons.
    for (const node of everyNode(frame)) {
      const style = getComputedStyle(node)
      await expect(style.backgroundColor).not.toBe(GREEN_400)
      await expect(style.color).not.toBe(GREEN_400)
      await expect(Number(style.fontWeight)).toBeLessThanOrEqual(600)
    }
    const checks = [
      ...free.querySelectorAll<HTMLElement>('li > span[aria-hidden="true"]'),
    ]
    await expect(checks).toHaveLength(copy.plans.free.features.length)
    for (const check of checks) {
      await expect(getComputedStyle(check).color).toBe(GREEN_600)
    }

    // The questions: hairline rows, not cards; each an h3 at 18/500 over a
    // muted answer; the last row closes the list with a hairline.
    const rows = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-pricing-faq-item]'),
    ]
    await expect(rows).toHaveLength(6)
    for (const row of rows) {
      const style = getComputedStyle(row)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopColor).toBe(BORDER_DEFAULT)
      await expect(style.borderTopLeftRadius).toBe('0px')
      await expect(style.backgroundColor).not.toBe(WHITE)
      const title = within(row).getByRole('heading', { level: 3 })
      await expect(getComputedStyle(title).fontSize).toBe('18px')
      await expect(Number(getComputedStyle(title).fontWeight)).toBe(500)
    }
    await expect(
      getComputedStyle(rows[5] as HTMLElement).borderBottomWidth,
    ).toBe('1px')
    await expect(
      within(faq).getByRole('link', { name: copy.faq.terms.link }),
    ).toHaveAttribute('href', '/terms')

    // The purchases note sits under the cards.
    await expect(
      box(canvas.getByText(copy.plans.purchasesNote)).top,
    ).toBeGreaterThan(box(free).bottom)

    // Inside the page column: no sideways scroll.
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * Scrolled: the page header's bar sticks under the marketing header, in the
 * page's white, and the title has collapsed into it (FE-458 is unchanged).
 */
export const Scrolled: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector(
      '[data-sticky-header-bar-title]',
    ) as HTMLElement
    window.scrollTo(0, 400)
    await waitFor(() => expect(getComputedStyle(bar).opacity).toBe('1'))
    const { header } = parts(canvasElement)
    const back = within(canvasElement).getByRole('button', { name: 'Go back' })
    await expect(box(back).top).toBeGreaterThanOrEqual(box(header).bottom)
    await expect(
      within(canvasElement).getAllByRole('heading', { level: 1 }),
    ).toHaveLength(1)
    // The bar's copy stays hidden from screen readers.
    await expect(bar.closest('[aria-hidden="true"]')).not.toBeNull()
  },
}

/** A tablet (834px, below `xl`): the head over the content, the cards side by side at one height. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { rails, rules, free, unlimited } = parts(canvasElement)
    if (!free || !unlimited) throw new Error('The page is incomplete')
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(2)
    const head = canvas.getByRole('heading', {
      level: 2,
      name: copy.header.heading,
    })
    await expect(box(free).top).toBeGreaterThanOrEqual(box(head).bottom)
    await expect(box(free).left).toBe(box(head).left)
    await expect(box(free).top).toBe(box(unlimited).top)
    await expect(box(free).height).toBe(box(unlimited).height)
    await expect(box(unlimited).left).toBeGreaterThan(box(free).right)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * Phone width (320px, the narrowest): one column in reading order (head, the
 * free plan, the paid plan, the note, the questions), no rails, 56px sections,
 * inside the page's gutters, no sideways scroll.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { rails, rules, plans, faq, free, unlimited } = parts(canvasElement)
    if (!faq || !free || !unlimited) throw new Error('The page is incomplete')
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(2)
    for (const section of [plans, faq]) {
      await expect(getComputedStyle(section).paddingTop).toBe('56px')
    }
    const head = canvas.getByRole('heading', {
      level: 2,
      name: copy.header.heading,
    })
    await expect(getComputedStyle(head).fontSize).toBe('34px')
    await expect(box(free).top).toBeGreaterThanOrEqual(box(head).bottom)
    await expect(box(unlimited).top).toBeGreaterThanOrEqual(box(free).bottom)
    await expect(box(free).left).toBe(box(unlimited).left)
    await expect(box(free).width).toBe(box(unlimited).width)
    await expect(box(free).left).toBeGreaterThanOrEqual(16)
    await expect(box(free).right).toBeLessThanOrEqual(
      canvasElement.clientWidth - 16,
    )
    await expect(box(faq).top).toBeGreaterThanOrEqual(box(unlimited).bottom)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** No trial from the API: the paid card leads with its price and the trial question is left out. */
export const NoTrial: Story = {
  args: { pricing: { ...storyPricing, trialDays: null, trialLabel: null } },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('£19.99')).toBeVisible()
    await expect(canvas.queryByText(copy.faq.trial.question)).toBeNull()
  },
}

/** A free worker: Free is their plan (the success tag), the trial opens Checkout in plum. */
export const FreeWorker: Story = {
  args: { hasSession: true },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  beforeEach: () => {
    const restore = stubSession(
      'storybook-token',
      buildStoryMe({ membership: freeMembership, setupComplete: true }),
    )
    return () => {
      restore()
      window.scrollTo(0, 0)
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { free } = parts(canvasElement)
    if (!free) throw new Error('The page is incomplete')
    await expect(within(free).getByText(copy.plans.yourPlan)).toBeVisible()
    const trial = canvas.getByRole('button', { name: 'Start free trial' })
    await expect(trial).toBeEnabled()
    await expect(getComputedStyle(trial).backgroundColor).toBe(PLUM)
    await expect(getComputedStyle(trial).color).toBe(WHITE)
  },
}

/** The API returned no plans: the card stands in the plans section, the questions are left out. */
export const Unavailable: Story = {
  args: { pricing: null },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { plans, rules } = parts(canvasElement)
    await expect(
      within(plans).getByRole('heading', {
        level: 3,
        name: copy.unavailable.heading,
      }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('region', { name: copy.faq.heading }),
    ).toBeNull()
    await expect(rules).toHaveLength(1)
    await expect(
      canvas.getByRole('link', { name: copy.unavailable.retry }),
    ).toHaveAttribute('href', '/pricing')
  },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', {
        level: 1,
        name: pricingBag.zh_hk.title,
      }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('region', { name: pricingBag.zh_hk.header.heading }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('region', { name: pricingBag.zh_hk.faq.heading }),
    ).toBeVisible()
    await expect(canvas.getByText('免費 6 個月')).toBeVisible()
  },
}
