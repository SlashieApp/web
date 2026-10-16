import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import pricingBag from '@/app/(marketing)/pricing/i11n.json'

import { PricingPlans } from './PricingPlans'
import {
  buildStoryMe,
  freeMembership,
  storyPricing,
  stubSession,
} from './pricingStoryFixtures'

const meta = {
  title: 'Marketing/Pricing/PricingPlans',
  component: PricingPlans,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    pricing: storyPricing,
    hasSession: false,
    copy: pricingBag.en,
  },
  // Signed out unless a story seeds its own session.
  beforeEach: () => stubSession(null, null),
} satisfies Meta<typeof PricingPlans>

export default meta
type Story = StoryObj<typeof meta>

/** No session cookie: the guest view straight away. */
export const Guest: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Get started' }),
    ).toBeVisible()
  },
}

/** Session cookie, profile still loading: placeholders, no buttons. */
export const CheckingSession: Story = {
  args: { hasSession: true },
  beforeEach: () => stubSession('storybook-token', null),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('link')).toHaveLength(0)
  },
}

/** Signed-in customer (no worker profile): Become a worker. */
export const Customer: Story = {
  args: { hasSession: true },
  beforeEach: () => stubSession('storybook-token', buildStoryMe(null)),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Become a worker' }),
    ).toBeVisible()
  },
}

/** Signed-in free worker: Free is their plan, the trial opens Checkout. */
export const FreeWorker: Story = {
  args: { hasSession: true },
  beforeEach: () =>
    stubSession(
      'storybook-token',
      buildStoryMe({ membership: freeMembership, setupComplete: true }),
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Your plan')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Start free trial' }),
    ).toBeEnabled()
  },
}

/** The API returned no plans: a retry and a way on, whoever is looking. */
export const Unavailable: Story = {
  args: { pricing: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { name: "Pricing isn't loading" }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Try again' }),
    ).toHaveAttribute('href', '/pricing')
  },
}
