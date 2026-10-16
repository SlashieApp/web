import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { buildAchievementPanels } from '../../helpers/taskAchievements'
import { MyTasksAchievements } from './MyTasksAchievements'

const allowance = { used: 2, cap: 3, unlimited: false }

const worker = {
  completedJobsCount: 6,
  categoryMix: [
    { category: 'CLEANING', count: 4 },
    { category: 'HANDYMAN', count: 2 },
  ],
  mostWorkedLocation: { label: 'Mong Kok', count: 4 },
  streakWeeks: 3,
  agreedTotalsOnCompletedJobs: [{ amount: 840, currency: 'GBP' }],
}

const customer = {
  hostedCompletedCount: 2,
  categoryMix: [{ category: 'MOVING', count: 2 }],
  mostUsedLocation: { label: 'Central', count: 2 },
  quotesReceived: 5,
  agreedTotalsOnCompletedJobs: [{ amount: 200, currency: 'GBP' }],
}

const dual = buildAchievementPanels({
  showWorker: true,
  showCustomer: true,
  quoteAllowance: allowance,
  worker,
  customer,
})

/** The Your activity rail (desktop) and the achievements tab on phones. */
const meta = {
  title: 'My tasks/MyTasksAchievements',
  component: MyTasksAchievements,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    panels: dual,
    loading: false,
    moreHref: '/profile/user-1#achievements',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '360px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyTasksAchievements>

export default meta
type Story = StoryObj<typeof meta>

/** Someone who both works and posts: a Worker and a Customer panel, with More. */
export const WorkerAndCustomer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Worker')
    await canvas.findByText('Customer')
    await canvas.findByRole('link', { name: /more/i })
  },
}

/** Only works: one panel, with no role heading. Sparse data shows dashes. */
export const WorkerOnly: Story = {
  args: {
    panels: buildAchievementPanels({
      showWorker: true,
      showCustomer: false,
      quoteAllowance: allowance,
      worker: null,
      customer: null,
    }),
  },
}

/** Only posts tasks: hosted jobs, quotes received and agreed totals. */
export const CustomerOnly: Story = {
  args: {
    panels: buildAchievementPanels({
      showWorker: false,
      showCustomer: true,
      quoteAllowance: allowance,
      worker: null,
      customer,
    }),
  },
}

/** A worker on Slashie Unlimited: the quotes tile reads Unlimited. */
export const UnlimitedQuotes: Story = {
  args: {
    panels: buildAchievementPanels({
      showWorker: true,
      showCustomer: false,
      quoteAllowance: { used: null, cap: null, unlimited: true },
      worker,
      customer: null,
    }),
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Unlimited')
  },
}

/** Fewer than three completed jobs: the share percentages stay hidden. */
export const FewJobsNoPercent: Story = {
  args: {
    panels: buildAchievementPanels({
      showWorker: true,
      showCustomer: false,
      quoteAllowance: allowance,
      worker: {
        completedJobsCount: 2,
        categoryMix: [
          { category: 'CLEANING', count: 1 },
          { category: 'HANDYMAN', count: 1 },
        ],
      },
      customer: null,
    }),
  },
}

/** No agreed totals yet: the agreed-totals line is left out. */
export const NoAgreedTotals: Story = {
  args: {
    panels: buildAchievementPanels({
      showWorker: false,
      showCustomer: true,
      quoteAllowance: allowance,
      worker: null,
      customer: { ...customer, agreedTotalsOnCompletedJobs: null },
    }),
  },
}

/** Without a profile link: the More button is left out. */
export const NoMoreLink: Story = {
  args: { moreHref: null },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('link')).toBeNull()
  },
}

/** Activity still loading: placeholder blocks. */
export const Loading: Story = {
  args: { panels: [], loading: true },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(/Loading/)
  },
}

/** Nothing to show (no panels, not loading): the card is not rendered. */
export const NoPanels: Story = {
  args: { panels: [] },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('heading')).toBeNull()
  },
}

/** Phone width: the achievements tab. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
