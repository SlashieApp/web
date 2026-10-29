import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  MarketingFrame,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { PricingTeaser } from './PricingTeaser'

const copy = messages.en.landing.pricingTeaser
const zhCopy = messages.zh_hk.landing.pricingTeaser
const eyebrow = messages.en.header.nav.pricing

/** The character the product's copy never uses, built here so no source line carries it. */
const EM_DASH = String.fromCodePoint(0x2014)

/** Resolved token values the stories check. */
const WHITE = 'rgb(255, 255, 255)'
const PLUM = 'rgb(105, 56, 239)'
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const INK = 'rgb(10, 21, 18)'
/**
 * Green 400, 600 and 800: none of them belongs in this section, but the green
 * 600 icon of the head's eyebrow (an eyebrow icon is green 600 by the spec).
 */
const GREENS = ['rgb(0, 220, 130)', 'rgb(2, 165, 103)', 'rgb(5, 104, 63)']
const GREEN_600 = 'rgb(2, 165, 103)'

/** Story-only: the section in the marketing frame, between two section rules, as `home/page.tsx` sets it. */
const withFrame: Decorator = (Story) => (
  <MarketingFrame>
    <SectionRule />
    <Story />
    <SectionRule />
  </MarketingFrame>
)

type Parts = {
  section: HTMLElement
  heading: HTMLElement
  free: HTMLElement
  premium: HTMLElement
  cta: HTMLElement
}

/** The pieces of the section, found by the hooks and roles it exposes. */
function parts(canvasElement: HTMLElement): Parts {
  const canvas = within(canvasElement)
  const section = canvasElement.querySelector<HTMLElement>(
    '[data-pricing-teaser]',
  )
  const free = canvasElement.querySelector<HTMLElement>(
    '[data-pricing-plan="free"]',
  )
  const premium = canvasElement.querySelector<HTMLElement>(
    '[data-pricing-plan="premium"]',
  )
  if (!section || !free || !premium) throw new Error('The section is missing')
  return {
    section,
    heading: canvas.getByRole('heading', { level: 2 }),
    free,
    premium,
    cta: canvas.getByRole('link'),
  }
}

function box(node: HTMLElement) {
  return node.getBoundingClientRect()
}

