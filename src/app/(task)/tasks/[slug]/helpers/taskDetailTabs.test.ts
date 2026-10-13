import { describe, expect, it } from 'vitest'

import {
  TASK_DETAIL_TAB,
  resolveTaskDetailTab,
  showTaskDetailQuotesSection,
} from './taskDetailTabs'

describe('resolveTaskDetailTab', () => {
  it('maps overview aliases and booking hashes', () => {
    expect(resolveTaskDetailTab('overview', TASK_DETAIL_TAB.overview)).toBe(
      'overview',
    )
    expect(resolveTaskDetailTab('info', TASK_DETAIL_TAB.overview)).toBe(
      'overview',
    )
    // Quotes are an Overview section now (FE-258).
    expect(resolveTaskDetailTab('quotes', TASK_DETAIL_TAB.overview)).toBe(
      'overview',
    )
    // Analytics is an owner card / drawer on Overview now (FE-258).
    expect(resolveTaskDetailTab('analytics', TASK_DETAIL_TAB.overview)).toBe(
      'overview',
    )
    expect(
      resolveTaskDetailTab('owner-task-performance', TASK_DETAIL_TAB.overview),
    ).toBe('overview')
    expect(resolveTaskDetailTab('activity', TASK_DETAIL_TAB.overview)).toBe(
      'overview',
    )
    expect(resolveTaskDetailTab('task-order', TASK_DETAIL_TAB.overview)).toBe(
      'overview',
    )
    expect(
      resolveTaskDetailTab('worker-job-panel', TASK_DETAIL_TAB.overview),
    ).toBe('overview')
    expect(resolveTaskDetailTab('', TASK_DETAIL_TAB.overview)).toBe('overview')
  })
})

describe('showTaskDetailQuotesSection', () => {
  it('keeps the Quotes section while the task is still open', () => {
    expect(
      showTaskDetailQuotesSection({
        isOpen: true,
        isAwarded: false,
        isClosed: false,
        isCancelled: false,
        atCap: false,
      }),
    ).toBe(true)
  })

  it('hides the Quotes section after accept and after completion', () => {
    expect(
      showTaskDetailQuotesSection({
        isOpen: false,
        isAwarded: true,
        isClosed: false,
        isCancelled: false,
        atCap: true,
      }),
    ).toBe(false)
    expect(
      showTaskDetailQuotesSection({
        isOpen: false,
        isAwarded: false,
        isClosed: true,
        isCancelled: false,
        atCap: true,
      }),
    ).toBe(false)
  })
})
