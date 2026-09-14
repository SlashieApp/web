import { describe, expect, it } from 'vitest'

import {
  TASK_DETAIL_TAB,
  defaultTaskDetailTab,
  resolveTaskDetailTab,
} from './taskDetailTabs'

describe('resolveTaskDetailTab', () => {
  it('maps overview aliases and booking hashes', () => {
    expect(resolveTaskDetailTab('overview', TASK_DETAIL_TAB.quotes)).toBe(
      'overview',
    )
    expect(resolveTaskDetailTab('info', TASK_DETAIL_TAB.quotes)).toBe(
      'overview',
    )
    expect(resolveTaskDetailTab('quotes', TASK_DETAIL_TAB.overview)).toBe(
      'quotes',
    )
    expect(resolveTaskDetailTab('activity', TASK_DETAIL_TAB.overview)).toBe(
      'activity',
    )
    expect(resolveTaskDetailTab('task-order', TASK_DETAIL_TAB.overview)).toBe(
      'activity',
    )
    expect(
      resolveTaskDetailTab('worker-job-panel', TASK_DETAIL_TAB.overview),
    ).toBe('activity')
    expect(resolveTaskDetailTab('', TASK_DETAIL_TAB.quotes)).toBe('quotes')
  })
})

describe('defaultTaskDetailTab', () => {
  it('sends owners with quotes to Quotes', () => {
    expect(
      defaultTaskDetailTab({
        isOwner: true,
        isOpen: true,
        isAwarded: false,
        isOrderWorker: false,
        quoteCount: 2,
      }),
    ).toBe('quotes')
  })

  it('sends awarded owner or assigned worker to Activity', () => {
    expect(
      defaultTaskDetailTab({
        isOwner: true,
        isOpen: false,
        isAwarded: true,
        isOrderWorker: false,
        quoteCount: 1,
      }),
    ).toBe('activity')
    expect(
      defaultTaskDetailTab({
        isOwner: false,
        isOpen: false,
        isAwarded: true,
        isOrderWorker: true,
        quoteCount: 1,
      }),
    ).toBe('activity')
  })

  it('defaults visitors and empty owners to Overview', () => {
    expect(
      defaultTaskDetailTab({
        isOwner: false,
        isOpen: true,
        isAwarded: false,
        isOrderWorker: false,
        quoteCount: 0,
      }),
    ).toBe('overview')
    expect(
      defaultTaskDetailTab({
        isOwner: true,
        isOpen: true,
        isAwarded: false,
        isOrderWorker: false,
        quoteCount: 0,
      }),
    ).toBe('overview')
  })
})
