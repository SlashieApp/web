import { describe, expect, it } from 'vitest'

import {
  matchLegacyPublicProfile,
  profileRedirectPath,
  userIdFromWorkerRedirectPayload,
} from './legacyProfileRedirect'

describe('matchLegacyPublicProfile', () => {
  it('maps /user/[id] onto the same user id', () => {
    expect(matchLegacyPublicProfile('/user/abc')).toEqual({
      kind: 'user',
      id: 'abc',
      localePrefix: '',
    })
    expect(profileRedirectPath('abc', '')).toBe('/profile/abc')
  })

  it('keeps the zh-hk prefix and collapses /en', () => {
    expect(matchLegacyPublicProfile('/zh-hk/user/abc')).toEqual({
      kind: 'user',
      id: 'abc',
      localePrefix: '/zh-hk',
    })
    expect(matchLegacyPublicProfile('/en/workers/worker-1')).toEqual({
      kind: 'worker',
      id: 'worker-1',
      localePrefix: '',
    })
    expect(profileRedirectPath('user-9', '/zh-hk')).toBe(
      '/zh-hk/profile/user-9',
    )
  })

  it('does not treat the workers directory as a profile', () => {
    expect(matchLegacyPublicProfile('/workers')).toBeNull()
    expect(matchLegacyPublicProfile('/zh-hk/workers')).toBeNull()
    expect(matchLegacyPublicProfile('/workers/worker-1/extra')).toBeNull()
    expect(matchLegacyPublicProfile('/profile/user-1')).toBeNull()
  })
})

describe('userIdFromWorkerRedirectPayload', () => {
  it('reads userId and treats null as unresolved', () => {
    expect(
      userIdFromWorkerRedirectPayload({
        data: { workerProfileRedirect: { userId: ' user-1 ' } },
      }),
    ).toBe('user-1')
    expect(
      userIdFromWorkerRedirectPayload({
        data: { workerProfileRedirect: null },
      }),
    ).toBeNull()
  })
})
