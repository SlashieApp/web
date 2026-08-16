import { describe, expect, it } from 'vitest'

import { defaultTaskDetailTab, parseTaskDetailTabHash } from './taskDetailTabs'

describe('parseTaskDetailTabHash', () => {
  it('accepts the four mobile tabs', () => {
    expect(parseTaskDetailTabHash('#overview')).toBe('overview')
    expect(parseTaskDetailTabHash('details')).toBe('details')
    expect(parseTaskDetailTabHash('#quotes')).toBe('quotes')
    expect(parseTaskDetailTabHash('#activity')).toBe('activity')
  })

  it('maps legacy #info to overview', () => {
    expect(parseTaskDetailTabHash('#info')).toBe('overview')
    expect(parseTaskDetailTabHash('info')).toBe('overview')
  })

  it('returns null for unknown hashes', () => {
    expect(parseTaskDetailTabHash('#priority')).toBeNull()
    expect(parseTaskDetailTabHash('')).toBeNull()
    expect(parseTaskDetailTabHash(null)).toBeNull()
  })
})

describe('defaultTaskDetailTab', () => {
  it('defaults owners with quotes to quotes', () => {
    expect(defaultTaskDetailTab({ isOwner: true, quoteCount: 2 })).toBe(
      'quotes',
    )
  })

  it('defaults everyone else to overview', () => {
    expect(defaultTaskDetailTab({ isOwner: true, quoteCount: 0 })).toBe(
      'overview',
    )
    expect(defaultTaskDetailTab({ isOwner: false, quoteCount: 4 })).toBe(
      'overview',
    )
  })
})
