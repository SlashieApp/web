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

    // Each plan's name is the card's title (FE-290): an h3, 16px at 500, ink
    // on Free and plum on the paid plan, with no sparkle.
    const freeTitle = within(free).getByRole('heading', { level: 3 })
    const paidTitle = within(unlimited).getByRole('heading', { level: 3 })
    await expect(freeTitle).toHaveTextContent('Free')
    await expect(paidTitle).toHaveTextContent('Slashie Pro')
    await expect(getComputedStyle(freeTitle).color).toBe(INK)
    await expect(getComputedStyle(paidTitle).color).toBe(PLUM)
    for (const title of [freeTitle, paidTitle]) {
      await expect(getComputedStyle(title).fontSize).toBe('16px')
      await expect(Number(getComputedStyle(title).fontWeight)).toBe(500)
      await expect(title.previousElementSibling).toBeNull()
    }
    await expect(unlimited.querySelector('svg.lucide-sparkles')).toBeNull()

    // The price after the trial reads as part of the offer: ink, 16px, 500.
    const then = within(unlimited).getByText('Then £19.99 / month')
    await expect(getComputedStyle(then).color).toBe(INK)
    await expect(getComputedStyle(then).fontSize).toBe('16px')
    await expect(Number(getComputedStyle(then).fontWeight)).toBe(500)
    await expect(
      getComputedStyle(within(unlimited).getByText('Card needed to start'))
        .color,
    ).toBe(TEXT_MUTED)

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
    const freeButton = link(free, 'Become a worker')
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

/**
 * `guest`: both buttons go through sign-up; the trial leads on the paid plan,
 * with the price after it and that a card is needed. Free says Become a
 * worker, since it leads into worker setup (FE-290).
 */
export const Guest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('6 months free')).toBeVisible()
    await expect(canvas.getByText('Then £19.99 / month')).toBeVisible()
    await expect(canvas.getByText('Card needed to start')).toBeVisible()
    await expect(link(canvasElement, 'Become a worker')).toHaveAttribute(
      'href',
      '/register?next=%2Fworker%2Fsetup',
    )
    await expect(link(canvasElement, 'Start free trial')).toHaveAttribute(
      'href',
      '/register?next=%2Fworker%2Fsetup%3Fnext%3D%2Fpricing',
    )
    await expect(
      canvas.getByText(pricingBag.en.plans.purchasesNote),
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

/**
 * `customer` (FE-591; Ryan 21 Nov): Slashie Pro for customers is coming soon,
 * in place of the card line. One Become a worker, the green one on Pro, back
 * here after setup; Free has no button.
 */
export const Customer: Story = {
  args: { config: PRICING_VIEWS.customer },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const unlimited = canvasElement.querySelector(
      '[data-pricing-plan="unlimited"]',
    ) as HTMLElement
    const free = canvasElement.querySelector(
      '[data-pricing-plan="free"]',
    ) as HTMLElement
    await expect(within(unlimited).getByText('6 months free')).toBeVisible()
    await expect(
      within(unlimited).getByText('Then £19.99 / month'),
    ).toBeVisible()
    await expect(
      within(unlimited).getByText('Slashie Pro for customers is coming soon.'),
    ).toBeVisible()
    await expect(canvas.queryByText('Card needed to start')).toBeNull()
    await expect(canvas.getAllByRole('link')).toHaveLength(1)
    await expect(link(unlimited, 'Become a worker')).toHaveAttribute(
      'href',
      '/worker/setup?next=%2Fpricing',
    )
    await expect(within(free).queryAllByRole('link')).toHaveLength(0)
  },
}

/** `customer` in zh-HK. */
export const CustomerZhHk: Story = {
  args: {
    config: PRICING_VIEWS.customer,
    copy: pricingBag.zh_hk.plans,
    intervals: pricingBag.zh_hk.intervals,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText('客戶版 Slashie Pro 即將推出。'),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: '成為工作者' })).toBeVisible()
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

/** `workerUnlimited`: Slashie Pro is their plan; Manage billing goes to Billing. */
export const WorkerUnlimited: Story = {
  args: { config: PRICING_VIEWS.workerUnlimited },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByText('6 months free')).toBeNull()
    await expect(
      canvas.queryByRole('link', { name: 'Become a worker' }),
    ).toBeNull()
    await expect(link(canvasElement, 'Manage billing')).toHaveAttribute(
      'href',
      '/billing',
    )
    await expect(
      canvas.getByText(pricingBag.en.plans.purchasesNote),
    ).toBeVisible()
  },
}

/** `workerBilling`: anything else that can't start Checkout: Billing, never a second Checkout. */
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

/** `workerTrialing`: their plan, the price, and when the trial ends (Billing's words). */
export const WorkerTrialing: Story = {
  args: { config: PRICING_VIEWS.workerTrialing, paidDate: '9 Dec 2026' },
  play: async ({ canvasElement }) => {
    const { unlimited } = cards(canvasElement)
    await expect(within(unlimited).getByText('Your plan')).toBeVisible()
    await expect(within(unlimited).getByText('£19.99')).toBeVisible()
    await expect(
      within(unlimited).getByText('Free until 9 Dec 2026.'),
    ).toBeVisible()
    await expect(link(canvasElement, 'Manage billing')).toHaveAttribute(
      'href',
      '/billing',
    )
  },
}

