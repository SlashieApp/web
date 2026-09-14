import { describe, expect, it } from 'vitest'

import {
  PAGE_CONTAINER_MAX_W_CSS,
  SEARCH_LIST_COLUMN_W,
} from '@/theme/pageContainer'

import {
  TASK_DETAIL_COLUMN_MAX_W,
  TASK_DETAIL_OVERVIEW_COLUMNS,
} from './taskDetailLayout'

describe('task detail desktop layout', () => {
  it('uses the full page container, not the 460px search list column', () => {
    expect(TASK_DETAIL_COLUMN_MAX_W).toBe(PAGE_CONTAINER_MAX_W_CSS)
    expect(TASK_DETAIL_COLUMN_MAX_W).not.toBe(SEARCH_LIST_COLUMN_W)
    expect(SEARCH_LIST_COLUMN_W).toBe('460px')
  })

  it('splits Overview into two columns from lg (1024px-class) up', () => {
    expect(TASK_DETAIL_OVERVIEW_COLUMNS.base).toBe('1fr')
    expect(TASK_DETAIL_OVERVIEW_COLUMNS.lg).toContain('minmax(0, 1fr)')
    expect(TASK_DETAIL_OVERVIEW_COLUMNS.lg).toContain('minmax(320px, 400px)')
  })
})
