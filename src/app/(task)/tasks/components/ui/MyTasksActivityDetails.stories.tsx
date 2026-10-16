import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { buildAchievementPanels } from '../../helpers/taskAchievements'
import { MyTasksActivityDetails } from './MyTasksActivityDetails'

const worker = {
  completedJobsCount: 2,
  categoryMix: [
    { category: 'CLEANING', count: 1 },
    { category: 'HANDYMAN', count: 1 },
  ],
  mostWorkedLocation: { label: 'Westminster', count: 1 },
  quotesThisMonth: 3,
  freeQuotesPerMonth: 5,
  streakWeeks: 2,
  agreedTotalsOnCompletedJobs: [{ amount: 0, currency: 'GBP' }],
}

const customer = {
  hostedCompletedCount: 0,
  categoryMix: [{ category: 'CLEANING', count: 1 }],
  mostUsedLocation: { label: 'Westminster', count: 1 },
  quotesReceived: 1,
  agreedTotalsOnCompletedJobs: [{ amount: 22, currency: 'GBP' }],
}

const allowance = { used: 3, cap: 5, unlimited: false }

/** The owner's activity in full: stats, category pie, place, streak and totals. */
const meta = {
  title: 'My tasks/MyTasksActivityDetails',
  component: MyTasksActivityDetails,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    panels: buildAchievementPanels({
      showWorker: true,
      showCustomer: true,
      quoteAllowance: allowance,
      worker,
      customer,
    }),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyTasksActivityDetails>

export default meta
type Story = StoryObj<typeof meta>

/** A worker who also posts: both panels. */
export const WorkerAndCustomer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Worker')
    await canvas.findByText('Customer')
  },
}

/** Only works, on the free plan: quotes used against the monthly allowance. */
export const WorkerFreePlan: Story = {
  args: {
    panels: buildAchievementPanels({
      showWorker: true,
      showCustomer: false,
      quoteAllowance: allowance,
      worker,
      customer: null,
    }),
  },
}

/** Only works, on Slashie Unlimited: the quotes line says Unlimited. */
export const WorkerUnlimited: Story = {
  args: {
    panels: buildAchievementPanels({
      showWorker: true,
      showCustomer: false,
      quoteAllowance: { used: null, cap: null, unlimited: true },
      worker,
      customer: null,
    }),
  },
}

/** A worker with no activity yet: the empty copy under the dashed stats. */
export const WorkerNoActivity: Story = {
  args: {
    panels: buildAchievementPanels({
      showWorker: true,
      showCustomer: false,
      quoteAllowance: { used: null, cap: null, unlimited: false },
      worker: null,
      customer: null,
    }),
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'Completed jobs you worked will show up here.',
    )
  },
}

/** Only posts tasks: hosted jobs, quotes received, place and totals. */
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

/** A customer with no activity yet: the empty copy. */
export const CustomerNoActivity: Story = {
  args: {
    panels: buildAchievementPanels({
      showWorker: false,
      showCustomer: true,
      quoteAllowance: allowance,
      worker: null,
      customer: null,
    }),
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'Completed tasks you hosted will show up here.',
    )
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
