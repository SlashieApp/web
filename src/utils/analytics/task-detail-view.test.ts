import { beforeEach, describe, expect, it, vi } from 'vitest'

const capture = vi.fn()

vi.mock('./capture', () => ({
  capture: (...args: unknown[]) => capture(...args),
}))

import {
  captureTaskDetailOpenedFromSearch,
  resolveTaskDetailViewerRole,
} from './task-detail-view'

describe('captureTaskDetailOpenedFromSearch', () => {
  beforeEach(() => {
    capture.mockReset()
  })

  it('records a visitor opening task detail from search', () => {
    captureTaskDetailOpenedFromSearch({
      taskId: 'task-1',
      isAuthenticated: false,
      surface: 'list',
    })

    expect(capture).toHaveBeenCalledWith('task_detail_opened_from_search', {
      task_id: 'task-1',
      viewer: 'visitor',
      is_authenticated: false,
      surface: 'list',
    })
  })

  it('records a signed-in viewer opening from the map', () => {
    captureTaskDetailOpenedFromSearch({
      taskId: 'task-2',
      isAuthenticated: true,
      surface: 'map',
    })

    expect(capture).toHaveBeenCalledWith('task_detail_opened_from_search', {
      task_id: 'task-2',
      viewer: 'signed_in',
      is_authenticated: true,
      surface: 'map',
    })
  })
})

describe('resolveTaskDetailViewerRole', () => {
  it('prefers owner, then worker, then visitor', () => {
    expect(
      resolveTaskDetailViewerRole({
        isOwner: true,
        isAuthenticated: true,
        hasWorkerProfile: true,
      }),
    ).toBe('owner')
    expect(
      resolveTaskDetailViewerRole({
        isOwner: false,
        isAuthenticated: true,
        hasWorkerProfile: true,
      }),
    ).toBe('worker')
    expect(
      resolveTaskDetailViewerRole({
        isOwner: false,
        isAuthenticated: false,
        hasWorkerProfile: false,
      }),
    ).toBe('visitor')
  })
})
