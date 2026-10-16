import { afterAll, describe, expect, it } from 'vitest'

import { MY_TASKS_VIEWS, getMyTasksView } from '.'
import type { MyTasksView, MyTasksViewInput } from '.'

const settled: MyTasksViewInput = {
  hasTasks: true,
  hasMatches: true,
  loading: false,
  failed: false,
  filtered: false,
}

const seen = new Set<MyTasksView>()

function expectView(input: Partial<MyTasksViewInput>, view: MyTasksView) {
  seen.add(view)
  expect(getMyTasksView({ ...settled, ...input })).toBe(view)
}

describe('getMyTasksView', () => {
  it('shows placeholders while the first load runs', () => {
    expectView({ hasTasks: false, hasMatches: false, loading: true }, 'loading')
  })

  it('keeps the search bar and shows placeholders while a new search loads', () => {
    expectView(
      { hasMatches: false, loading: true, filtered: true },
      'searching',
    )
  })

  it('shows the error with Try again when nothing could load', () => {
    expectView({ hasTasks: false, hasMatches: false, failed: true }, 'error')
  })

  it('invites a new user to post a task or browse', () => {
    expectView({ hasTasks: false, hasMatches: false }, 'empty')
  })

  it('offers Clear filters when the search leaves nothing', () => {
    expectView({ hasMatches: false, filtered: true }, 'noMatches')
  })

  it('lists the groups when there are tasks to show', () => {
    expectView({}, 'list')
  })

  it('keeps showing cached tasks when a refresh fails', () => {
    expectView({ failed: true }, 'list')
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(MY_TASKS_VIEWS).sort())
  })
})
