import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { PRICING_VIEWS } from '../../../views'
import { storyPricing, storyQuarterlyPricing } from '../../pricingStoryFixtures'
import { PricingPlanCards } from './PricingPlanCards'

const meta = {
  title: 'Marketing/Pricing/PricingPlanCards',
  component: PricingPlanCards,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    pricing: storyPricing,
    config: PRICING_VIEWS.guest,
    copy: pricingBag.en.plans,
    intervals: pricingBag.en.intervals,
  },
} satisfies Meta<typeof PricingPlanCards>

export default meta
type Story = StoryObj<typeof meta>

function link(canvasElement: HTMLElement, name: string) {
  return within(canvasElement).getByRole('link', { name })
}

/** Resolved token values the stories check. */
const WHITE = 'rgb(255, 255, 255)'
const PLUM = 'rgb(105, 56, 239)'
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const BORDER_STRONG = 'rgb(212, 212, 216)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const INK = 'rgb(10, 21, 18)'
const GREEN_400 = 'rgb(0, 220, 130)'
const GREEN_600 = 'rgb(2, 165, 103)'

/** The two cards, by the hooks they carry. */
function cards(canvasElement: HTMLElement) {
  const free = canvasElement.querySelector<HTMLElement>(
    '[data-pricing-plan="free"]',
  )
  const unlimited = canvasElement.querySelector<HTMLElement>(
    '[data-pricing-plan="unlimited"]',
  )
  if (!free || !unlimited) throw new Error('The plan cards are missing')
  return { free, unlimited }
}

/**
 * The card recipe of the product and the landing's teaser (FE-471): white, a
 * 1px hairline, 12px corners and `e1`; the paid plan keeps plum for its label
 * (with a sparkle) and its hairline; the price is a 600 figure with tabular
 * figures; the checks are green 600 strokes and the only green fill is the paid
 * plan's button, the page's main action.
 */
export const CardRecipe: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { free, unlimited } = cards(canvasElement)

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

    // Each plan's name is an h3 at 500; muted on Free, plum with the sparkle on the paid plan.
    const freeTitle = within(free).getByRole('heading', { level: 3 })
    const paidTitle = within(unlimited).getByRole('heading', { level: 3 })
    await expect(freeTitle).toHaveTextContent('Free')
    await expect(paidTitle).toHaveTextContent('Slashie Unlimited')
    await expect(getComputedStyle(freeTitle).color).toBe(TEXT_MUTED)
    await expect(getComputedStyle(paidTitle).color).toBe(PLUM)
    await expect(Number(getComputedStyle(paidTitle).fontWeight)).toBe(500)
    await expect(freeTitle.previousElementSibling).toBeNull()
    await expect(paidTitle.previousElementSibling).toHaveAttribute(
      'aria-hidden',
      'true',
    )

    // The price: a figure, 34px at 600 with tabular figures, in ink.
    for (const text of ['£0', '6 months free']) {
      const style = getComputedStyle(within(canvasElement).getByText(text))
      await expect(Number(style.fontWeight)).toBe(600)
      await expect(style.fontSize).toBe('34px')
      await expect(style.fontVariantNumeric).toContain('tabular-nums')
      await expect(style.color).toBe(INK)
    }

    // The features: a hairline above, green 600 checks (aria-hidden), ink text.
    const checks = free.querySelectorAll<HTMLElement>(
      'li > span[aria-hidden="true"]',
    )
    await expect(checks).toHaveLength(pricingBag.en.plans.free.features.length)
    for (const check of checks) {
      await expect(getComputedStyle(check).color).toBe(GREEN_600)
    }
    await expect(
      getComputedStyle(free.querySelector('ul') as HTMLElement).borderTopWidth,
    ).toBe('1px')

    // The buttons are pills: outline on Free, the green primary with an ink
    // label on the paid plan (the main action stays green; plum is the card's
    // label, sparkle and hairline), and only that one carries the hook the
    // marketing header's Get started yields to.
    const freeButton = link(free, 'Get started')
    const paidButton = link(unlimited, 'Start free trial')
    await expect(getComputedStyle(freeButton).backgroundColor).toBe(WHITE)
    await expect(getComputedStyle(freeButton).borderTopColor).toBe(
      BORDER_STRONG,
    )
    await expect(freeButton).not.toHaveAttribute('data-page-green-action')
    await expect(getComputedStyle(paidButton).backgroundColor).toBe(GREEN_400)
    await expect(getComputedStyle(paidButton).color).toBe(INK)
    await expect(paidButton).toHaveAttribute('data-page-green-action', '')
    for (const button of [freeButton, paidButton]) {
      const rect = button.getBoundingClientRect()
      await expect(
        Number.parseFloat(getComputedStyle(button).borderTopLeftRadius),
      ).toBeGreaterThan(rect.height / 2 - 1)
      await expect(rect.height).toBeGreaterThanOrEqual(44)
    }
    // Both buttons sit on one line at the card's foot.
    await expect(freeButton.getBoundingClientRect().bottom).toBe(
      paidButton.getBoundingClientRect().bottom,
    )

    // Green fills one thing, the paid plan's button, and weights stop at 600.
    const greenFills: Element[] = []
    for (const node of [...canvasElement.querySelectorAll<HTMLElement>('*')]) {
      const style = getComputedStyle(node)
      if (style.backgroundColor === GREEN_400) greenFills.push(node)
      await expect(Number(style.fontWeight)).toBeLessThanOrEqual(600)
    }
    await expect(greenFills).toEqual([paidButton])

    // The cards stand side by side at one height.
    const [left, right] = [free, unlimited].map((card) =>
      card.getBoundingClientRect(),
    )
    await expect(left?.top).toBe(right?.top)
    await expect(left?.height).toBe(right?.height)
  },
}

