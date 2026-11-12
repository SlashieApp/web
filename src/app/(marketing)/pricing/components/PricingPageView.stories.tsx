import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import marketingBag from '@/app/(marketing)/i11n.json'
import pricingBag from '@/app/(marketing)/pricing/i11n.json'
import { FeedbackDialogProvider } from '@/ui/FeedbackDialog/FeedbackDialogProvider'
import { viewportAt } from '@/ui/PageContainer/pageLines.testing'

import { MarketingHeader } from '../../components/layout/MarketingHeader'
import { expectMarketingPage } from '../../components/layout/marketingLines.testing'
import { PricingPageView } from './PricingPageView'
import {
  buildStoryMe,
  freeMembership,
  storyPricing,
  stubSession,
} from './pricingStoryFixtures'

const copy = pricingBag.en
const marketing = marketingBag.en

/** Home's closing band, as the page builds it for a guest. */
const finalCta = {
  copy: marketing.landing.finalCta,
  primary: {
    label: marketing.common.ctas.postTask,
    href: '/register?next=%2Ftasks%2Fcreate',
  },
  secondary: {
    label: marketing.common.ctas.becomeWorker,
    href: '/register?next=%2Fworker%2Fsetup',
  },
}

/** The counting cells' titles, as the page fills them in for the story's plans. */
const countingTitles = (bag: typeof copy) =>
  (['free', 'edits', 'unlimited'] as const).map((key) =>
    bag.counting[key].title
      .replace('{count}', String(storyPricing.freeQuotesPerMonth))
      .replace('{product}', storyPricing.productName),
  )

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
    phone: marketing.landing.phone,
    finalCta,
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

/**
 * The hero rises in like Home's (a CSS animation), and the snippets play once
 * scrolled into view: wait for what a check looks at to be shown.
 */
async function shown(element: HTMLElement) {
  element.scrollIntoView({ block: 'center' })
  await waitFor(() => expect(element).toBeVisible(), { timeout: 4000 })
  return element
}

/** The pieces of the page the stories look at. */
function parts(canvasElement: HTMLElement) {
  const q = (selector: string) =>
    canvasElement.querySelector<HTMLElement>(selector)
  const rails = q('[data-marketing-rails]')
  const frame = rails?.parentElement
  const rules = [
    ...canvasElement.querySelectorAll<HTMLElement>('[data-section-rule]'),
  ]
  const hero = q('[data-pricing-hero]')
  const header = q('header')
  if (!frame || !rails || !hero || !header) {
    throw new Error('The page is missing its frame or hero')
  }
  return {
    frame,
    rails,
    rules,
    hero,
    header,
    counting: q('[data-pricing-counting]'),
    faq: q('[data-pricing-faq]'),
    cta: q('[data-final-cta]'),
    free: q('[data-pricing-plan="free"]'),
    unlimited: q('[data-pricing-plan="unlimited"]'),
  }
}

/** Every element in the frame (the marketing header is chrome and is not the page). */
function everyNode(root: HTMLElement) {
  return [root, ...root.querySelectorAll<HTMLElement>('*')]
}

