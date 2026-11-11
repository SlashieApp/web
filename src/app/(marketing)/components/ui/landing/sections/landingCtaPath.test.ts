import { describe, expect, it } from 'vitest'

import { getSafeNextPath } from '@/app/(auth)/helpers/authRedirect'

import { landingCtaPath } from './landingCtaPath'

describe('landingCtaPath', () => {
  it('sends a guest to sign-up with the page as `next`', () => {
    expect(landingCtaPath('/tasks/create', 'guest')).toBe(
      '/register?next=%2Ftasks%2Fcreate',
    )
    expect(landingCtaPath('/worker/setup', 'guest')).toBe(
      '/register?next=%2Fworker%2Fsetup',
    )
  })

  it('keeps a query through sign-up', () => {
    const path = landingCtaPath('/tasks/create?title=Fix+a+tap', 'guest')
    const next = new URL(path, 'https://slashie.invalid').searchParams.get(
      'next',
    )
    expect(getSafeNextPath(next)).toBe('/tasks/create?title=Fix+a+tap')
  })

  it('sends a signed-in visitor straight to the page', () => {
    expect(landingCtaPath('/tasks/create', 'signedIn')).toBe('/tasks/create')
    expect(landingCtaPath('/tasks/create?title=Fix+a+tap', 'signedIn')).toBe(
      '/tasks/create?title=Fix+a+tap',
    )
  })
})
