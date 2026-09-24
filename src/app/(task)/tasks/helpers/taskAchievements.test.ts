import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  achievementRoleVisibility,
  buildAchievementPanels,
} from './taskAchievements'

const allowance = { used: 1, cap: 3, unlimited: false }

describe('achievementRoleVisibility', () => {
  it('hides a role the viewer does not use', () => {
    expect(
      achievementRoleVisibility({
        hasWorkerProfile: false,
        sentQuoteCount: 0,
        postedTaskCount: 2,
      }),
    ).toEqual({ worker: false, customer: true })
    expect(
      achievementRoleVisibility({
        hasWorkerProfile: true,
        sentQuoteCount: 0,
        postedTaskCount: 0,
      }),
    ).toEqual({ worker: true, customer: false })
  })

  it('shows a role when the achievements API reports activity', () => {
    expect(
      achievementRoleVisibility({
        hasWorkerProfile: false,
        sentQuoteCount: 0,
        postedTaskCount: 0,
        workerHasActivity: true,
      }),
    ).toEqual({ worker: true, customer: false })
  })
})

describe('buildAchievementPanels', () => {
  it('keeps worker and customer panels separate and labels agreed totals', () => {
    const panels = buildAchievementPanels({
      showWorker: true,
      showCustomer: true,
      quoteAllowance: allowance,
      localQuotesReceived: 4,
      worker: {
        completedJobsCount: 6,
        categoryMix: [
          { category: 'CLEANING', count: 4 },
          { category: 'MOVING', count: 2 },
        ],
        mostWorkedLocation: 'Mong Kok',
        streakWeeks: 3,
        agreedTotalsOnCompletedJobs: { amount: 840, currency: 'GBP' },
      },
      customer: {
        hostedCompletedCount: 2,
        mostUsedLocation: 'Central',
        agreedTotalsOnCompletedJobs: { amount: 200, currency: 'GBP' },
      },
    })

    expect(panels.map((panel) => panel.role)).toEqual(['worker', 'customer'])
    expect(panels[0]).toMatchObject({
      completedCount: 6,
      location: 'Mong Kok',
      agreedTotalLabel: '£840',
      streakWeeks: 3,
      quotes: { kind: 'ofCap', used: 1, cap: 3 },
    })
    expect(panels[0]?.categoryMix.map((item) => item.percent)).toEqual([67, 33])
    expect(panels[1]).toMatchObject({
      completedCount: 2,
      location: 'Central',
      agreedTotalLabel: '£200',
      quotes: { kind: 'received', count: 4 },
      streakWeeks: null,
    })
    expect(panels[1]?.categoryMix).toEqual([])
  })

  it('hides category percentages when the completed count is tiny', () => {
    const [worker] = buildAchievementPanels({
      showWorker: true,
      showCustomer: false,
      quoteAllowance: { used: null, cap: null, unlimited: true },
      localQuotesReceived: null,
      worker: {
        completedJobsCount: 2,
        categoryMix: [
          { category: 'CLEANING', count: 1 },
          { category: 'MOVING', count: 1 },
        ],
        quotesUnlimited: false,
      },
      customer: null,
    })
    expect(worker?.categoryMix.map((item) => item.percent)).toEqual([
      null,
      null,
    ])
    expect(worker?.quotes).toEqual({ kind: 'unlimited' })
    expect(worker?.agreedTotalLabel).toBeNull()
    expect(worker?.streakWeeks).toBeNull()
  })

  it('does not invent a completed count or a money total before the API', () => {
    const [customer] = buildAchievementPanels({
      showWorker: false,
      showCustomer: true,
      quoteAllowance: allowance,
      localQuotesReceived: 0,
      worker: null,
      customer: null,
    })
    expect(customer?.completedCount).toBeNull()
    expect(customer?.agreedTotalLabel).toBeNull()
    expect(customer?.sparse).toBe(false)
    expect(customer?.quotes).toEqual({ kind: 'received', count: 0 })
  })
})

describe('achievements copy', () => {
  it('uses the agreed-totals label and never says earnings or Stripe', () => {
    const copy = JSON.parse(
      readFileSync(
        join(process.cwd(), 'src/app/(task)/tasks/i11n.json'),
        'utf8',
      ),
    ) as { en: { achievements: { agreedTotals: string } }; zh_hk: unknown }
    const serialized = JSON.stringify(copy).toLowerCase()
    expect(copy.en.achievements.agreedTotals).toBe(
      'Agreed totals on completed jobs',
    )
    expect(serialized).not.toContain('earnings')
    expect(serialized).not.toContain('stripe')
  })
})