const meta = {
  title: 'Marketing/Landing/PricingTeaser',
  component: PricingTeaser,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    copy,
    eyebrow,
    pricing: {
      productName: 'Slashie Unlimited',
      headline: '30-day free trial',
      subline: formatMessage(copy.unlimitedSublineWithPrice, {
        priceLine: '£9.99/month',
      }),
      freeHeadline: formatMessage(copy.freeHeadline, { count: 3 }),
    },
    ctaLabel: messages.en.common.ctas.viewPricing,
    pricingHref: '/pricing',
  },
  decorators: [withFrame],
} satisfies Meta<typeof PricingTeaser>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop, live pricing with a trial: the head and the pill on the left, the two
 * plan cards on the right. Both cards are the product's card (white, a 1px
 * hairline, `e1`, 12px corners) with the text at the start; the paid plan keeps
 * plum for its label, its hairline and the pill. There is no green in the
 * section and nothing heavier than 600.
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    const { section, heading, free, premium, cta } = parts(canvasElement)
    const canvas = within(canvasElement)

    // A landmark named by its heading, with one h3 per plan.
    await expect(canvas.getByRole('region', { name: copy.heading })).toBe(
      section,
    )
    await expect(heading).toHaveTextContent(copy.heading)
    const plans = canvas.getAllByRole('heading', { level: 3 })
    await expect(plans.map((plan) => plan.textContent)).toEqual([
      args.pricing.freeHeadline,
      args.pricing.headline,
    ])

    // Today's strings only, and no em dash anywhere.
    await expect(section.textContent).not.toContain(EM_DASH)
    await expect(canvas.getByText(copy.body)).toBeVisible()
    await expect(canvas.getByText(copy.freePlanLabel)).toBeVisible()
    await expect(canvas.getByText(copy.freeBody)).toBeVisible()
    await expect(canvas.getByText(args.pricing.productName)).toBeVisible()
    await expect(canvas.getByText(args.pricing.subline)).toBeVisible()

    // The page's white: opaque, so a 3D prop never crosses a card.
    await expect(getComputedStyle(section).backgroundColor).toBe(WHITE)

    // Both cards: white, a 1px hairline, 12px corners, e1 (a soft ink shadow).
    for (const card of [free, premium]) {
      const style = getComputedStyle(card)
      await expect(style.backgroundColor).toBe(WHITE)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopLeftRadius).toBe('12px')
      await expect(style.boxShadow).toContain('rgba(10, 21, 18, 0.05)')
      await expect(style.textAlign).toMatch(/^(start|left)$/)
    }
    await expect(getComputedStyle(free).borderTopColor).toBe(BORDER_DEFAULT)
    await expect(getComputedStyle(premium).borderTopColor).toBe(PLUM)

    // The labels: muted for the free plan, plum with its sparkle for the paid one.
    await expect(
      getComputedStyle(canvas.getByText(copy.freePlanLabel)).color,
    ).toBe(TEXT_MUTED)
    const premiumLabel = canvas.getByText(args.pricing.productName)
    await expect(getComputedStyle(premiumLabel).color).toBe(PLUM)
    await expect(premium.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    await expect(free.querySelector('svg')).toBeNull()

    // The head has its eyebrow (the nav's "Pricing") with a green 600 icon.
    const eyebrowText = canvas.getByText(eyebrow)
    await expect(getComputedStyle(eyebrowText).textTransform).toBe('uppercase')
    await expect(eyebrowText.previousElementSibling).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    await expect(
      getComputedStyle(eyebrowText.previousElementSibling as Element).color,
    ).toBe(GREEN_600)

    // The headlines are figures: headings at 600 in ink with tabular figures.
    for (const plan of plans) {
      const style = getComputedStyle(plan)
      await expect(Number(style.fontWeight)).toBe(600)
      await expect(style.color).toBe(INK)
      await expect(style.fontSize).toBe('24px')
      await expect(style.fontVariantNumeric).toContain('tabular-nums')
    }

    // The pill: the pricing link, plum with a white label, 44px, fully round.
    await expect(cta).toHaveAttribute('href', args.pricingHref)
    await expect(cta).toHaveTextContent(args.ctaLabel)
    const pill = getComputedStyle(cta)
    await expect(pill.backgroundColor).toBe(PLUM)
    await expect(pill.color).toBe(WHITE)
    await expect(Number(pill.fontWeight)).toBe(500)
    await expect(Number.parseFloat(pill.borderTopLeftRadius)).toBeGreaterThan(
      box(cta).height / 2 - 1,
    )
    await expect(box(cta).height).toBeGreaterThanOrEqual(44)

    // Green stops at the door: no green text, fill or line, and nothing over
    // 600. The one exception is the eyebrow's green 600 icon (and the svg
    // inside it, which draws with its colour).
    const eyebrowIcon = eyebrowText.previousElementSibling as Element
    for (const node of [
      section,
      ...section.querySelectorAll<HTMLElement>('*'),
    ]) {
      const style = getComputedStyle(node)
      const inEyebrowIcon = eyebrowIcon.contains(node)
      for (const value of [
        style.color,
        style.backgroundColor,
        style.borderTopColor,
        style.borderLeftColor,
      ]) {
        if (inEyebrowIcon && value === GREEN_600) continue
        await expect(GREENS).not.toContain(value)
      }
      await expect(Number(style.fontWeight)).toBeLessThanOrEqual(600)
    }

    // Desktop: the head and the pill in the left column, the cards in the right
    // one, side by side at one height, the pill straight under the head.
    const [head, left, right, button] = [heading, free, premium, cta].map(box)
    await expect(left.top).toBe(right.top)
    await expect(left.height).toBe(right.height)
    await expect(right.left).toBeGreaterThan(left.right)
    await expect(head.right).toBeLessThan(left.left)
    await expect(button.left).toBe(head.left)
    await expect(button.top).toBeGreaterThan(head.bottom)
    await expect(button.right).toBeLessThan(left.left)
    await expect(head.top).toBeGreaterThanOrEqual(left.top - 4)

    // Inside the page column: no sideways scroll.
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Live pricing without a trial: the premium card leads with the price. */
export const PriceOnly: Story = {
  args: {
    pricing: {
      productName: 'Slashie Unlimited',
      headline: '£9.99/month',
      subline: copy.unlimitedSublineFallback,
      freeHeadline: formatMessage(copy.freeHeadline, { count: 3 }),
    },
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { premium } = parts(canvasElement)
    await expect(within(premium).getByRole('heading')).toHaveTextContent(
      '£9.99/month',
    )
    await expect(
      within(premium).getByText(copy.unlimitedSublineFallback),
    ).toBeVisible()
  },
}

/** Pricing unavailable: both premium lines fall back to generic copy with no price or trial claim. */
export const PricingUnavailable: Story = {
  args: {
    pricing: {
      productName: 'Slashie Unlimited',
      headline: copy.unlimitedHeadlineFallback,
      subline: copy.unlimitedSublineFallback,
      freeHeadline: formatMessage(copy.freeHeadline, { count: 3 }),
    },
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { section, premium } = parts(canvasElement)
    await expect(within(premium).getByRole('heading')).toHaveTextContent(
      copy.unlimitedHeadlineFallback,
    )
    // No price, no trial: no digit in the premium card.
    await expect(premium.textContent).not.toMatch(/\d/)
    await expect(section.textContent).not.toContain(EM_DASH)
  },
}

/** Long trial and price lines: both cards keep equal height, wrap cleanly and stay in their column. */
export const LongText: Story = {
  args: {
    pricing: {
      productName: 'Slashie Unlimited for busy local workers',
      headline: 'Your first three months free, no card needed up front',
      subline: formatMessage(copy.unlimitedSublineWithPrice, {
        priceLine: '£9.99/month, billed monthly, cancel any time',
      }),
      freeHeadline: formatMessage(copy.freeHeadline, { count: 3 }),
    },
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { section, free, premium, cta } = parts(canvasElement)
    const [left, right] = [free, premium].map(box)
    await expect(left.top).toBe(right.top)
    await expect(left.height).toBe(right.height)
    // The long headline wraps to several lines inside its card.
    const headline = within(premium).getByRole('heading')
    await expect(box(headline).height).toBeGreaterThan(30 * 2 - 1)
    await expect(box(headline).right).toBeLessThanOrEqual(right.right)
    // The pill still sits in the left column.
    await expect(box(cta).right).toBeLessThan(left.left)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
    await expect(section).toBeVisible()
  },
}

/**
 * Phone width (320px, the narrowest): one column in reading order (head, the
 * free plan, the paid plan, the pill), inside the page's gutters, no sideways
 * scroll.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { heading, free, premium, cta } = parts(canvasElement)
    const [head, first, second, button] = [heading, free, premium, cta].map(box)
    await expect(first.top).toBeGreaterThanOrEqual(head.bottom)
    await expect(second.top).toBeGreaterThanOrEqual(first.bottom)
    await expect(button.top).toBeGreaterThanOrEqual(second.bottom)
    await expect(first.left).toBe(second.left)
    await expect(first.width).toBe(second.width)
    await expect(first.left).toBe(head.left)
    await expect(button.left).toBe(head.left)
    await expect(first.left).toBeGreaterThanOrEqual(16)
    await expect(second.right).toBeLessThanOrEqual(
      canvasElement.clientWidth - 16,
    )
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * A tablet (834px, below `lg`): the head, then the two cards side by side at one
 * height, then the pill, all at the start.
 */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { heading, free, premium, cta } = parts(canvasElement)
    const [head, left, right, button] = [heading, free, premium, cta].map(box)
    await expect(left.top).toBeGreaterThanOrEqual(head.bottom)
    await expect(left.top).toBe(right.top)
    await expect(left.height).toBe(right.height)
    await expect(right.left).toBeGreaterThan(left.right)
    await expect(button.top).toBeGreaterThanOrEqual(left.bottom)
    await expect(button.left).toBe(head.left)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: {
    copy: zhCopy,
    eyebrow: messages.zh_hk.header.nav.pricing,
    pricing: {
      productName: 'Slashie Unlimited',
      headline: '30 日免費試用',
      subline: formatMessage(zhCopy.unlimitedSublineWithPrice, {
        priceLine: '£9.99/月',
      }),
      freeHeadline: formatMessage(zhCopy.freeHeadline, { count: 3 }),
    },
    ctaLabel: messages.zh_hk.common.ctas.viewPricing,
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('region', { name: zhCopy.heading }),
    ).toBeVisible()
    await expect(canvas.getByText(zhCopy.freePlanLabel)).toBeVisible()
    await expect(canvas.getByText(args.eyebrow)).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: args.ctaLabel }),
    ).toBeVisible()
  },
}