/**
 * Desktop (1366), redesigned to match Home (FE-552): the hero (the h1 and body
 * centred over the faint grey, the two plans under them), how quotes are
 * counted (three cells with live snippets), the questions and Home's closing
 * band, divided by full-width rules, in the rails. The h1 names the hero; the
 * cells' h2s name their section; the plan titles and the questions are h3s.
 * Plum for the paid plan's label and hairline; green in the check icons, the
 * paid plan's button and the closing band's Post a task (one per screen).
 */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const {
      frame,
      rails,
      rules,
      hero,
      header,
      counting,
      faq,
      cta,
      free,
      unlimited,
    } = parts(canvasElement)
    if (!counting || !faq || !cta || !free || !unlimited) {
      throw new Error('The page is incomplete')
    }

    // One h1, the headline, centred; it names the hero.
    const h1s = canvas.getAllByRole('heading', { level: 1 })
    await expect(h1s).toHaveLength(1)
    const h1 = h1s[0] as HTMLElement
    await expect(h1).toHaveTextContent(copy.header.heading)
    await expect(getComputedStyle(h1).textAlign).toBe('center')
    await expect(
      canvas.getByRole('region', { name: copy.header.heading }),
    ).toBe(hero)
    await expect(
      canvas
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      ...countingTitles(copy),
      copy.faq.heading,
      marketing.landing.finalCta.heading,
    ])
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

    // White page; the old page header (back arrow, "Membership") is gone.
    await expect(getComputedStyle(frame).backgroundColor).toBe(WHITE)
    await expect(getComputedStyle(header).backgroundColor).toBe(WHITE)
    await expect(
      canvasElement.querySelector('[data-sticky-header-bar-bg]'),
    ).toBeNull()

    // Rails bound the page column; three full-width rules divide the four
    // sections: hero | counting | questions | closing band.
    await expect(getComputedStyle(rails).display).toBe('block')
    const column = rails.firstElementChild as HTMLElement
    const edge = getComputedStyle(column)
    for (const side of ['Left', 'Right'] as const) {
      await expect(edge[`border${side}Width`]).toBe('1px')
      await expect(edge[`border${side}Color`]).toBe(BORDER_DEFAULT)
    }
    await expect(box(column).width).toBe(Math.min(box(frame).width, PAGE_PX))
    await expect(rules).toHaveLength(3)
    for (const rule of rules) {
      await expect(box(rule).width).toBe(box(frame).width)
      await expect(box(rule).height).toBe(1)
      await expect(getComputedStyle(rule).backgroundColor).toBe(BORDER_DEFAULT)
    }
    const order = [hero, counting, faq, cta]
    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i] as HTMLElement
      await expect(box(rule).top).toBeGreaterThanOrEqual(
        box(order[i] as HTMLElement).bottom - 1,
      )
      await expect(box(rule).bottom).toBeLessThanOrEqual(
        box(order[i + 1] as HTMLElement).top + 1,
      )
    }
    await expect(getComputedStyle(faq).paddingTop).toBe('128px')

    // The plans sit under the headline, side by side at one height, centred.
    await expect(box(free).top).toBeGreaterThan(box(h1).bottom)
    await expect(box(free).top).toBe(box(unlimited).top)
    await expect(box(free).height).toBe(box(unlimited).height)
    await expect(box(unlimited).left).toBeGreaterThan(box(free).right)
    const middle = box(frame).left + box(frame).width / 2
    await expect(
      Math.abs((box(free).left + box(unlimited).right) / 2 - middle),
    ).toBeLessThan(2)
    // The prices are above the fold.
    await expect(box(free).top).toBeLessThan(window.innerHeight)

    // The cards follow Home's teaser: white, a 1px hairline, 12px corners, e1.
    for (const card of [free, unlimited]) {
      const style = getComputedStyle(card)
      await expect(style.backgroundColor).toBe(WHITE)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopLeftRadius).toBe('12px')
      await expect(style.boxShadow).toContain('rgba(10, 21, 18, 0.05)')
    }
    await expect(getComputedStyle(free).borderTopColor).toBe(BORDER_DEFAULT)
    await expect(getComputedStyle(unlimited).borderTopColor).toBe(PLUM)
    const freeTitle = within(free).getByRole('heading', { level: 3 })
    const paidTitle = within(unlimited).getByRole('heading', { level: 3 })
    await expect(getComputedStyle(freeTitle).color).toBe(TEXT_MUTED)
    await expect(getComputedStyle(paidTitle).color).toBe(PLUM)

    // The price is a figure: 34px at 600 with tabular figures, in ink.
    for (const text of ['£0', '6 months free']) {
      const figure = within(canvasElement).getByText(text)
      const style = getComputedStyle(figure)
      await expect(Number(style.fontWeight)).toBe(600)
      await expect(style.fontSize).toBe('34px')
      await expect(style.fontVariantNumeric).toContain('tabular-nums')
      await expect(style.color).toBe(INK)
    }

    // Pills: outline on Free, the green primary on the paid plan.
    const freeButton = within(free).getByRole('link', { name: 'Get started' })
    const paidButton = within(unlimited).getByRole('link', {
      name: 'Start free trial',
    })
    await expect(getComputedStyle(freeButton).backgroundColor).toBe(WHITE)
    await expect(getComputedStyle(freeButton).borderTopColor).toBe(
      BORDER_STRONG,
    )
    await expect(getComputedStyle(paidButton).backgroundColor).toBe(GREEN_400)
    await expect(getComputedStyle(paidButton).color).toBe(INK)
    await expect(paidButton).toHaveAttribute('data-page-green-action', '')
    await expect(box(freeButton).bottom).toBe(box(paidButton).bottom)

    // Green does a job or stays out: the green fills are the paid plan's
    // button and the closing band's Post a task (never on one screen
    // together), no green text, and nothing heavier than 600.
    const postTask = within(cta).getByRole('link', {
      name: marketing.common.ctas.postTask,
    })
    const greenFills: Element[] = []
    for (const node of everyNode(frame)) {
      const style = getComputedStyle(node)
      if (style.backgroundColor === GREEN_400) greenFills.push(node)
      await expect(style.color).not.toBe(GREEN_400)
      await expect(Number(style.fontWeight)).toBeLessThanOrEqual(600)
    }
    await expect(greenFills).toEqual([paidButton, postTask])
    await expect(box(postTask).top - box(paidButton).bottom).toBeGreaterThan(
      window.innerHeight,
    )
    const checks = [
      ...free.querySelectorAll<HTMLElement>('li > span[aria-hidden="true"]'),
    ]
    await expect(checks).toHaveLength(copy.plans.free.features.length)
    for (const check of checks) {
      await expect(getComputedStyle(check).color).toBe(GREEN_600)
    }

    // How quotes are counted: three cells side by side, divided by
    // hairlines, their snippet panels starting on one line.
    const cells = [
      ...counting.querySelectorAll<HTMLElement>('[data-pricing-counting-cell]'),
    ]
    await expect(cells).toHaveLength(3)
    const panels = cells.map(
      (cell) => cell.querySelector('figure') as HTMLElement,
    )
    for (const panel of panels) {
      await expect(box(panel).top).toBe(box(panels[0] as HTMLElement).top)
    }
    for (const cell of cells.slice(1)) {
      await expect(getComputedStyle(cell).borderLeftWidth).toBe('1px')
    }

    // The questions: hairline rows, each an h3 over a muted answer.
    const rows = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-pricing-faq-item]'),
    ]
    await expect(rows).toHaveLength(6)
    await expect(
      within(faq).getByRole('link', { name: copy.faq.terms.link }),
    ).toHaveAttribute('href', '/terms')

    // Home's closing band: its line, Post a task and Become a worker.
    await expect(postTask).toHaveAttribute('href', finalCta.primary.href)
    await expect(
      within(cta).getByRole('link', {
        name: marketing.common.ctas.becomeWorker,
      }),
    ).toHaveAttribute('href', finalCta.secondary.href)

    // The purchases note sits under the cards.
    await expect(
      box(canvas.getByText(copy.plans.purchasesNote)).top,
    ).toBeGreaterThan(box(free).bottom)

    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * The snippets use the live plans: the free allowance fills its meter, an
 * edited quote shows its old price struck and leaves the meter at one, and
 * Slashie Unlimited has no meter. They name themselves by their cell's title.
 */
