import { describe, expect, it } from 'vitest'

import {
  matchLegacyWorkerProfile,
  profileRedirectPath,
  userIdFromWorkerRedirectPayload,
} from './legacyProfileRedirect'

describe('matchLegacyWorkerProfile', () => {
  it('reads the worker id and keeps the zh-hk prefix', () => {
    expect(matchLegacyWorkerProfile('/workers/worker-1')).toEqual({
      workerId: 'worker-1',
      localePrefix: '',
    })
    expect(matchLegacyWorkerProfile('/zh-hk/workers/worker-1')).toEqual({
      workerId: 'worker-1',
      localePrefix: '/zh-hk',
    })
    expect(profileRedirectPath('user-9', '/zh-hk')).toBe(
      '/zh-hk/profile/user-9',
    )
  })

  it('collapses /en to English', () => {
    expect(matchLegacyWorkerProfile('/en/workers/worker-1')).toEqual({
      workerId: 'worker-1',
      localePrefix: '',
    })
    expect(profileRedirectPath('abc', '')).toBe('/profile/abc')
  })

  it('does not treat the workers directory, or other pages, as a profile', () => {
    expect(matchLegacyWorkerProfile('/workers')).toBeNull()
    expect(matchLegacyWorkerProfile('/zh-hk/workers')).toBeNull()
    expect(matchLegacyWorkerProfile('/workers/worker-1/extra')).toBeNull()
    expect(matchLegacyWorkerProfile('/profile/user-1')).toBeNull()
    expect(matchLegacyWorkerProfile('/user/abc')).toBeNull()
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
