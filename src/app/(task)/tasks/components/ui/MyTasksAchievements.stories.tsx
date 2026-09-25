import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { buildAchievementPanels } from '../../helpers/taskAchievements'
import { MyTasksAchievements } from './MyTasksAchievements'

const allowance = { used: 2, cap: 3, unlimited: false }

const dual = buildAchievementPanels({
  showWorker: true,
  showCustomer: true,
  quoteAllowance: allowance,
  worker: {
    completedJobsCount: 6,
    categoryMix: [
      { category: 'CLEANING', count: 4 },
      { category: 'HANDYMAN', count: 2 },
    ],
    mostWorkedLocation: { label: 'Mong Kok', count: 4 },
    streakWeeks: 3,
    agreedTotalsOnCompletedJobs: [{ amount: 840, currency: 'GBP' }],
  },
  customer: {
    hostedCompletedCount: 2,
    categoryMix: [{ category: 'MOVING', count: 2 }],
    mostUsedLocation: { label: 'Central', count: 2 },
    quotesReceived: 5,
    agreedTotalsOnCompletedJobs: [{ amount: 200, currency: 'GBP' }],
  },
})

const workerOnly = buildAchievementPanels({
  showWorker: true,
  showCustomer: false,
  quoteAllowance: allowance,
  worker: null,
  customer: null,
})

const meta = {
  title: 'task/tasks/ui/MyTasksAchievements',
  component: MyTasksAchievements,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    panels: dual,
    loading: false,
  },
} satisfies Meta<typeof MyTasksAchievements>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WorkerOnly: Story = {
  args: { panels: workerOnly },
}

export const Loading: Story = {
  args: { panels: [], loading: true },
}
