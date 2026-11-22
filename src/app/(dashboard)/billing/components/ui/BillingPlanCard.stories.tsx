import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { storyMembership } from '@/app/(auth)/helpers/authStoryFixtures'
import {
  storyPricing,
  storyQuarterlyPricing,
} from '@/app/(marketing)/pricing/components/pricingStoryFixtures'

import { BILLING_VIEWS } from '../../views'
import { BillingPlanCard } from './BillingPlanCard'

const meta = {
  title: 'Dashboard/Billing/BillingPlanCard',
  component: BillingPlanCard,
  parameters: { layout: 'padded' },
  args: {
    config: BILLING_VIEWS.free,
    membership: storyMembership('free'),
    pricing: storyPricing,
    formatDate: (value) => (value ? '9 Dec 2026' : null),
    resetsOn: '1 Nov 2026',
    actionLoading: false,
    onAction: fn(),
  },
} satisfies Meta<typeof BillingPlanCard>

export default meta
type Story = StoryObj<typeof meta>

/** The button reports its action. */
export const Free: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Start free trial' }),
    )
    await expect(args.onAction).toHaveBeenCalledWith('startTrial')
  },
}

/** A plan billed every 3 months: the price line says so. */
export const EveryThreeMonths: Story = {
  args: { pricing: storyQuarterlyPricing },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('6 months free, then £54 every 3 months'),
    ).toBeVisible()
  },
}

/** `activating`: a spinner and the message, no button. */
/**
 * Back from Checkout, the plan has just become active (motion group C, Ryan
 * 22 Nov): the card says "Slashie Pro is active" for this first view, settles
 * in, and a tick draws beside the badge. This replaces the pop-up.
 */
export const JustActivated: Story = {
  args: {
    config: BILLING_VIEWS.trialing,
    membership: storyMembership('trial'),
    justActivated: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Slashie Pro is active' })
    const head = canvasElement.querySelector(
      '[data-plan-moment]',
    ) as HTMLElement
    await expect(getComputedStyle(head).animationName).toBe('moment-settle')
    await expect(
      canvasElement.querySelector('[data-success-tick]'),
    ).not.toBeNull()
  },
}

/** The same plan on any later visit: its everyday title, no tick. */
export const TrialingLater: Story = {
  args: {
    config: BILLING_VIEWS.trialing,
    membership: storyMembership('trial'),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-plan-moment]')).toBeNull()
    await expect(canvasElement.querySelector('[data-success-tick]')).toBeNull()
    await expect(
      within(canvasElement).queryByRole('heading', {
        name: 'Slashie Pro is active',
      }),
    ).toBeNull()
  },
}

export const Activating: Story = {
  args: { config: BILLING_VIEWS.activating },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText(
        'Activating your plan. This usually takes a few seconds.',
      ),
    ).toBeVisible()
    await expect(canvas.queryByRole('button')).toBeNull()
  },
}

/** `activationDelayed`: slower than usual, Check again. */
export const ActivationDelayed: Story = {
  args: { config: BILLING_VIEWS.activationDelayed },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Check again' }),
    )
    await expect(args.onAction).toHaveBeenCalledWith('checkAgain')
  },
}

/** `incomplete`: Checkout didn't finish; Check again re-syncs. */
export const Incomplete: Story = {
  args: { config: BILLING_VIEWS.incomplete },
}

/** `paused`: Manage billing to resume. */
export const Paused: Story = {
  args: { config: BILLING_VIEWS.paused },
}

/** A date the API didn't send: the sentence without one. */
export const NoDate: Story = {
  args: {
    config: BILLING_VIEWS.subscribed,
    membership: storyMembership('active', { currentPeriodEnd: null }),
    formatDate: () => null,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Unlimited quotes.'),
    ).toBeVisible()
  },
}

/** While Checkout or the portal opens: the button shows it's busy. */
export const ActionLoading: Story = {
  args: { actionLoading: true },
}
