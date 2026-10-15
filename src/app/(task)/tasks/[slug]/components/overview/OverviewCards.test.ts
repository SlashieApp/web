import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('OverviewCards layout', () => {
  it('leads with the Task summary, then photos, the phone section cards, and quotes', () => {
    const src = readFileSync(join(dir, 'OverviewCards.tsx'), 'utf8')
    const order = [
      '<TaskSummary />',
      '<PhotosCard />',
      '<TaskAnalyticsTrigger />',
      '<TaskActivityTrigger />',
      '<QuotesPanel />',
    ].map((tag) => src.indexOf(tag))
    expect(order.every((at) => at >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    expect(src).toContain('showTaskDetailQuotesSection(permissions)')
    // FE-274: status, booking, budget and details are one summary card.
    for (const gone of [
      'BookingSection',
      'TaskPricingCard',
      'TaskDetailsCard',
      'hideOverviewCards',
    ]) {
      expect(src).not.toContain(gone)
    }
  })

  it('keeps the pin clearance on the view', () => {
    const view = readFileSync(join(dir, '../layout/TaskDetailView.tsx'), 'utf8')
    expect(view).toContain('TASK_DETAIL_PIN_CLEARANCE')
    expect(view).toContain('TaskDetailTabs')
  })
})
