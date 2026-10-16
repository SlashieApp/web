import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { PRICING_VIEWS } from '../../../views'
import { storyPricing } from '../../pricingStoryFixtures'
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
    await expect(
      canvas.getByRole('button', { name: 'Start free trial' }),
    ).toBeEnabled()
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

/** Phone width: the cards stack, Free first. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
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
  },
}