export const HowQuotesAreCounted: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const titles = countingTitles(copy)
    const count = storyPricing.freeQuotesPerMonth
    const free = canvas.getByRole('figure', { name: titles[0] })
    const edited = canvas.getByRole('figure', { name: titles[1] })
    const unlimited = canvas.getByRole('figure', { name: titles[2] })
    const used = (n: number) =>
      copy.counting.snippet.used
        .replace('{used}', String(n))
        .replace('{count}', String(count))

    await shown(within(free).getByText(used(count)))
    await expect(
      within(free).getAllByText(copy.counting.snippet.sent),
    ).toHaveLength(count)

    await shown(within(edited).getByText(copy.counting.snippet.updated))
    await shown(within(edited).getByText(used(1)))
    const struck = edited.querySelector('s') as HTMLElement
    await expect(getComputedStyle(struck).textDecorationLine).toContain(
      'line-through',
    )

    await shown(within(unlimited).getByText(storyPricing.productName))
    await shown(within(unlimited).getByText(copy.counting.snippet.unlimited))
    await expect(unlimited.querySelector('[data-pricing-meter]')).toBeNull()
    await expect(
      getComputedStyle(
        unlimited.querySelector('[data-pricing-unlimited]') as HTMLElement,
      ).borderTopColor,
    ).toBe(PLUM)
  },
}