/**
 * `workerCancelling`: a plan that won't renew says when it ends in place of
 * the price, and Keep Slashie Pro opens the billing portal (FE-290).
 */
export const WorkerCancelling: Story = {
  args: { config: PRICING_VIEWS.workerCancelling, paidDate: '5 Jan 2027' },
  play: async ({ canvasElement }) => {
    const { unlimited } = cards(canvasElement)
    await expect(within(unlimited).getByText('Your plan')).toBeVisible()
    await expect(within(unlimited).getByText('Ends 5 Jan 2027')).toBeVisible()
    await expect(within(unlimited).queryByText('£19.99')).toBeNull()
    const keep = within(unlimited).getByRole('button', {
      name: 'Keep Slashie Pro',
    })
    await expect(keep).toBeEnabled()
    await expect(keep).toHaveAttribute('data-page-green-action', '')
  },
}

/** `workerGivenUntil`: Slashie Pro given until a date; Keep starts Checkout (BE-119). */
export const WorkerGivenUntil: Story = {
  args: { config: PRICING_VIEWS.workerGivenUntil, paidDate: '5 Jan 2027' },
  play: async ({ canvasElement }) => {
    const { unlimited } = cards(canvasElement)
    await expect(within(unlimited).getByText('Ends 5 Jan 2027')).toBeVisible()
    await expect(
      within(unlimited).getByRole('button', { name: 'Keep Slashie Pro' }),
    ).toBeEnabled()
  },
}

/** `workerGiven`: given by Slashie with no end: no price and no button. */
export const WorkerGiven: Story = {
  args: { config: PRICING_VIEWS.workerGiven },
  play: async ({ canvasElement }) => {
    const { unlimited } = cards(canvasElement)
    await expect(within(unlimited).getByText('Your plan')).toBeVisible()
    await expect(within(unlimited).getByText('Given by Slashie')).toBeVisible()
    await expect(
      within(unlimited).getByText('Unlimited quotes, with no end date.'),
    ).toBeVisible()
    await expect(within(unlimited).queryByText('£19.99')).toBeNull()
    await expect(within(canvasElement).queryAllByRole('link')).toHaveLength(0)
    await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0)
  },
}

/**
 * `workerPaymentProblem`: the paid plan is still theirs, with Billing's line
 * and Fix payment (the portal). Free is not marked as their plan (FE-290).
 */
export const WorkerPaymentProblem: Story = {
  args: { config: PRICING_VIEWS.workerPaymentProblem },
  play: async ({ canvasElement }) => {
    const { free, unlimited } = cards(canvasElement)
    await expect(within(free).queryByText('Your plan')).toBeNull()
    await expect(within(unlimited).getByText('Your plan')).toBeVisible()
    await expect(within(unlimited).getByText('Payment problem')).toBeVisible()
    await expect(
      within(unlimited).getByText(
        pricingBag.en.plans.paidStatus.paymentProblemNote,
      ),
    ).toBeVisible()
    await expect(
      within(unlimited).getByRole('button', { name: 'Fix payment' }),
    ).toBeEnabled()
  },
}

/** `workerPaused`: the paid plan is theirs, paused, with Manage billing. */
export const WorkerPaused: Story = {
  args: { config: PRICING_VIEWS.workerPaused },
  play: async ({ canvasElement }) => {
    const { unlimited } = cards(canvasElement)
    await expect(within(unlimited).getByText('Your plan')).toBeVisible()
    await expect(within(unlimited).getByText('Paused')).toBeVisible()
    await expect(link(canvasElement, 'Manage billing')).toHaveAttribute(
      'href',
      '/billing',
    )
  },
}

/** `workerIncomplete`: Checkout didn't finish; Free is their plan; Check again. */
export const WorkerIncomplete: Story = {
  args: { config: PRICING_VIEWS.workerIncomplete },
  play: async ({ canvasElement }) => {
    const { free, unlimited } = cards(canvasElement)
    await expect(within(free).getByText('Your plan')).toBeVisible()
    await expect(within(unlimited).getByText('Not finished')).toBeVisible()
    await expect(
      within(unlimited).getByRole('button', { name: 'Check again' }),
    ).toBeEnabled()
  },
}

/** zh-HK: a plan that won't renew, in Billing's words. */
export const WorkerCancellingZhHk: Story = {
  args: {
    config: PRICING_VIEWS.workerCancelling,
    paidDate: '2027年1月5日',
    copy: pricingBag.zh_hk.plans,
    intervals: pricingBag.zh_hk.intervals,
  },
  play: async ({ canvasElement }) => {
    const { unlimited } = cards(canvasElement)
    await expect(within(unlimited).getByText('2027年1月5日 結束')).toBeVisible()
    await expect(
      within(unlimited).getByRole('button', { name: '保留 Slashie Pro' }),
    ).toBeVisible()
    await expect(
      within(canvasElement).getByText('可隨時在「方案與帳單」取消'),
    ).toBeVisible()
  },
}

/** The API reports no trial: Unlimited shows its price even to a guest. */
export const NoTrial: Story = {
  args: { pricing: { ...storyPricing, trialDays: null } },
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
    await expect(canvas.getByText('開始試用需提供信用卡')).toBeVisible()
    await expect(canvas.getByText('你會以信用卡經 Stripe 付款。')).toBeVisible()
    await expect(canvas.getByText('成為工作者')).toBeVisible()
  },
}
