import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { storyPricing } from '../../pricingStoryFixtures'
import { PRICING_FAQ_HEADING_ID, PricingFaq } from './PricingFaq'

/** `border.default`, `text.default` and `text.muted`, resolved. */
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const INK = 'rgb(10, 21, 18)'
const TEXT_MUTED = 'rgb(82, 82, 91)'

const meta = {
  title: 'Marketing/Pricing/PricingFaq',
  component: PricingFaq,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    pricing: storyPricing,
    copy: pricingBag.en.faq,
    intervals: pricingBag.en.intervals,
  },
} satisfies Meta<typeof PricingFaq>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Six questions with the live price, interval and free allowance filled in, as
 * a section: a landmark named by its h2 (the head, on the left from `xl`) over
 * hairline rows, not cards: each question an h3 at 18/500 over a muted 14px
 * answer, the last row closed by a hairline.
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(6)
    const heading = canvas.getByRole('heading', { level: 2, name: 'Questions' })
    await expect(heading).toHaveAttribute('id', PRICING_FAQ_HEADING_ID)
    await expect(canvas.getByRole('region', { name: 'Questions' })).toBe(
      canvasElement.querySelector('[data-pricing-faq]'),
    )
    const rows = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-pricing-faq-item]'),
    ]
    await expect(rows).toHaveLength(6)
    for (const row of rows) {
      const style = getComputedStyle(row)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopColor).toBe(BORDER_DEFAULT)
      await expect(style.borderTopLeftRadius).toBe('0px')
      const question = within(row).getByRole('heading', { level: 3 })
      const q = getComputedStyle(question)
      await expect(q.fontSize).toBe('18px')
      await expect(Number(q.fontWeight)).toBe(500)
      await expect(q.color).toBe(INK)
      const answer = question.nextElementSibling as HTMLElement
      await expect(getComputedStyle(answer).fontSize).toBe('14px')
      await expect(getComputedStyle(answer).color).toBe(TEXT_MUTED)
    }
    await expect(
      getComputedStyle(rows.at(-1) as HTMLElement).borderBottomWidth,
    ).toBe('1px')
    // From `xl` the head is the left column and the rows the right one.
    await expect(heading.getBoundingClientRect().right).toBeLessThan(
      (rows[0] as HTMLElement).getBoundingClientRect().left,
    )
    await expect(
      canvas.getByText(/continues at £19\.99 \/ month unless/),
    ).toBeVisible()
    const terms = canvas.getByRole('link', { name: 'Terms' })
    await expect(terms).toHaveAttribute('href', '/terms')
    // A link inside a sentence is underlined at rest: its green 800 is 1.1:1
    // against the muted text, so colour alone would not tell it apart (WCAG 1.4.1).
    await expect(getComputedStyle(terms).textDecorationLine).toBe('underline')
  },
}

/** The API reports no trial: the trial question is left out. */
export const NoTrial: Story = {
  args: { pricing: { ...storyPricing, trialDays: null, trialLabel: null } },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getAllByRole('heading', { level: 3 }),
    ).toHaveLength(5)
  },
}

/** Yearly price: the trial answer says "/ year". */
export const YearlyPrice: Story = {
  args: {
    pricing: { ...storyPricing, priceAmount: 19900, priceInterval: 'year' },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/£199 \/ year/)).toBeVisible()
  },
}

/** Phone width: the head over the rows, inside the gutters, no sideways scroll. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const heading = canvas.getByRole('heading', { level: 2 })
    const first = canvasElement.querySelector(
      '[data-pricing-faq-item]',
    ) as HTMLElement
    await expect(first.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      heading.getBoundingClientRect().bottom,
    )
    await expect(first.getBoundingClientRect().left).toBe(
      heading.getBoundingClientRect().left,
    )
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.faq, intervals: pricingBag.zh_hk.intervals },
}