/** A tablet (834px): the headline over the cards, the cards side by side, the cells stacked. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { rails, rules, counting, free, unlimited } = parts(canvasElement)
    if (!counting || !free || !unlimited)
      throw new Error('The page is incomplete')
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(3)
    const h1 = canvas.getByRole('heading', { level: 1 })
    await expect(box(free).top).toBeGreaterThan(box(h1).bottom)
    await expect(box(free).top).toBe(box(unlimited).top)
    await expect(box(unlimited).left).toBeGreaterThan(box(free).right)
    const cells = [
      ...counting.querySelectorAll<HTMLElement>('[data-pricing-counting-cell]'),
    ]
    for (let i = 1; i < cells.length; i += 1) {
      await expect(box(cells[i] as HTMLElement).top).toBeGreaterThanOrEqual(
        box(cells[i - 1] as HTMLElement).bottom - 1,
      )
    }
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * Phone width (320px, the narrowest): one column in reading order (the
 * headline, the free plan, the paid plan, the note, the cells, the questions,
 * the closing band), no rails, inside the page's gutters, no sideways scroll.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { rails, rules, counting, faq, cta, free, unlimited } =
      parts(canvasElement)
    if (!counting || !faq || !cta || !free || !unlimited) {
      throw new Error('The page is incomplete')
    }
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(3)
    await expect(getComputedStyle(faq).paddingTop).toBe('56px')
    const h1 = canvas.getByRole('heading', { level: 1 })
    await expect(box(free).top).toBeGreaterThanOrEqual(box(h1).bottom)
    await expect(box(unlimited).top).toBeGreaterThanOrEqual(box(free).bottom)
    await expect(box(free).left).toBe(box(unlimited).left)
    await expect(box(free).width).toBe(box(unlimited).width)
    await expect(box(free).left).toBeGreaterThanOrEqual(16)
    await expect(box(free).right).toBeLessThanOrEqual(
      canvasElement.clientWidth - 16,
    )
    await expect(box(counting).top).toBeGreaterThanOrEqual(
      box(unlimited).bottom,
    )
    await expect(box(faq).top).toBeGreaterThanOrEqual(box(counting).bottom)
    await expect(box(cta).top).toBeGreaterThanOrEqual(box(faq).bottom)
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
    await shown(canvas.getByText('£19.99'))
    await expect(canvas.queryByText(copy.faq.trial.question)).toBeNull()
  },
}

/** A free worker: Free is their plan (the success tag), the trial opens Checkout in the green primary. */
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
    await shown(within(free).getByText(copy.plans.yourPlan))
    const trial = canvas.getByRole('button', { name: 'Start free trial' })
    await expect(trial).toBeEnabled()
    await expect(getComputedStyle(trial).backgroundColor).toBe(GREEN_400)
    await expect(trial).toHaveAttribute('data-page-green-action', '')
  },
}