/** `guest`: both buttons go through sign-up; the trial leads on Unlimited. */
export const Guest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('6 months free')).toBeVisible()
    await expect(canvas.getByText('Then £19.99 / month')).toBeVisible()
    await expect(link(canvasElement, 'Get started')).toHaveAttribute(
      'href',
      '/register?next=%2Fworker%2Fsetup',
    )
    await expect(link(canvasElement, 'Start free trial')).toHaveAttribute(
      'href',
      '/register?next=%2Fworker%2Fsetup%3Fnext%3D%2Fpricing',
    )
    await expect(
      canvas.getByText(
        'Purchases are processed securely. On iOS and Android, subscription management may open your platform billing settings when available.',
      ),
    ).toBeVisible()
  },
}

/** A plan billed every 3 months: "every 3 months", never "/ month"; Free stays per month. */
export const EveryThreeMonths: Story = {
  args: { pricing: storyQuarterlyPricing },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Then £54 every 3 months')).toBeVisible()
    await expect(canvas.getByText('/ month')).toBeVisible()
  },
}

/** zh-HK, every 3 months: "每 3 個月 £54". */
export const EveryThreeMonthsZhHk: Story = {
  args: {
    pricing: storyQuarterlyPricing,
    copy: pricingBag.zh_hk.plans,
    intervals: pricingBag.zh_hk.intervals,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('之後 每 3 個月 £54'),
    ).toBeVisible()
  },
}

/** `checkingSession`: placeholders instead of buttons while the profile loads. */
export const CheckingSession: Story = {
  args: { config: PRICING_VIEWS.checkingSession },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('link')).toHaveLength(0)
    await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0)
  },
}

/** `customer`: set up a worker profile; the trial button comes back here after. */
export const Customer: Story = {
  args: { config: PRICING_VIEWS.customer },
  play: async ({ canvasElement }) => {
    await expect(link(canvasElement, 'Become a worker')).toHaveAttribute(
      'href',
      '/worker/setup',
    )
    await expect(link(canvasElement, 'Start free trial')).toHaveAttribute(
      'href',
      '/worker/setup?next=%2Fpricing',
    )
  },
}

