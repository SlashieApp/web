import { describe, expect, it } from 'vitest'

import { publicProfilePath } from './publicProfilePath'

describe('publicProfilePath', () => {
  it('links to the public profile and omits a blank exclude id', () => {
    expect(publicProfilePath('user-1')).toBe('/profile/user-1')
    expect(publicProfilePath('user-1', { excludeTaskId: '  ' })).toBe(
      '/profile/user-1',
    )
    expect(publicProfilePath('user-1', { excludeTaskId: null })).toBe(
      '/profile/user-1',
    )
  })

  it('passes the current task so the profile can omit it', () => {
    expect(publicProfilePath('user-1', { excludeTaskId: 'task 2' })).toBe(
      '/profile/user-1?excludeTaskId=task%202',
    )
  })
})
