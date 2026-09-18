import { describe, expect, it } from 'vitest'

import {
  isPersistentMarketplaceMapPath,
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

describe('isPersistentMarketplaceMapPath', () => {
  it('keeps the shared map on search and public task detail', () => {
    expect(isPersistentMarketplaceMapPath('/search')).toBe(true)
    expect(isPersistentMarketplaceMapPath('/zh-hk/search')).toBe(true)
    expect(isPersistentMarketplaceMapPath('/tasks/task-1')).toBe(true)
    expect(isPersistentMarketplaceMapPath('/zh-hk/tasks/task-1')).toBe(true)
  })

  it('unmounts the map on edit and other task routes', () => {
    expect(isPersistentMarketplaceMapPath('/tasks')).toBe(false)
    expect(isPersistentMarketplaceMapPath('/tasks/task-1/edit')).toBe(false)
    expect(isPersistentMarketplaceMapPath('/')).toBe(false)
  })
})

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
    expect(
      taskDetailHrefFromBrowse('task-1', {
        fromSearch: true,
        lat: 51.5074,
        lng: -0.1278,
      }),
    ).toBe('/tasks/task-1?from=search&lat=51.50740&lng=-0.12780')
  })
})