/** `workerSetup`: Free is their plan; finish setup before the trial. */
export const WorkerSetup: Story = {
  args: { config: PRICING_VIEWS.workerSetup },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Your plan')).toBeVisible()
    await expect(link(canvasElement, 'Finish worker setup')).toHaveAttribute(
      'href',
      '/worker/setup?next=%2Fpricing',
    )
  },
}

/** `workerFree`: Free is their plan; Start free trial opens Checkout. */
export const WorkerFree: Story = {
  args: { config: PRICING_VIEWS.workerFree },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Your plan')).toBeVisible()
    const trial = canvas.getByRole('button', { name: 'Start free trial' })
    await expect(trial).toBeEnabled()
    // The checkout button is the paid plan's pill and the page's main action:
    // the green primary like its links, with the header's hook.
    await expect(getComputedStyle(trial).backgroundColor).toBe(GREEN_400)
    await expect(getComputedStyle(trial).color).toBe(INK)
    await expect(trial).toHaveAttribute('data-page-green-action', '')
  },
}

/** `workerLapsed`: no trial claim, the plain price, and Resubscribe. */
export const WorkerLapsed: Story = {
  args: { config: PRICING_VIEWS.workerLapsed },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByText('6 months free')).toBeNull()
    await expect(canvas.getByText('£19.99')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Resubscribe' }),
    ).toBeEnabled()
  },
}

/** `workerUnlimited`: Unlimited is their plan; Manage billing goes to Billing. */
export const WorkerUnlimited: Story = {
  args: { config: PRICING_VIEWS.workerUnlimited },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByText('6 months free')).toBeNull()
    await expect(canvas.queryByRole('link', { name: 'Get started' })).toBeNull()
    await expect(link(canvasElement, 'Manage billing')).toHaveAttribute(
      'href',
      '/billing',
    )
    await expect(
      canvas.getByText(
        'Purchases are processed securely. On iOS and Android, subscription management may open your platform billing settings when available.',
      ),
    ).toBeVisible()
  },
}

/** `workerBilling`: payment failed or paused; Billing, never a second Checkout. */
export const WorkerBilling: Story = {
  args: { config: PRICING_VIEWS.workerBilling },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0)
    await expect(link(canvasElement, 'Manage billing')).toHaveAttribute(
      'href',
      '/billing',
    )
  },
}

/** The API reports no trial: Unlimited shows its price even to a guest. */
export const NoTrial: Story = {
  args: { pricing: { ...storyPricing, trialDays: null, trialLabel: null } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText(/free$/)).toBeNull()
  },
}

/** A yearly price and a 14-day trial read as such. */
export const YearlyPrice: Story = {
  args: {
    pricing: {
      ...storyPricing,
      priceAmount: 19900,
      priceInterval: 'year',
      trialDays: 14,
    },
  },
}

/** Phone width: the cards stack, Free first, each as wide as the screen's column. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { free, unlimited } = cards(canvasElement)
    const [first, second] = [free, unlimited].map((card) =>
      card.getBoundingClientRect(),
    )
    await expect(second?.top).toBeGreaterThanOrEqual(first?.bottom ?? 0)
    await expect(first?.left).toBe(second?.left)
    await expect(first?.width).toBe(second?.width)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Traditional Chinese: trial and interval come from the copy, not the API label. */
export const TraditionalChinese: Story = {
  args: {
    copy: pricingBag.zh_hk.plans,
    intervals: pricingBag.zh_hk.intervals,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('免費 6 個月')).toBeVisible()
    await expect(canvas.getByText('之後 £19.99 / 月')).toBeVisible()
    await expect(
      canvas.getByText(
        '購買會安全處理。在 iOS 和 Android 上，訂閱管理可能會開啟平台帳單設定（如適用）。',
      ),
    ).toBeVisible()
  },
}
