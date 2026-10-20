import { afterAll, describe, expect, it } from 'vitest'

import { ACCOUNT_VIEWS, type AccountView, getAccountView } from '.'

const seen = new Set<AccountView>()
const view = (input: Parameters<typeof getAccountView>[0]) => {
  const result = getAccountView(input)
  seen.add(result)
  return result
}

describe('getAccountView', () => {
  it('shows the password row to an email and password account', () => {
    expect(view({ suspended: false, hasPassword: true })).toBe('password')
  })

  it('offers to set a password to a Google or Apple only account', () => {
    expect(view({ suspended: false, hasPassword: false })).toBe('social')
  })

  it('makes everything read-only for a suspended account', () => {
    expect(view({ suspended: true, hasPassword: true })).toBe('suspended')
    expect(view({ suspended: true, hasPassword: false })).toBe('suspended')
  })

  it('lets only a suspended account lose its buttons and Delete', () => {
    expect(ACCOUNT_VIEWS.suspended.editable).toBe(false)
    expect(ACCOUNT_VIEWS.suspended.showDelete).toBe(false)
    expect(ACCOUNT_VIEWS.password.editable).toBe(true)
    expect(ACCOUNT_VIEWS.password.passwordForm).toBe('change')
    expect(ACCOUNT_VIEWS.social.passwordForm).toBe('set')
    expect(ACCOUNT_VIEWS.suspended.passwordForm).toBeNull()
  })

  // Every registered view is reached by at least one test above.
  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(ACCOUNT_VIEWS).sort())
  })
})
