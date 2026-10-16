import { describe, expect, it } from 'vitest'

import { ABOUT_VIEWS, getAboutView } from '.'

describe('getAboutView', () => {
  it('shows a signed-out visitor the sign-up ways in', () => {
    expect(getAboutView({ session: 'guest' })).toBe('guest')
    expect(ABOUT_VIEWS.guest.primary.href).toBe(
      '/register?next=%2Ftasks%2Fcreate',
    )
    expect(ABOUT_VIEWS.guest.secondary.href).toBe(
      '/register?next=%2Fworker%2Fsetup',
    )
  })

  it('sends a signed-in reader straight to posting or browsing', () => {
    expect(getAboutView({ session: 'signedIn' })).toBe('signedIn')
    expect(ABOUT_VIEWS.signedIn.primary.href).toBe('/tasks/create')
    expect(ABOUT_VIEWS.signedIn.secondary.href).toBe('/search')
  })

  it('has a config for every view', () => {
    expect(Object.keys(ABOUT_VIEWS).sort()).toEqual(['guest', 'signedIn'])
  })
})