/**
 * One green fill per screen: while the paid plan's button is on screen the
 * marketing header's Get started is the outline pill; scrolled to how quotes
 * are counted (neither the plan's button nor the closing band on screen) it
 * is the green one, so the screen always has a green main action.
 */
export const HeaderGetStartedYieldsToThePlansButton: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { header, unlimited, counting } = parts(canvasElement)
    if (!unlimited || !counting) throw new Error('The page is incomplete')
    const getStarted = within(header).getByRole('link', {
      name: 'Get started',
    })
    window.scrollTo(0, 0)
    await waitFor(
      () => expect(getComputedStyle(getStarted).backgroundColor).toBe(WHITE),
      { timeout: 4000 },
    )
    const top = box(counting).top + window.scrollY
    window.scrollTo(0, top - box(header).height)
    await waitFor(
      () =>
        expect(getComputedStyle(getStarted).backgroundColor).toBe(GREEN_400),
      { timeout: 4000 },
    )
  },
}

/** The API returned no plans: the card stands in the hero, the counting and questions are left out. */
export const Unavailable: Story = {
  args: { pricing: null },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { hero, rules, counting, faq, cta } = parts(canvasElement)
    await shown(
      within(hero).getByRole('heading', {
        level: 3,
        name: copy.unavailable.heading,
      }),
    )
    await expect(counting).toBeNull()
    await expect(faq).toBeNull()
    await expect(cta).not.toBeNull()
    await expect(rules).toHaveLength(1)
    await expect(
      canvas.getByRole('link', { name: copy.unavailable.retry }),
    ).toHaveAttribute('href', '/pricing')
  },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: {
    copy: pricingBag.zh_hk,
    phone: marketingBag.zh_hk.landing.phone,
    finalCta: {
      ...finalCta,
      copy: marketingBag.zh_hk.landing.finalCta,
    },
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const zh = pricingBag.zh_hk
    await shown(
      canvas.getByRole('heading', { level: 1, name: zh.header.heading }),
    )
    for (const title of countingTitles(zh)) {
      await shown(canvas.getByRole('heading', { level: 2, name: title }))
    }
    await shown(canvas.getByRole('region', { name: zh.faq.heading }))
    await shown(canvas.getByText('免費 6 個月'))
    await expect(canvasElement.textContent).not.toContain('師傅')
    await expect(canvasElement.textContent).not.toContain(EM_DASH)
  },
}

/** R1, R2, R5 (FE-493): the site header and the sections on the logo and menu lines (the h1 is centred, FE-552), the rails on the container edge from lg (32px outside the lines), the rules edge to edge at 390 (phone). */
export const PageLines390: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 390, {
      header: true,
      centredTitle: true,
    })
  },
}

/** R1, R2, R5 (FE-493): the site header and the sections on the logo and menu lines (the h1 is centred, FE-552), the rails on the container edge from lg (32px outside the lines), the rules edge to edge at 1024 (tablet). */
export const PageLines1024: Story = {
  ...viewportAt(1024),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 1024, {
      header: true,
      centredTitle: true,
    })
  },
}

/** R1, R2, R5 (FE-493): the site header and the sections on the logo and menu lines (the h1 is centred, FE-552), the rails on the container edge from lg (32px outside the lines), the rules edge to edge at 1366 (laptop). */
export const PageLines1366: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 1366, {
      header: true,
      centredTitle: true,
    })
  },
}

/** R1, R2, R5 (FE-493): the site header and the sections on the logo and menu lines (the h1 is centred, FE-552), the rails on the container edge from lg (32px outside the lines), the rules edge to edge at 1920 (wide desktop). */
export const PageLines1920: Story = {
  ...viewportAt(1920),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 1920, {
      header: true,
      centredTitle: true,
    })
  },
}
