import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { buildAchievementPanels } from '../../helpers/taskAchievements'
import { MyTasksActivityDetails } from './MyTasksActivityDetails'

const panels = buildAchievementPanels({
  showWorker: true,
  showCustomer: true,
  quoteAllowance: { used: 3, cap: 5, unlimited: false },
  worker: {
    completedJobsCount: 2,
    categoryMix: [
      { category: 'CLEANING', count: 1 },
      { category: 'HANDYMAN', count: 1 },
    ],
    mostWorkedLocation: { label: 'Westminster, London', count: 1 },
    quotesThisMonth: 3,
    freeQuotesPerMonth: 5,
    streakWeeks: 2,
    agreedTotalsOnCompletedJobs: [{ amount: 0, currency: 'GBP' }],
  },
  customer: {
    hostedCompletedCount: 0,
    categoryMix: [{ category: 'CLEANING', count: 1 }],
    mostUsedLocation: { label: 'Westminster, London', count: 1 },
    quotesReceived: 1,
    agreedTotalsOnCompletedJobs: [{ amount: 22, currency: 'GBP' }],
  },
})

const meta = {
  title: 'task/tasks/ui/MyTasksActivityDetails',
  component: MyTasksActivityDetails,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { panels },
} satisfies Meta<typeof MyTasksActivityDetails>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
