import { describe, expect, it } from 'vitest'

import {
  deletionNoticeFromParams,
  formatDeletionDate,
  loginPathAfterDeletion,
} from './accountDeletion'

describe('accountDeletion helpers', () => {
  it('formats the deletion day per locale', () => {
    expect(formatDeletionDate('2026-11-12T10:00:00.000Z', 'en')).toBe(
      '12 November 2026',
    )
    expect(formatDeletionDate('2026-11-12T10:00:00.000Z', 'zh-hk')).toBe(
      '2026年11月12日',
    )
    expect(formatDeletionDate('not a date', 'en')).toBe('')
  })

  it('carries only the day to the login page', () => {
    expect(loginPathAfterDeletion('2026-11-12T10:00:00.000Z')).toBe(
      '/login?deletion=2026-11-12',
    )
    expect(loginPathAfterDeletion('garbage')).toBe('/login?deletion=1')
  })

  it('reads the login notice from the query string', () => {
    const params = (query: string) => new URLSearchParams(query)
    expect(deletionNoticeFromParams(params('deletion=2026-11-12'))).toEqual({
      kind: 'scheduled',
      date: '2026-11-12',
    })
    expect(deletionNoticeFromParams(params('deletion=<script>'))).toEqual({
      kind: 'scheduled',
      date: null,
    })
    expect(deletionNoticeFromParams(params('restore=1'))).toEqual({
      kind: 'restore',
    })
    expect(deletionNoticeFromParams(params('next=/tasks'))).toBeNull()
  })
})
