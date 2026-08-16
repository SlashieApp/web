import { describe, expect, it } from 'vitest'

import { isTaskDetailPath } from './isTaskDetailPath'

describe('isTaskDetailPath', () => {
  it('matches a bare task-detail slug', () => {
    expect(isTaskDetailPath('/tasks/abc-123')).toBe(true)
    expect(isTaskDetailPath('/zh-hk/tasks/abc-123')).toBe(true)
  })

  it('rejects nested and sibling task routes', () => {
    expect(isTaskDetailPath('/tasks')).toBe(false)
    expect(isTaskDetailPath('/tasks/abc-123/edit')).toBe(false)
    expect(isTaskDetailPath('/tasks/create')).toBe(false)
    expect(isTaskDetailPath('/search')).toBe(false)
    expect(isTaskDetailPath(null)).toBe(false)
  })
})
