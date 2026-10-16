import type { ApolloClient } from '@apollo/client/core'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  type StoryResponse,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import {
  type StoryMembershipKind,
  storyMe,
  storyMembership,
  storyWorker,
  storyWorkerDraft,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { storyPricing } from '@/app/(marketing)/pricing/components/pricingStoryFixtures'
import Pricing from '@/app/(marketing)/pricing/graphql/Pricing.gql'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { BillingScreen } from './BillingScreen'

const seedPricing = (client: ApolloClient) =>
  client.writeQuery({ query: Pricing, data: { pricing: storyPricing } })

/** A signed-in session; pricing is loaded unless a story says otherwise. */
function screenFor(
  me: MeSnapshot,
  pricing: 'ready' | 'loading' | 'failed' = 'ready',
): Story {
  const responses: Record<string, StoryResponse> =
    pricing === 'failed'
      ? { Pricing: { kind: 'graphqlError', code: 'INTERNAL_SERVER_ERROR' } }
      : {}
  return {
    decorators: [
      withSession({
        me,
        responses,
        seed: pricing === 'ready' ? seedPricing : undefined,
      }),
    ],
  }
}

const worker = (kind: StoryMembershipKind) =>
  storyWorkerMe({ worker: storyWorker({ membership: storyMembership(kind) }) })

const meta = {
  title: 'Dashboard/Billing/BillingScreen',
  component: BillingScreen,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/billing' } },
  },
} satisfies Meta<typeof BillingScreen>

export default meta
type Story = StoryObj<typeof meta>

/** `customer`: plans are for workers, with Become a worker. */
export const Customer: Story = {
  ...screenFor(storyMe()),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { level: 1, name: 'Plan & billing' }),
    ).toBeVisible()
    await expect(await canvas.findByText('Plans are for workers')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Become a worker' }),
    ).toBeVisible()
  },
}

/** `workerSetup`: Finish setup before any plan. */
export const WorkerSetup: Story = {
  ...screenFor(storyWorkerMe({ worker: storyWorkerDraft() })),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Finish setup',
      }),
    ).toBeVisible()
  },
}

/** `free`: the meter, Start free trial and "6 months free, then £19.99 / month". */
export const Free: Story = {
  ...screenFor(worker('free')),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('1 of 3 used')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Start free trial' }),
    ).toBeVisible()
    await expect(
      canvas.getByText('6 months free, then £19.99 / month'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Compare plans' }),
    ).toBeVisible()
  },
}

/** `loading`: no offer until the price is known. */
export const PriceLoading: Story = {
  ...screenFor(worker('free'), 'loading'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('1 of 3 used')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Start free trial' }),
    ).toBeNull()
  },
}

/** `priceUnavailable`: the price failed, so Try again instead of an offer. */
export const PriceUnavailable: Story = {
  ...screenFor(worker('free'), 'failed'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("We couldn't load the price right now."),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Try again' }),
    ).toBeVisible()
  },
}

/** `lapsed`: Resubscribe at the price, with no trial claim. */
export const Lapsed: Story = {
  ...screenFor(worker('canceled')),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Resubscribe' }),
    ).toBeVisible()
    await expect(canvas.getByText('£19.99 / month')).toBeVisible()
    await expect(canvas.queryByText(/months free/)).toBeNull()
  },
}

/** `trialing`: free until the date, then the price; Manage billing. */
export const Trialing: Story = {
  ...screenFor(worker('trial')),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Free until 9 Dec 2026.'),
    ).toBeVisible()
    await expect(canvas.getByText('Then £19.99 / month')).toBeVisible()
    await expect(
      canvas.getByText('Cancel anytime in Manage billing.'),
    ).toBeVisible()
  },
}

/** `subscribed`: renews on the date. */
export const Subscribed: Story = {
  ...screenFor(worker('active')),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Renews on 9 Jan 2027.'),
    ).toBeVisible()
  },
}

/** `cancelling`: Ending, unlimited until the date, Keep Slashie Unlimited. */
export const Cancelling: Story = {
  ...screenFor(worker('activeCancelling')),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Ending')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Keep Slashie Unlimited' }),
    ).toBeVisible()
  },
}

/** `paymentProblem`: Fix payment, and no free quota meter. */
export const PaymentProblem: Story = {
  ...screenFor(worker('pastDue')),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Fix payment' }),
    ).toBeVisible()
    await expect(canvas.queryByText(/of 3 used/)).toBeNull()
    await expect(canvas.queryByText(/months free/)).toBeNull()
  },
}

/** Back from Checkout: Activating, with no button to start another. */
export const Activating: Story = {
  ...screenFor(worker('free')),
  parameters: {
    nextjs: {
      navigation: { pathname: '/billing', query: { checkout: 'success' } },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Activating')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Start free trial' }),
    ).toBeNull()
  },
}

/** zh-HK: the plan card in Traditional Chinese, dates included. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/billing' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
    withSession({ me: worker('trial'), seed: seedPricing }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { level: 1, name: '方案與帳單' }),
    ).toBeVisible()
    await expect(canvas.getByText('之後 £19.99 / 月')).toBeVisible()
  },
}

/** Phones: one column, Back in the header, the button in the first screen. */
export const Phone: Story = {
  ...screenFor(worker('free')),
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Back' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Start free trial' }),
    ).toBeVisible()
  },
}
