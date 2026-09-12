import { describe, expect, it } from 'vitest'

import {
  isSearchBrowsePath,
  taskDetailHrefFromBrowse,
} from './openTaskDetailFromBrowse'

describe('isSearchBrowsePath', () => {
  it('matches /search with or without a locale prefix', () => {
    expect(isSearchBrowsePath('/search')).toBe(true)
    expect(isSearchBrowsePath('/zh-hk/search')).toBe(true)
    expect(isSearchBrowsePath('/search?lat=51.5')).toBe(true)
    expect(isSearchBrowsePath('/zh-hk/search?q=plumber')).toBe(true)
  })

  it('rejects home, task detail, and other browse paths', () => {
    expect(isSearchBrowsePath('/')).toBe(false)
    expect(isSearchBrowsePath('/tasks')).toBe(false)
    expect(isSearchBrowsePath('/tasks/task-1')).toBe(false)
    expect(isSearchBrowsePath('/zh-hk/tasks/task-1')).toBe(false)
    expect(isSearchBrowsePath('/searching')).toBe(false)
  })
})

describe('taskDetailHrefFromBrowse', () => {
  it('builds a shareable task path and tags search as the source', () => {
    expect(taskDetailHrefFromBrowse('task-1')).toBe('/tasks/task-1')
    expect(taskDetailHrefFromBrowse('task-1', { fromSearch: false })).toBe(
      '/tasks/task-1',
    )
    expect(taskDetailHrefFromBrowse('task-1', { fromSearch: true })).toBe(
      '/tasks/task-1?from=search',
    )
  })
})
